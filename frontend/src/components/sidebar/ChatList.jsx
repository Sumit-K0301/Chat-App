import { useEffect } from "react";
import useChatStore from "../../store/useChatStore";
import useGroupStore from "../../store/useGroupStore";
import UserItem from "./UserItem";
import LoadingSpinner from "../common/LoadingSpinner";
import UnreadBadge from "../common/UnreadBadge";

export default function ChatList() {
  const { chatPartners, fetchChatPartners, isFetchingPartners, setSelectedUser } =
    useChatStore();
  const selectedUser = useChatStore((s) => s.selectedUser);
  const unreadCounts = useChatStore((s) => s.unreadCounts);
  const clearSelectedGroup = useGroupStore((s) => s.clearSelectedGroup);

  useEffect(() => {
    fetchChatPartners();
  }, []);

  const handleSelect = (user) => {
    clearSelectedGroup();
    setSelectedUser(user);
  };

  if (isFetchingPartners) return <LoadingSpinner />;

  if (!chatPartners.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-base-content/50 text-sm">
        <p>No conversations yet</p>
        <p className="text-xs mt-1">Start chatting from Contacts</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 overflow-y-auto">
      {chatPartners.map((user) => (
        <UserItem
          key={user._id}
          user={user}
          isSelected={selectedUser?._id === user._id}
          onClick={handleSelect}
          trailing={<UnreadBadge count={unreadCounts[user._id]} />}
        />
      ))}
    </div>
  );
}
