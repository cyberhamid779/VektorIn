import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ExternalLink, Globe, Award, FolderGit2, Download, Share2, Check } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const GithubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

function SkillChip({ label }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px",
      borderRadius: 99, fontSize: 12, fontWeight: 500,
      background: "#eff6ff", color: "#1d4ed8",
      border: "1px solid #bfdbfe",
    }}>
      {label}
    </span>
  );
}

export default function PublicCV() {
  const { identifier } = useParams();
  const [profile, setProfile] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    axios.get(`${API}/public/profile/${identifier}`)
      .then(r => setProfile(r.data))
      .catch(() => setNotFound(true));
  }, [identifier]);

  const shareUrl = window.location.href;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt("Profil linki:", shareUrl);
    }
  };

  const handlePrint = () => window.print();

  if (notFound) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <p style={{ fontSize: 18, color: "#666" }}>Profil tapılmadı</p>
      <Link to="/" style={{ color: "#1a4a8a", marginTop: 12, fontSize: 14 }}>Hash Campus-a qayıt</Link>
    </div>
  );

  if (!profile) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #1a4a8a", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  let skills = [];
  try { skills = profile.skills ? JSON.parse(profile.skills) : []; } catch { skills = profile.skills?.split(",").map(s => s.trim()).filter(Boolean) || []; }

  return (
    <>
      <style>{`
        @media print {
          .cv-actions { display: none !important; }
          .cv-footer { display: none !important; }
          body { margin: 0; }
          .cv-page { box-shadow: none !important; max-width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
        }
        @page { margin: 1.5cm; }
      `}</style>

      {/* Action bar — hidden on print */}
      <div className="cv-actions" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "#fff", borderBottom: "1px solid #e5e7eb",
        padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link to="/" style={{ fontSize: 13, fontWeight: 700, color: "#1a4a8a", textDecoration: "none" }}>
          ⬡ Hash Campus
        </Link>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleShare}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151" }}
          >
            {copied ? <Check size={14} color="#22c55e" /> : <Share2 size={14} />}
            {copied ? "Kopyalandı!" : "Paylaş"}
          </button>
          <button
            onClick={handlePrint}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, border: "none", background: "#1a4a8a", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff" }}
          >
            <Download size={14} /> PDF yüklə
          </button>
        </div>
      </div>

      {/* CV page */}
      <div style={{ minHeight: "100vh", background: "#f3f4f6", padding: "72px 16px 40px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div className="cv-page" style={{ maxWidth: 800, margin: "0 auto", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>

          {/* Header */}
          <div style={{ background: "#1a4a8a", padding: "36px 40px", display: "flex", alignItems: "flex-start", gap: 28 }}>
            {profile.profile_picture ? (
              <img src={profile.profile_picture} alt={profile.full_name} style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "3px solid rgba(255,255,255,0.3)" }} />
            ) : (
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: "rgba(255,255,255,0.2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 700, color: "#fff" }}>
                {profile.full_name?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{profile.full_name}</h1>
              {profile.headline && <p style={{ margin: "6px 0 0", fontSize: 15, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{profile.headline}</p>}
              {(profile.major || profile.course) && (
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
                  {profile.major}{profile.course ? ` · ${profile.course}-ci kurs` : ""}
                </p>
              )}

              {/* Links */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 14 }}>
                {profile.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: 12 }}>
                    <GithubIcon /> {profile.github_url.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                )}
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: 12 }}>
                    <LinkedinIcon /> LinkedIn
                  </a>
                )}
                {profile.website_url && (
                  <a href={profile.website_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: 12 }}>
                    <Globe size={12} /> {profile.website_url.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                )}
              </div>
            </div>

            {profile.is_open_for_team && (
              <div style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", padding: "4px 12px", borderRadius: 99, fontSize: 11, color: "#fff", fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap" }}>
                Komanda üçün açıq
              </div>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: 28 }}>

            {/* About */}
            {profile.bio && (
              <section>
                <h2 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280" }}>Haqqımda</h2>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "#374151" }}>{profile.bio}</p>
              </section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <section>
                <h2 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280" }}>Bacarıqlar</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {skills.map((s, i) => <SkillChip key={i} label={s} />)}
                </div>
              </section>
            )}

            {/* Projects */}
            {profile.projects?.length > 0 && (
              <section>
                <h2 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280" }}>Layihələr</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {profile.projects.map(p => (
                    <div key={p.id} style={{ padding: "14px 16px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fafafa" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <FolderGit2 size={14} color="#1a4a8a" />
                            <strong style={{ fontSize: 14, color: "#111827" }}>{p.title}</strong>
                          </div>
                          {p.description && <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>{p.description}</p>}
                          {p.technologies && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                              {p.technologies.split(",").map((t, i) => (
                                <span key={i} style={{ fontSize: 11, padding: "1px 7px", borderRadius: 99, background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" }}>
                                  {t.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {p.github_url && (
                          <a href={p.github_url} target="_blank" rel="noreferrer" style={{ color: "#6b7280", flexShrink: 0 }}>
                            <ExternalLink size={15} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certificates */}
            {profile.certificates?.length > 0 && (
              <section>
                <h2 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280" }}>Sertifikatlar</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {profile.certificates.map(c => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", border: "1px solid #e5e7eb", borderRadius: 8 }}>
                      <Award size={16} color="#1a4a8a" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: 13, color: "#111827" }}>{c.name}</strong>
                        <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 8 }}>{c.issuer}</span>
                        {c.issue_date && <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 8 }}>· {c.issue_date}</span>}
                      </div>
                      {c.credential_url && (
                        <a href={c.credential_url} target="_blank" rel="noreferrer" style={{ color: "#1a4a8a", fontSize: 11, textDecoration: "none", flexShrink: 0 }}>
                          Bax →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Footer */}
          <div className="cv-footer" style={{ borderTop: "1px solid #e5e7eb", padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              Bu profil <strong style={{ color: "#1a4a8a" }}>Hash Campus</strong>-da yaradılıb — hashcampus.site
            </span>
            <Link to="/register" style={{ fontSize: 12, color: "#1a4a8a", textDecoration: "none", fontWeight: 600 }}>
              Sən də qoşul →
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
