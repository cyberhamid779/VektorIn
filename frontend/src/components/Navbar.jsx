import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/feed" className="text-xl font-bold text-blue-600">VektorIn</Link>

        <div className="flex items-center gap-1">
          <Link
            to="/feed"
            className={`px-3 py-2 rounded-lg text-sm font-medium ${isActive("/feed") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Feed
          </Link>
          <Link
            to="/search"
            className={`px-3 py-2 rounded-lg text-sm font-medium ${isActive("/search") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Axtar
          </Link>
          <Link
            to="/connections"
            className={`px-3 py-2 rounded-lg text-sm font-medium ${isActive("/connections") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Bağlantılar
          </Link>
          <Link
            to="/messages"
            className={`px-3 py-2 rounded-lg text-sm font-medium ${isActive("/messages") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Mesajlar
          </Link>
          <Link
            to="/profile"
            className={`px-3 py-2 rounded-lg text-sm font-medium ${isActive("/profile") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Profil
          </Link>
          <button
            onClick={logout}
            className="ml-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Çıxış
          </button>
        </div>
      </div>
    </nav>
  );
}
