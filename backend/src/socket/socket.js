import { Server } from "socket.io";
import http from "http";
import socketAuthMiddleware from "../middlewares/socket.js";
import Group from "../models/group.model.js";

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

// This is for storing online users
const userSocketMap = {};           //{userId:socketId}

io.on("connection", async (socket) => {
  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ── Join group rooms (F4) ────────────────────────────────────
  try {
    const groups = await Group.find({ members: userId });
    groups.forEach((group) => {
      socket.join(`group:${group._id}`);
    });
  } catch (err) {
    console.error("Error joining group rooms:", err.message);
  }

  // ── Typing indicators (F2) ──────────────────────────────────
  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId: userId });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { senderId: userId });
    }
  });

  // ── Group typing (F4 + F2) ──────────────────────────────────
  socket.on("groupTyping", ({ groupId }) => {
    socket.to(`group:${groupId}`).emit("groupTyping", { senderId: userId, groupId });
  });

  socket.on("groupStopTyping", ({ groupId }) => {
    socket.to(`group:${groupId}`).emit("groupStopTyping", { senderId: userId, groupId });
  });

  // ── Join a new group room (when user is added to a group) ───
  socket.on("joinGroup", ({ groupId }) => {
    socket.join(`group:${groupId}`);
  });

  // ── Disconnect ──────────────────────────────────────────────
  socket.on("disconnect", () => {
    // Only remove if this socket is still the active one for this user
    if (userSocketMap[userId] === socket.id) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { app, server, io }