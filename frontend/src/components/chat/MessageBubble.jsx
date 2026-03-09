import { useState, useRef, useEffect } from "react";
import { Check, CheckCheck, Trash2, SmilePlus, FileText, Download, AlertCircle, Loader2 } from "lucide-react";
import { formatMessageTime } from "../../utils/formatTime";
import { formatFileSize } from "../../utils/formatTime";
import useChatStore from "../../store/useChatStore";
import ReactionPicker from "./ReactionPicker";

export default function MessageBubble({ message, currentUserId, showSender, onDelete, onReact }) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState(false);
  const pickerRef = useRef(null);

  const senderId =
    typeof message.senderID === "object" ? message.senderID._id : message.senderID;
  const isOwn = senderId === currentUserId;
  const senderName =
    typeof message.senderID === "object" ? message.senderID.fullname : null;

  const chatStore = useChatStore();
  const handleDelete = onDelete || ((msgId) => chatStore.deleteMessage(msgId));
  const handleReact = onReact || ((msgId, emoji) => chatStore.addReaction(msgId, emoji));

  // Click-outside to close reaction picker
  useEffect(() => {
    if (!showReactionPicker) return;
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowReactionPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showReactionPicker]);

  // Deleted message
  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
        <div className="px-4 py-2 rounded-2xl bg-base-200 text-base-content/40 italic text-sm max-w-xs">
          This message was deleted
        </div>
      </div>
    );
  }

  const handleReaction = (emoji) => {
    handleReact(message._id, emoji);
    setShowReactionPicker(false);
  };

  const statusIcon = () => {
    if (!isOwn) return null;
    if (message._isFailed) return <AlertCircle className="w-3.5 h-3.5 text-error" />;
    if (message._isSending) return <Loader2 className="w-3.5 h-3.5 text-base-content/40 animate-spin" />;
    switch (message.status) {
      case "read":
        return <CheckCheck className="w-3.5 h-3.5 text-primary" />;
      case "delivered":
        return <CheckCheck className="w-3.5 h-3.5 text-base-content/40" />;
      default:
        return <Check className="w-3.5 h-3.5 text-base-content/40" />;
    }
  };

  return (
    <>
      <div
        className={`flex ${isOwn ? "justify-end" : "justify-start"} group ${message._isSending ? "opacity-60" : ""}`}
      >
        <div className={`relative max-w-[75%] ${isOwn ? "order-1" : ""}`}>
          {/* Sender name for group messages */}
          {showSender && senderName && !isOwn && (
            <p className="text-xs font-medium text-primary mb-0.5 ml-1">{senderName}</p>
          )}

          <div
            className={`px-4 py-2 rounded-2xl ${
              isOwn
                ? "bg-primary text-primary-content rounded-br-md"
                : "bg-base-200 text-base-content rounded-bl-md"
            }`}
          >
            {/* Text */}
            {message.text && <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>}

            {/* Image */}
            {message.image && (
              <img
                src={message.image}
                alt="attachment"
                className="rounded-lg mt-1 max-w-full max-h-60 cursor-pointer object-cover"
                onClick={() => setImagePreview(true)}
              />
            )}

            {/* File */}
            {message.file?.url && (
              <a
                href={message.file.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 mt-1 p-2 rounded-lg ${
                  isOwn ? "bg-primary-content/10" : "bg-base-300"
                }`}
              >
                <FileText className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{message.file.name || "File"}</p>
                  <p className="text-xs opacity-60">{formatFileSize(message.file.size)}</p>
                </div>
                <Download className="w-4 h-4 flex-shrink-0" />
              </a>
            )}

            {/* Timestamp + status */}
            <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : ""}`}>
              <span className={`text-[10px] ${isOwn ? "text-primary-content/60" : "text-base-content/40"}`}>
                {formatMessageTime(message.createdAt)}
              </span>
              {statusIcon()}
            </div>
          </div>

          {/* Reactions */}
          {message.reactions?.length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-0.5 ${isOwn ? "justify-end" : ""}`}>
              {groupReactions(message.reactions).map(({ emoji, count }) => (
                <span
                  key={emoji}
                  className="inline-flex items-center gap-0.5 text-xs bg-base-200 rounded-full px-1.5 py-0.5 border border-base-300"
                >
                  {emoji} {count > 1 && <span className="text-[10px] text-base-content/60">{count}</span>}
                </span>
              ))}
            </div>
          )}

          {/* Hover actions — visible on group hover via CSS */}
          {!message._isSending && !message._isFailed && (
            <div
              className={`absolute top-0 ${
                isOwn ? "-left-16" : "-right-16"
              } flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity`}
            >
              <button
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                className="btn btn-ghost btn-xs btn-circle"
                title="React"
              >
                <SmilePlus className="w-3.5 h-3.5" />
              </button>
              {isOwn && (
                <button
                  onClick={() => handleDelete(message._id)}
                  className="btn btn-ghost btn-xs btn-circle text-error"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Reaction picker — click-based, closes on click-outside */}
          {showReactionPicker && (
            <div ref={pickerRef} className={`absolute -top-10 ${isOwn ? "right-0" : "left-0"} z-10`}>
              <ReactionPicker onSelect={handleReaction} />
            </div>
          )}
        </div>
      </div>

      {/* Image preview modal */}
      {imagePreview && message.image && (
        <dialog className="modal modal-open" onClick={() => setImagePreview(false)}>
          <div className="modal-box max-w-3xl p-2">
            <img src={message.image} alt="preview" className="w-full rounded-lg" />
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setImagePreview(false)}>close</button>
          </form>
        </dialog>
      )}
    </>
  );
}

function groupReactions(reactions) {
  const map = {};
  for (const r of reactions) {
    map[r.emoji] = (map[r.emoji] || 0) + 1;
  }
  return Object.entries(map).map(([emoji, count]) => ({ emoji, count }));
}
