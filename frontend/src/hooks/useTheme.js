import { useState, useEffect } from "react";

function applyDark(value) {
  document.documentElement.classList.toggle("dark", value);
}

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("dark_mode") === "true";
    applyDark(saved);
    return saved;
  });

  useEffect(() => {
    const handler = () => {
      const isDark = localStorage.getItem("dark_mode") === "true";
      applyDark(isDark);
      setDark(isDark);
    };
    window.addEventListener("dark_mode_change", handler);
    return () => window.removeEventListener("dark_mode_change", handler);
  }, []);

  return dark;
}
