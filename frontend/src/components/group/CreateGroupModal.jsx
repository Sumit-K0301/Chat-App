import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import useChatStore from "../../store/useChatStore";
import useGroupStore from "../../store/useGroupStore";
import useSocketStore from "../../store/useSocketStore";
import Avatar from "../common/Avatar";

export default function CreateGroupModal({ onClose }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupPic, setGroupPic] = useState(null);
  const [creating, setCreating] = useState(false);

  const { contacts, fetchContacts } = useChatStore();
  const { createGroup } = useGroupStore();
  const { emitJoinGroup } = useSocketStore();

  useEffect(() => {
    fetchContacts();
  }, []);

  const filtered = contacts.filter((c) =>
    c.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || selectedMembers.length === 0) return;

    setCreating(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (description.trim()) formData.append("description", description.trim());
      if (groupPic) formData.append("groupPic", groupPic);
      selectedMembers.forEach((id) => formData.append("members", id));

      const group = await createGroup(formData);
      if (group) {
        emitJoinGroup(group._id);
        onClose();
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-bold text-lg mb-4">Create Group</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Group name *"
            className="input input-bordered w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <textarea
            placeholder="Description (optional)"
            className="textarea textarea-bordered w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />

          <div>
            <label className="label">
              <span className="label-text text-sm">Group Picture (optional)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              className="file-input file-input-bordered file-input-sm w-full"
              onChange={(e) => setGroupPic(e.target.files?.[0] || null)}
            />
          </div>

          {/* Member picker */}
          <div>
            <label className="label">
              <span className="label-text text-sm">
                Select Members * ({selectedMembers.length} selected)
              </span>
            </label>

            <label className="input input-bordered input-sm flex items-center gap-2 mb-2">
              <Search className="w-3 h-3 opacity-50" />
              <input
                type="text"
                placeholder="Search contacts..."
                className="grow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>

            <div className="max-h-48 overflow-y-auto border border-base-300 rounded-lg">
              {filtered.length === 0 && (
                <p className="p-3 text-sm text-center text-base-content/50">No contacts found</p>
              )}
              {filtered.map((contact) => (
                <label
                  key={contact._id}
                  className="flex items-center gap-3 p-2 hover:bg-base-200 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-primary"
                    checked={selectedMembers.includes(contact._id)}
                    onChange={() => toggleMember(contact._id)}
                  />
                  <Avatar src={contact.profilePic} alt={contact.fullname} size="w-8 h-8" />
                  <span className="text-sm">{contact.fullname}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={!name.trim() || selectedMembers.length === 0 || creating}
          >
            {creating ? <span className="loading loading-spinner loading-sm" /> : "Create Group"}
          </button>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
