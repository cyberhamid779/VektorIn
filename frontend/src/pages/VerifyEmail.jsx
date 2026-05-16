import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/client";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) { setStatus("invalid"); return; }
    api.get(`/auth/verify-email?token=${token}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("invalid"));
  }, []);

  const linkBtn = { display: "inline-block", background: "#1a4a8a", color: "#fff", border: "1px solid #1a4a8a", padding: "8px 20px", fontSize: 13, fontWeight: 600, textDecoration: "none" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f2f2f2", padding: "0 16px" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Link to="/" style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", textDecoration: "none" }}>Hash</Link>
        </div>
        <div style={{ background: "#fff", border: "1px solid #d4d4d4", padding: "32px 24px", textAlign: "center" }}>
          {status === "loading" && (
            <p style={{ fontSize: 13, color: "#666" }}>Yoxlanılır...</p>
          )}
          {status === "success" && (
            <>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 }}>Email təsdiqləndi!</p>
              <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>Hesabınız aktivdir. İndi daxil ola bilərsiniz.</p>
              <Link to="/login" style={linkBtn}>Daxil ol</Link>
            </>
          )}
          {status === "invalid" && (
            <>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#c0392b", marginBottom: 6 }}>Link etibarsızdır</p>
              <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>Bu link köhnəlmiş və ya yanlışdır.</p>
              <Link to="/register" style={linkBtn}>Yenidən qeydiyyat</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
