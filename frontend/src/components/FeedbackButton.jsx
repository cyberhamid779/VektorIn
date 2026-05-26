import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import api from "../api/client";
import { toast } from "./Toast";
import { useDarkMode } from "../hooks/useTheme";

export default function FeedbackButton() {
  const dark = useDarkMode();
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState("idea");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await api.post("/feedback", { content: text.trim(), category: cat });
      toast.success("Rəyiniz göndərildi, təşəkkür edirik!");
      setText("");
      setOpen(false);
    } catch {
      toast.error("Göndərilmədi, yenidən cəhd edin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        title="Rəy və təklif"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 900,
          width: 48, height: 48, borderRadius: "50%",
          background: "#1a4a8a", color: "#fff", border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        }}
      >
        <MessageSquare size={20} />
      </button>

      {/* Modal */}
      {open && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
          padding: 24, pointerEvents: "none",
        }}>
          <div style={{
            width: 320, pointerEvents: "auto",
            background: dark ? "#1f2937" : "#fff",
            border: dark ? "1px solid #374151" : "1px solid #d4d4d4",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            marginBottom: 64,
          }}>
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: dark ? "1px solid #374151" : "1px solid #e5e5e5",
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: dark ? "#f3f4f6" : "#1a1a1a" }}>
                💬 Rəy və təklif
              </span>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: dark ? "#9ca3af" : "#999", padding: 2 }}>
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "14px 16px" }}>
              {/* Category */}
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {[{ val: "idea", label: "💡 Təklif" }, { val: "bug", label: "🐛 Xəta" }, { val: "other", label: "💬 Digər" }].map(c => (
                  <button key={c.val} onClick={() => setCat(c.val)} style={{
                    flex: 1, padding: "5px 0", fontSize: 11, fontWeight: 600, cursor: "pointer",
                    border: `1px solid ${cat === c.val ? "#1a4a8a" : (dark ? "#374151" : "#d4d4d4")}`,
                    background: cat === c.val ? "#1a4a8a" : "transparent",
                    color: cat === c.val ? "#fff" : (dark ? "#9ca3af" : "#666"),
                  }}>{c.label}</button>
                ))}
              </div>

              {/* Text */}
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Fikirlərinizi yazın..."
                rows={4}
                style={{
                  width: "100%", boxSizing: "border-box", padding: "8px 10px", fontSize: 13,
                  border: `1px solid ${dark ? "#374151" : "#d4d4d4"}`,
                  background: dark ? "#111827" : "#fafafa",
                  color: dark ? "#f3f4f6" : "#1a1a1a",
                  resize: "none", outline: "none", fontFamily: "inherit",
                }}
              />

              <button
                onClick={send}
                disabled={loading || !text.trim()}
                style={{
                  marginTop: 8, width: "100%", padding: "9px", background: "#1a4a8a",
                  color: "#fff", border: "none", fontSize: 13, fontWeight: 600,
                  cursor: loading || !text.trim() ? "not-allowed" : "pointer",
                  opacity: loading || !text.trim() ? 0.6 : 1,
                }}
              >
                {loading ? "Göndərilir..." : "Göndər"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
