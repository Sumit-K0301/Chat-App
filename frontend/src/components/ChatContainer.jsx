import React, { useEffect, useRef } from 'react'
import * as apiClient from "../apiClient.js"

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder .jsx";
import useChatStore from '../store/useChatStore.js';
import toast from 'react-hot-toast';
import NoConversationPlaceholder from './NoConversationPlaceholder.jsx';
import useAuthStore from '../store/useAuthStore.js';


function ChatContainer() {

    const { userID } = useAuthStore()
    const { selectedUser, isMessagesLoading, setIsMessagesLoading, messages, setMessage, subscribeToMessages, unsubscribeFromMessages} = useChatStore();

    const messageEndRef = useRef()

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {
        const chats = async() => {
            setIsMessagesLoading(true);
            try {
                const response = await apiClient.getMessages(selectedUser._id);
                setMessage(response);

            } catch (error) {
                toast.error(error.response?.data?.message)
                console.error(error)
            } finally {
                setIsMessagesLoading(false);
            } 
        }

        if(selectedUser) {
            chats();
            subscribeToMessages();
        } 

        return () => unsubscribeFromMessages();

    },[selectedUser,subscribeToMessages])

    return (
        <>
        <ChatHeader />

        <div className="flex-1 px-6 overflow-y-auto py-8">
            {messages.length > 0 && !isMessagesLoading ? (
            <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((msg) => (

                <div
                key={msg._id}
                className={`chat ${msg.senderID === userID ? "chat-end" : "chat-start"}`}
                >
                    <div
                    className={`chat-bubble relative ${
                        msg.senderID === userID
                        ? "bg-cyan-600 text-white"
                        : "bg-slate-800 text-slate-200"
                    }`}
                    >

                        {msg.image && (
                        <img src={msg.image} alt="Shared" className="rounded-lg h-48 object-cover" />
                        )}

                        {msg.text && <p className="mt-2">{msg.text}</p>}

                        <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                            {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                            })}
                        </p>

                    </div>
                </div>
                ))}

                {/* 👇 scroll target */}
                <div ref={messageEndRef} >
                </div>
            </div>
                ) : isMessagesLoading ? (
                <MessagesLoadingSkeleton />
                ) : (
                <NoChatHistoryPlaceholder name={selectedUser.fullname} />
                )}
        </div>

        <MessageInput />
    </>


  )
}

export default ChatContainer 