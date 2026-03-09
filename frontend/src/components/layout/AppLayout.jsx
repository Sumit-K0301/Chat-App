import Sidebar from "../sidebar/Sidebar";
import ChatContainer from "../chat/ChatContainer";
import GroupChatContainer from "../group/GroupChatContainer";
import NoChatSelected from "../common/NoChatSelected";
import useChatStore from "../../store/useChatStore";
import useGroupStore from "../../store/useGroupStore";

export default function AppLayout() {
  const selectedUser = useChatStore((s) => s.selectedUser);
  const selectedGroup = useGroupStore((s) => s.selectedGroup);
  const clearSelectedUser = useChatStore((s) => s.clearSelectedUser);
  const clearSelectedGroup = useGroupStore((s) => s.clearSelectedGroup);

  const hasChat = selectedUser || selectedGroup;

  const handleBack = () => {
    clearSelectedUser();
    clearSelectedGroup();
  };

  return (
    <div className="h-screen flex bg-base-100">
      {/* Sidebar — hidden on mobile when chat is open */}
      <div
        className={`${
          hasChat ? "hidden lg:flex" : "flex"
        } w-full lg:w-80 xl:w-96 flex-shrink-0 border-r border-base-300`}
      >
        <Sidebar />
      </div>

      {/* Chat area */}
      <div className={`${hasChat ? "flex" : "hidden lg:flex"} flex-1 flex-col min-w-0`}>
        {selectedUser && <ChatContainer onBack={handleBack} />}
        {selectedGroup && <GroupChatContainer onBack={handleBack} />}
        {!hasChat && <NoChatSelected />}
      </div>
    </div>
  );
}
