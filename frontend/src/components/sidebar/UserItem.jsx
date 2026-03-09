import { useState } from "react";
import Avatar from "../common/Avatar";
import useSocketStore from "../../store/useSocketStore";
import useNicknameStore from "../../store/useNicknameStore";
import { Pencil, Check, X } from "lucide-react";

export default function UserItem({ user, isSelected, onClick, subtitle, trailing }) {
  const onlineUsers = useSocketStore((s) => s.onlineUsers);
  const isOnline = onlineUsers.includes(user._id);
  const nickname = useNicknameStore((s) => s.nicknames[user._id]);
  const setNickname = useNicknameStore((s) => s.setNickname);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const displayName = nickname || user.fullname;

  const startEditing = (e) => {
    e.stopPropagation();
    setDraft(nickname || "");
    setEditing(true);
  };

  const saveNickname = (e) => {
    e.stopPropagation();
    setNickname(user._id, draft);
    setEditing(false);
  };

  const cancelEditing = (e) => {
    e.stopPropagation();
    setEditing(false);
  };

  return (
    <button
      onClick={() => !editing && onClick(user)}
      className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors hover:bg-base-300 group ${
        isSelected ? "bg-base-300" : ""
      }`}
    >
      <Avatar src={user.profilePic} alt={user.fullname} online={isOnline} />
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-1.5">
          {editing ? (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveNickname(e);
                  if (e.key === "Escape") cancelEditing(e);
                }}
                placeholder={user.fullname}
                className="input input-xs input-bordered w-24"
                autoFocus
              />
              <button onClick={saveNickname} className="btn btn-ghost btn-xs btn-circle text-success">
                <Check className="w-3 h-3" />
              </button>
              <button onClick={cancelEditing} className="btn btn-ghost btn-xs btn-circle text-error">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <>
              <p className="font-medium truncate">{displayName}</p>
              {nickname && (
                <span className="text-xs text-base-content/40 truncate">({user.fullname})</span>
              )}
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isOnline ? "bg-success" : "bg-base-content/20"
                }`}
              />
              <button
                onClick={startEditing}
                className="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                title="Set nickname"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
        {subtitle ? (
          <p className="text-xs text-base-content/50 truncate">{subtitle}</p>
        ) : (
          <p className="text-xs text-base-content/50 truncate">
            {user.bio || "Hey there! I am using this app."}
          </p>
        )}
      </div>
      {!editing && trailing}
    </button>
  );
}
