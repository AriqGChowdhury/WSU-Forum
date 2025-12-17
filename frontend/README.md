# WSU Forum

A modern, full-featured forum application for Wayne State University built with React, Vite, and TailwindCSS.

## 🚀 Features

- **Authentication** - SSO and email/password login with verification
- **Feed** - Create, edit, delete posts with likes and saves
- **Topics** - Browse and follow discussion topics
- **Events** - View and RSVP to campus events
- **Saved Posts** - Bookmark posts for later
- **Profile** - View and edit your profile
- **Settings** - Manage notifications and preferences
- **Lounge** - Real-time chat rooms (demo)

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication views
│   ├── events/         # Events components
│   ├── feed/           # Feed and posts
│   ├── layout/         # Header, Sidebar, Navigation
│   ├── lounge/         # Chat lounge
│   ├── profile/        # Profile view
│   ├── saved/          # Saved posts
│   ├── settings/       # Settings view
│   ├── topics/         # Topics view
│   └── ui/             # shadcn/ui components
├── contexts/           # React contexts (Auth, Posts)
├── constants/          # App constants and routes
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── services/           # API service layer
└── styles/             # CSS and Tailwind styles
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:3000 in your browser

### Build for Production

```bash
npm run build
npm run preview
```

## 🔌 Backend Integration

The app is ready for backend API integration. To connect your backend:

1. Open `src/services/api.js`
2. Set `CONFIG.USE_MOCKS = false`
3. Update `CONFIG.BASE_URL` to your API URL
4. Add your API key/auth token handling

### API Endpoints Expected

```
POST   /auth/login          - Sign in
POST   /auth/register       - Sign up
POST   /auth/sso            - SSO sign in
POST   /auth/logout         - Sign out
POST   /auth/verify         - Verify email
GET    /auth/me             - Get current user

GET    /posts               - Get all posts
POST   /posts               - Create post
PATCH  /posts/:id           - Update post
DELETE /posts/:id           - Delete post
POST   /posts/:id/like      - Toggle like
POST   /posts/:id/save      - Toggle save
POST   /posts/:id/comments  - Add comment

GET    /topics              - Get all topics
POST   /topics/:id/follow   - Follow topic
DELETE /topics/:id/follow   - Unfollow topic

GET    /events              - Get all events
POST   /events/:id/rsvp     - RSVP to event

PATCH  /users/me            - Update profile
GET    /users/me/saved      - Get saved posts
```

## 🎨 Customization

### Colors

WSU brand colors are defined in `src/styles/index.css`:

```css
:root {
  --wsu-green: #0c5449;
  --wsu-gold: #ffc82e;
  --wsu-gray: #f5f5f5;
}
```

### Components

UI components are from [shadcn/ui](https://ui.shadcn.com/) and can be customized in `src/components/ui/`.

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
