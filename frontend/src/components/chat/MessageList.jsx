import MessageBubble from "./MessageBubble";
import DateSeparator from "./DateSeparator";
import LoadingSpinner from "../common/LoadingSpinner";
import useScrollManagement from "../../hooks/useScrollManagement";

export default function MessageList({
  messages,
  hasMore,
  isLoading,
  loadMore,
  conversationId,
  currentUserId,
  onDelete,
  onReact,
  shouldShowSender,
  emptyText = "No messages yet. Say hello! 👋",
  typingIndicator,
}) {
  const { bottomRef, containerRef, handleScroll } = useScrollManagement({
    messages,
    hasMore,
    loadMore,
    conversationId,
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-1"
    >
      {hasMore && (
        <div className="text-center py-2">
          <span className="loading loading-dots loading-sm text-base-content/30" />
        </div>
      )}

      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-base-content/40 text-sm">
          {emptyText}
        </div>
      )}

      {messages.map((msg, idx) => {
        const prevMsg = messages[idx - 1];
        const showDate =
          idx === 0 ||
          new Date(msg.createdAt).toDateString() !==
            new Date(prevMsg.createdAt).toDateString();
        return (
          <div key={msg._id}>
            {showDate && <DateSeparator dateStr={msg.createdAt} />}
            <MessageBubble
              message={msg}
              currentUserId={currentUserId}
              showSender={shouldShowSender?.(msg, idx)}
              onDelete={onDelete}
              onReact={onReact}
            />
          </div>
        );
      })}

      {typingIndicator}

      <div ref={bottomRef} />
    </div>
  );
}
