import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, Search, Users, User, LogOut, Menu, X, Shield, Settings, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../api/client";
import { useDarkMode } from "../hooks/useTheme";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const dark = useDarkMode();

  useEffect(() => {
    api.get("/users/me").then(res => setCurrentUser(res.data)).catch(() => {});
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const links = [
    { path: "/feed", icon: Home, label: "Feed" },
    { path: "/search", icon: Search, label: "Axtar" },
    { path: "/connections", icon: Users, label: "Baglantilar" },
    { path: "/messages", icon: MessageCircle, label: "Mesajlar" },
    { path: "/profile", icon: User, label: "Profil" },
    { path: "/settings", icon: Settings, label: "Parametrlər" },
    ...(currentUser?.is_admin ? [{ path: "/admin", icon: Shield, label: "Admin" }] : []),
  ];

  return (
    <nav className={`${dark ? "bg-gray-900/90 border-gray-700/50" : "bg-white/80 border-gray-200/50"} backdrop-blur-xl border-b sticky top-0 z-50 shadow-sm`}>
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/feed" className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          InVektor
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            const isAdmin = path === "/admin";
            return (
              <Link
                key={path}
                to={path}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? isAdmin
                      ? "bg-gradient-to-r from-red-50 to-rose-50 text-red-600 shadow-sm"
                      : dark
                      ? "bg-blue-500/20 text-blue-400 shadow-sm"
                      : "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm"
                    : isAdmin
                    ? "text-red-400 hover:bg-red-50 hover:text-red-500"
                    : dark
                    ? "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
                {isActive && (
                  <span className={`absolute -bottom-[13px] left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full ${
                    isAdmin ? "bg-gradient-to-r from-red-500 to-rose-500" : "bg-gradient-to-r from-blue-500 to-indigo-500"
                  }`} />
                )}
              </Link>
            );
          })}
          <div className={`w-px h-8 ${dark ? "bg-gray-700" : "bg-gray-200"} mx-2`} />
          <button
            onClick={logout}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${dark ? "text-gray-400 hover:bg-red-500/10 hover:text-red-400" : "text-gray-400 hover:bg-red-50 hover:text-red-500"} transition-all duration-200`}
          >
            <LogOut size={18} />
            <span>Cixis</span>
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 rounded-xl ${dark ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"} transition`}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={`md:hidden ${dark ? "bg-gray-900/95" : "bg-white/95"} backdrop-blur-xl border-t ${dark ? "border-gray-700" : "border-gray-100"} px-4 pb-4 pt-2 space-y-1`}>
          {links.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            const isAdmin = path === "/admin";
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? isAdmin
                      ? "bg-gradient-to-r from-red-50 to-rose-50 text-red-600"
                      : dark
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600"
                    : isAdmin
                    ? "text-red-400 hover:bg-red-50"
                    : dark
                    ? "text-gray-400 hover:bg-gray-800"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => { setMobileOpen(false); logout(); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition w-full"
          >
            <LogOut size={20} />
            <span>Cixis</span>
          </button>
        </div>
      )}
    </nav>
  );
}
