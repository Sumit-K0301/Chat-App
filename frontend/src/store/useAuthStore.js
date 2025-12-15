import { create } from 'zustand';
import axiosInstance from '../utilities/axios';

import {io} from "socket.io-client"

const useAuthStore = create((set, get) => ({

    userID: null,
    isAuthenticated: false,
    socket: null,
    onlineUsers : [],

    authenticate: async () => {
        try {
            const response = await axiosInstance.get('/api/auth/status')
                
            set({ isAuthenticated: true, userID: response.data.userId});
                console.log('User is authenticated');
            get().connectSocket()
            
        }

        catch (error) {
            set({ isAuthenticated: false, userID: null });
            console.error('Authentication check failed:', error);
        }
    },

    connectSocket: () => {
        const { userID } = get();
        if (!userID || get().socket?.connected) return;

        const socket = io(import.meta.env.VITE_BACKEND_URL, {
            withCredentials: true,
        });

        socket.connect();

        set({ socket });

        // Listen for online users event
        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
    },

    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    },

}));

export default useAuthStore;