import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

const useAuthStore = create((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  isCheckingAuth: true,
  isLoggingIn: false,
  isSigningUp: false,
  isUpdatingProfile: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/api/auth/status");
      if (res.status === 200) {
        set({ isAuthenticated: true });
        await get().fetchProfile();
      }
    } catch {
      set({ isAuthenticated: false, currentUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  fetchProfile: async () => {
    try {
      const res = await axiosInstance.get("/api/user/profile");
      set({ currentUser: res.data });
    } catch {
      toast.error("Failed to load profile");
    }
  },

  login: async (email, password) => {
    set({ isLoggingIn: true });
    const toastId = toast.loading("Logging in...");
    try {
      await axiosInstance.post("/api/auth/login", { email, password });
      set({ isAuthenticated: true });
      await get().fetchProfile();
      toast.success("Logged in successfully", { id: toastId });
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg, { id: toastId });
      throw err;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  signup: async (fullname, email, password) => {
    set({ isSigningUp: true });
    const toastId = toast.loading("Creating account...");
    try {
      await axiosInstance.post("/api/user/register", { fullname, email, password });
      set({ isAuthenticated: true });
      await get().fetchProfile();
      toast.success("Account created successfully", { id: toastId });
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        "Signup failed";
      toast.error(msg, { id: toastId });
      throw err;
    } finally {
      set({ isSigningUp: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/api/auth/logout");
      set({ isAuthenticated: false, currentUser: null });
      localStorage.removeItem("contact_nicknames");
      toast.success("Logged out");
    } catch {
      toast.error("Logout failed");
    }
  },

  updateProfile: async (formData) => {
    set({ isUpdatingProfile: true });
    const toastId = toast.loading("Updating profile...");
    try {
      const res = await axiosInstance.put("/api/user/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set({ currentUser: res.data.updatedUser });
      toast.success("Profile updated", { id: toastId });
    } catch (err) {
      const msg = err.response?.data?.message || "Update failed";
      toast.error(msg, { id: toastId });
      throw err;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  forgotPassword: async (email) => {
    try {
      const res = await axiosInstance.post("/api/auth/forgot-password", { email });
      toast.success(res.data.message || "Reset link sent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
      throw err;
    }
  },

  resetPassword: async (token, password) => {
    try {
      const res = await axiosInstance.post(`/api/auth/reset-password/${token}`, { password });
      toast.success(res.data.message || "Password reset successful");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
      throw err;
    }
  },

  resendVerification: async () => {
    try {
      const res = await axiosInstance.post("/api/auth/resend-verification");
      toast.success(res.data.message || "Verification email sent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend");
      throw err;
    }
  },
}));

export default useAuthStore;
