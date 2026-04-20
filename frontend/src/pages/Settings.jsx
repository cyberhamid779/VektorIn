import { useState } from "react";
import { Settings as SettingsIcon, Check, Moon, Sun, Image as ImageIcon, Monitor } from "lucide-react";
import { useDarkClasses } from "../hooks/useDarkClasses";

const BG_OPTIONS = [
  { id: "default", label: "Standart", preview: "bg-gray-50" },
  { id: "vectors", label: "Vektor & Aviasiya", preview: "bg-[#1a1a2e]", local: true },
  { id: "cockpit-night", label: "Kokpit (gecə)", img: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1920&q=80" },
  { id: "cockpit-panel", label: "Kokpit paneli", img: "https://images.unsplash.com/photo-1581094288338-2024c4979bfe?w=1920&q=80" },
  { id: "cockpit-sky", label: "Kokpit (səma)", img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&q=80" },
  { id: "night-flight", label: "Gecə uçuşu", img: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1920&q=80" },
  { id: "wing-sunset", label: "Qanad (gün batımı)", img: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=1920&q=80" },
  { id: "wing-clouds", label: "Buludlar üstündə", img: "https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=1920&q=80" },
  { id: "runway-sunset", label: "Uçuş zolağı", img: "https://images.unsplash.com/photo-1559268950-2d7ceb2efa3a?w=1920&q=80" },
  { id: "airplane-sky", label: "Təyyarə (səma)", img: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1920&q=80" },
  { id: "dark", label: "Tünd", preview: "bg-gray-900" },
  { id: "navy", label: "Tünd göy", preview: "bg-[#0f172a]" },
];

export default function Settings() {
  const [selected, setSelected] = useState(localStorage.getItem("bg_theme") || "default");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("dark_mode") === "true");

  const handleSelect = (id) => {
    setSelected(id);
    localStorage.setItem("bg_theme", id);
    window.dispatchEvent(new Event("bg_theme_change"));
  };

  const toggleDarkMode = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    localStorage.setItem("dark_mode", String(newVal));
    window.dispatchEvent(new Event("dark_mode_change"));
  };

  const d = useDarkClasses();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
          <SettingsIcon size={24} className="text-white" />
        </div>
        <div>
          <h1 className={`text-2xl font-bold ${d.heading}`}>Parametrlər</h1>
          <p className={d.textFaint + " text-sm"}>Görünüş və fərdiləşdirmə</p>
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <div className={`${d.card} rounded-2xl shadow-sm p-6 mb-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon size={20} className="text-indigo-500" /> : <Sun size={20} className="text-amber-500" />}
            <div>
              <h2 className={`text-lg font-semibold ${d.text}`}>Qaranlıq rejim</h2>
              <p className={`text-xs ${d.textFaint}`}>Kartlar, navbar və mətnlər tünd rəngdə göstərilir</p>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
              darkMode ? "bg-indigo-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${
                darkMode ? "left-7" : "left-1"
              }`}
            >
              {darkMode ? <Moon size={12} className="text-indigo-500" /> : <Sun size={12} className="text-amber-500" />}
            </div>
          </button>
        </div>
      </div>

      {/* Arxa plan seçimi */}
      <div className={`${d.card} rounded-2xl shadow-sm p-6`}>
        <div className="flex items-center gap-2 mb-5">
          <ImageIcon size={18} className={d.textMuted} />
          <h2 className={`text-lg font-semibold ${d.text}`}>Arxa plan</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BG_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
                selected === opt.id
                  ? "border-blue-500 shadow-lg shadow-blue-100 scale-[1.02]"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
            >
              {/* Preview */}
              <div className={`h-24 ${opt.preview || ""} relative`}>
                {opt.img && (
                  <img
                    src={`${opt.img}&w=400&h=200&fit=crop`}
                    alt={opt.label}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
                {opt.local && (
                  <div
                    className="absolute inset-0 bg-[#1a1a2e]"
                    style={{
                      backgroundImage: "url('/bg-vectors.png')",
                      backgroundSize: "300px",
                      backgroundRepeat: "repeat",
                    }}
                  />
                )}
                {/* Overlay for non-image solid colors */}
                {!opt.img && !opt.local && opt.id !== "default" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Monitor size={24} className="text-white/20" />
                  </div>
                )}
                {/* Selected checkmark */}
                {selected === opt.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </div>

              {/* Label */}
              <div className={`px-3 py-2 ${d.dark ? "bg-gray-800" : "bg-white"}`}>
                <span className={`text-xs font-medium ${d.textSecondary}`}>{opt.label}</span>
              </div>
            </button>
          ))}
        </div>

        <p className={`text-xs ${d.textFaint} mt-4 text-center`}>
          Seçim yalnız bu cihazda saxlanılır · Şəkillər Unsplash-dan
        </p>
      </div>
    </div>
  );
}
