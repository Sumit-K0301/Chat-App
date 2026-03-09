export default function TypingIndicator({ name }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-base-content/30 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-base-content/30 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-base-content/30 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-xs text-base-content/40">
        {name ? `${name} is typing...` : "typing..."}
      </span>
    </div>
  );
}
