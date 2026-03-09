import { useEffect } from "react";
import useSocketStore from "../store/useSocketStore";
import useChatStore from "../store/useChatStore";
import useGroupStore from "../store/useGroupStore";
import useAuthStore from "../store/useAuthStore";
import useThemeStore from "../store/useThemeStore";
import { playNotificationSound } from "../utils/sound";

export default function useSocket() {
  const { connect, disconnect, socket } = useSocketStore();
  const soundEnabled = useThemeStore((s) => s.soundEnabled);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  // Join all group socket rooms when socket is ready and groups are loaded
  useEffect(() => {
    if (!socket) return;
    const groups = useGroupStore.getState().groups;
    groups.forEach((g) => useSocketStore.getState().emitJoinGroup(g._id));
  }, [socket]);

  // Also join rooms whenever the groups list changes (e.g., after fetch)
  const groups = useGroupStore((s) => s.groups);
  useEffect(() => {
    if (!socket || !groups.length) return;
    groups.forEach((g) => useSocketStore.getState().emitJoinGroup(g._id));
  }, [groups, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      const currentUserId = useAuthStore.getState().currentUser?._id;
      const selectedUser = useChatStore.getState().selectedUser;
      const senderId =
        typeof message.senderID === "object"
          ? message.senderID._id
          : message.senderID;

      // Skip own messages — already handled by optimistic update + API response
      if (senderId === currentUserId) return;

      if (selectedUser && selectedUser._id === senderId) {
        useChatStore.getState().addMessage(message);
        useChatStore.getState().markAsRead(senderId);
      } else {
        useChatStore.getState().incrementUnread(senderId);
      }
      if (soundEnabled) playNotificationSound();
    };

    const handleMessageStatus = ({ messageId, status }) => {
      useChatStore.getState().updateMessageStatus(messageId, status);
    };

    const handleMessagesRead = ({ readBy, partnerId }) => {
      useChatStore.getState().markAllReadFromPartner(readBy);
    };

    const handleMessageDeleted = ({ messageId }) => {
      useChatStore.getState().setMessageDeleted(messageId);
    };

    const handleMessageReaction = ({ messageId, reactions }) => {
      useChatStore.getState().updateMessageReactions(messageId, reactions);
    };

    const handleNewGroupMessage = (message) => {
      const currentUserId = useAuthStore.getState().currentUser?._id;
      const msgSenderId =
        typeof message.senderID === "object"
          ? message.senderID._id
          : message.senderID;

      // Skip own messages — already handled by optimistic update + API response
      if (msgSenderId === currentUserId) return;

      const selectedGroup = useGroupStore.getState().selectedGroup;
      if (selectedGroup && selectedGroup._id === message.groupId) {
        useGroupStore.getState().addGroupMessage(message);
      } else {
        useGroupStore.getState().incrementGroupUnread(message.groupId);
      }
      if (soundEnabled) playNotificationSound();
    };

    const handleGroupCreated = (group) => {
      useGroupStore.getState().addGroup(group);
    };

    const handleGroupUpdated = (group) => {
      useGroupStore.getState().updateGroupInList(group);
    };

    const handleGroupMessageDeleted = ({ messageId }) => {
      useGroupStore.getState().setGroupMessageDeleted(messageId);
    };

    const handleGroupMessageReaction = ({ messageId, reactions }) => {
      useGroupStore.getState().updateGroupMessageReactions(messageId, reactions);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageStatusUpdate", handleMessageStatus);
    socket.on("messagesRead", handleMessagesRead);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("messageReaction", handleMessageReaction);
    socket.on("newGroupMessage", handleNewGroupMessage);
    socket.on("groupCreated", handleGroupCreated);
    socket.on("groupUpdated", handleGroupUpdated);
    socket.on("groupMessageDeleted", handleGroupMessageDeleted);
    socket.on("groupMessageReaction", handleGroupMessageReaction);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageStatusUpdate", handleMessageStatus);
      socket.off("messagesRead", handleMessagesRead);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("messageReaction", handleMessageReaction);
      socket.off("newGroupMessage", handleNewGroupMessage);
      socket.off("groupCreated", handleGroupCreated);
      socket.off("groupUpdated", handleGroupUpdated);
      socket.off("groupMessageDeleted", handleGroupMessageDeleted);
      socket.off("groupMessageReaction", handleGroupMessageReaction);
    };
  }, [socket, soundEnabled]);
}
