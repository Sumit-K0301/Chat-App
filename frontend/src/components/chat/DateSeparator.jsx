import { formatDate } from "../../utils/formatTime";

export default function DateSeparator({ dateStr }) {
  return (
    <div className="flex items-center gap-3 my-3">
      <div className="flex-1 h-px bg-base-300" />
      <span className="text-xs font-medium text-base-content/50 px-2">
        {formatDate(dateStr)}
      </span>
      <div className="flex-1 h-px bg-base-300" />
    </div>
  );
}
