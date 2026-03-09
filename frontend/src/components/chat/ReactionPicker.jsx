const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "🎉"];

export default function ReactionPicker({ onSelect }) {
  return (
    <div className="flex items-center gap-0.5 bg-base-100 shadow-lg rounded-full px-2 py-1 border border-base-300">
      {QUICK_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="hover:scale-125 transition-transform text-base p-0.5"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
