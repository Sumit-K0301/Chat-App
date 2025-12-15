# Real-Time Chat Application

A full-stack, real-time messaging application built with the MERN stack. This project utilizes modern web development practices including React 19, Tailwind CSS 4, and Socket.io for instant bi-directional communication.

## 🚀 Tech Stack

### Frontend
| Tech | Description |
| :--- | :--- |
| **React 19** | Latest UI library for building user interfaces |
| **Vite** | Next-generation frontend tooling |
| **Tailwind CSS 4** | Utility-first CSS framework for rapid styling |
| **DaisyUI 5** | Component library for Tailwind CSS |
| **Zustand** | Small, fast, and scalable state management |
| **TanStack Query** | Powerful asynchronous state management for server state |
| **React Hook Form** | Performant, flexible, and extensible forms |
| **Socket.io Client** | Real-time bidirectional event-based communication |
| **React Hot Toast** | Beautiful notifications |

### Backend
| Tech | Description |
| :--- | :--- |
| **Node.js & Express 5** | Runtime environment and web framework |
| **MongoDB & Mongoose** | NoSQL database and object modeling |
| **Socket.io** | Real-time engine for WebSockets |
| **JWT** | JSON Web Tokens for secure authentication |
| **Cloudinary** | Cloud storage for profile and message images |
| **Multer** | Middleware for handling `multipart/form-data` |
| **Arcjet** | Security layer (Rate limiting & bot protection) |
| **SendGrid** | Email delivery service |

---

## ✨ Features

* **Real-time Messaging:** Instant delivery of messages using Socket.io.
* **Authentication:** Secure Signup/Login with JWT (HTTP-Only cookies) and BCrypt hashing.
* **Media Sharing:** Image uploads in chat and profile pictures via Cloudinary.
* **Global State Management:** Seamless state handling with Zustand.
* **Online Status:** Real-time online/offline user indicators.
* **Security:** Rate limiting and protection via Arcjet; Input validation via Express Validator.

---

## 🛠️ Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file in the **server** directory.

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key

# Cloudinary (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Arcjet (Security)
ARCJET_KEY=your_arcjet_key

# SendGrid (Email) - Optional if implemented
SENDGRID_API_KEY=your_sendgrid_key