import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import { markMessageAsDeleted } from "../utils/message";

const useGroupStore = create((set, get) => ({
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  hasMoreGroupMessages: false,
  isFetchingGroupMessages: false,
  unreadGroupCounts: {},

  setSelectedGroup: (group) => {
    const counts = { ...get().unreadGroupCounts };
    if (group) {
      delete counts[group._id];
      // Reset unread count on backend
      axiosInstance.put(`/api/groups/${group._id}/read`).catch(() => {});
    }
    set({ selectedGroup: group, groupMessages: [], hasMoreGroupMessages: false, unreadGroupCounts: counts });
  },

  clearSelectedGroup: () => {
    set({ selectedGroup: null, groupMessages: [], hasMoreGroupMessages: false });
  },

  fetchGroups: async () => {
    try {
      const res = await axiosInstance.get("/api/groups");
      set({ groups: res.data });
    } catch {
      toast.error("Failed to load groups");
    }
  },

  createGroup: async (formData) => {
    try {
      const res = await axiosInstance.post("/api/groups", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Add immediately from API response; addGroup() deduplicates if socket event also arrives
      get().addGroup(res.data);
      toast.success("Group created");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create group");
      throw err;
    }
  },

  fetchGroupMessages: async (groupId) => {
    set({ isFetchingGroupMessages: true });
    try {
      const res = await axiosInstance.get(`/api/groups/${groupId}/messages`);
      set({
        groupMessages: res.data.messages,
        hasMoreGroupMessages: res.data.hasMore,
      });
    } catch {
      toast.error("Failed to load group messages");
    } finally {
      set({ isFetchingGroupMessages: false });
    }
  },

  loadMoreGroupMessages: async (groupId) => {
    const { groupMessages } = get();
    if (!groupMessages.length) return;
    const oldest = groupMessages[0];
    try {
      const res = await axiosInstance.get(
        `/api/groups/${groupId}/messages?before=${oldest.createdAt}`
      );
      set({
        groupMessages: [...res.data.messages, ...groupMessages],
        hasMoreGroupMessages: res.data.hasMore,
      });
    } catch {
      toast.error("Failed to load older messages");
    }
  },

  sendGroupMessage: async (groupId, formData, { tempId, optimisticMsg } = {}) => {
    if (optimisticMsg) {
      set({ groupMessages: [...get().groupMessages, optimisticMsg] });
    }
    try {
      const res = await axiosInstance.post(`/api/groups/${groupId}/messages`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (tempId) {
        set({ groupMessages: get().groupMessages.map((m) => m._id === tempId ? res.data : m) });
      } else {
        set({ groupMessages: [...get().groupMessages, res.data] });
      }
      return res.data;
    } catch {
      if (tempId) {
        set({ groupMessages: get().groupMessages.map((m) => m._id === tempId ? { ...m, _isFailed: true, _isSending: false } : m) });
      }
      toast.error("Failed to send message");
    }
  },

  addMember: async (groupId, memberId) => {
    try {
      const res = await axiosInstance.post(`/api/groups/${groupId}/members`, { memberId });
      set({
        groups: get().groups.map((g) => (g._id === groupId ? res.data : g)),
        selectedGroup: get().selectedGroup?._id === groupId ? res.data : get().selectedGroup,
      });
      toast.success("Member added");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member");
    }
  },

  removeMember: async (groupId, memberId) => {
    try {
      const res = await axiosInstance.delete(`/api/groups/${groupId}/members`, {
        data: { memberId },
      });
      set({
        groups: get().groups.map((g) => (g._id === groupId ? res.data : g)),
        selectedGroup: get().selectedGroup?._id === groupId ? res.data : get().selectedGroup,
      });
      toast.success("Member removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove member");
    }
  },

  updateGroup: async (groupId, formData) => {
    try {
      const res = await axiosInstance.put(`/api/groups/${groupId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set({
        groups: get().groups.map((g) => (g._id === groupId ? res.data : g)),
        selectedGroup: get().selectedGroup?._id === groupId ? res.data : get().selectedGroup,
      });
      toast.success("Group updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update group");
    }
  },

  // Socket helpers
  addGroupMessage: (message) => {
    const exists = get().groupMessages.some((m) => m._id === message._id);
    if (!exists) {
      set({ groupMessages: [...get().groupMessages, message] });
    }
  },

  addGroup: (group) => {
    const exists = get().groups.some((g) => g._id === group._id);
    if (!exists) {
      set({ groups: [...get().groups, group] });
    }
  },

  updateGroupInList: (group) => {
    set({
      groups: get().groups.map((g) => (g._id === group._id ? group : g)),
      selectedGroup: get().selectedGroup?._id === group._id ? group : get().selectedGroup,
    });
  },

  incrementGroupUnread: (groupId) => {
    const counts = { ...get().unreadGroupCounts };
    counts[groupId] = (counts[groupId] || 0) + 1;
    set({ unreadGroupCounts: counts });
  },

  clearGroupUnread: (groupId) => {
    const counts = { ...get().unreadGroupCounts };
    delete counts[groupId];
    set({ unreadGroupCounts: counts });
  },

  setGroupMessageDeleted: (messageId) => {
    set({
      groupMessages: get().groupMessages.map((m) =>
        m._id === messageId ? markMessageAsDeleted(m) : m
      ),
    });
  },

  updateGroupMessageReactions: (messageId, reactions) => {
    set({
      groupMessages: get().groupMessages.map((m) =>
        m._id === messageId ? { ...m, reactions } : m
      ),
    });
  },

  deleteGroupMessage: async (msgId) => {
    try {
      await axiosInstance.delete(`/api/messages/${msgId}`);
      get().setGroupMessageDeleted(msgId);
    } catch {
      toast.error("Failed to delete message");
    }
  },

  addGroupReaction: async (msgId, emoji) => {
    try {
      const res = await axiosInstance.post(`/api/messages/${msgId}/react`, { emoji });
      get().updateGroupMessageReactions(msgId, res.data.reactions);
    } catch {
      toast.error("Failed to react");
    }
  },
}));

export default useGroupStore;
