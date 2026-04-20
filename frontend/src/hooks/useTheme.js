import { useState, useEffect } from "react";

export function useIsDarkBg() {
  const [isDark, setIsDark] = useState(() => {
    const theme = localStorage.getItem("bg_theme") || "default";
    return theme !== "default";
  });

  useEffect(() => {
    const handler = () => {
      const theme = localStorage.getItem("bg_theme") || "default";
      setIsDark(theme !== "default");
    };
    window.addEventListener("bg_theme_change", handler);
    return () => window.removeEventListener("bg_theme_change", handler);
  }, []);

  return isDark;
}
