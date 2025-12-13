/**
 * API Service Layer
 * =================
 * Centralized API configuration and methods.
 * Currently uses mock data - swap BASE_URL and remove mocks for production.
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api',
  TIMEOUT: 10000,
  USE_MOCKS: true, // Set to false when backend is ready
};

// ============================================================================
// HTTP CLIENT
// ============================================================================

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiError(response.status, error.message || 'Request failed');
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(0, 'Network error');
    }
  }

  get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_DATA = {
  user: {
    id: 'u_wsu_001',
    name: 'Jean D.',
    email: 'jean.d@wayne.edu',
    role: 'Student',
    major: 'Computer Science',
    year: 'Junior',
    avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Jean',
    bio: 'CS student passionate about AI and web development.',
    joinedAt: '2024-09-01',
    stats: { posts: 12, followers: 45, following: 32 },
  },

  posts: [
    {
      id: 'p1',
      author: { 
        id: 'u_ali', 
        name: 'Ali Z.', 
        avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Ali',
        role: 'Student'
      },
      subforumId: 'cs',
      topicId: 't2',
      topicName: 'CS & AI',
      title: 'Best starter project for CNNs?',
      body: 'Trying to build something simple that still teaches the core ideas. Any suggestions for a beginner-friendly project?',
      liked: false,
      saved: true,
      likes: 9,
      comments: [
        { 
          id: 'c1', 
          author: { id: 'u_jay', name: 'Jay M.', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Jay', role: 'Student' },
          text: 'MNIST or CIFAR-10 is perfect. Keep it small, track overfitting.',
          createdAt: '1h ago'
        },
      ],
      createdAt: '2h ago',
      contentType: 'discussion',
    },
    {
      id: 'p2',
      author: { 
        id: 'u_robotics', 
        name: 'WSU Robotics', 
        avatar: 'https://api.dicebear.com/8.x/shapes/svg?seed=WSU',
        role: 'Staff'
      },
      subforumId: 'clubs',
      topicId: 't3',
      topicName: 'Events',
      title: 'Tonight: drivetrain tear-down stream',
      body: "We'll live stream at 7pm. Bring questions about brushless motors & PID tuning. Everyone welcome!",
      liked: true,
      saved: false,
      likes: 31,
      comments: [],
      createdAt: '6h ago',
      contentType: 'event',
      eventDate: '2025-12-15',
      eventTime: '19:00',
      eventPlace: 'Engineering 1500',
    },
    {
      id: 'p3',
      author: { 
        id: 'u_sarah', 
        name: 'Sarah K.', 
        avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Sarah',
        role: 'Student'
      },
      subforumId: 'roommates',
      topicId: 't4',
      topicName: 'Housing',
      title: 'Roommate needed for Winter semester',
      body: 'Looking for a roommate to share a 2BR apartment near campus. $650/month including utilities. DM if interested!',
      liked: false,
      saved: false,
      likes: 5,
      comments: [],
      createdAt: '1d ago',
      contentType: 'discussion',
    },
    {
      id: 'p4',
      author: { 
        id: 'u_drsmith', 
        name: 'Dr. Smith', 
        avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=DrSmith',
        role: 'Faculty'
      },
      subforumId: 'announcements',
      topicId: 't1',
      topicName: 'Announcements',
      title: 'Final Exam Schedule Released',
      body: 'The final exam schedule for Fall 2025 has been posted. Please check the registrar website for your specific times. Office hours will be extended during finals week.',
      liked: true,
      saved: true,
      likes: 45,
      comments: [
        { 
          id: 'c2', 
          author: { id: 'u_mike', name: 'Mike L.', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Mike', role: 'Student' },
          text: 'Thanks for the heads up!',
          createdAt: '30m ago'
        },
      ],
      createdAt: '4h ago',
      contentType: 'announcement',
    },
    {
      id: 'p5',
      author: { 
        id: 'u_emma', 
        name: 'Emma T.', 
        avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Emma',
        role: 'Student'
      },
      subforumId: 'study-groups',
      topicId: 't6',
      topicName: 'Study Groups',
      title: 'Study group for CSC 4500 Algorithms?',
      body: 'Anyone want to form a study group for the Algorithms final? Planning to meet at the library this weekend.',
      liked: false,
      saved: false,
      likes: 12,
      comments: [
        { 
          id: 'c3', 
          author: { id: 'u_alex', name: 'Alex P.', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Alex', role: 'Student' },
          text: "I'm in! DM me the details.",
          createdAt: '2h ago'
        },
      ],
      createdAt: '5h ago',
      contentType: 'question',
    },
    {
      id: 'p6',
      author: { 
        id: 'u_career', 
        name: 'Career Services', 
        avatar: 'https://api.dicebear.com/8.x/shapes/svg?seed=Career',
        role: 'Staff'
      },
      subforumId: 'internships',
      topicId: 't7',
      topicName: 'Career',
      title: 'Summer 2026 Internship Fair - Register Now!',
      body: 'Over 50 companies will be attending our annual internship fair on January 15th. Registration is required. Free professional headshots available!',
      liked: true,
      saved: true,
      likes: 89,
      comments: [],
      createdAt: '1d ago',
      contentType: 'event',
      eventDate: '2026-01-15',
      eventTime: '10:00',
      eventPlace: 'Student Center Ballroom',
    },
    {
      id: 'p7',
      author: { 
        id: 'u_jason', 
        name: 'Jason R.', 
        avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Jason',
        role: 'Student'
      },
      subforumId: 'marketplace',
      topicId: 't5',
      topicName: 'Marketplace',
      title: 'Selling: Calculus textbook (Stewart 9th Ed)',
      body: 'Barely used, no highlighting. $50 OBO. Can meet on campus.',
      liked: false,
      saved: false,
      likes: 3,
      comments: [],
      createdAt: '2d ago',
      contentType: 'discussion',
    },
  ],

  topics: [
    { id: 't1', name: 'Announcements', description: 'Official WSU announcements', followers: 1234, color: '#0c5449' },
    { id: 't2', name: 'CS & AI', description: 'Computer Science and AI discussions', followers: 856, color: '#3b82f6' },
    { id: 't3', name: 'Events', description: 'Campus events and activities', followers: 2103, color: '#f59e0b' },
    { id: 't4', name: 'Housing', description: 'Housing and roommate finder', followers: 445, color: '#8b5cf6' },
    { id: 't5', name: 'Marketplace', description: 'Buy, sell, and trade', followers: 678, color: '#10b981' },
    { id: 't6', name: 'Study Groups', description: 'Find study partners', followers: 523, color: '#ec4899' },
    { id: 't7', name: 'Career', description: 'Jobs, internships, and career advice', followers: 892, color: '#6366f1' },
    { id: 't8', name: 'Sports', description: 'WSU athletics and intramurals', followers: 1567, color: '#ef4444' },
  ],

  events: [
    { 
      id: 'e1', 
      title: 'AI/ML Club Meetup', 
      description: 'Monthly meetup to discuss latest AI trends and projects.',
      date: '2025-12-20', 
      time: '18:00',
      place: 'Prentis 2F', 
      going: 42,
      interested: 78,
      organizer: 'AI/ML Club',
      image: null,
    },
    { 
      id: 'e2', 
      title: 'Robotics Demo Night', 
      description: 'See student robotics projects in action!',
      date: '2025-12-22', 
      time: '19:00',
      place: 'Engineering 1500', 
      going: 87,
      interested: 156,
      organizer: 'WSU Robotics',
      image: null,
    },
    { 
      id: 'e3', 
      title: 'Winter Career Fair', 
      description: 'Connect with top employers recruiting WSU students.',
      date: '2025-12-28', 
      time: '10:00',
      place: 'Student Center Ballroom', 
      going: 256,
      interested: 890,
      organizer: 'Career Services',
      image: null,
    },
    { 
      id: 'e4', 
      title: 'Study Jam: Finals Week', 
      description: 'Group study session with free coffee and snacks.',
      date: '2025-12-18', 
      time: '14:00',
      place: 'Library 3rd Floor', 
      going: 34,
      interested: 89,
      organizer: 'Student Government',
      image: null,
    },
  ],
};

// ============================================================================
// MOCK API HELPERS
// ============================================================================

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const mockResponse = async (data, delayMs = 300) => {
  await delay(delayMs);
  return JSON.parse(JSON.stringify(data)); // Deep clone
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
    async signInWithSSO() {
      if (CONFIG.USE_MOCKS) {
        return mockResponse({ user: MOCK_DATA.user, token: 'mock_token_123' }, 600);
      }
      return client.post('/auth/sso');
    },

    async signIn(email, password) {
      if (CONFIG.USE_MOCKS) {
        await delay(500);
        if (email && password) {
          return { user: MOCK_DATA.user, token: 'mock_token_123' };
        }
        throw new ApiError(401, 'Invalid credentials');
      }
      return client.post('/auth/login', { email, password });
    },

    async signUp(data) {
      if (CONFIG.USE_MOCKS) {
        return mockResponse({ user: { ...MOCK_DATA.user, ...data }, token: 'mock_token_123' }, 600);
      }
      return client.post('/auth/register', data);
    },

    async signOut() {
      if (CONFIG.USE_MOCKS) {
        return mockResponse({ success: true }, 200);
      }
      return client.post('/auth/logout');
    },

    async verifyEmail(code) {
      if (CONFIG.USE_MOCKS) {
        await delay(400);
        if (code === '123456') {
          return { verified: true };
        }
        throw new ApiError(400, 'Invalid verification code');
      }
      return client.post('/auth/verify', { code });
    },

    async forgotPassword(email) {
      if (CONFIG.USE_MOCKS) {
        return mockResponse({ sent: true }, 400);
      }
      return client.post('/auth/forgot-password', { email });
    },

    async getMe() {
      if (CONFIG.USE_MOCKS) {
        return mockResponse({ user: MOCK_DATA.user });
      }
      return client.get('/auth/me');
    },
  },

  // --------------------------------------------------------------------------
  // POSTS
  // --------------------------------------------------------------------------
  posts: {
    async getAll(params = {}) {
      if (CONFIG.USE_MOCKS) {
        let posts = [...MOCK_DATA.posts];
        if (params.topicId) {
          posts = posts.filter((p) => p.topicId === params.topicId);
        }
        return mockResponse({ posts });
      }
      return client.get('/posts', params);
    },

    async getById(id) {
      if (CONFIG.USE_MOCKS) {
        const post = MOCK_DATA.posts.find((p) => p.id === id);
        if (!post) throw new ApiError(404, 'Post not found');
        return mockResponse({ post });
      }
      return client.get(`/posts/${id}`);
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
          createdAt: 'Just now',
          ...data,
        };
        MOCK_DATA.posts.unshift(newPost);
        return mockResponse({ post: newPost }, 400);
      }
      return client.post('/posts', data);
    },

    async update(id, data) {
      if (CONFIG.USE_MOCKS) {
        const index = MOCK_DATA.posts.findIndex((p) => p.id === id);
        if (index === -1) throw new ApiError(404, 'Post not found');
        MOCK_DATA.posts[index] = { ...MOCK_DATA.posts[index], ...data };
        return mockResponse({ post: MOCK_DATA.posts[index] });
      }
      return client.patch(`/posts/${id}`, data);
    },

    async delete(id) {
      if (CONFIG.USE_MOCKS) {
        const index = MOCK_DATA.posts.findIndex((p) => p.id === id);
        if (index !== -1) MOCK_DATA.posts.splice(index, 1);
        return mockResponse({ success: true });
      }
      return client.delete(`/posts/${id}`);
    },

    async like(id) {
      if (CONFIG.USE_MOCKS) {
        const post = MOCK_DATA.posts.find((p) => p.id === id);
        if (post) {
          post.liked = !post.liked;
          post.likes += post.liked ? 1 : -1;
        }
        return mockResponse({ liked: post?.liked, likes: post?.likes });
      }
      return client.post(`/posts/${id}/like`);
    },

    async save(id) {
      if (CONFIG.USE_MOCKS) {
        const post = MOCK_DATA.posts.find((p) => p.id === id);
        if (post) post.saved = !post.saved;
        return mockResponse({ saved: post?.saved });
      }
      return client.post(`/posts/${id}/save`);
    },

    async addComment(postId, text) {
      if (CONFIG.USE_MOCKS) {
        const post = MOCK_DATA.posts.find((p) => p.id === postId);
        if (!post) throw new ApiError(404, 'Post not found');
        const comment = {
          id: `c_${Date.now()}`,
          author: MOCK_DATA.user,
          text,
          createdAt: 'Just now',
        };
        post.comments.push(comment);
        return mockResponse({ comment });
      }
      return client.post(`/posts/${postId}/comments`, { text });
    },
  },

  // --------------------------------------------------------------------------
  // TOPICS
  // --------------------------------------------------------------------------
  topics: {
    async getAll() {
      if (CONFIG.USE_MOCKS) {
        return mockResponse({ topics: MOCK_DATA.topics }, 200);
      }
      return client.get('/topics');
    },

    async getById(id) {
      if (CONFIG.USE_MOCKS) {
        const topic = MOCK_DATA.topics.find((t) => t.id === id);
        if (!topic) throw new ApiError(404, 'Topic not found');
        return mockResponse({ topic });
      }
      return client.get(`/topics/${id}`);
    },

    async follow(id) {
      if (CONFIG.USE_MOCKS) {
        const topic = MOCK_DATA.topics.find((t) => t.id === id);
        if (topic) topic.followers += 1;
        return mockResponse({ followed: true });
      }
      return client.post(`/topics/${id}/follow`);
    },

    async unfollow(id) {
      if (CONFIG.USE_MOCKS) {
        const topic = MOCK_DATA.topics.find((t) => t.id === id);
        if (topic) topic.followers -= 1;
        return mockResponse({ followed: false });
      }
      return client.delete(`/topics/${id}/follow`);
    },
  },

  // --------------------------------------------------------------------------
  // EVENTS
  // --------------------------------------------------------------------------
  events: {
    async getAll(params = {}) {
      if (CONFIG.USE_MOCKS) {
        return mockResponse({ events: MOCK_DATA.events }, 200);
      }
      return client.get('/events', params);
    },

    async getById(id) {
      if (CONFIG.USE_MOCKS) {
        const event = MOCK_DATA.events.find((e) => e.id === id);
        if (!event) throw new ApiError(404, 'Event not found');
        return mockResponse({ event });
      }
      return client.get(`/events/${id}`);
    },

    async rsvp(id, status) {
      if (CONFIG.USE_MOCKS) {
        const event = MOCK_DATA.events.find((e) => e.id === id);
        if (event && status === 'going') event.going += 1;
        if (event && status === 'interested') event.interested += 1;
        return mockResponse({ status });
      }
      return client.post(`/events/${id}/rsvp`, { status });
    },
  },

  // --------------------------------------------------------------------------
  // USER / PROFILE
  // --------------------------------------------------------------------------
  users: {
    async getProfile(id) {
      if (CONFIG.USE_MOCKS) {
        return mockResponse({ user: MOCK_DATA.user });
      }
      return client.get(`/users/${id}`);
    },

    async updateProfile(data) {
      if (CONFIG.USE_MOCKS) {
        Object.assign(MOCK_DATA.user, data);
        return mockResponse({ user: MOCK_DATA.user });
      }
      return client.patch('/users/me', data);
    },

    async getSavedPosts() {
      if (CONFIG.USE_MOCKS) {
        const saved = MOCK_DATA.posts.filter((p) => p.saved);
        return mockResponse({ posts: saved });
      }
      return client.get('/users/me/saved');
    },
  },

  // --------------------------------------------------------------------------
  // REPORTS
  // --------------------------------------------------------------------------
  reports: {
    async create({ type, targetId, reason }) {
      if (CONFIG.USE_MOCKS) {
        return mockResponse({ success: true, reportId: `r_${Date.now()}` }, 350);
      }
      return client.post('/reports', { type, targetId, reason });
    },
  },
};

// Export for direct use
export { ApiError, CONFIG };
export default api;
