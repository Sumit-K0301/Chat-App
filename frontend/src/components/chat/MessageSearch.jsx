import { useState, useCallback } from "react";
import useChatStore from "../../store/useChatStore";
import { Search, X } from "lucide-react";
import { formatMessageTime } from "../../utils/formatTime";

export default function MessageSearch({ partnerId, onClose }) {
  const [query, setQuery] = useState("");
  const { searchResults, isSearching, searchMessages, clearSearch } = useChatStore();

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (query.trim()) {
        searchMessages(query.trim(), partnerId);
      }
    },
    [query, partnerId]
  );

  const handleClear = () => {
    setQuery("");
    clearSearch();
  };

  return (
    <div className="mt-2">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <label className="input input-bordered input-sm flex items-center gap-2 flex-1">
          <Search className="w-3 h-3 opacity-50" />
          <input
            type="text"
            placeholder="Search messages..."
            className="grow"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button type="button" onClick={handleClear} className="btn btn-ghost btn-xs btn-circle">
              <X className="w-3 h-3" />
            </button>
          )}
        </label>
      </form>

      {(searchResults.length > 0 || isSearching) && (
        <div className="mt-2 max-h-48 overflow-y-auto bg-base-200 rounded-lg">
          {isSearching && (
            <div className="p-3 text-center text-sm text-base-content/50">
              Searching...
            </div>
          )}
          {searchResults.map((msg) => {
            const senderName =
              typeof msg.senderID === "object" ? msg.senderID.fullname : "You";
            return (
              <div
                key={msg._id}
                className="p-2 hover:bg-base-300 cursor-pointer text-sm border-b border-base-300 last:border-0"
              >
                <div className="flex justify-between">
                  <span className="font-medium text-xs">{senderName}</span>
                  <span className="text-xs text-base-content/40">
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>
                <p className="text-base-content/70 truncate">{msg.text}</p>
              </div>
            );
          })}
          {!isSearching && searchResults.length === 0 && query && (
            <div className="p-3 text-center text-sm text-base-content/50">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
