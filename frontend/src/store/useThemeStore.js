import { create } from "zustand";

const useThemeStore = create((set) => ({
  theme: "light",
  soundEnabled: true,

  initTheme: () => {
    const saved = localStorage.getItem("chat-theme") || "light";
    document.documentElement.setAttribute("data-theme", saved);
    set({ theme: saved });

    const sound = localStorage.getItem("chat-sound");
    set({ soundEnabled: sound !== "false" });
  },

  toggleTheme: () => {
    set((state) => {
      const next = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("chat-theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return { theme: next };
    });
  },

  toggleSound: () => {
    set((state) => {
      const next = !state.soundEnabled;
      localStorage.setItem("chat-sound", String(next));
      return { soundEnabled: next };
    });
  },
}));

export default useThemeStore;
