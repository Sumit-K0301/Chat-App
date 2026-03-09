import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import { markMessageAsDeleted } from "../utils/message";

const useChatStore = create((set, get) => ({
  chatPartners: [],
  contacts: [],
  messages: [],
  hasMoreMessages: false,
  selectedUser: null,
  isFetchingMessages: false,
  isFetchingPartners: false,
  searchResults: [],
  isSearching: false,
  unreadCounts: {},

  setSelectedUser: (user) => {
    const counts = { ...get().unreadCounts };
    if (user) delete counts[user._id];
    set({ selectedUser: user, messages: [], hasMoreMessages: false, searchResults: [], unreadCounts: counts });
  },

  clearSelectedUser: () => {
    set({ selectedUser: null, messages: [], hasMoreMessages: false, searchResults: [] });
  },

  fetchChatPartners: async () => {
    set({ isFetchingPartners: true });
    try {
      const res = await axiosInstance.get("/api/messages/chat-partners");
      set({ chatPartners: res.data });
    } catch {
      toast.error("Failed to load conversations");
    } finally {
      set({ isFetchingPartners: false });
    }
  },

  fetchContacts: async () => {
    try {
      const res = await axiosInstance.get("/api/messages/contacts");
      set({ contacts: res.data });
    } catch {
      toast.error("Failed to load contacts");
    }
  },

  fetchMessages: async (partnerId) => {
    set({ isFetchingMessages: true });
    try {
      const res = await axiosInstance.get(`/api/messages/${partnerId}`);
      set({
        messages: res.data.messages,
        hasMoreMessages: res.data.hasMore,
      });
    } catch {
      toast.error("Failed to load messages");
    } finally {
      set({ isFetchingMessages: false });
    }
  },

  loadMoreMessages: async (partnerId) => {
    const { messages } = get();
    if (!messages.length) return;
    const oldest = messages[0];
    try {
      const res = await axiosInstance.get(
        `/api/messages/${partnerId}?before=${oldest.createdAt}`
      );
      set({
        messages: [...res.data.messages, ...messages],
        hasMoreMessages: res.data.hasMore,
      });
    } catch {
      toast.error("Failed to load older messages");
    }
  },

  sendMessage: async (partnerId, formData, { tempId, optimisticMsg } = {}) => {
    // Add optimistic message immediately if provided
    if (optimisticMsg) {
      set({ messages: [...get().messages, optimisticMsg] });
    }
    try {
      const res = await axiosInstance.post(`/api/messages/${partnerId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Replace optimistic message with real one
      if (tempId) {
        set({ messages: get().messages.map((m) => m._id === tempId ? res.data : m) });
      } else {
        set({ messages: [...get().messages, res.data] });
      }
      return res.data;
    } catch {
      // Mark optimistic message as failed
      if (tempId) {
        set({ messages: get().messages.map((m) => m._id === tempId ? { ...m, _isFailed: true, _isSending: false } : m) });
      }
      toast.error("Failed to send message");
    }
  },

  markAsRead: async (partnerId) => {
    try {
      await axiosInstance.put(`/api/messages/${partnerId}/read`);
    } catch {
      // silent fail
    }
  },

  deleteMessage: async (msgId) => {
    try {
      await axiosInstance.delete(`/api/messages/${msgId}`);
      set({
        messages: get().messages.map((m) =>
          m._id === msgId ? markMessageAsDeleted(m) : m
        ),
      });
    } catch {
      toast.error("Failed to delete message");
    }
  },

  addReaction: async (msgId, emoji) => {
    try {
      const res = await axiosInstance.post(`/api/messages/${msgId}/react`, { emoji });
      set({
        messages: get().messages.map((m) =>
          m._id === msgId ? { ...m, reactions: res.data.reactions } : m
        ),
      });
    } catch {
      toast.error("Failed to react");
    }
  },

  removeReaction: async (msgId) => {
    try {
      const res = await axiosInstance.delete(`/api/messages/${msgId}/react`);
      set({
        messages: get().messages.map((m) =>
          m._id === msgId ? { ...m, reactions: res.data.reactions } : m
        ),
      });
    } catch {
      toast.error("Failed to remove reaction");
    }
  },

  searchMessages: async (query, partnerId) => {
    set({ isSearching: true });
    try {
      const params = new URLSearchParams({ q: query });
      if (partnerId) params.append("partnerId", partnerId);
      const res = await axiosInstance.get(`/api/messages/search?${params}`);
      set({ searchResults: res.data });
    } catch {
      toast.error("Search failed");
    } finally {
      set({ isSearching: false });
    }
  },

  clearSearch: () => set({ searchResults: [], isSearching: false }),

  // Socket helpers — called by the socket hook
  addMessage: (message) => {
    const exists = get().messages.some((m) => m._id === message._id);
    if (!exists) {
      set({ messages: [...get().messages, message] });
    }
  },

  updateMessageStatus: (messageId, status) => {
    set({
      messages: get().messages.map((m) =>
        m._id === messageId ? { ...m, status } : m
      ),
    });
  },

  markAllReadFromPartner: (partnerId) => {
    set({
      messages: get().messages.map((m) => {
        const senderId = typeof m.senderID === "object" ? m.senderID._id : m.senderID;
        if (senderId !== partnerId) return { ...m, status: "read" };
        return m;
      }),
    });
  },

  setMessageDeleted: (messageId) => {
    set({
      messages: get().messages.map((m) =>
        m._id === messageId ? markMessageAsDeleted(m) : m
      ),
    });
  },

  updateMessageReactions: (messageId, reactions) => {
    set({
      messages: get().messages.map((m) =>
        m._id === messageId ? { ...m, reactions } : m
      ),
    });
  },

  incrementUnread: (partnerId) => {
    const counts = { ...get().unreadCounts };
    counts[partnerId] = (counts[partnerId] || 0) + 1;
    set({ unreadCounts: counts });
  },

  clearUnread: (partnerId) => {
    const counts = { ...get().unreadCounts };
    delete counts[partnerId];
    set({ unreadCounts: counts });
  },
}));

export default useChatStore;
