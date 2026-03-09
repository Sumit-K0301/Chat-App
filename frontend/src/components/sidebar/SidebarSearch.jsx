import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import useChatStore from "../../store/useChatStore";
import useGroupStore from "../../store/useGroupStore";
import Avatar from "../common/Avatar";
import useSocketStore from "../../store/useSocketStore";

export default function SidebarSearch({ onSelectUser, onSelectGroup }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef(null);

  const contacts = useChatStore((s) => s.contacts);
  const chatPartners = useChatStore((s) => s.chatPartners);
  const groups = useGroupStore((s) => s.groups);
  const onlineUsers = useSocketStore((s) => s.onlineUsers);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Combine contacts + chatPartners, deduplicate
  const allUsers = [...chatPartners];
  const partnerIds = new Set(chatPartners.map((u) => u._id));
  contacts.forEach((u) => {
    if (!partnerIds.has(u._id)) allUsers.push(u);
  });

  const filteredUsers = debouncedQuery
    ? allUsers.filter((u) =>
        u.fullname?.toLowerCase().includes(debouncedQuery) ||
        u.email?.toLowerCase().includes(debouncedQuery)
      )
    : [];

  const filteredGroups = debouncedQuery
    ? groups.filter((g) =>
        g.name?.toLowerCase().includes(debouncedQuery) ||
        g.description?.toLowerCase().includes(debouncedQuery)
      )
    : [];

  const hasResults = filteredUsers.length > 0 || filteredGroups.length > 0;

  return (
    <div className="px-2 pt-2 pb-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search contacts & groups..."
          className="input input-bordered input-sm w-full pl-9 pr-8"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {debouncedQuery && (
        <div className="mt-1.5 max-h-60 overflow-y-auto rounded-lg bg-base-200/50">
          {!hasResults && (
            <p className="text-xs text-base-content/50 text-center py-2">No results found</p>
          )}

          {filteredUsers.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-base-content/60 px-2.5 pt-1.5 pb-0.5 uppercase tracking-wide">Users</p>
              {filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => {
                    onSelectUser(user);
                    setQuery("");
                  }}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 hover:bg-base-300 transition-colors"
                >
                  <div className="w-7 h-7 flex-shrink-0">
                    <Avatar src={user.profilePic} alt={user.fullname} online={onlineUsers.includes(user._id)} size="sm" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-medium truncate leading-tight">{user.fullname}</p>
                    {user.email && <p className="text-[11px] text-base-content/50 truncate leading-tight">{user.email}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {filteredGroups.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-base-content/60 px-2.5 pt-1.5 pb-0.5 uppercase tracking-wide">Groups</p>
              {filteredGroups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => {
                    onSelectGroup(group);
                    setQuery("");
                  }}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 hover:bg-base-300 transition-colors"
                >
                  <div className="w-7 h-7 flex-shrink-0">
                    <Avatar src={group.groupPic} alt={group.name} size="sm" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-medium truncate leading-tight">{group.name}</p>
                    <p className="text-[11px] text-base-content/50 truncate leading-tight">
                      {group.members.length} member{group.members.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
