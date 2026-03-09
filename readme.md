# 💬 Chat App

A feature-rich, real-time chat application built with the MERN stack. Supports direct messaging, group chats, file sharing, message reactions, and more.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 Authentication | JWT-based auth with httpOnly cookies |
| 💬 Real-time Messaging | Socket.io powered instant delivery |
| 👥 Group Chats | Create and manage group conversations |
| 📎 File Sharing | Send images, PDFs, documents, and more |
| ✅ Read Receipts | See when messages are delivered and read |
| ⌨️ Typing Indicators | See when someone is typing |
| 😀 Message Reactions | React to messages with emojis |
| 🔍 Message Search | Full-text search across conversations |
| 🗑️ Message Deletion | Soft-delete your sent messages |
| 📄 Pagination | Infinite scroll for message history |
| 🔔 Push Notifications | Browser notifications when offline |
| 📧 Email Verification | Verify email after registration |
| 🔑 Password Reset | Forgot password flow via email |
| 👤 User Bio & Status | Editable profile bio |
| 🌗 Dark/Light Theme | Toggle between dark and light mode |
| 🔊 Sound Effects | Keyboard and notification sounds |
| 🛡️ Security | Arcjet, Helmet, input sanitization |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Zustand, TanStack Query, Socket.io Client, DaisyUI |
| Backend | Node.js, Express 5, Socket.io, Mongoose |
| Database | MongoDB |
| Media | Cloudinary |
| Email | SendGrid |
| Security | Arcjet, Helmet, express-mongo-sanitize, JWT, bcrypt |
| Push | web-push (VAPID) |

## 📁 Project Structure

```
Chat-App/
├── backend/
│   └── src/
│       ├── config/
│       │   ├── arcjet.js          # Arcjet rate limiting config
│       │   ├── cloudinary.js      # Cloudinary SDK config
│       │   └── cookie.js          # Centralized cookie options
│       ├── controllers/
│       │   ├── auth.controller.js    # Login, logout, forgot/reset password
│       │   ├── group.controller.js   # Group CRUD + messaging
│       │   ├── message.controller.js # Messages, search, reactions, read receipts
│       │   ├── notification.controller.js # Push subscription management
│       │   └── user.controller.js    # Register, profile, email verification
│       ├── middlewares/
│       │   ├── arcjet.js           # Arcjet middleware
│       │   ├── auth.js             # JWT verification
│       │   ├── multer.js           # File upload (image + document filters)
│       │   └── socket.js           # Socket.io auth middleware
│       ├── models/
│       │   ├── group.model.js      # Group schema
│       │   ├── message.model.js    # Message schema (with reactions, file, status)
│       │   └── user.model.js       # User schema (with bio, verification, push)
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── group.routes.js
│       │   ├── messages.routes.js
│       │   └── notification.routes.js
│       ├── services/
│       │   ├── cloudinary.service.js # Image + file upload
│       │   ├── email.service.js      # Welcome, verification, reset emails
│       │   └── push.service.js       # Web Push notifications
│       ├── socket/
│       │   └── socket.js            # Socket.io server + events
│       ├── utilities/
│       │   └── generateToken.js
│       ├── db/
│       │   └── connectDB.js
│       ├── app.js                    # Express app setup
│       └── index.js                  # Server entry point
│
└── frontend/
    └── src/
        ├── api/
        │   ├── axios.js              # Axios instance
        │   └── apiClient.js          # All API functions (22 endpoints)
        ├── components/
        │   ├── chat/
        │   │   ├── ChatContainer.jsx     # Messages view + infinite scroll
        │   │   ├── ChatHeader.jsx        # Chat partner header
        │   │   ├── MessageBubble.jsx     # Single message (status, reactions, delete, file)
        │   │   ├── MessageInput.jsx      # Input + file upload + typing events
        │   │   ├── MessageSearch.jsx     # Full-text search bar
        │   │   ├── NoChatHistoryPlaceholder.jsx
        │   │   ├── NoConversationPlaceholder.jsx
        │   │   └── TypingIndicator.jsx   # Animated typing dots
        │   ├── sidebar/
        │   │   ├── ActiveTabSwitch.jsx
        │   │   ├── ChatsList.jsx
        │   │   ├── ContactList.jsx
        │   │   ├── CreateGroupModal.jsx  # Group creation dialog
        │   │   ├── GroupsList.jsx        # Groups list
        │   │   ├── NoChatsFound.jsx
        │   │   ├── ProfileHeader.jsx     # Profile + bio + theme + logout
        │   │   └── UserCard.jsx          # Shared user card component
        │   └── common/
        │       ├── BorderAnimatedContainer.jsx
        │       ├── ErrorBoundary.jsx
        │       ├── MessagesLoadingSkeleton.jsx
        │       ├── PageLoader.jsx
        │       ├── ThemeToggle.jsx       # Dark/light mode switch
        │       └── UsersLoadingSkeleton.jsx
        ├── hooks/
        │   └── useKeyboardSound.js
        ├── pages/
        │   ├── ErrorPage.jsx
        │   ├── ForgotPasswordPage.jsx
        │   ├── LoginPage.jsx
        │   ├── MessagePage.jsx
        │   ├── ResetPasswordPage.jsx
        │   ├── SignupPage.jsx
        │   └── VerifyEmailPage.jsx
        ├── store/
        │   ├── useAuthStore.js
        │   ├── useChatStore.js
        │   ├── useGroupStore.js
        │   └── useThemeStore.js
        ├── App.jsx
        ├── main.jsx
        └── index.css
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- SendGrid account (for emails)

### 1. Clone & Install
```bash
git clone <repo-url>
cd Chat-App

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Environment Variables

**Backend `.env`:**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/chat-app
JWT_SECRET=your-jwt-secret-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
ARCJET_KEY=your-arcjet-key
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=your@email.com
FRONTEND_URL=http://localhost:5173

# Optional: Push notifications
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

Generate VAPID keys: `npx web-push generate-vapid-keys`

**Frontend `.env`:**
```env
VITE_BACKEND_URL=http://localhost:5000
```

### 3. Run
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

Open `http://localhost:5173` in your browser.

## 🔒 Security

- **Arcjet** — Rate limiting & bot detection on all API routes
- **Helmet** — HTTP security headers (HSTS, X-Frame-Options, CSP, etc.)
- **express-mongo-sanitize** — Prevents NoSQL injection attacks
- **JWT httpOnly cookies** — Secure token storage
- **bcrypt** — Password hashing (10 salt rounds)
- **toJSON transforms** — Passwords and tokens stripped from all responses
- **Multer file filters** — Only allowed file types processed
- **Input validation** — express-validator on auth routes

## 📄 License

MIT