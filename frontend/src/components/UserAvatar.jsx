const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";

export default function UserAvatar({ user, size = "md", className = "" }) {
  const sizes = {
    xs: "w-8 h-8 text-xs",
    sm: "w-10 h-10 text-sm",
    md: "w-14 h-14 text-xl",
    lg: "w-24 h-24 text-3xl",
  };

  const sizeClass = sizes[size] || sizes.md;
  const name = user?.full_name || user?.name || "?";
  const pic = user?.profile_picture;

  if (pic) {
    const src = pic.startsWith("http") ? pic : `${API_BASE}${pic}`;
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-2xl object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
