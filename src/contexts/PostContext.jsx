import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import { useAuth } from "./AuthContext";

const PostContext = createContext(null);

// ============================================================================
// HELPERS
// ============================================================================
function normalizePosts(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.posts)) return input.posts;
  return [];
}

function filterOutDeleted(posts) {
  // No local tombstone logic; just return posts
  return posts || [];
}

// ============================================================================
// POST PROVIDER
// ============================================================================
export function PostProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // On auth change
  useEffect(() => {
    if (!isAuthenticated) {
      setPosts([]);
      return;
    }
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // --------------------------------------------------------------------------
  // LOAD POSTS
  // --------------------------------------------------------------------------
  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.posts.getAll();
      const serverPostsRaw = normalizePosts(data);
      const serverPosts = filterOutDeleted(serverPostsRaw);

      setPosts(serverPosts);
    } catch (err) {
      console.error("Failed to load posts:", err);
      setError(err?.message || "Failed to load posts");
      setPosts([]);
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

      try {
        await api.posts.create(data);
        await loadPosts();
        return { success: true };
      } catch (err) {
        console.error("Create post failed:", err);
        setError(err?.message || "Failed to create post");
        return { success: false };
      }
    },
    [loadPosts]
  );

  // --------------------------------------------------------------------------
  // UPDATE POST
  // --------------------------------------------------------------------------
  const updatePost = useCallback(async (id, data) => {
    setError(null);

    try {
      await api.posts.update(id, data);
      setPosts((prev) =>
        (prev || []).map((p) => (p.id === id ? { ...p, ...data } : p))
      );
      return { success: true };
    } catch (err) {
      console.error("Update post failed:", err);
      setError(err?.message || "Failed to update post");
      return { success: false };
    }
  }, []);

  // --------------------------------------------------------------------------
  // DELETE POST
  // --------------------------------------------------------------------------
  const deletePost = useCallback(async (id) => {
    setError(null);

    try {
      await api.posts.delete(id);
      setPosts((prev) => (prev || []).filter((p) => p.id !== id));
      return { success: true };
    } catch (err) {
      console.error("Delete post failed:", err);
      setError(err?.message || "Failed to delete post");
      return { success: false };
    }
  }, []);

  // --------------------------------------------------------------------------
  // TOGGLE LIKE
  // --------------------------------------------------------------------------
  const toggleLike = useCallback(
    async (id) => {
      const current = posts.find((p) => p.id === id);
      if (!current) return;

      const wasLiked = !!current.liked;
      const currentLikes = Number(current.like_amt ?? current.likes ?? 0);
      const nextLikes = wasLiked ? currentLikes - 1 : currentLikes + 1;

      setPosts((prev) =>
        (prev || []).map((p) =>
          p.id === id ? { ...p, liked: !wasLiked, likes: nextLikes, like_amt: nextLikes } : p
        )
      );

      try {
        const response = await api.posts.like(id);
        if (response) {
          const serverLiked = response.liked ?? !wasLiked;
          const serverLikes = response.likes ?? nextLikes;

          setPosts((prev) =>
            (prev || []).map((p) =>
              p.id === id ? { ...p, liked: serverLiked, likes: serverLikes, like_amt: serverLikes } : p
            )
          );
        }
      } catch (err) {
        console.error("Failed to toggle like:", err);
        // Revert
        setPosts((prev) =>
          (prev || []).map((p) =>
            p.id === id ? { ...p, liked: wasLiked, likes: currentLikes, like_amt: currentLikes } : p
          )
        );
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
      if (!current) return;

      const wasSaved = !!current.saved;
      setPosts((prev) =>
        (prev || []).map((p) => (p.id === id ? { ...p, saved: !wasSaved } : p))
      );

      try {
        await api.posts.save(id);
      } catch (err) {
        console.error("Failed to toggle save:", err);
        // Revert
        setPosts((prev) =>
          (prev || []).map((p) => (p.id === id ? { ...p, saved: wasSaved } : p))
        );
      }
    },
    [posts]
  );

  // --------------------------------------------------------------------------
  // ADD COMMENT
  // --------------------------------------------------------------------------
  const addComment = useCallback(
    async (postId, text) => {
      setError(null);

      try {
        const response = await api.posts.addComment(postId, text);
        if (response?.comment) {
          setPosts((prev) =>
            (prev || []).map((p) =>
              p.id === postId
                ? {
                    ...p,
                    comments: [...(p.comments || []), response.comment],
                    comment_amt: (p.comment_amt || 0) + 1,
                  }
                : p
            )
          );
          return { success: true, comment: response.comment };
        }
        return { success: false };
      } catch (err) {
        console.error("Add comment failed:", err);
        setError(err?.message || "Failed to add comment");
        return { success: false };
      }
    },
    []
  );

  // --------------------------------------------------------------------------
  // DELETE COMMENT
  // --------------------------------------------------------------------------
  const deleteComment = useCallback(async (postId, commentId) => {
    setError(null);
    setPosts((prev) =>
      (prev || []).map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: (p.comments || []).filter((c) => c.id !== commentId),
              comment_amt: Math.max(0, (p.comment_amt || 0) - 1),
            }
          : p
      )
    );
    return { success: true };
  }, []);

  // --------------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------------
  const getSavedPosts = useCallback(() => (posts || []).filter((p) => !!p.saved), [posts]);

  const getPostsByTopic = useCallback(
    (topicId) => (posts || []).filter((p) => p.topicId === topicId),
    [posts]
  );

  const getPostsBySubforum = useCallback(
    (subforumId) => (posts || []).filter((p) => p.subforumId === subforumId || p.subforum?.id === subforumId),
    [posts]
  );

  const getUserPosts = useCallback(() => {
    if (!user) return [];
    return (posts || []).filter((p) => p.author?.id === user.id || p.user === user.username);
  }, [posts, user]);

  const refreshPosts = useCallback(async () => {
    if (!isAuthenticated) return;
    await loadPosts();
  }, [isAuthenticated, loadPosts]);

  // --------------------------------------------------------------------------
  // PROVIDER VALUE
  // --------------------------------------------------------------------------
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

// --------------------------------------------------------------------------
// HOOK
// --------------------------------------------------------------------------
export function usePosts() {
  const context = useContext(PostContext);
  if (!context) throw new Error("usePosts must be used within a PostProvider");
  return context;
}

export default PostContext;
