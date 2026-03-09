import { useState, useRef } from "react";
import { Send, Image as ImageIcon, X } from "lucide-react";
import useChatStore from "../../store/useChatStore";
import useTyping from "../../hooks/useTyping";
import toast from "react-hot-toast";

const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1 MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export default function MessageInput({ partnerId, isGroup, onSend }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const { startTyping, stopTyping } = useTyping(partnerId, isGroup);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(selected.type)) {
      toast.error("Only image files (JPEG, PNG, GIF, WebP) are allowed");
      e.target.value = "";
      return;
    }

    if (selected.size > MAX_IMAGE_SIZE) {
      toast.error("Image size must not exceed 1 MB");
      e.target.value = "";
      return;
    }

    setFile(selected);
    const reader = new FileReader();
    reader.onload = (ev) => setFilePreview(ev.target.result);
    reader.readAsDataURL(selected);
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;

    const formData = new FormData();
    if (text.trim()) formData.append("text", text.trim());
    if (file) formData.append("image", file);

    // Clear input immediately (optimistic)
    setText("");
    removeFile();
    stopTyping();
    textareaRef.current?.focus();

    await onSend(formData);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    startTyping();
  };

  return (
    <div className="border-t border-base-300 bg-base-100 p-3">
      {/* Image preview */}
      {file && filePreview && (
        <div className="mb-2 flex items-center gap-2 p-2 bg-base-200 rounded-lg">
          <img src={filePreview} alt="preview" className="w-12 h-12 rounded object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{file.name}</p>
            <p className="text-xs text-base-content/50">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <button onClick={removeFile} className="btn btn-ghost btn-xs btn-circle">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-ghost btn-sm btn-circle flex-shrink-0"
        >
          <ImageIcon className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="textarea textarea-bordered flex-1 min-h-[2.5rem] max-h-32 resize-none leading-snug py-2"
          rows={1}
        />

        <button
          type="submit"
          className="btn btn-primary btn-sm btn-circle flex-shrink-0"
          disabled={!text.trim() && !file}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
