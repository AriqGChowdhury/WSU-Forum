// ============================================================================
// CONFIGURATION (DO NOT TOUCH)
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

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (typeof data.message === "string") return data.message;
  if (typeof data.Message === "string") return data.Message;
  if (typeof data.error === "string") return data.error;
  if (typeof data.Error === "string") return data.Error;

  // DRF validation: { field: ["msg"], other: ["msg"] }
  if (typeof data === "object") {
    const keys = Object.keys(data);
    if (keys.length > 0) {
      const firstKey = keys[0];
      const val = data[firstKey];

      if (Array.isArray(val) && val.length > 0) {
        rawToString(val[0]);
        return `${firstKey}: ${rawToString(val[0])}`;
      }
      if (typeof val === "string") {
        return `${firstKey}: ${val}`;
      }
      if (val && typeof val === "object") {
        const innerKeys = Object.keys(val);
        if (innerKeys.length > 0) {
          const innerVal = val[innerKeys[0]];
          if (Array.isArray(innerVal) && innerVal.length > 0) {
            return `${firstKey}.${innerKeys[0]}: ${rawToString(innerVal[0])}`;
          }
          if (typeof innerVal === "string") {
            return `${firstKey}.${innerKeys[0]}: ${innerVal}`;
          }
        }
      }
    }
  }

  return "Request failed";
}

function rawToString(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch (e) {
    return String(v);
  }
}

