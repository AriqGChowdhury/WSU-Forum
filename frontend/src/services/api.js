
// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  BASE_URL: "http://127.0.0.1:8000", 
  TIMEOUT: 10000,
  USE_MOCKS: false,
};

// ============================================================================
// ERRORS
// ============================================================================

class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = "ApiError";
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function safeJsonParse(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new ApiError(0, "Server returned invalid JSON.", { raw: text });
  }
}

function pickErrorMessage(data) {
  if (!data) return "Request failed";
  return (
    data.message ||
    data.Message ||
    data.error ||
    data.Error ||
    (typeof data.detail === "string" ? data.detail : null) ||
    "Request failed"
  );
}

// ============================================================================
// HTTP CLIENT
// ============================================================================

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    // Add auth token if available
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      method: options.method || "GET",
      headers,
      // credentials: "include",
      ...options,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

    try {
      const response = await fetch(url, { ...config, signal: controller.signal });
      clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type") || "";

      
      if (!contentType.includes("application/json")) {
        if (contentType.includes("text/html")) {
          const htmlText = await response.text();
          const firstPart = htmlText.substring(0, 500);

          if (htmlText.includes("CSRF")) {
            throw new ApiError(response.status, "CSRF token error. Refresh the page.", {
              url,
              html: firstPart,
            });
          }

          if (response.status === 404 || htmlText.includes("404")) {
            throw new ApiError(404, "API endpoint not found. Check urls.py + BASE_URL.", {
              url,
              html: firstPart,
            });
          }

          if (response.status >= 500 || htmlText.includes("500")) {
            throw new ApiError(500, "Server error. Check Django console/logs.", {
              url,
              html: firstPart,
            });
          }

          throw new ApiError(
            response.status,
            `Server returned HTML instead of JSON (status ${response.status}).`,
            { url, html: firstPart }
          );
        }

        throw new ApiError(response.status, "Invalid response format from server", {
          url,
          contentType,
        });
      }

      // Parse JSON
      const text = await response.text();
      const data = safeJsonParse(text);

      if (!response.ok) {
        // Attempt token refresh on 401
        if (response.status === 401) {
          const refreshToken = localStorage.getItem("refreshToken");

          if (refreshToken) {
            try {
              const refreshResponse = await fetch(
                `${this.baseURL}/api/token/refresh/`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ refresh: refreshToken }),
                }
              );

              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();

                if (refreshData.access) {
                  localStorage.setItem("accessToken", refreshData.access);

                  // retry original request with new token
                  headers.Authorization = `Bearer ${refreshData.access}`;
                  const retryResponse = await fetch(url, {
                    ...config,
                    headers,
                  });

                  const retryText = await retryResponse.text();
                  return safeJsonParse(retryText);
                }
              }
            } catch (e) {
              // fall through to logout
            }
          }
        }

        throw new ApiError(response.status, pickErrorMessage(data), { url, data });
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error && error.name === "AbortError") {
        throw new ApiError(0, "Request timed out. Please try again.");
      }

      throw new ApiError(0, error?.message || "Network error. Please check your connection.");
    }
  }

  get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const finalEndpoint = query ? `${endpoint}?${query}` : endpoint;
    return this.request(finalEndpoint, { method: "GET" });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data ?? {}),
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data ?? {}),
    });
  }

  patch(endpoint, data) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data ?? {}),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_DATA = {
  user: {
    id: "u_wsu_001",
    name: "Jean D.",
    email: "jean.d@wayne.edu",
    role: "Student",
    major: "Computer Science",
    year: "Junior",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=Jean",
    bio: "CS student passionate about AI and web development.",
    joinedAt: "2024-09-01",
    emailVerified: true,
    stats: { posts: 12, followers: 45, following: 32 },
  },
  posts: [],
  topics: [],
  events: [],
};

// ============================================================================
// API SERVICE
// ============================================================================

const client = new ApiClient(CONFIG.BASE_URL);

