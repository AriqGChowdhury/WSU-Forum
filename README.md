# WSU Forum

A modern, full-featured forum application for Wayne State University built with React, Vite, and TailwindCSS.

## 🚀 Features

- **Authentication** - JWT, SSO, email/password login with verification
- **Feed** - Create, edit, delete posts with likes and saves
- **Events** - View and RSVP to campus events
- **Saved Posts** - Bookmark posts for later
- **Profile** - View and edit your profile
- **Settings** - Manage notifications and preferences

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/         # React components
│       ├── auth/           # Authentication views
│       ├── events/         # Events components
│       ├── feed/           # Feed and posts
│       ├── layout/         # Header, Sidebar, Navigation
│       ├── lounge/         # Chat lounge
│       ├── profile/        # Profile view
│       ├── saved/          # Saved posts
│       ├── settings/       # Settings view
│       ├── topics/         # Topics view
│       └── ui/             # shadcn/ui components
│   ├──  contexts/          # React contexts (Auth, Posts)
│   ├── constants/          # App constants and routes
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── services/           # API service layer
│   └── styles/             # CSS and Tailwind styles

backend/
├── forum/                     #Django App
│   ├── services/              #Business Logic
│       ├── notifications.py   #Sends email notifications
│       └── service.py         #Backend Logic for all services, such as registration, login, etc.
│   ├── admin.py               #Configuration for admin interface
│   ├── apps.py                #App configuration
│   ├── models.py              #Model creation for database
│   ├── serializers.py         #Control API input validation, and output
│   ├── tests.py               #Automated testing
│   ├── tokens.py              #Token generation
│   ├── urls.py                #Defines URL routes
│   └── views.py               #HTTP interface
├── WSU_Forum                  #Django Project
│   ├── asgi.py                #Async entry point
│   ├── settings.py            #Django settings
│   ├── urls.py                #Defines project URL routes
│   └── wsgi.py                #Production entry point
└── manage.py                   #Entry script
```

## 🛠️ Getting Front-end Started

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
POST   /login          - Sign in
POST   /register       - Sign up
POST   /sso            - SSO sign in
POST   /logout         - Sign out
GET    /login          - Get current user

GET    /posts                              - Get all posts
POST   /posts                              - Create post
POST   /search                             - Search
PATCH  /posts/:id                          - Update post
DELETE /delete/post/<int:post_id           - Delete post
POST   /int:post_id/like                   - Toggle like
POST   /int:post_id/save                   - Toggle save
POST   /int:post_id/comments               - Add comment
PATCH  /settings                           - Update settings
GET    /settings                           - Get current settings
GET    /profile                            - Get current profile
GET    /profile/int:user_id                - View someones profile
POST   /follow/int:user_id                 - Follow/Unfollow someone
DELETE /int:post_id/comments               - Delete comment on a post
GET    /posts/int:post_id                  - View a single post in detail
GET    /subforums                          - Get all subforums with optional filtering
POST   /subforums                          - Request to create a subforum
POST /subforums/int:subforum_id/subscribe  - Subscribe to a subforum
DELETE /subforums/int:subforum_id/subscribe - Unsubscribe to a subforum
GET /subforums/int:subforum_id/posts        - View all posts in subforum




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

## 🛠️ Getting Back-end Started

### Prerequisites

- pip
- Python 3.10 +

### Installation

1. Install dependencies
```bash
pip install -r requirements.txt
```

2. Apply database migrations
```bash
python manage.py makemigrations
python manage.py migrate
```
3. Run server
```bash
python manage.py runserver
```

### Important
- Both the frontend and backend must be running at the same time to use the application.
- If you want to use only the backend, you can use tools like Postman and send requests to the endpoints defined in `forum/urls.py`.

## Authors
- Ariq Chowdhury - Backend
- Eman Jibril - Backend
- Alghada Badani - SCRUM Leader/Backend
- Jean Dilloway - Frontend
- Sanjeda Khan - Frontend


## 📝 License

MIT License

Copyright (c) 2025 Ariq Chowdhury

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
