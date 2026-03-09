import { useEffect, useCallback } from "react";
import useChatStore from "../../store/useChatStore";
import useAuthStore from "../../store/useAuthStore";
import useSocketStore from "../../store/useSocketStore";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import { createOptimisticMessage } from "../../utils/message";

export default function ChatContainer({ onBack }) {
  const selectedUser = useChatStore((s) => s.selectedUser);
  const currentUser = useAuthStore((s) => s.currentUser);
  const typingUsers = useSocketStore((s) => s.typingUsers);
  const { messages, hasMoreMessages, isFetchingMessages, loadMoreMessages, fetchMessages, markAsRead, sendMessage } = useChatStore();

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
      markAsRead(selectedUser._id);
    }
  }, [selectedUser?._id]);

  const loadMore = useCallback(() => loadMoreMessages(selectedUser._id), [selectedUser?._id]);

  const handleSend = async (formData) => {
    const { tempId, optimisticMsg, localImageUrl } = createOptimisticMessage({
      currentUser,
      targetId: selectedUser._id,
      formData,
      isGroup: false,
    });
    await sendMessage(selectedUser._id, formData, { tempId, optimisticMsg });
    if (localImageUrl) URL.revokeObjectURL(localImageUrl);
  };

  const isPartnerTyping = selectedUser && typingUsers[selectedUser._id];

  return (
    <div className="flex flex-col h-full bg-base-100">
      <ChatHeader onBack={onBack} />
      <MessageList
        messages={messages}
        hasMore={hasMoreMessages}
        isLoading={isFetchingMessages}
        loadMore={loadMore}
        conversationId={selectedUser?._id}
        currentUserId={currentUser?._id}
        typingIndicator={isPartnerTyping ? <TypingIndicator /> : null}
      />
      <MessageInput
        partnerId={selectedUser._id}
        isGroup={false}
        onSend={handleSend}
      />
    </div>
  );
}
