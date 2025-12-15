import express from "express"
import cors from 'cors';
import cookieParser from 'cookie-parser';
import arcjet from './middlewares/arcjet.js';
import { v2 as cloudinary } from 'cloudinary';

import { app, server} from "../src/socket/socket.js"

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import messagesRoutes from './routes/messages.routes.js';

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({
    extended: true }));


app.use("/api/auth", arcjet, authRoutes)
app.use("/api/user", arcjet, userRoutes)
app.use("/api/messages", messagesRoutes)


export {app, server};