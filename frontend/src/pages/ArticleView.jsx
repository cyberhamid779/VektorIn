import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Clock, Edit3, Trash2, Send, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import api from "../api/client";
import UserAvatar from "../components/UserAvatar";
import { formatBakuDate, formatBakuHM } from "../utils/time";
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
    bodyText: dark ? "#d0d8e8" : "#2d3748",
  };
}

export default function ArticleView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const dark = useDarkMode();
  const C = useColors(dark);
  const [article, setArticle] = useState(null);
  const [me, setMe] = useState(null);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  useFonts();

  useEffect(() => {
    api.get(`/articles/${id}`).then(r => setArticle(r.data)).catch(() => navigate("/feed"));
    api.get("/users/me").then(r => setMe(r.data)).catch(() => {});
  }, [id]);

  const handleLike = async () => {
    setArticle(prev => ({ ...prev, is_liked: !prev.is_liked, like_count: prev.is_liked ? prev.like_count - 1 : prev.like_count + 1 }));
    try { await api.post(`/articles/${id}/like`); } catch { api.get(`/articles/${id}`).then(r => setArticle(r.data)); }
  };

  const toggleComments = async () => {
    if (!showComments) { const res = await api.get(`/articles/${id}/comments`); setComments(res.data); }
    setShowComments(!showComments);
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    await api.post(`/articles/${id}/comment`, { content: commentText.trim() });
    setCommentText("");
    const res = await api.get(`/articles/${id}/comments`);
    setComments(res.data);
    setArticle(prev => ({ ...prev, comment_count: prev.comment_count + 1 }));
  };

  const handleDelete = async () => {
    if (!confirm("Bu məqaləni silmək istəyirsən?")) return;
    await api.delete(`/articles/${id}`);
    navigate("/feed");
  };

  if (!article) return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: isMobile ? "16px 12px" : "32px 20px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {[240, 40, 24, 16, 16, 16, 16].map((h, i) => (
          <div key={i} style={{ height: h, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 12, opacity: 0.6 }} />
        ))}
      </div>
    </div>
  );

  const isOwn = me?.id === article.author_id;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Archivo', sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: isMobile ? "16px 12px" : "28px 20px" }}>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            marginBottom: 16, padding: "7px 12px",
            fontSize: 13, fontWeight: 600, color: C.muted,
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 10, cursor: "pointer",
            fontFamily: "'Archivo', sans-serif",
            transition: "color 0.15s, border-color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.borderColor = "rgba(30,144,255,0.30)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
        >
          <ArrowLeft size={14} /> Geri
        </button>

        {/* Article card */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 20, overflow: "hidden",
          boxShadow: dark ? "0 8px 48px rgba(0,0,0,0.4)" : "0 4px 24px rgba(7,20,40,0.06)",
        }}>
          {article.cover_image && (
            <img src={article.cover_image} alt="cover" style={{ width: "100%", height: 280, objectFit: "cover", display: "block" }} />
          )}

          <div style={{ padding: isMobile ? "20px 16px" : "32px 36px" }}>
            <h1 style={{
              fontSize: isMobile ? 24 : 32, fontWeight: 900,
              color: C.text, margin: "0 0 10px 0", lineHeight: 1.25,
              letterSpacing: "-0.02em", fontFamily: "'Archivo', sans-serif",
            }}>
              {article.title}
            </h1>
            {article.subtitle && (
              <p style={{
                fontSize: 17, color: C.muted, margin: "0 0 24px 0",
                lineHeight: 1.55, fontFamily: "'Archivo', sans-serif",
              }}>
                {article.subtitle}
              </p>
            )}

            {/* Author row */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 0",
              borderTop: `1px solid ${C.border}`,
              borderBottom: `1px solid ${C.border}`,
              marginBottom: 28,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Link to={`/profile/${article.author_id}`}>
                  <UserAvatar user={{ full_name: article.author_name, profile_picture: article.author_picture }} size="md" />
                </Link>
                <div>
                  <Link to={`/profile/${article.author_id}`} style={{
                    fontSize: 13, fontWeight: 800, color: C.text,
                    textDecoration: "none", fontFamily: "'Archivo', sans-serif",
                    transition: "color 0.15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = ACCENT}
                    onMouseLeave={e => e.currentTarget.style.color = C.text}
                  >
                    {article.author_name}
                  </Link>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.muted, marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>
                    <span>{formatBakuDate(article.created_at)}</span>
                    <span>·</span>
                    <Clock size={11} />
                    <span>{article.read_time} dəq oxuma</span>
                  </div>
                </div>
              </div>
              {isOwn && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => navigate(`/article/${id}/edit`)}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "7px 14px", fontSize: 12, fontWeight: 700,
                      color: ACCENT, background: "rgba(30,144,255,0.10)",
                      border: "1px solid rgba(30,144,255,0.25)", borderRadius: 9,
                      cursor: "pointer", fontFamily: "'Archivo', sans-serif",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    <Edit3 size={13} /> Redaktə
                  </button>
                  <button
                    onClick={handleDelete}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "7px 14px", fontSize: 12, fontWeight: 700,
                      color: "#f87171", background: "rgba(248,113,113,0.10)",
                      border: "1px solid rgba(248,113,113,0.25)", borderRadius: 9,
                      cursor: "pointer", fontFamily: "'Archivo', sans-serif",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    <Trash2 size={13} /> Sil
                  </button>
                </div>
              )}
            </div>

            {/* Article body */}
            <div
              className="article-content"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: C.bodyText,
                marginBottom: 32,
                lineHeight: 1.85,
                fontSize: 16,
              }}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Reaction bar */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              paddingTop: 18, borderTop: `1px solid ${C.border}`,
            }}>
              <button
                onClick={handleLike}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "8px 16px", fontSize: 13, fontWeight: 700,
                  cursor: "pointer",
                  color: article.is_liked ? "#f87171" : C.muted,
                  background: article.is_liked ? "rgba(248,113,113,0.10)" : "transparent",
                  border: `1px solid ${article.is_liked ? "rgba(248,113,113,0.30)" : C.border}`,
                  borderRadius: 10,
                  fontFamily: "'Archivo', sans-serif",
                  transition: "all 0.15s",
                }}
              >
                <Heart size={15} fill={article.is_liked ? "currentColor" : "none"} /> {article.like_count}
              </button>
              <button
                onClick={toggleComments}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "8px 16px", fontSize: 13, fontWeight: 700,
                  cursor: "pointer",
                  color: showComments ? ACCENT : C.muted,
                  background: showComments ? "rgba(30,144,255,0.10)" : "transparent",
                  border: `1px solid ${showComments ? "rgba(30,144,255,0.30)" : C.border}`,
                  borderRadius: 10,
                  fontFamily: "'Archivo', sans-serif",
                  transition: "all 0.15s",
                }}
              >
                <MessageCircle size={15} /> {article.comment_count}
                {showComments ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>

            {/* Comments section */}
            {showComments && (
              <div style={{ marginTop: 24 }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                  <input
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && submitComment()}
                    placeholder="Şərh yaz..."
                    style={{
                      flex: 1, padding: "10px 14px", fontSize: 13,
                      border: `1px solid ${C.border}`,
                      borderRadius: 11,
                      background: C.surface2, color: C.text,
                      outline: "none", fontFamily: "'Archivo', sans-serif",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                    onFocus={e => { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = "0 0 0 3px rgba(30,144,255,0.12)"; }}
                    onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
                  />
                  <button
                    onClick={submitComment}
                    disabled={!commentText.trim()}
                    style={{
                      display: "flex", alignItems: "center", padding: "10px 16px",
                      background: commentText.trim() ? ACCENT : C.surface2,
                      color: commentText.trim() ? "#fff" : C.muted,
                      border: `1px solid ${C.border}`,
                      borderRadius: 11, cursor: commentText.trim() ? "pointer" : "not-allowed",
                      boxShadow: commentText.trim() ? "0 4px 14px rgba(30,144,255,0.30)" : "none",
                      transition: "all 0.15s",
                    }}
                  >
                    <Send size={14} />
                  </button>
                </div>

                {comments.length === 0 ? (
                  <p style={{ fontSize: 13, color: C.muted, textAlign: "center", padding: "20px 0" }}>Hələ şərh yoxdur</p>
                ) : comments.map(c => (
                  <div key={c.id} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                    <Link
                      to={`/profile/${c.user_id}`}
                      style={{
                        width: 34, height: 34, flexShrink: 0, borderRadius: "50%",
                        background: "rgba(30,144,255,0.15)",
                        color: ACCENT,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 800, textDecoration: "none",
                        border: "1px solid rgba(30,144,255,0.25)",
                        fontFamily: "'Archivo', sans-serif",
                      }}
                    >
                      {c.user_name?.charAt(0)}
                    </Link>
                    <div style={{
                      flex: 1, padding: "12px 16px",
                      background: C.surface2, border: `1px solid ${C.border}`,
                      borderRadius: 14,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                        <Link to={`/profile/${c.user_id}`} style={{
                          fontSize: 13, fontWeight: 800, color: C.text,
                          textDecoration: "none", fontFamily: "'Archivo', sans-serif",
                        }}>
                          {c.user_name}
                        </Link>
                        <span style={{ fontSize: 11, color: C.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                          {formatBakuHM(c.created_at)}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.55, fontFamily: "'Archivo', sans-serif" }}>
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
