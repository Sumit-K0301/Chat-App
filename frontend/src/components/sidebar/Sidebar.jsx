import { useState } from "react";
import { MessageCircle, Users2, Contact } from "lucide-react";
import ProfileHeader from "./ProfileHeader";
import ChatList from "./ChatList";
import ContactList from "./ContactList";
import GroupList from "./GroupList";
import SidebarSearch from "./SidebarSearch";
import useChatStore from "../../store/useChatStore";
import useGroupStore from "../../store/useGroupStore";

const TABS = [
  { id: "chats", label: "Chats", icon: MessageCircle },
  { id: "contacts", label: "Contacts", icon: Contact },
  { id: "groups", label: "Groups", icon: Users2 },
];

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState("chats");
  const setSelectedUser = useChatStore((s) => s.setSelectedUser);
  const clearSelectedUser = useChatStore((s) => s.clearSelectedUser);
  const setSelectedGroup = useGroupStore((s) => s.setSelectedGroup);
  const clearSelectedGroup = useGroupStore((s) => s.clearSelectedGroup);

  const handleSearchSelectUser = (user) => {
    clearSelectedGroup();
    setSelectedUser(user);
    setActiveTab("chats");
  };

  const handleSearchSelectGroup = (group) => {
    clearSelectedUser();
    setSelectedGroup(group);
    setActiveTab("groups");
  };

  return (
    <aside className="flex flex-col h-full w-full bg-base-100 border-r border-base-300">
      <ProfileHeader />

      <SidebarSearch onSelectUser={handleSearchSelectUser} onSelectGroup={handleSearchSelectGroup} />

      {/* Tabs */}
      <div className="flex border-b border-base-300">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === id
                ? "border-primary text-primary"
                : "border-transparent text-base-content/60 hover:text-base-content"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === "chats" && <ChatList />}
        {activeTab === "contacts" && <ContactList />}
        {activeTab === "groups" && <GroupList />}
      </div>
    </aside>
  );
}
