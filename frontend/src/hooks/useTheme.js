import { useState, useEffect } from "react";

export function useDarkMode() {
  const [dark, setDark] = useState(localStorage.getItem("dark_mode") === "true");

  useEffect(() => {
    const handler = () => setDark(localStorage.getItem("dark_mode") === "true");
    window.addEventListener("dark_mode_change", handler);
    return () => window.removeEventListener("dark_mode_change", handler);
  }, []);

  return dark;
}
