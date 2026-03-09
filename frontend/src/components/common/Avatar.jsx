const FALLBACK = "/avatar.png";

export default function Avatar({ src, alt = "", size = "w-10 h-10", online, className = "" }) {
  return (
    <div className={`avatar ${online !== undefined ? (online ? "online" : "offline") : ""} ${className}`}>
      <div className={`${size} rounded-full`}>
        <img src={src || FALLBACK} alt={alt} onError={(e) => (e.target.src = FALLBACK)} />
      </div>
    </div>
  );
}
