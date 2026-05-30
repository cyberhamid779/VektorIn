import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Clock, PenSquare, BookOpen, Home, FileText } from "lucide-react";
import api from "../api/client";
import UserAvatar from "../components/UserAvatar";
import { useIsMobile } from "../hooks/useIsMobile";
import { useDarkMode } from "../hooks/useTheme";

const ACCENT = "#1E90FF";

function useFonts() {
  useEffect(() => {
    if (document.getElementById("hash-fonts")) return;
    const link = document.createElement("link");
    link.id = "hash-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,800&family=JetBrains+Mono:wght@500;600&display=swap";
    document.head.appendChild(link);
  }, []);
}

function useColors(dark) {
  return {
    bg:       dark ? "#050f1f" : "#f0f4fa",
    surface:  dark ? "#0a1c39" : "#ffffff",
    surface2: dark ? "#0d2248" : "#f8faff",
    border:   dark ? "rgba(255,255,255,0.07)" : "#e4e9f1",
    text:     dark ? "#ffffff" : "#071428",
    muted:    dark ? "#7d8ba3" : "#69768d",
    accentWash: dark ? "rgba(30,144,255,0.10)" : "rgba(30,144,255,0.06)",
  };
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "indicə";
  if (diff < 3600) return `${Math.floor(diff / 60)} dəq əvvəl`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat əvvəl`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} gün əvvəl`;
  return new Date(dateStr).toLocaleDateString("az-AZ", { day: "numeric", month: "short" });
}

function ArticleCard({ article }) {
  const dark = useDarkMode();
  const C = useColors(dark);
  const [hover, setHover] = useState(false);
  return (
    <Link
      to={`/article/${article.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", gap: 16, alignItems: "flex-start",
        padding: "18px 20px",
        background: C.surface,
        border: `1px solid ${hover ? "rgba(30,144,255,0.25)" : C.border}`,
        borderRadius: 16,
        marginBottom: 10,
        textDecoration: "none", color: "inherit",
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
        boxShadow: hover ? "0 6px 24px rgba(30,144,255,0.08)" : "none",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        fontFamily: "'Archivo', sans-serif",
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <UserAvatar user={{ full_name: article.author_name, profile_picture: article.author_picture }} size="xs" />
          <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>{article.author_name}</span>
        </div>

        <div>
          <h2 style={{
            fontSize: 15, fontWeight: 800, color: C.text,
            margin: 0, lineHeight: 1.4, marginBottom: 4,
            fontFamily: "'Archivo', sans-serif",
            transition: "color 0.15s",
          }} style={{ fontSize: 15, fontWeight: 800, color: hover ? ACCENT : C.text, margin: 0, lineHeight: 1.4, marginBottom: 4, fontFamily: "'Archivo', sans-serif", transition: "color 0.15s" }}>
            {article.title}
          </h2>
          {(article.subtitle || article.preview) && (
            <p style={{
              fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.55,
              overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            }}>
              {article.subtitle || article.preview}
            </p>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: C.muted, fontFamily: "'JetBrains Mono', monospace" }}>
          <span>{timeAgo(article.created_at)}</span>
          <span>·</span>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={10} /> {article.read_time} dəq</span>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Heart size={10} /> {article.like_count}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><MessageCircle size={10} /> {article.comment_count}</span>
        </div>
      </div>

      {article.cover_image && (
        <div style={{ width: 84, height: 84, flexShrink: 0, overflow: "hidden", borderRadius: 12, border: `1px solid ${C.border}` }}>
          <img src={article.cover_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
    </Link>
  );
}

export default function Articles() {
  const dark = useDarkMode();
  const C = useColors(dark);
  const [articles, setArticles] = useState([]);
  const [myArticles, setMyArticles] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  useFonts();

  useEffect(() => {
    Promise.all([api.get("/articles"), api.get("/users/me")])
      .then(([art, user]) => { setArticles(art.data); setMe(user.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (me && tab === "mine") {
      api.get(`/articles/user/${me.id}`).then(r => setMyArticles(r.data)).catch(() => {});
    }
  }, [tab, me]);

  const displayed = tab === "mine" ? myArticles : articles;

  const navItems = [
    { id: "all",  Icon: Home,     label: "Bütün məqalələr" },
    { id: "mine", Icon: FileText, label: "Mənim yazılarım" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Archivo', sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: isMobile ? "16px 12px" : "28px 20px" }}>

        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
              color: ACCENT, fontFamily: "'JetBrains Mono', monospace",
              textTransform: "uppercase",
            }}>ARTICLES</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>
              Məqalələr
            </h1>
            <button
              onClick={() => navigate("/article/new")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 16px", fontSize: 13, fontWeight: 800,
                color: "#fff", background: ACCENT,
                border: "none", borderRadius: 10, cursor: "pointer",
                fontFamily: "'Archivo', sans-serif",
                boxShadow: "0 4px 16px rgba(30,144,255,0.35)",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <PenSquare size={14} /> Yeni məqalə
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          display: "flex", gap: 2,
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 13, padding: 4, marginBottom: 20,
          width: "fit-content",
        }}>
          {navItems.map(({ id, Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "8px 16px", borderRadius: 10, border: "none",
                cursor: "pointer", fontSize: 13,
                fontWeight: tab === id ? 800 : 600,
                background: tab === id ? ACCENT : "transparent",
                color: tab === id ? "#fff" : C.muted,
                boxShadow: tab === id ? "0 4px 14px rgba(30,144,255,0.30)" : "none",
                transition: "all 0.15s",
                fontFamily: "'Archivo', sans-serif",
              }}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* Author strip */}
        {me && (
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 16px",
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 14, marginBottom: 18,
          }}>
            <UserAvatar user={{ full_name: me.full_name, profile_picture: me.profile_picture }} size="sm" />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: 0 }}>{me.full_name}</p>
              <p style={{ fontSize: 12, color: C.muted, margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
                {me.major} · {articles.filter(a => a.author_id === me.id).length} yazı
              </p>
            </div>
          </div>
        )}

        {/* Article list */}
        {loading ? (
          <div>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 96, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, marginBottom: 10 }} />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "64px 20px",
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 18,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: C.accentWash, border: "1px solid rgba(30,144,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 18,
            }}>
              <BookOpen size={26} color={ACCENT} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: 0 }}>
              {tab === "mine" ? "Hələ məqalən yoxdur" : "Hələ məqalə yoxdur"}
            </p>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>İlk məqaləni sən yaz!</p>
          </div>
        ) : (
          <div>
            {displayed.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        )}
      </div>
    </div>
  );
}
