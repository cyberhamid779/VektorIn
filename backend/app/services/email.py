import httpx
from app.config import settings


def send_verification_email(to_email: str, token: str) -> bool:
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px">
      <h2 style="color:#2563eb">Hash — Email Təsdiqləmə</h2>
      <p>Salam! Qeydiyyatı tamamlamaq üçün aşağıdakı düyməyə bas:</p>
      <a href="{verify_url}"
         style="display:inline-block;margin:24px 0;padding:12px 28px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
        Emaili təsdiqlə
      </a>
      <p style="color:#6b7280;font-size:13px">Link 24 saat ərzində etibarlıdır.</p>
    </div>
    """
    try:
        res = httpx.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            json={
                "from": "Hash <onboarding@resend.dev>",
                "to": [to_email],
                "subject": "Hash — Emailini təsdiqlə",
                "html": html,
            },
            timeout=10,
        )
        return res.status_code == 200
    except Exception:
        return False
