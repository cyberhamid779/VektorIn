import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Users, BookOpen, Network, FileText, ArrowRight, ChevronDown } from "lucide-react";

/* ── Animated sky canvas ── */
function SkyCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // clouds
    const clouds = Array.from({ length: 7 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: 40 + Math.random() * (canvas.height * 0.55),
      r: 38 + Math.random() * 55,
      speed: 0.12 + Math.random() * 0.18,
      alpha: 0.13 + Math.random() * 0.18,
    }));

    // aircraft
    const plane = { x: -120, y: canvas.height * 0.38, speed: 1.1 };

    function drawCloud(c) {
      ctx.save();
      ctx.globalAlpha = c.alpha;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.arc(c.x + c.r * 0.7, c.y - c.r * 0.3, c.r * 0.75, 0, Math.PI * 2);
      ctx.arc(c.x - c.r * 0.6, c.y - c.r * 0.2, c.r * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawPlane(x, y) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "rgba(255,255,255,0.82)";
      // fuselage
      ctx.beginPath();
      ctx.ellipse(0, 0, 48, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      // wing
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(10, 0);
      ctx.lineTo(24, 22);
      ctx.lineTo(-8, 18);
      ctx.closePath();
      ctx.fill();
      // tail
      ctx.beginPath();
      ctx.moveTo(-36, 0);
      ctx.lineTo(-28, 0);
      ctx.lineTo(-26, -14);
      ctx.closePath();
      ctx.fill();
      // nose
      ctx.beginPath();
      ctx.moveTo(42, 0);
      ctx.lineTo(52, 2);
      ctx.lineTo(42, 4);
      ctx.closePath();
      ctx.fillStyle = "rgba(200,220,255,0.9)";
      ctx.fill();
      ctx.restore();
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      clouds.forEach(c => {
        c.x += c.speed;
        if (c.x - c.r * 1.5 > canvas.width) c.x = -c.r * 2;
        drawCloud(c);
      });

      plane.x += plane.speed;
      if (plane.x > canvas.width + 130) plane.x = -130;
      drawPlane(plane.x, plane.y);

      animId = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

const features = [
  {
    icon: <FileText size={26} />,
    title: "Akademik lent",
    desc: "Layihələrini, tədqiqatlarını və fikirlərini həmyaşıdlarınla paylaş.",
    accent: "from-sky-500 to-blue-600",
  },
  {
    icon: <Users size={26} />,
    title: "Tələbə şəbəkəsi",
    desc: "İxtisas və bacarıq filtri ilə düzgün insanı tap, komanda qur.",
    accent: "from-indigo-500 to-violet-600",
  },
  {
    icon: <Network size={26} />,
    title: "Professional bağlantı",
    desc: "Əlaqə istəyi göndər, peşəkar şəbəkəni genişləndir.",
    accent: "from-blue-500 to-cyan-600",
  },
  {
    icon: <BookOpen size={26} />,
    title: "Məqalə yaz",
    desc: "Bilik paylaş, sahənə dair dərin məzmun hazırla.",
    accent: "from-violet-500 to-purple-600",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#07101f] text-white overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-4 bg-[#07101f]/70 backdrop-blur-xl border-b border-white/8">
        <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent select-none">
          Hash
        </span>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2 text-sm font-medium text-sky-300 hover:text-white transition"
          >
            Daxil ol
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 text-sm font-semibold bg-sky-500 hover:bg-sky-400 rounded-lg transition shadow-lg shadow-sky-500/30"
          >
            Qeydiyyat
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden">
        {/* gradient sky bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1e40] via-[#0d2a5e] to-[#07101f]" />
        {/* horizon glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[260px] bg-sky-500/10 rounded-full blur-3xl" />
        {/* animated canvas */}
        <SkyCanvas />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-300 text-xs font-semibold tracking-widest uppercase mb-8">
            Milli Aviasiya Akademiyası · Qapalı Platforma
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            Bilik paylaş.
            <br />
            <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Hündürlüyə qalx.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Hash — MAA tələbələri üçün vahid akademik şəbəkə. Layihə tap,
            komanda qur, sahənin ən yaxşıları ilə əlaqə saxla.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/register"
              className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 rounded-xl font-semibold shadow-xl shadow-blue-600/30 transition"
            >
              Platformaya qoşul <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-8 py-3.5 border border-white/15 hover:border-sky-400/50 hover:bg-white/5 rounded-xl font-medium transition"
            >
              Daxil ol
            </Link>
          </div>

          {/* stats */}
          <div className="flex justify-center gap-10 mt-16 pt-10 border-t border-white/8">
            {[
              { n: "3000+", label: "Tələbə" },
              { n: "5+", label: "Fakültə" },
              { n: "1", label: "Platforma" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl font-black text-white">{s.n}</p>
                <p className="text-slate-400 text-sm mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-slate-500">
          <ChevronDown size={24} />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative py-28 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sky-400 text-sm font-semibold tracking-widest uppercase mb-3">İmkanlar</p>
          <h2 className="text-4xl font-black text-white">Platforma nə verir?</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(f => (
            <div
              key={f.title}
              className="group relative bg-white/4 hover:bg-white/8 border border-white/8 hover:border-sky-500/30 rounded-2xl p-6 transition duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.accent} flex items-center justify-center mb-5 shadow-lg`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="px-6 pb-28 max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d2a5e] to-[#0a1e40] border border-sky-500/20 p-12 text-center">
          {/* decorative glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-56 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
          <p className="text-sky-400 text-xs font-semibold tracking-widest uppercase mb-4">Başlamağa hazırsan?</p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 relative">
            Akademik karyeranı<br />bu gün inşa et.
          </h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            @naa.edu.az və ya @student.naa.edu.az email ünvanınla qeydiyyatdan keç.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-sky-500 hover:bg-sky-400 rounded-xl font-semibold shadow-xl shadow-sky-500/30 transition"
          >
            Qeydiyyatdan keç <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/8 text-center py-8 text-slate-500 text-sm">
        Hash · Vektor × MAA × Alfavit Group
      </footer>
    </div>
  );
}
