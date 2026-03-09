import express from "express"
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import arcjet from './middlewares/arcjet.js';
import configureCloudinary from './config/cloudinary.js';

import { app, server } from "../src/socket/socket.js"

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import messagesRoutes from './routes/messages.routes.js';
import groupRoutes from './routes/group.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import searchRoutes from './routes/search.routes.js';
import nicknameRoutes from './routes/nickname.routes.js';

// Custom sanitizer (express-mongo-sanitize is incompatible with Express 5's read-only req.query)
const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
            if (key.startsWith('$') || key.includes('.')) {
                delete obj[key];
            } else {
                sanitize(obj[key]);
            }
        }
    }
};
const mongoSanitize = (req, res, next) => {
    if (req.body) sanitize(req.body);
    if (req.params) sanitize(req.params);
    next();
};

configureCloudinary();

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({
    extended: true
}));
app.use(mongoSanitize);


app.use("/api/auth", arcjet, authRoutes)
app.use("/api/user", arcjet, userRoutes)
app.use("/api/messages", arcjet, messagesRoutes)
app.use("/api/groups", arcjet, groupRoutes)
app.use("/api/notifications", arcjet, notificationRoutes)
app.use("/api/search", arcjet, searchRoutes)
app.use("/api/nicknames", arcjet, nicknameRoutes)


export { app, server };