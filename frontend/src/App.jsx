import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Messages from "./pages/Messages";
import Connections from "./pages/Connections";
import Landing from "./pages/Landing";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import api from "./api/client";

const BG_STYLES = {
  default: { style: {} },
  vectors: {
    style: {
      backgroundColor: "#1a1a2e",
      backgroundImage: "url('/bg-vectors.png')",
      backgroundSize: "400px",
      backgroundRepeat: "repeat",
    },
  },
  navy: { style: { backgroundColor: "#0f172a" } },
};

function useBackgroundTheme() {
  const [theme, setTheme] = useState(localStorage.getItem("bg_theme") || "default");

  useEffect(() => {
    const handler = () => setTheme(localStorage.getItem("bg_theme") || "default");
    window.addEventListener("bg_theme_change", handler);
    return () => window.removeEventListener("bg_theme_change", handler);
  }, []);

  return BG_STYLES[theme] || BG_STYLES.default;
}

function useDarkMode() {
  const [dark, setDark] = useState(localStorage.getItem("dark_mode") === "true");

  useEffect(() => {
    const handler = () => setDark(localStorage.getItem("dark_mode") === "true");
    window.addEventListener("dark_mode_change", handler);
    return () => window.removeEventListener("dark_mode_change", handler);
  }, []);

  return dark;
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const bg = useBackgroundTheme();
  const dark = useDarkMode();
  if (!token) return <Navigate to="/login" />;
  return (
    <div className={dark ? "dark" : ""}>
      <Navbar />
      <div
        className={`min-h-[calc(100vh-64px)] ${bg.style.backgroundColor || bg.style.backgroundImage ? "" : "bg-gray-50"}`}
        style={bg.style}
      >
        {children}
      </div>
    </div>
  );
}

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const [allowed, setAllowed] = useState(null);
  const bg = useBackgroundTheme();
  const dark = useDarkMode();

  useEffect(() => {
    if (!token) { setAllowed(false); return; }
    api.get("/users/me").then(res => {
      setAllowed(res.data.is_admin);
    }).catch(() => setAllowed(false));
  }, [token]);

  if (allowed === null) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
  if (!allowed) return <Navigate to="/feed" />;
  return (
    <div className={dark ? "dark" : ""}>
      <Navbar />
      <div
        className={`min-h-[calc(100vh-64px)] ${bg.style.backgroundColor || bg.style.backgroundImage ? "" : "bg-gray-50"}`}
        style={bg.style}
      >
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/connections" element={<PrivateRoute><Connections /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/feed" />} />
      </Routes>
    </BrowserRouter>
  );
}