export const api = {
  // --------------------------------------------------------------------------
  // AUTH
  // --------------------------------------------------------------------------
  auth: {
    async signIn(username, password) {
      // if (CONFIG.USE_MOCKS) {
      //   localStorage.setItem("accessToken", "mock_token_123");
      //   return { success: true, user: MOCK_DATA.user, token: "mock_token_123" };
      // }
      
      // Your backend expects username + password
      const response = await client.post("/login", {
        username: username,
        password: password,
      });

      // store tokens if backend returns them
      if (response && response.access) {
        localStorage.setItem("accessToken", response.access);
      }
      if (response && response.refresh) {
        localStorage.setItem("refreshToken", response.refresh);
      }

      return {
        success: response?.success ?? true,
        user: response?.user ?? response,
        token: response?.access,
        message: response?.message,
      };
    },

    async signUp(data) {
      // if (CONFIG.USE_MOCKS) {
      //   return {
      //     success: true,
      //     user: { ...MOCK_DATA.user, ...data },
      //     message: "Account created! Please check your email to verify.",
      //   };
      // }

      // Match your Django serializer fields
      const requestData = {
        username: data.username || (data.email ? data.email.split("@")[0] : ""),
        email: data.email,
        password: data.password,
        pass2: data.pass2 || data.password,
        role: data.role || "student",
        major: data.major || "",
        classification: data.classification || "",
        department: data.department || "",
      };

      const response = await client.post("/register", requestData);

      // Usually you DO NOT get JWT until email verified (depends on your backend)
      return {
        success: true,
        user: response?.user ?? response,
        message: response?.message || "Account created! Please check your email to verify.",
      };
    },

    async verifyEmail(uidb64, token) {
      // if (CONFIG.USE_MOCKS) {
      //   return { success: true, message: "Email verified!" };
      // }

      const response = await client.get(`/activate/${uidb64}/${token}`);

      // Your backend might return {message:"success"} or similar
      const ok =
        response?.message === "success" ||
        response?.success === true ||
        response?.detail === "success";

      return {
        success: !!ok,
        message: response?.message || response?.detail || "Verification finished",
      };
    },

    async forgotPassword(email) {
      // if (CONFIG.USE_MOCKS) {
      //   return { success: true, message: "Reset email sent" };
      // }

      // YOUR urls.py shows: path('reset', views.RequestResetView.as_view(), name='reset')
      const response = await client.post("/reset", { email });

      return {
        success: true,
        message: response?.message || "Password reset link sent to your email",
      };
    },

    async resetPassword(uidb64, token, password, pass2 = null) {
      // if (CONFIG.USE_MOCKS) {
      //   return { success: true, message: "Password reset successfully" };
      // }

     
      // Common pattern: /reset/<uidb64>/<token>
      const response = await client.post(`/reset/${uidb64}/${token}`, {
        password,
        pass2: pass2 || password,
      });

      return {
        success: true,
        message: response?.message || "Password reset successfully",
      };
    },

    async signOut() {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return { success: true };
    },

    async getMe() {
      // if (CONFIG.USE_MOCKS) {
      //   return { user: MOCK_DATA.user };
      // }

      const token = localStorage.getItem("accessToken");
      if (!token) return { user: null };

      try {
        const response = await client.get("/profile");
        return { user: response?.user ?? response ?? null };
      } catch (e) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return { user: null };
      }
    },
  },

  // --------------------------------------------------------------------------
  // POSTS
  // --------------------------------------------------------------------------
  posts: {
    async getAll(params = {}) {
      // if (CONFIG.USE_MOCKS) {
      //   return { posts: MOCK_DATA.posts };
      // }
      try {
        const response = await client.get("/posts", params);
        return { posts: response };
      } catch (e) {
        return { posts: [] };
      }
    },

    async getById(postId) {
      // if (CONFIG.USE_MOCKS) {
      //   const post = MOCK_DATA.posts.find((p) => p.id === postId);
      //   if (!post) throw new ApiError(404, "Post not found");
      //   return { post };
      // }
      const response = await client.get(`/${postId}`);
      return { post: response };
    },

    async create(data) {
      // if (CONFIG.USE_MOCKS) {
      //   const newPost = {
      //     id: `p_${Date.now()}`,
      //     author: MOCK_DATA.user,
      //     liked: false,
      //     saved: false,
      //     likes: 0,
      //     comments: [],
      //     createdAt: "Just now",
      //     ...data,
      //   };
      //   MOCK_DATA.posts.unshift(newPost);
      //   return { post: newPost };
      // }
      const response = await client.post("/posts", data);
      return { post: response };
    },

    async like(postId) {
      // if (CONFIG.USE_MOCKS) {
      //   const post = MOCK_DATA.posts.find((p) => p.id === postId);
      //   if (post) {
      //     post.liked = !post.liked;
      //     post.likes += post.liked ? 1 : -1;
      //   }
      //   return { liked: post?.liked, likes: post?.likes };
      // }
      return client.post(`/${postId}/likes`, {});
    },

    async save(postId) {
      // if (CONFIG.USE_MOCKS) {
      //   const post = MOCK_DATA.posts.find((p) => p.id === postId);
      //   if (post) post.saved = !post.saved;
      //   return { saved: post?.saved };
      // }
      return client.post(`/${postId}/save`, {});
    },

    async addComment(postId, text) {
      // if (CONFIG.USE_MOCKS) {
      //   const post = MOCK_DATA.posts.find((p) => p.id === postId);
      //   if (!post) throw new ApiError(404, "Post not found");
      //   const comment = {
      //     id: `c_${Date.now()}`,
      //     author: MOCK_DATA.user,
      //     text,
      //     createdAt: "Just now",
      //   };
      //   post.comments.push(comment);
      //   return { comment };
      // }
      const response = await client.post(`/${postId}/comments`, { text });
      return { comment: response };
    },

    async delete(postId) {
      // if (CONFIG.USE_MOCKS) {
      //   const index = MOCK_DATA.posts.findIndex((p) => p.id === postId);
      //   if (index !== -1) MOCK_DATA.posts.splice(index, 1);
      //   return { success: true };
      // }

      await client.delete(`/delete/post/${postId}`,);
      return { success: true };
    },
  },

  // --------------------------------------------------------------------------
  // SETTINGS
  // --------------------------------------------------------------------------
  settings: {
    async get() {
      // if (CONFIG.USE_MOCKS) {
      //   const saved = localStorage.getItem("wsu_forum_settings");
      //   return { settings: saved ? JSON.parse(saved) : {} };
      // }

      try {
        const response = await client.get("/settings");
        return { settings: response?.user ?? response ?? {} };
      } catch (e) {
        const saved = localStorage.getItem("wsu_forum_settings");
        return { settings: saved ? JSON.parse(saved) : {} };
      }
    },

    async update(settings) {
      // if (CONFIG.USE_MOCKS) {
      //   localStorage.setItem("wsu_forum_settings", JSON.stringify(settings));
      //   return { success: true, settings };
      // }

      try {
        const response = await client.patch("/settings", settings);
        return { success: true, settings: response };
      } catch (e) {
        localStorage.setItem("wsu_forum_settings", JSON.stringify(settings));
        return { success: true, settings };
      }
    },
  },

  // --------------------------------------------------------------------------
  // SEARCH
  // --------------------------------------------------------------------------
  search: {
    async query(searchText) {
      // if (CONFIG.USE_MOCKS) {
      //   return { users: [], posts: [], subforums: [] };
      // }

      try {
        const response = await client.post("/search", { searchText });
        return {
          users: response?.People || [],
          posts: response?.Posts || [],
          subforums: response?.Subforums || [],
        };
      } catch (e) {
        return { users: [], posts: [], subforums: [] };
      }
    },
  },

  // --------------------------------------------------------------------------
  // USER PROFILE
  // --------------------------------------------------------------------------
  users: {
    async getProfile() {
      // if (CONFIG.USE_MOCKS) {
      //   return { user: MOCK_DATA.user };
      // }
      const response = await client.get("/profile");
      return { user: response?.user ?? response };
    },

    async updateProfile(data) {
      // if (CONFIG.USE_MOCKS) {
      //   Object.assign(MOCK_DATA.user, data);
      //   return { user: MOCK_DATA.user };
      // }
      const response = await client.patch("/settings", data);
      return { user: response };
    },

    async getSavedPosts() {
      // if (CONFIG.USE_MOCKS) {
      //   const saved = MOCK_DATA.posts.filter((p) => p.saved);
      //   return { posts: saved };
      // }
      const response = await client.get("/profile");
      return { posts: response?.Saved || [] };
    },
  },

  // --------------------------------------------------------------------------
  // SUBFORUMS 
  // --------------------------------------------------------------------------
  subforums: {
    async getAll(params = {}) {
      // if (CONFIG.USE_MOCKS) return { subforums: [] };

      try {
        const response = await client.get("/subforums", params);
        return { subforums: response };
      } catch (e) {
        return { subforums: [] };
      }
    },

    async getById(id) {
      // if (CONFIG.USE_MOCKS) return { subforum: null };
      const response = await client.get(`/subforums/${id}`);
      return { subforum: response };
    },

    async create(data) {
      // if (CONFIG.USE_MOCKS) return { subforum: data };
      const response = await client.post("/subforums", data);
      return { subforum: response };
    },

    async subscribe(id) {
      // if (CONFIG.USE_MOCKS) return { success: true };
      return client.post(`/subforums/${id}/subscribe`, {});
    },

    async unsubscribe(id) {
      // if (CONFIG.USE_MOCKS) return { success: true };
      return client.delete(`/subforums/${id}/subscribe`);
    },
  },

  // --------------------------------------------------------------------------
  // NOTIFICATIONS
  // --------------------------------------------------------------------------
  notifications: {
    async getAll() {
      // if (CONFIG.USE_MOCKS) {
      //   const saved = localStorage.getItem("wsu_notifications");
      //   if (saved) return { notifications: JSON.parse(saved) };
      //   return { notifications: [] };
      // }

      try {
        const response = await client.get("/notifications");
        return response?.notifications ? response : { notifications: response || [] };
      } catch (e) {
        return { notifications: [] };
      }
    },

    async markAsRead(notificationId) {
      // if (CONFIG.USE_MOCKS) return { success: true };
      return client.post(`/notifications/${notificationId}/read`, {});
    },

    async markAllAsRead() {
      // if (CONFIG.USE_MOCKS) return { success: true };
      return client.post("/notifications/read-all", {});
    },
  },
};

export { ApiError, CONFIG };
export default api;
