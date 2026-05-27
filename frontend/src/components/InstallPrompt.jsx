import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("pwa_dismissed")) return;
    const handler = e => {
      e.preventDefault();
      setPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
  };

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem("pwa_dismissed", "1");
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", bottom: 80, left: 16, right: 16, zIndex: 1100,
      background: "#1a4a8a", color: "#fff",
      borderRadius: 12, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      maxWidth: 420, margin: "0 auto",
    }}>
      <img src="/icon-192.png" alt="Hash" style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Hash tətbiqini yüklə</p>
        <p style={{ margin: "2px 0 0", fontSize: 12, opacity: 0.85 }}>Ana ekrana əlavə et, daha sürətli aç</p>
      </div>
      <button
        onClick={install}
        style={{
          background: "#fff", color: "#1a4a8a", border: "none",
          borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 700,
          cursor: "pointer", display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
        }}
      >
        <Download size={14} />
        Yüklə
      </button>
      <button
        onClick={dismiss}
        style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 4, opacity: 0.7, flexShrink: 0 }}
      >
        <X size={18} />
      </button>
    </div>
  );
}
