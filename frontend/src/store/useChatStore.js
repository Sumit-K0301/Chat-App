import { create } from 'zustand';
import useAuthStore from './useAuthStore';

const useChatStore = create((set,get) => ({
    contacts : [],
    chatPartners : [],
    messages : [],
    activeTab : "chats",
    selectedUser : null,
    isUserLoading : false,
    isMessagesLoading : false,
    isSoundEnabled : JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

    toggleSound : () => {
        localStorage.setItem("isSoundEnabled", !get().isSoundEnabled) 
        set({isSoundEnabled : !get().isSoundEnabled})
    },

    setMessage : (message) => {
        set({messages : message})
    },

    addMessage: (newMessage) => set((state) => ({
        messages: [...state.messages, newMessage]
    })),

    setActiveTab: (tab) => set({activeTab : tab}),
    setSelectedUser: (selectedUser) => set({selectedUser: selectedUser}),
    setIsUserLoading: (isUserLoading) => set({isUserLoading : isUserLoading}),
    setIsMessagesLoading: (isMessagesLoading) => set({isMessagesLoading : isMessagesLoading}),

    subscribeToMessages: () => {
        const { selectedUser, isSoundEnabled, addMessage } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {
            
            const isMessageSentFromSelectedUser = newMessage.senderID === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;

            addMessage(newMessage);

            if (isSoundEnabled) {
                const notificationSound = new Audio("/sounds/notification.mp3");

                notificationSound.currentTime = 0; // reset to start
                notificationSound.play().catch((e) => console.log("Audio play failed:", e));
            }
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

}))

export default useChatStore;