function saveTokensFromResponse(response) {
  if (!response) return;

  const access =
    response.accessToken ||
    response.access_token ||
    response.access ||
    response.token ||
    null;

  const refresh =
    response.refreshToken ||
    response.refresh_token ||
    response.refresh ||
    null;

  if (access) {
    localStorage.setItem("accessToken", access);
  }
  if (refresh) {
    localStorage.setItem("refreshToken", refresh);
  }
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

    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      method: options.method || "GET",
      headers,
      credentials: "include",
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

      const text = await response.text();
      const data = safeJsonParse(text);

      if (!response.ok) {
        throw new ApiError(response.status, pickErrorMessage(data), {
          url,
          data,
          status: response.status,
        });
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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const mockResponse = async (data, delayMs = 200) => {
  await delay(delayMs);
  return JSON.parse(JSON.stringify(data));
};

// ============================================================================
// API SERVICE
// ============================================================================

const client = new ApiClient(CONFIG.BASE_URL);

async function tryGet(endpoints, params = {}) {
  let lastErr = null;

  for (let i = 0; i < endpoints.length; i++) {
    try {
      return await client.get(endpoints[i], params);
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr;
}

async function tryPatch(endpoints, body) {
  let lastErr = null;

  for (let i = 0; i < endpoints.length; i++) {
    try {
      return await client.patch(endpoints[i], body);
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr;
}

export const api = {
  // --------------------------------------------------------------------------
  // AUTH
  // --------------------------------------------------------------------------
  auth: {
    async signIn(email, password) {
      if (CONFIG.USE_MOCKS) {
        localStorage.setItem("accessToken", "mock_token_123");
        return { success: true, user: MOCK_DATA.user, token: "mock_token_123" };
      }

      const response = await client.post("/login", {
        username: email,
        password: password,
      });

      saveTokensFromResponse(response);

      return {
        success: response?.success ?? true,
        user: response?.user ?? response,
        token:
          response?.accessToken ||
          response?.access ||
          response?.token ||
          localStorage.getItem("accessToken"),
        message: response?.message,
      };
    },

    async signUp(data) {
      if (CONFIG.USE_MOCKS) {
        return {
          success: true,
          user: { ...MOCK_DATA.user, ...data },
          message: "Account created! Please check your email to verify.",
        };
      }

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
      saveTokensFromResponse(response);

      return {
        success: true,
        user: response?.user ?? response,
        message: response?.message || "Account created! Please check your email to verify.",
      };
    },

    async verifyEmail(uidb64, token) {
      if (CONFIG.USE_MOCKS) {
        return { success: true, message: "Email verified!" };
      }

      const response = await client.get(`/activate/${uidb64}/${token}`);

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
      if (CONFIG.USE_MOCKS) {
        return { success: true, message: "Reset email sent" };
      }

      const response = await client.post("/reset", { email });

      return {
        success: true,
        message: response?.message || "Password reset link sent to your email",
      };
    },

    async resetPassword(uidb64, token, password, pass2 = null) {
      if (CONFIG.USE_MOCKS) {
        return { success: true, message: "Password reset successfully" };
      }

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
      if (CONFIG.USE_MOCKS) {
        return { user: MOCK_DATA.user };
      }

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
      if (CONFIG.USE_MOCKS) {
        return { posts: MOCK_DATA.posts };
      }
      try {
        const response = await client.get("/posts", params);
        return { posts: response };
      } catch (e) {
        return { posts: [] };
      }
    },

    async getById(postId) {
      if (CONFIG.USE_MOCKS) {
        const post = MOCK_DATA.posts.find((p) => p.id === postId);
        if (!post) throw new ApiError(404, "Post not found");
        return { post };
      }
      const response = await client.get(`/posts/${postId}`);
      return { post: response };
    },

    async create(data) {
      if (CONFIG.USE_MOCKS) {
        const newPost = {
          id: `p_${Date.now()}`,
          author: MOCK_DATA.user,
          liked: false,
          saved: false,
          likes: 0,
          comments: [],
          createdAt: "Just now",
          ...data,
        };
        MOCK_DATA.posts.unshift(newPost);
        return { post: newPost };
      }
      const response = await client.post("/posts", data);
      return { post: response };
    },

    async update(postId, data) {
      if (CONFIG.USE_MOCKS) {
        const post = MOCK_DATA.posts.find((p) => p.id === postId);
        if (post) Object.assign(post, data);
        return { post };
      }
      const response = await client.patch(`/posts/${postId}`, data);
      return { post: response };
    },

    async delete(postId) {
      if (CONFIG.USE_MOCKS) {
        const index = MOCK_DATA.posts.findIndex((p) => p.id === postId);
        if (index !== -1) MOCK_DATA.posts.splice(index, 1);
        return { success: true };
      }

      await client.delete(`/posts/${postId}`);
      return { success: true };
    },

    async like(postId) {
      if (CONFIG.USE_MOCKS) {
        const post = MOCK_DATA.posts.find((p) => p.id === postId);
        if (post) {
          post.liked = !post.liked;
          post.likes += post.liked ? 1 : -1;
        }
        return mockResponse({ liked: post?.liked, likes: post?.likes });
      }

      return client.post(`/posts/${postId}/like`, {});
    },

    async save(postId) {
      if (CONFIG.USE_MOCKS) {
        const post = MOCK_DATA.posts.find((p) => p.id === postId);
        if (post) post.saved = !post.saved;
        return { saved: post?.saved };
      }
      return client.post(`/posts/${postId}/save`, {});
    },

    async addComment(postId, text) {
      if (CONFIG.USE_MOCKS) {
        const post = MOCK_DATA.posts.find((p) => p.id === postId);
        if (!post) throw new ApiError(404, "Post not found");
        const comment = {
          id: `c_${Date.now()}`,
          author: MOCK_DATA.user,
          text,
          createdAt: "Just now",
        };
        post.comments.push(comment);
        return { comment };
      }

      const response = await client.post(`/posts/${postId}/comments`, { body: text });
      return { comment: response?.comment ?? response };
    },

    async search(query) {
      if (CONFIG.USE_MOCKS) {
        return mockResponse({ People: [], Posts: [], Subforums: [] }, 250);
      }

      try {
        const response = await client.post("/search", { query });
        return response;
      } catch (e) {
        console.error("Search failed:", e?.message, e?.details?.data || e);
        return { People: [], Posts: [], Subforums: [] };
      }
    },
  },

  // --------------------------------------------------------------------------
  // TOPICS
  // --------------------------------------------------------------------------
  topics: {
    async getAll(params = {}) {
      if (CONFIG.USE_MOCKS) {
        return { topics: MOCK_DATA.topics };
      }
      try {
        const response = await client.get("/topics", params);
        return { topics: response?.topics ?? response ?? [] };
      } catch (e) {
        console.error("Topics fetch failed:", e?.message, e?.details?.data || e);
        return { topics: [] };
      }
    },

    async follow(topicId) {
      if (CONFIG.USE_MOCKS) {
        return { success: true };
      }
      try {
        return await client.post(`/topics/${topicId}/follow`, {});
      } catch (e) {
        console.error("Follow topic failed:", e?.message, e?.details?.data || e);
        return { success: false };
      }
    },

    async unfollow(topicId) {
      if (CONFIG.USE_MOCKS) {
        return { success: true };
      }
      try {
        return await client.delete(`/topics/${topicId}/follow`);
      } catch (e) {
        console.error("Unfollow topic failed:", e?.message, e?.details?.data || e);
        return { success: false };
      }
    },
  },

  // --------------------------------------------------------------------------
  // EVENTS
  // --------------------------------------------------------------------------
  events: {
    async getAll(params = {}) {
      if (CONFIG.USE_MOCKS) {
        return { events: MOCK_DATA.events };
      }
      try {
        const response = await client.get("/events", params);
        return { events: response?.events ?? response ?? [] };
      } catch (e) {
        console.error("Events fetch failed:", e?.message, e?.details?.data || e);
        return { events: [] };
      }
    },

    async getById(eventId) {
      if (CONFIG.USE_MOCKS) {
        const event = MOCK_DATA.events.find((e) => e.id === eventId);
        return { event };
      }
      try {
        const response = await client.get(`/events/${eventId}`);
        return { event: response };
      } catch (e) {
        console.error("Event fetch failed:", e?.message, e?.details?.data || e);
        return { event: null };
      }
    },

    async create(data) {
      if (CONFIG.USE_MOCKS) {
        const newEvent = {
          id: `e_${Date.now()}`,
          ...data,
          attendees: 0,
        };
        MOCK_DATA.events.push(newEvent);
        return { event: newEvent };
      }
      try {
        const response = await client.post("/events", data);
        return { event: response };
      } catch (e) {
        console.error("Event create failed:", e?.message, e?.details?.data || e);
        throw e;
      }
    },

    async rsvp(eventId) {
      if (CONFIG.USE_MOCKS) {
        return { success: true };
      }
      try {
        return await client.post(`/events/${eventId}/rsvp`, {});
      } catch (e) {
        console.error("RSVP failed:", e?.message, e?.details?.data || e);
        return { success: false };
      }
    },
  },

  // --------------------------------------------------------------------------
  // SETTINGS
  // --------------------------------------------------------------------------
  settings: {
    async get() {
      if (CONFIG.USE_MOCKS) {
        const saved = localStorage.getItem("wsu_forum_settings");
        return { settings: saved ? JSON.parse(saved) : {} };
      }

      // try no-slash first (matches your urls.py), then slash
      try {
        const response = await tryGet(["/settings", "/settings/"]);
        return { settings: response?.settings ?? response?.user ?? response ?? {} };
      } catch (e) {
        const saved = localStorage.getItem("wsu_forum_settings");
        return { settings: saved ? JSON.parse(saved) : {} };
      }
    },

    async update(settings) {
      if (CONFIG.USE_MOCKS) {
        localStorage.setItem("wsu_forum_settings", JSON.stringify(settings));
        return { success: true, settings };
      }

      // try no-slash first (matches your urls.py), then slash
      try {
        const response = await tryPatch(["/settings", "/settings/"], settings);
        return { success: true, settings: response?.settings ?? response };
      } catch (e) {
        localStorage.setItem("wsu_forum_settings", JSON.stringify(settings));
        return { success: true, settings };
      }
    },
  },

  // --------------------------------------------------------------------------
  // USER PROFILE
  // --------------------------------------------------------------------------
  users: {
    async getProfile(userId = null) {
      if (CONFIG.USE_MOCKS) {
        return { user: MOCK_DATA.user };
      }
      try {
        const endpoint = userId ? `/users/${userId}` : "/profile";
        const response = await client.get(endpoint);
        return { user: response?.user ?? response };
      } catch (e) {
        console.error("Profile fetch failed:", e?.message, e?.details?.data || e);
        return { user: null };
      }
    },

    async updateProfile(data) {
      if (CONFIG.USE_MOCKS) {
        Object.assign(MOCK_DATA.user, data);
        return { user: MOCK_DATA.user };
      }

      // Your backend uses "settings" and "profile" without slash in urls.py,
      // so try no-slash first, then slash as fallback.
      try {
        const r1 = await tryPatch(["/settings", "/settings/"], data);
        return { user: r1?.user ?? r1 };
      } catch (e1) {
        console.error("Profile update failed on settings:", e1?.message, e1?.details?.data || e1);

        const r2 = await tryPatch(["/profile", "/profile/"], data);
        return { user: r2?.user ?? r2 };
      }
    },

    async getSavedPosts() {
      if (CONFIG.USE_MOCKS) {
        const saved = MOCK_DATA.posts.filter((p) => p.saved);
        return { posts: saved };
      }
      try {
        const response = await client.get("/profile");
        return { posts: response?.Saved || [] };
      } catch (e) {
        return { posts: [] };
      }
    },
  },

  // --------------------------------------------------------------------------
  // SUBFORUMS
  // --------------------------------------------------------------------------
  subforums: {
    async getAll(params = {}) {
      if (CONFIG.USE_MOCKS) return { subforums: [] };

      try {
        const response = await client.get("/subforums", params);
        return { subforums: response };
      } catch (e) {
        return { subforums: [] };
      }
    },

    async getById(id) {
      if (CONFIG.USE_MOCKS) return { subforum: null };
      const response = await client.get(`/subforums/${id}`);
      return { subforum: response };
    },

    async create(data) {
      if (CONFIG.USE_MOCKS) return { subforum: data };
      const response = await client.post("/subforums", data);
      return { subforum: response };
    },

    async subscribe(id) {
      if (CONFIG.USE_MOCKS) return { success: true };
      return client.post(`/subforums/${id}/subscribe`, {});
    },

    async unsubscribe(id) {
      if (CONFIG.USE_MOCKS) return { success: true };
      return client.delete(`/subforums/${id}/subscribe`);
    },
  },

  // --------------------------------------------------------------------------
  // NOTIFICATIONS
  // --------------------------------------------------------------------------
  notifications: {
    async getAll() {
      if (CONFIG.USE_MOCKS) {
        const saved = localStorage.getItem("wsu_notifications");
        if (saved) return { notifications: JSON.parse(saved) };
        return { notifications: [] };
      }

      try {
        const response = await client.get("/notifications");
        return response?.notifications ? response : { notifications: response || [] };
      } catch (e) {
        console.error("Notifications fetch failed:", e?.message, e?.details?.data || e);
        return { notifications: [] };
      }
    },

    async markAsRead(notificationId) {
      if (CONFIG.USE_MOCKS) return { success: true };
      try {
        return client.post(`/notifications/${notificationId}/read`, {});
      } catch (e) {
        console.error("Mark as read failed:", e?.message, e?.details?.data || e);
        return { success: false };
      }
    },

    async markAllAsRead() {
      if (CONFIG.USE_MOCKS) return { success: true };
      try {
        return client.post("/notifications/read-all", {});
      } catch (e) {
        console.error("Mark all as read failed:", e?.message, e?.details?.data || e);
        return { success: false };
      }
    },
  },

  // --------------------------------------------------------------------------
  // SEARCH (alias for backwards compatibility)
  // --------------------------------------------------------------------------
  search: {
    async query(searchText) {
      return api.posts.search(searchText);
    },
  },
};

export { ApiError, CONFIG };
export default api;
