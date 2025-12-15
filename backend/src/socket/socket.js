import { Server } from "socket.io";
import http from "http";
import socketAuthMiddleware from "../middlewares/socket.js";

import express from "express"

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

// Apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// We will use this function to check if the user is online or not
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// This is for storig online users
const userSocketMap = {};           //{userId:socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.user.fullname);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // With socket.on we listen for events from clients
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.fullname);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io }