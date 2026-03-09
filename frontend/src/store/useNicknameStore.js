import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";

// Nicknames are stored locally and synced with backend when available.
// Falls back to localStorage if backend endpoints don't exist yet.

const STORAGE_KEY = "contact_nicknames";

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveToStorage(nicknames) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nicknames));
}

const useNicknameStore = create((set, get) => ({
  nicknames: loadFromStorage(), // { [targetId]: nickname }

  fetchNicknames: async () => {
    try {
      const res = await axiosInstance.get("/api/nicknames");
      const map = {};
      res.data.forEach((n) => {
        map[n.targetId] = n.nickname;
      });
      set({ nicknames: map });
      saveToStorage(map);
    } catch {
      // Backend not available — use localStorage fallback
    }
  },

  setNickname: async (targetId, nickname) => {
    const trimmed = nickname.trim();
    const updated = { ...get().nicknames };

    if (trimmed) {
      updated[targetId] = trimmed;
    } else {
      delete updated[targetId];
    }

    set({ nicknames: updated });
    saveToStorage(updated);

    // Try to sync with backend
    try {
      await axiosInstance.put(`/api/nicknames/${encodeURIComponent(targetId)}`, { nickname: trimmed });
    } catch {
      // Backend not available — saved locally only
    }
  },

  getNickname: (targetId) => {
    return get().nicknames[targetId] || null;
  },

  removeNickname: async (targetId) => {
    const updated = { ...get().nicknames };
    delete updated[targetId];
    set({ nicknames: updated });
    saveToStorage(updated);

    try {
      await axiosInstance.delete(`/api/nicknames/${encodeURIComponent(targetId)}`);
    } catch {
      // Backend not available
    }
  },
}));

export default useNicknameStore;
