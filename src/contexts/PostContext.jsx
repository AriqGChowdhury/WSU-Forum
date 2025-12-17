import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { api } from "@/services/api";
import { useAuth } from "./AuthContext";

const PostContext = createContext(null);

// ============================================================================
// LOCAL STORAGE
// ============================================================================

const POSTS_KEY = "wsu_forum_posts_v1";
const DELETED_KEY = "wsu_forum_deleted_post_ids_v1";

function safeLoadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function safeSaveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // ignore
  }
}

function safeLoadLocalPosts() {
  const parsed = safeLoadJson(POSTS_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

function safeSaveLocalPosts(nextPosts) {
  safeSaveJson(POSTS_KEY, nextPosts || []);
}

function loadDeletedIds() {
  const parsed = safeLoadJson(DELETED_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

function saveDeletedIds(ids) {
  safeSaveJson(DELETED_KEY, ids || []);
}

function addDeletedId(id) {
  if (!id) return;
  const current = loadDeletedIds();
  if (current.includes(id)) return;
  saveDeletedIds([id, ...current]);
}

function removeDeletedId(id) {
  if (!id) return;
  const current = loadDeletedIds();
  const next = current.filter((x) => x !== id);
  saveDeletedIds(next);
}

function normalizePosts(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.posts)) return input.posts;
  return [];
}

function filterOutDeleted(posts) {
  const deletedIds = loadDeletedIds();
  if (!deletedIds.length) return posts || [];
  return (posts || []).filter((p) => !deletedIds.includes(p.id));
}

export function PostProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  const [posts, setPosts] = useState(() => {
    const local = safeLoadLocalPosts();
    return filterOutDeleted(local);
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // keep localStorage in sync with posts
  useEffect(() => {
    safeSaveLocalPosts(posts);
  }, [posts]);

  // On auth change
  useEffect(() => {
    if (!isAuthenticated) {
      setPosts([]);
      return;
    }
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const localPosts = filterOutDeleted(safeLoadLocalPosts());

    try {
      const data = await api.posts.getAll();
      const serverPostsRaw = normalizePosts(data);
      const serverPosts = filterOutDeleted(serverPostsRaw);

      // Prefer server if it has posts, otherwise fall back to local
      if (serverPosts.length > 0) {
        setPosts(serverPosts);
        safeSaveLocalPosts(serverPosts);
      } else {
        setPosts(localPosts);
      }
    } catch (err) {
      console.error("Failed to load posts:", err);
      setPosts(localPosts);
      setError(err?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  // --------------------------------------------------------------------------
  // CREATE POST
  // --------------------------------------------------------------------------
  const createPost = useCallback(
    async (data) => {
      setError(null);

      // optimistic local post
      const tempId = `local_${Date.now()}`;
      const optimisticPost = {
        id: tempId,
        title: data?.title || "",
        body: data?.body || "",
        contentType: data?.contentType || "discussion",

        topicId: data?.topicId || null,
        topicName: data?.topicName || null,
        subforumId: data?.subforumId || null,
        subforum: data?.subforum || null,

        createdAt: data?.createdAt || "Just now",

        eventDate: data?.eventDate || null,
        eventTime: data?.eventTime || null,
        eventPlace: data?.eventPlace || null,

        liked: false,
        saved: false,
        likes: 0,
        like_amt: 0,

        comments: [],
        comment_amt: 0,

        author:
          data?.author ||
          user || {
            id: "local_user",
            name: "You",
          },
      };

      // if this id was ever deleted, un-delete it
      removeDeletedId(tempId);

      setPosts((prev) => {
        const next = [optimisticPost, ...(prev || [])];
        return filterOutDeleted(next);
      });

      try {
        await api.posts.create(data);

        // If backend works, reload (will overwrite local with server list)
        await loadPosts();
        return { success: true };
      } catch (err) {
        // Keep local if backend fails
        console.error("Create post failed, kept locally:", err);
        setError(err?.message || "Failed to create post");
        return { success: true, localOnly: true };
      }
    },
    [loadPosts, user]
  );

  // --------------------------------------------------------------------------
  // UPDATE POST
  // --------------------------------------------------------------------------
  const updatePost = useCallback(async (id, data) => {
    setError(null);

    setPosts((prev) => {
      const next = (prev || []).map((p) => {
        if (p.id !== id) return p;
        return { ...p, ...data };
      });
      return filterOutDeleted(next);
    });

    try {
      const isLocal = String(id || "").startsWith("local_");
      if (isLocal) return { success: true, localOnly: true };

      await api.posts.update(id, data);
      return { success: true };
    } catch (err) {
      console.error("Update post failed on backend (kept locally):", err);
      setError(err?.message || "Failed to update post");
      return { success: true, localOnly: true };
    }
  }, []);

  // --------------------------------------------------------------------------
  // DELETE POST (TOMBSTONE)
  // --------------------------------------------------------------------------
  const deletePost = useCallback(async (id) => {
    setError(null);

    // tombstone it so refresh never brings it back
    addDeletedId(id);

    // remove from UI immediately
    setPosts((prev) => {
      const next = (prev || []).filter((p) => p.id !== id);
      return filterOutDeleted(next);
    });

    try {
      const isLocal = String(id || "").startsWith("local_");
      if (isLocal) return { success: true, localOnly: true };

      await api.posts.delete(id);
      return { success: true };
    } catch (err) {
      // Keep tombstone even if backend delete fails (so it stays gone in UI)
      console.error("Delete failed on backend, kept deleted locally:", err);
      setError(err?.message || "Failed to delete post");
      return { success: true, localOnly: true };
    }
  }, []);

  // --------------------------------------------------------------------------
  // TOGGLE LIKE
  // --------------------------------------------------------------------------
  const toggleLike = useCallback(
    async (id) => {
      const current = posts.find((p) => p.id === id);
      const wasLiked = !!current?.liked;
      const currentLikes = Number(current?.like_amt ?? current?.likes ?? 0);
      const nextLikes = wasLiked ? currentLikes - 1 : currentLikes + 1;

      setPosts((prev) => {
        const next = (prev || []).map((p) => {
          if (p.id !== id) return p;
          return {
            ...p,
            liked: !wasLiked,
            likes: nextLikes,
            like_amt: nextLikes,
          };
        });
        return filterOutDeleted(next);
      });

      try {
        const isLocal = String(id || "").startsWith("local_");
        if (isLocal) return;

        const response = await api.posts.like(id);
        if (response) {
          const serverLiked = response.liked ?? !wasLiked;
          const serverLikes = response.likes ?? nextLikes;

          setPosts((prev) => {
            const next = (prev || []).map((p) => {
              if (p.id !== id) return p;
              return {
                ...p,
                liked: serverLiked,
                likes: serverLikes,
                like_amt: serverLikes,
              };
            });
            return filterOutDeleted(next);
          });
        }
      } catch (err) {
        console.error("Failed to toggle like:", err);

        // revert
        setPosts((prev) => {
          const next = (prev || []).map((p) => {
            if (p.id !== id) return p;
            return {
              ...p,
              liked: wasLiked,
              likes: currentLikes,
              like_amt: currentLikes,
            };
          });
          return filterOutDeleted(next);
        });
      }
    },
    [posts]
  );

  // --------------------------------------------------------------------------
  // TOGGLE SAVE
  // --------------------------------------------------------------------------
  const toggleSave = useCallback(
    async (id) => {
      const current = posts.find((p) => p.id === id);
      const wasSaved = !!current?.saved;

      setPosts((prev) => {
        const next = (prev || []).map((p) => {
          if (p.id !== id) return p;
          return { ...p, saved: !wasSaved };
        });
        return filterOutDeleted(next);
      });

      try {
        const isLocal = String(id || "").startsWith("local_");
        if (isLocal) return;

        await api.posts.save(id);
      } catch (err) {
        console.error("Failed to toggle save:", err);

        // revert
        setPosts((prev) => {
          const next = (prev || []).map((p) => {
            if (p.id !== id) return p;
            return { ...p, saved: wasSaved };
          });
          return filterOutDeleted(next);
        });
      }
    },
    [posts]
  );

  // --------------------------------------------------------------------------
  // ADD COMMENT (LOCAL FIRST)
  // --------------------------------------------------------------------------
  const addComment = useCallback(
    async (postId, text) => {
      setError(null);

      const newComment = {
        id: `c_local_${Date.now()}`,
        author: user || { id: "local_user", name: "You" },
        text,
        createdAt: "Just now",
      };

      setPosts((prev) => {
        const next = (prev || []).map((p) => {
          if (p.id !== postId) return p;

          const prevComments = Array.isArray(p.comments) ? p.comments : [];
          const nextComments = [...prevComments, newComment];

          return {
            ...p,
            comments: nextComments,
            comment_amt: Number(p.comment_amt || prevComments.length) + 1,
          };
        });

        return filterOutDeleted(next);
      });

      try {
        const isLocalPost = String(postId || "").startsWith("local_");
        if (isLocalPost) return { success: true, comment: newComment, localOnly: true };

        const response = await api.posts.addComment(postId, text);

        if (response?.comment) {
          setPosts((prev) => {
            const next = (prev || []).map((p) => {
              if (p.id !== postId) return p;

              const prevComments = Array.isArray(p.comments) ? p.comments : [];
              const nextComments = prevComments.map((c) => {
                if (c.id === newComment.id) return response.comment;
                return c;
              });

              return { ...p, comments: nextComments };
            });

            return filterOutDeleted(next);
          });

          return { success: true, comment: response.comment };
        }

        return { success: true, comment: newComment, localOnly: true };
      } catch (err) {
        console.error("Add comment failed, kept locally:", err);
        setError(err?.message || "Failed to add comment");
        return { success: true, comment: newComment, localOnly: true };
      }
    },
    [user]
  );

  // --------------------------------------------------------------------------
  // DELETE COMMENT (LOCAL ONLY — because api.js doesn't have deleteComment)
  // --------------------------------------------------------------------------
  const deleteComment = useCallback(async (postId, commentId) => {
    setError(null);

    setPosts((prev) => {
      const next = (prev || []).map((p) => {
        if (p.id !== postId) return p;

        const prevComments = Array.isArray(p.comments) ? p.comments : [];
        const nextComments = prevComments.filter((c) => c.id !== commentId);

        return {
          ...p,
          comments: nextComments,
          comment_amt: Math.max(0, Number(p.comment_amt || prevComments.length) - 1),
        };
      });

      return filterOutDeleted(next);
    });

    return { success: true, localOnly: true };
  }, []);

  // --------------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------------
  const getSavedPosts = useCallback(() => {
    return (posts || []).filter((p) => !!p.saved);
  }, [posts]);

  const getPostsByTopic = useCallback(
    (topicId) => {
      return (posts || []).filter((p) => p.topicId === topicId);
    },
    [posts]
  );

  const getPostsBySubforum = useCallback(
    (subforumId) => {
      return (posts || []).filter((p) => {
        return p.subforumId === subforumId || p.subforum?.id === subforumId;
      });
    },
    [posts]
  );

  const getUserPosts = useCallback(() => {
    if (!user) return [];
    return (posts || []).filter((p) => {
      return p.author?.id === user.id || p.user === user.username;
    });
  }, [posts, user]);

  const refreshPosts = useCallback(async () => {
    if (!isAuthenticated) return;
    await loadPosts();
  }, [isAuthenticated, loadPosts]);

  const value = {
    posts,
    loading,
    error,

    createPost,
    updatePost,
    deletePost,

    toggleLike,
    toggleSave,

    addComment,
    deleteComment,

    getSavedPosts,
    getPostsByTopic,
    getPostsBySubforum,
    getUserPosts,

    refreshPosts,
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

export function usePosts() {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePosts must be used within a PostProvider");
  }
  return context;
}

export default PostContext;