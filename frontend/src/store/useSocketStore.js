import { create } from "zustand";
import { io } from "socket.io-client";

const useSocketStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],
  typingUsers: {},
  groupTypingUsers: {},

  connect: () => {
    if (get().socket?.connected) return;

    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    socket.on("typing", ({ senderId }) => {
      set({ typingUsers: { ...get().typingUsers, [senderId]: true } });
    });

    socket.on("stopTyping", ({ senderId }) => {
      const updated = { ...get().typingUsers };
      delete updated[senderId];
      set({ typingUsers: updated });
    });

    socket.on("groupTyping", ({ senderId, groupId }) => {
      const key = `${groupId}_${senderId}`;
      set({ groupTypingUsers: { ...get().groupTypingUsers, [key]: true } });
    });

    socket.on("groupStopTyping", ({ senderId, groupId }) => {
      const key = `${groupId}_${senderId}`;
      const updated = { ...get().groupTypingUsers };
      delete updated[key];
      set({ groupTypingUsers: updated });
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [], typingUsers: {}, groupTypingUsers: {} });
    }
  },

  emitTyping: (receiverId) => {
    get().socket?.emit("typing", { receiverId });
  },

  emitStopTyping: (receiverId) => {
    get().socket?.emit("stopTyping", { receiverId });
  },

  emitGroupTyping: (groupId) => {
    get().socket?.emit("groupTyping", { groupId });
  },

  emitGroupStopTyping: (groupId) => {
    get().socket?.emit("groupStopTyping", { groupId });
  },

  emitJoinGroup: (groupId) => {
    get().socket?.emit("joinGroup", { groupId });
  },
}));

export default useSocketStore;
