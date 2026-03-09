import { useEffect, useState } from "react";
import useChatStore from "../../store/useChatStore";
import useGroupStore from "../../store/useGroupStore";
import UserItem from "./UserItem";
import LoadingSpinner from "../common/LoadingSpinner";

export default function ContactList() {
  const { contacts, fetchContacts, setSelectedUser } = useChatStore();
  const selectedUser = useChatStore((s) => s.selectedUser);
  const clearSelectedGroup = useGroupStore((s) => s.clearSelectedGroup);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts().finally(() => setLoading(false));
  }, []);

  const handleSelect = (user) => {
    clearSelectedGroup();
    setSelectedUser(user);
  };

  if (loading && !contacts.length) return <LoadingSpinner />;

  if (!contacts.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-base-content/50 text-sm">
        <p>No contacts found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 overflow-y-auto">
      {contacts.map((user) => (
        <UserItem
          key={user._id}
          user={user}
          isSelected={selectedUser?._id === user._id}
          onClick={handleSelect}
        />
      ))}
    </div>
  );
}
