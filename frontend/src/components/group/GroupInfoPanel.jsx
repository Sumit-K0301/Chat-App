import { X, Crown } from "lucide-react";
import Avatar from "../common/Avatar";
import useSocketStore from "../../store/useSocketStore";

export default function GroupInfoPanel({ group, onClose }) {
  const onlineUsers = useSocketStore((s) => s.onlineUsers);

  if (!group) return null;

  // createdBy may be a plain string or a populated object
  const creator =
    typeof group.createdBy === "object"
      ? group.createdBy
      : group.members.find((m) => m._id === group.createdBy);

  return (
    <div className="w-80 border-l border-base-300 bg-base-100 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-base-300">
        <h3 className="font-bold text-lg">Group Info</h3>
        <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Group avatar + name */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <Avatar src={group.groupPic} alt={group.name} size="w-20 h-20" />
          <h4 className="font-semibold text-lg text-center">{group.name}</h4>
          {group.description && (
            <p className="text-sm text-base-content/60 text-center">{group.description}</p>
          )}
        </div>

        {/* Creator */}
        {creator && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-2">
              Created by
            </p>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-base-200">
              <Avatar
                src={creator.profilePic}
                alt={creator.fullname}
                size="w-9 h-9"
                online={onlineUsers.includes(creator._id)}
              />
              <div>
                <p className="font-medium text-sm">{creator.fullname}</p>
                <div className="flex items-center gap-1">
                  <Crown className="w-3 h-3 text-warning" />
                  <span className="text-xs text-base-content/50">Admin</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Participants */}
        <div>
          <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-2">
            Participants ({group.members.length})
          </p>
          <div className="flex flex-col gap-1">
            {group.members.map((member) => {
              const isOnline = onlineUsers.includes(member._id);
              const isAdmin = group.admins?.some((a) => a._id === member._id);
              return (
                <div
                  key={member._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors"
                >
                  <Avatar
                    src={member.profilePic}
                    alt={member.fullname}
                    size="w-9 h-9"
                    online={isOnline}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{member.fullname}</p>
                    {isAdmin && (
                      <span className="text-xs text-warning">Admin</span>
                    )}
                  </div>
                  <span
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      isOnline ? "bg-success" : "bg-base-content/20"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
