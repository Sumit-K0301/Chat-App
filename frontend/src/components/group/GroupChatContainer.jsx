import { useEffect, useCallback, useState } from "react";
import useGroupStore from "../../store/useGroupStore";
import useAuthStore from "../../store/useAuthStore";
import useSocketStore from "../../store/useSocketStore";
import MessageList from "../chat/MessageList";
import TypingIndicator from "../chat/TypingIndicator";
import MessageInput from "../chat/MessageInput";
import Avatar from "../common/Avatar";
import GroupInfoPanel from "./GroupInfoPanel";
import { ArrowLeft, Users } from "lucide-react";
import { createOptimisticMessage } from "../../utils/message";

export default function GroupChatContainer({ onBack }) {
  const {
    selectedGroup,
    groupMessages,
    hasMoreGroupMessages,
    isFetchingGroupMessages,
    fetchGroupMessages,
    loadMoreGroupMessages,
    sendGroupMessage,
    deleteGroupMessage,
    addGroupReaction,
  } = useGroupStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const groupTypingUsers = useSocketStore((s) => s.groupTypingUsers);

  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMessages(selectedGroup._id);
    }
  }, [selectedGroup?._id]);

  const loadMore = useCallback(() => loadMoreGroupMessages(selectedGroup._id), [selectedGroup?._id]);

  const handleSend = async (formData) => {
    const { tempId, optimisticMsg, localImageUrl } = createOptimisticMessage({
      currentUser,
      targetId: selectedGroup._id,
      formData,
      isGroup: true,
    });
    await sendGroupMessage(selectedGroup._id, formData, { tempId, optimisticMsg });
    if (localImageUrl) URL.revokeObjectURL(localImageUrl);
  };

  // Find who's typing in this group
  const typingEntries = Object.keys(groupTypingUsers).filter(
    (key) => key.startsWith(selectedGroup?._id + "_") && !key.endsWith("_" + currentUser?._id)
  );

  // For showing sender names above consecutive messages
  const shouldShowSender = useCallback((msg, idx) => {
    if (idx === 0) return true;
    const prev = groupMessages[idx - 1];
    const prevSender = typeof prev.senderID === "object" ? prev.senderID._id : prev.senderID;
    const currSender = typeof msg.senderID === "object" ? msg.senderID._id : msg.senderID;
    return prevSender !== currSender;
  }, [groupMessages]);

  if (!selectedGroup) return null;

  return (
    <div className="flex h-full bg-base-100">
      <div className="flex flex-col flex-1 min-w-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-base-300 bg-base-100">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="btn btn-ghost btn-sm btn-circle lg:hidden">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Avatar src={selectedGroup.groupPic} alt={selectedGroup.name} />
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
          >
            <p className="font-semibold truncate">{selectedGroup.name}</p>
            <p className="text-xs text-base-content/50 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {selectedGroup.members.length} members
            </p>
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={groupMessages}
        hasMore={hasMoreGroupMessages}
        isLoading={isFetchingGroupMessages}
        loadMore={loadMore}
        conversationId={selectedGroup?._id}
        currentUserId={currentUser?._id}
        onDelete={(msgId) => deleteGroupMessage(msgId)}
        onReact={(msgId, emoji) => addGroupReaction(msgId, emoji)}
        shouldShowSender={shouldShowSender}
        emptyText="No messages yet. Start the conversation! 🎉"
        typingIndicator={typingEntries.length > 0 ? <TypingIndicator name="Someone" /> : null}
      />

      <MessageInput
        partnerId={selectedGroup._id}
        isGroup={true}
        onSend={handleSend}
      />
      </div>

      {showInfo && (
        <GroupInfoPanel group={selectedGroup} onClose={() => setShowInfo(false)} />
      )}
    </div>
  );
}
