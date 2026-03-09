import Avatar from "../common/Avatar";
import useSocketStore from "../../store/useSocketStore";
import useChatStore from "../../store/useChatStore";
import useNicknameStore from "../../store/useNicknameStore";
import { ArrowLeft, Search, X } from "lucide-react";
import { useState } from "react";
import MessageSearch from "./MessageSearch";

export default function ChatHeader({ onBack }) {
  const selectedUser = useChatStore((s) => s.selectedUser);
  const onlineUsers = useSocketStore((s) => s.onlineUsers);
  const nickname = useNicknameStore((s) => s.nicknames[selectedUser?._id]);
  const [showSearch, setShowSearch] = useState(false);

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="px-4 py-3 border-b border-base-300 bg-base-100">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="btn btn-ghost btn-sm btn-circle lg:hidden">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <Avatar src={selectedUser.profilePic} alt={selectedUser.fullname} online={isOnline} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold truncate">
              {nickname || selectedUser.fullname}
              {nickname && (
                <span className="text-xs font-normal text-base-content/40 ml-1">({selectedUser.fullname})</span>
              )}
            </p>
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                isOnline ? "bg-success" : "bg-base-content/20"
              }`}
            />
          </div>
          <p className="text-xs text-base-content/50 truncate">
            {selectedUser.bio || "Hey there! I am using this app."}
          </p>
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="btn btn-ghost btn-sm btn-circle"
        >
          {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
        </button>
      </div>

      {showSearch && (
        <MessageSearch partnerId={selectedUser._id} onClose={() => setShowSearch(false)} />
      )}
    </div>
  );
}
