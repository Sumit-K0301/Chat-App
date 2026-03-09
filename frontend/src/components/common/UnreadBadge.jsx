export default function UnreadBadge({ count }) {
  if (!count) return null;
  return (
    <span className="badge badge-primary badge-sm min-w-5 text-xs">
      {count > 99 ? "99+" : count}
    </span>
  );
}
