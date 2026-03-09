import { useEffect, useState } from "react";
import useGroupStore from "../../store/useGroupStore";
import useChatStore from "../../store/useChatStore";
import Avatar from "../common/Avatar";
import LoadingSpinner from "../common/LoadingSpinner";
import UnreadBadge from "../common/UnreadBadge";
import CreateGroupModal from "../group/CreateGroupModal";
import { Plus, Users } from "lucide-react";

export default function GroupList() {
  const { groups, fetchGroups, setSelectedGroup, selectedGroup } = useGroupStore();
  const unreadGroupCounts = useGroupStore((s) => s.unreadGroupCounts);
  const clearSelectedUser = useChatStore((s) => s.clearSelectedUser);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchGroups().finally(() => setLoading(false));
  }, []);

  const handleSelect = (group) => {
    clearSelectedUser();
    setSelectedGroup(group);
  };

  if (loading && !groups.length) return <LoadingSpinner />;

  return (
    <>
      <div className="flex flex-col gap-1 overflow-y-auto">
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-3 w-full p-3 rounded-xl transition-colors hover:bg-base-300 border-2 border-dashed border-base-300 mb-1"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          <span className="font-medium text-sm">Create New Group</span>
        </button>

        {groups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-base-content/50 text-sm">
            <Users className="w-8 h-8 mb-2 opacity-30" />
            <p>No groups yet</p>
          </div>
        )}

        {groups.map((group) => (
          <button
            key={group._id}
            onClick={() => handleSelect(group)}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors hover:bg-base-300 ${
              selectedGroup?._id === group._id ? "bg-base-300" : ""
            }`}
          >
            <Avatar src={group.groupPic} alt={group.name} />
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium truncate">{group.name}</p>
              <p className="text-xs text-base-content/50">
                {group.members.length} member{group.members.length !== 1 ? "s" : ""}
              </p>
            </div>
            <UnreadBadge count={unreadGroupCounts[group._id]} />
          </button>
        ))}
      </div>

      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} />}
    </>
  );
}
