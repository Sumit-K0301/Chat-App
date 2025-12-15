import React, { useEffect, useState } from 'react'
import * as apiClient from "../apiClient"
import useChatStore from '../store/useChatStore';
import useAuthStore from "../store/useAuthStore"

import NoChatsFound from "./NoChatsFound"
import UsersLoadingSkeleton from './UsersLoadingSkeleton';
import toast from 'react-hot-toast';

function ChatsList() {

    const [chatPartners, setChatPartners] = useState([]);
    const { isUserLoading, setIsUserLoading, setSelectedUser } = useChatStore();
    const { onlineUsers } = useAuthStore();

    useEffect(() => {
        const ChatPartners = async() => {
            setIsUserLoading(true);
            try {
                const response = await apiClient.getChatPartners();
                setChatPartners(response);

            } catch(error) {
                toast.error(error.response?.data?.message);
                console.error(error)
            } finally {
                setIsUserLoading(false);
            }
        }

        ChatPartners()
    },[])

    if (isUserLoading) return <UsersLoadingSkeleton />;
    if (chatPartners.length === 0) return <NoChatsFound />;

    return (
        <>
        { (chatPartners).map((chat) => (
            <div
            key={chat._id}
            className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
            onClick={() => setSelectedUser(chat)}
            >

                <div className="flex items-center gap-3">
                    <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
                        <div className="size-12 rounded-full">
                            <img src={chat.profilePic || "/avatar.png"} alt={chat.fullname} />
                        </div>
                    </div>
                    <h4 className="text-slate-200 font-medium truncate">{chat.fullname}</h4>
                </div>
            </div>
        ))}
        
        </>  
  )
}

export default ChatsList