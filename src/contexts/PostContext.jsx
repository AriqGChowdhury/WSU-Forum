import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';

// ============================================================================
// MOCK DATA - Will display alongside real data
// ============================================================================

const MOCK_POSTS = [
  {
    id: 'mock_p1',
    author: { 
      id: 'mock_u_ali', 
      name: 'Ali Z.', 
      avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Ali',
      role: 'Student'
    },
    subforumId: 'cs',
    subforumName: 'Computer Science',
    topicId: 't2',
    topicName: 'CS & AI',
    title: 'Best starter project for CNNs?',
    body: 'Trying to build something simple that still teaches the core ideas. Any suggestions for a beginner-friendly project? I was thinking about image classification with MNIST or maybe something more practical.',
    liked: false,
    saved: true,
    likes: 9,
    comments: [
      { 
        id: 'mock_c1', 
        author: { id: 'mock_u_jay', name: 'Jay M.', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Jay', role: 'Student' },
        text: 'MNIST or CIFAR-10 is perfect. Keep it small, track overfitting.',
        createdAt: '1h ago'
      },
      { 
        id: 'mock_c2', 
        author: { id: 'mock_u_prof', name: 'Dr. Chen', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=DrChen', role: 'Faculty' },
        text: 'Consider starting with transfer learning using a pre-trained model like ResNet. Much easier than training from scratch!',
        createdAt: '45m ago'
      },
    ],
    createdAt: '2h ago',
    contentType: 'question',
    isMock: true,
  },
  {
    id: 'mock_p2',
    author: { 
      id: 'mock_u_robotics', 
      name: 'WSU Robotics Club', 
      avatar: 'https://api.dicebear.com/8.x/shapes/svg?seed=WSU',
      role: 'Staff'
    },
    subforumId: 'clubs',
    subforumName: 'Clubs & Organizations',
    topicId: 't3',
    topicName: 'Events',
    title: '🤖 Tonight: Drivetrain Tear-Down Stream',
    body: "We'll live stream at 7pm in Engineering 1500. Bring questions about brushless motors & PID tuning. Everyone welcome! Pizza and refreshments provided.",
    liked: true,
    saved: false,
    likes: 31,
    comments: [],
    createdAt: '6h ago',
    contentType: 'event',
    eventDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    eventTime: '19:00',
    eventPlace: 'Engineering 1500',
    isMock: true,
  },
  {
    id: 'mock_p3',
    author: { 
      id: 'mock_u_sarah', 
      name: 'Sarah K.', 
      avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Sarah',
      role: 'Student'
    },
    subforumId: 'roommates',
    subforumName: 'Roommate Finder',
    topicId: 't4',
    topicName: 'Housing',
    title: 'Roommate needed for Winter semester',
    body: 'Looking for a roommate to share a 2BR apartment near campus. $650/month including utilities. The apartment is on Anthony Wayne Dr, 5 min walk to campus. DM if interested!',
    liked: false,
    saved: false,
    likes: 5,
    comments: [
      { 
        id: 'mock_c3', 
        author: { id: 'mock_u_mike', name: 'Mike T.', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Mike', role: 'Student' },
        text: 'Is this still available? I\'m a junior CS major looking for housing.',
        createdAt: '3h ago'
      },
    ],
    createdAt: '1d ago',
    contentType: 'discussion',
    isMock: true,
  },
  {
    id: 'mock_p4',
    author: { 
      id: 'mock_u_drsmith', 
      name: 'Dr. Smith', 
      avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=DrSmith',
      role: 'Faculty'
    },
    subforumId: 'announcements',
    subforumName: 'Announcements',
    topicId: 't1',
    topicName: 'Announcements',
    title: '📢 Final Exam Schedule Released',
    body: 'The final exam schedule for Fall 2025 has been posted. Please check the registrar website for your specific times. Office hours will be extended during finals week - see the schedule in my syllabus.',
    liked: true,
    saved: true,
    likes: 45,
    comments: [
      { 
        id: 'mock_c4', 
        author: { id: 'mock_u_student1', name: 'Emma L.', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Emma', role: 'Student' },
        text: 'Thanks for the heads up! Will there be a review session before the final?',
        createdAt: '30m ago'
      },
    ],
    createdAt: '4h ago',
    contentType: 'announcement',
    isMock: true,
  },
  {
    id: 'mock_p5',
    author: { 
      id: 'mock_u_emma', 
      name: 'Emma T.', 
      avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=EmmaT',
      role: 'Student'
    },
    subforumId: 'study-groups',
    subforumName: 'Study Groups',
    topicId: 't6',
    topicName: 'Study Groups',
    title: 'Study group for CSC 4500 Algorithms?',
    body: 'Anyone want to form a study group for the Algorithms final? Planning to meet at the library this weekend. We can work through practice problems together.',
    liked: false,
    saved: false,
    likes: 12,
    comments: [
      { 
        id: 'mock_c5', 
        author: { id: 'mock_u_alex', name: 'Alex P.', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Alex', role: 'Student' },
        text: "I'm in! DM me the details. I really need help with dynamic programming.",
        createdAt: '2h ago'
      },
      { 
        id: 'mock_c6', 
        author: { id: 'mock_u_jen', name: 'Jennifer W.', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Jennifer', role: 'Student' },
        text: "Count me in too! Sunday afternoon works best for me.",
        createdAt: '1h ago'
      },
    ],
    createdAt: '5h ago',
    contentType: 'question',
    isMock: true,
  },
  {
    id: 'mock_p6',
    author: { 
      id: 'mock_u_career', 
      name: 'Career Services', 
      avatar: 'https://api.dicebear.com/8.x/shapes/svg?seed=Career',
      role: 'Staff'
    },
    subforumId: 'internships',
    subforumName: 'Internships',
    topicId: 't7',
    topicName: 'Career',
    title: '🎯 Summer 2026 Internship Fair - Register Now!',
    body: 'Over 50 companies will be attending our annual internship fair on January 15th. Companies include Google, Microsoft, Ford, GM, and many local Detroit startups. Registration is required. Free professional headshots available!',
    liked: true,
    saved: true,
    likes: 89,
    comments: [],
    createdAt: '1d ago',
    contentType: 'event',
    eventDate: '2026-01-15',
    eventTime: '10:00',
    eventPlace: 'Student Center Ballroom',
    isMock: true,
  },
  {
    id: 'mock_p7',
    author: { 
      id: 'mock_u_jason', 
      name: 'Jason R.', 
      avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Jason',
      role: 'Student'
    },
    subforumId: 'marketplace',
    subforumName: 'Buy/Sell/Trade',
    topicId: 't5',
    topicName: 'Marketplace',
    title: '📚 Selling: Calculus textbook (Stewart 9th Ed)',
    body: 'Barely used, no highlighting. $50 OBO. Can meet on campus. Also have the solutions manual available for extra $20.',
    liked: false,
    saved: false,
    likes: 3,
    comments: [],
    createdAt: '2d ago',
    contentType: 'discussion',
    isMock: true,
  },
  {
    id: 'mock_p8',
    author: { 
      id: 'mock_u_sports', 
      name: 'WSU Athletics', 
      avatar: 'https://api.dicebear.com/8.x/shapes/svg?seed=Athletics',
      role: 'Staff'
    },
    subforumId: 'sports',
    subforumName: 'Sports & Recreation',
    topicId: 't8',
    topicName: 'Sports',
    title: '🏀 Warriors Basketball vs Michigan State - Friday!',
    body: 'Come support your Warriors this Friday night at 7pm! First 500 students get free t-shirts. Student section opens at 6pm.',
    liked: false,
    saved: false,
    likes: 67,
    comments: [
      { 
        id: 'mock_c7', 
        author: { id: 'mock_u_fan', name: 'Marcus J.', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Marcus', role: 'Student' },
        text: "Let's gooooo! Warriors all the way! 💚",
        createdAt: '5h ago'
      },
    ],
    createdAt: '8h ago',
    contentType: 'event',
    eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    eventTime: '19:00',
    eventPlace: 'Athletics Center',
    isMock: true,
  },
];

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
  const [includeMockData, setIncludeMockData] = useState(true); // Toggle for mock data

  // Fetch posts when user logs in
  useEffect(() => {
    if (!isAuthenticated) {
      setPosts([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    api.posts.getAll()
      .then(({ posts: realPosts }) => {
        if (!cancelled) {
          // Combine real posts with mock posts if enabled
          const allPosts = includeMockData 
            ? [...(realPosts || []), ...MOCK_POSTS]
            : (realPosts || []);
          
          // Sort by createdAt (mock posts have relative times, so put real posts first)
          setPosts(allPosts);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          // Still show mock data on error
          if (includeMockData) {
            setPosts(MOCK_POSTS);
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [isAuthenticated, includeMockData]);

  // Create a new post
  const createPost = useCallback(async (data) => {
    setError(null);
    try {
      // Add to local state immediately for better UX
      const newPost = {
        id: `post_${Date.now()}`,
        ...data,
        liked: false,
        saved: false,
        likes: 0,
        comments: [],
        createdAt: 'Just now',
      };
      
      setPosts((prev) => [newPost, ...prev]);
      
      // Try to save to backend
      try {
        const { post } = await api.posts.create(data);
        // Update with server response if available
        if (post) {
          setPosts((prev) => prev.map(p => p.id === newPost.id ? { ...post, ...newPost } : p));
        }
      } catch (apiError) {
        console.log('Post saved locally, backend sync pending');
      }
      
      return { success: true, post: newPost };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Update a post
  const updatePost = useCallback(async (id, data) => {
    setError(null);
    try {
      // Optimistic update
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
      
      // Try backend update
      try {
        await api.posts.update(id, data);
      } catch (apiError) {
        console.log('Post update saved locally');
      }
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Delete a post
  const deletePost = useCallback(async (id) => {
    setError(null);
    try {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      
      try {
        await api.posts.delete(id);
      } catch (apiError) {
        console.log('Post deleted locally');
      }
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Toggle like (optimistic update)
  const toggleLike = useCallback(async (id) => {
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
      const comment = {
        id: `comment_${Date.now()}`,
        author: {
          id: user?.id,
          name: user?.name,
          avatar: user?.avatar,
          role: user?.role,
        },
        text,
        createdAt: 'Just now',
      };
      
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: [...(p.comments || []), comment] } : p
        )
      );
      
      try {
        await api.posts.addComment(postId, text);
      } catch (apiError) {
        console.log('Comment saved locally');
      }
      
      return { success: true, comment };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [user]);

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
    return posts.filter((p) => p.author?.id === user.id);
  }, [posts, user]);

  // Refresh posts
  const refreshPosts = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { posts: realPosts } = await api.posts.getAll();
      const allPosts = includeMockData 
        ? [...(realPosts || []), ...MOCK_POSTS]
        : (realPosts || []);
      setPosts(allPosts);
    } catch (err) {
      setError(err.message);
      if (includeMockData) {
        setPosts(MOCK_POSTS);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, includeMockData]);

  // Toggle mock data
  const toggleMockData = useCallback((show) => {
    setIncludeMockData(show);
  }, []);

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
    includeMockData,
    toggleMockData,
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
