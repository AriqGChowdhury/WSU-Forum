/**
 * Application Constants
 * =====================
 */

// Navigation Routes
export const ROUTES = {
  AUTH: 'auth',
  VERIFY: 'verify',
  FEED: 'feed',
  TOPICS: 'topics',
  SUBFORUMS: 'subforums',
  SUBFORUM: 'subforum',
  EVENTS: 'events',
  SAVED: 'saved',
  PROFILE: 'profile',
  SETTINGS: 'settings',
  LOUNGE: 'lounge',
  ADMIN: 'admin',
};

// Post Content Types
export const CONTENT_TYPES = {
  DISCUSSION: 'discussion',
  EVENT: 'event',
  QUESTION: 'question',
  ANNOUNCEMENT: 'announcement',
  POLL: 'poll',
};

// Event RSVP Status
export const RSVP_STATUS = {
  GOING: 'going',
  INTERESTED: 'interested',
  NOT_GOING: 'not_going',
};

// User Roles
export const USER_ROLES = {
  STUDENT: 'Student',
  FACULTY: 'Faculty',
  STAFF: 'Staff',
  ALUMNI: 'Alumni',
  ADMIN: 'Admin',
};

// Role Badge Colors
export const ROLE_COLORS = {
  Student: { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc' },
  Faculty: { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
  Staff: { bg: '#f3e8ff', text: '#7c3aed', border: '#c4b5fd' },
  Alumni: { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
  Admin: { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' },
};

// Role Access Levels (higher = more access)
export const ROLE_ACCESS = {
  Student: 1,
  Alumni: 2,
  Staff: 3,
  Faculty: 4,
  Admin: 5,
};

// Sub-Forum Categories
export const SUBFORUM_CATEGORIES = {
  ACADEMICS: 'academics',
  CAMPUS_LIFE: 'campus_life',
  CAREER: 'career',
  GENERAL: 'general',
  STUDENT_ONLY: 'student_only',
  FACULTY_STAFF: 'faculty_staff',
};

// Sub-Forums Configuration
export const SUBFORUMS = [
  // Academics
  {
    id: 'cs',
    name: 'Computer Science',
    description: 'Programming, algorithms, tech discussions',
    category: 'academics',
    icon: 'Code',
    color: '#3b82f6',
    access: ['Student', 'Faculty', 'Staff', 'Alumni', 'Admin'],
  },
  {
    id: 'engineering',
    name: 'Engineering',
    description: 'All engineering disciplines',
    category: 'academics',
    icon: 'Cog',
    color: '#f59e0b',
    access: ['Student', 'Faculty', 'Staff', 'Alumni', 'Admin'],
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Finance, marketing, management',
    category: 'academics',
    icon: 'Briefcase',
    color: '#10b981',
    access: ['Student', 'Faculty', 'Staff', 'Alumni', 'Admin'],
  },
  {
    id: 'medicine',
    name: 'Medicine & Health',
    description: 'Medical students, nursing, health sciences',
    category: 'academics',
    icon: 'Heart',
    color: '#ef4444',
    access: ['Student', 'Faculty', 'Staff', 'Alumni', 'Admin'],
  },
  {
    id: 'arts',
    name: 'Arts & Sciences',
    description: 'Liberal arts, sciences, humanities',
    category: 'academics',
    icon: 'Palette',
    color: '#8b5cf6',
    access: ['Student', 'Faculty', 'Staff', 'Alumni', 'Admin'],
  },

  // Campus Life
  {
    id: 'housing',
    name: 'Housing',
    description: 'Dorms, apartments, roommate finder',
    category: 'campus_life',
    icon: 'Home',
    color: '#06b6d4',
    access: ['Student', 'Faculty', 'Staff', 'Alumni', 'Admin'],
  },
  {
    id: 'dining',
    name: 'Dining',
    description: 'Meal plans, campus food, restaurants',
    category: 'campus_life',
    icon: 'UtensilsCrossed',
    color: '#f97316',
    access: ['Student', 'Faculty', 'Staff', 'Alumni', 'Admin'],
  },
  {
    id: 'clubs',
    name: 'Clubs & Organizations',
    description: 'Student orgs, clubs, Greek life',
    category: 'campus_life',
    icon: 'Users',
    color: '#ec4899',
    access: ['Student', 'Faculty', 'Staff', 'Alumni', 'Admin'],
  },
  {
    id: 'sports',
    name: 'Sports & Recreation',
    description: 'Athletics, intramurals, gym',
    category: 'campus_life',
    icon: 'Trophy',
    color: '#84cc16',
    access: ['Student', 'Faculty', 'Staff', 'Alumni', 'Admin'],
  },

  // Career
  {
    id: 'internships',
    name: 'Internships',
    description: 'Internship opportunities and experiences',
    category: 'career',
    icon: 'GraduationCap',
    color: '#6366f1',
    access: ['Student', 'Faculty', 'Staff', 'Alumni', 'Admin'],
  },
  {
    id: 'jobs',
    name: 'Job Postings',
    description: 'Full-time, part-time, campus jobs',
    category: 'career',
    icon: 'Briefcase',
    color: '#14b8a6',
    access: ['Student', 'Faculty', 'Staff', 'Alumni', 'Admin'],
  },
  {
    id: 'resume',
    name: 'Resume & Interview Help',
    description: 'Career advice, resume reviews',
    category: 'career',
    icon: 'FileText',
    color: '#a855f7',
    access: ['Student', 'Faculty', 'Staff', 'Alumni', 'Admin'],
  },

  // General
  {
    id: 'announcements',
    name: 'Announcements',
    description: 'Official university announcements',
    category: 'general',
    icon: 'Megaphone',
    color: '#0c5449',
    access: ['Student', 'Faculty', 'Staff', 'Alumni', 'Admin'],
    postAccess: ['Faculty', 'Staff', 'Admin'], // Only these can post
  },
  {
    id: 'marketplace',
    name: 'Buy/Sell/Trade',
    description: 'Textbooks, furniture, items for sale',
    category: 'general',
    icon: 'ShoppingBag',
    color: '#eab308',
    access: ['Student', 'Faculty', 'Staff', 'Alumni', 'Admin'],
  },
  {
    id: 'offtopic',
    name: 'Off-Topic',
    description: 'Random discussions, memes, fun stuff',
    category: 'general',
    icon: 'MessageCircle',
    color: '#64748b',
    access: ['Student', 'Faculty', 'Staff', 'Alumni', 'Admin'],
  },

  // Student Only
  {
    id: 'study-groups',
    name: 'Study Groups',
    description: 'Find study partners and groups',
    category: 'student_only',
    icon: 'BookOpen',
    color: '#0ea5e9',
    access: ['Student', 'Admin'],
  },
  {
    id: 'roommates',
    name: 'Roommate Finder',
    description: 'Find roommates for next semester',
    category: 'student_only',
    icon: 'UserPlus',
    color: '#22c55e',
    access: ['Student', 'Admin'],
  },
  {
    id: 'student-life',
    name: 'Student Life',
    description: 'Student-only discussions and advice',
    category: 'student_only',
    icon: 'Sparkles',
    color: '#f472b6',
    access: ['Student', 'Admin'],
  },

  // Faculty & Staff Only
  {
    id: 'faculty-lounge',
    name: 'Faculty Lounge',
    description: 'Private faculty discussions',
    category: 'faculty_staff',
    icon: 'Coffee',
    color: '#78350f',
    access: ['Faculty', 'Admin'],
  },
  {
    id: 'committees',
    name: 'Committees',
    description: 'Committee discussions and planning',
    category: 'faculty_staff',
    icon: 'Users',
    color: '#1e40af',
    access: ['Faculty', 'Staff', 'Admin'],
  },
  {
    id: 'resources',
    name: 'Teaching Resources',
    description: 'Share teaching materials and tips',
    category: 'faculty_staff',
    icon: 'FolderOpen',
    color: '#7c2d12',
    access: ['Faculty', 'Staff', 'Admin'],
  },
];

// Category Labels
export const CATEGORY_LABELS = {
  academics: { name: 'Academics', icon: 'GraduationCap', color: '#3b82f6' },
  campus_life: { name: 'Campus Life', icon: 'Building', color: '#10b981' },
  career: { name: 'Career', icon: 'Briefcase', color: '#8b5cf6' },
  general: { name: 'General', icon: 'Globe', color: '#64748b' },
  student_only: { name: 'Students Only', icon: 'UserCheck', color: '#0ea5e9' },
  faculty_staff: { name: 'Faculty & Staff', icon: 'Shield', color: '#78350f' },
};

// Validation Rules
export const VALIDATION = {
  POST_TITLE_MIN: 3,
  POST_TITLE_MAX: 100,
  POST_BODY_MIN: 10,
  POST_BODY_MAX: 5000,
  COMMENT_MIN: 1,
  COMMENT_MAX: 1000,
  BIO_MAX: 500,
};

// WSU Brand Colors
export const COLORS = {
  WSU_GREEN: '#0c5449',
  WSU_GOLD: '#ffc82e',
  WSU_GRAY: '#f5f5f5',
};

// Helper function to check if user can access a subforum
export const canAccessSubforum = (userRole, subforum) => {
  if (!subforum.access) return true;
  return subforum.access.includes(userRole);
};

// Helper function to check if user can post in a subforum
export const canPostInSubforum = (userRole, subforum) => {
  if (subforum.postAccess) {
    return subforum.postAccess.includes(userRole);
  }
  return canAccessSubforum(userRole, subforum);
};

// Get subforums user can access
export const getAccessibleSubforums = (userRole) => {
  return SUBFORUMS.filter(sf => canAccessSubforum(userRole, sf));
};

// Get subforums by category
export const getSubforumsByCategory = (category, userRole) => {
  return SUBFORUMS.filter(sf => 
    sf.category === category && canAccessSubforum(userRole, sf)
  );
};
