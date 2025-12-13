import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';

// ============================================================================
// CONTEXT
// ============================================================================

const PostContext = createContext(null);

// ============================================================================
// PROVIDER
// ============================================================================

export function PostProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch posts when user logs in
  useEffect(() => {
    if (!isAuthenticated) {
      setPosts([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    api.posts.getAll()
      .then(({ posts }) => {
        if (!cancelled) setPosts(posts);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [isAuthenticated]);

  // Create a new post
  const createPost = useCallback(async (data) => {
    setError(null);
    try {
      const { post } = await api.posts.create(data);
      setPosts((prev) => [post, ...prev]);
      return { success: true, post };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Update a post
  const updatePost = useCallback(async (id, data) => {
    setError(null);
    try {
      const { post } = await api.posts.update(id, data);
      setPosts((prev) => prev.map((p) => (p.id === id ? post : p)));
      return { success: true, post };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Delete a post
  const deletePost = useCallback(async (id) => {
    setError(null);
    try {
      await api.posts.delete(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Toggle like (optimistic update)
  const toggleLike = useCallback(async (id) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );

    try {
      await api.posts.like(id);
    } catch {
      // Revert on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
            : p
        )
      );
    }
  }, []);

  // Toggle save (optimistic update)
  const toggleSave = useCallback(async (id) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p))
    );

    try {
      await api.posts.save(id);
    } catch {
      // Revert on error
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p))
      );
    }
  }, []);

  // Add comment to a post
  const addComment = useCallback(async (postId, text) => {
    setError(null);
    try {
      const { comment } = await api.posts.addComment(postId, text);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
        )
      );
      return { success: true, comment };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Get saved posts
  const getSavedPosts = useCallback(() => {
    return posts.filter((p) => p.saved);
  }, [posts]);

  // Get posts by topic
  const getPostsByTopic = useCallback((topicId) => {
    return posts.filter((p) => p.topicId === topicId);
  }, [posts]);

  // Get posts by subforum
  const getPostsBySubforum = useCallback((subforumId) => {
    return posts.filter((p) => p.subforumId === subforumId);
  }, [posts]);

  // Get user's own posts
  const getUserPosts = useCallback(() => {
    if (!user) return [];
    return posts.filter((p) => p.author.id === user.id);
  }, [posts, user]);

  // Refresh posts
  const refreshPosts = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { posts } = await api.posts.getAll();
      setPosts(posts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

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
    getSavedPosts,
    getPostsByTopic,
    getPostsBySubforum,
    getUserPosts,
    refreshPosts,
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

export function usePosts() {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
}

export default PostContext;
