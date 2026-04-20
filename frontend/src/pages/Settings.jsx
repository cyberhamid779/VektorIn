import { useState } from "react";
import { Settings as SettingsIcon, Monitor, Check } from "lucide-react";

const BG_OPTIONS = [
  { id: "default", label: "Standart (açıq boz)", color: "bg-gray-100", preview: "bg-gray-50" },
  { id: "vectors", label: "Vektor & Aviasiya", color: "bg-[#1a1a2e]", preview: "bg-[#1a1a2e]", image: true },
  { id: "dark", label: "Tünd", color: "bg-gray-900", preview: "bg-gray-900" },
  { id: "navy", label: "Tünd göy", color: "bg-[#0f172a]", preview: "bg-[#0f172a]" },
];

export default function Settings() {
  const [selected, setSelected] = useState(localStorage.getItem("bg_theme") || "default");

  const handleSelect = (id) => {
    setSelected(id);
    localStorage.setItem("bg_theme", id);
    window.dispatchEvent(new Event("bg_theme_change"));
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
          <SettingsIcon size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parametrlər</h1>
          <p className="text-gray-400 text-sm">Görünüş və fərdiləşdirmə</p>
        </div>
      </div>

      {/* Arxa plan seçimi */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Monitor size={18} className="text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-800">Arxa plan</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
              <div className={`h-28 ${opt.preview} relative`}>
                {opt.image && (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: "url('/bg-vectors.png')",
                      backgroundSize: "400px",
                      backgroundRepeat: "repeat",
                    }}
                  />
                )}
                {/* Mini UI preview */}
                <div className="absolute inset-3 flex flex-col gap-2">
                  <div className={`h-2 w-full rounded ${opt.id === "default" ? "bg-white" : "bg-white/10"}`} />
                  <div className={`h-12 w-full rounded-lg ${opt.id === "default" ? "bg-white" : "bg-white/5"} border ${opt.id === "default" ? "border-gray-200" : "border-white/10"}`} />
                  <div className={`h-6 w-3/4 rounded ${opt.id === "default" ? "bg-white" : "bg-white/5"} border ${opt.id === "default" ? "border-gray-200" : "border-white/10"}`} />
                </div>
              </div>

              {/* Label */}
              <div className="px-4 py-3 bg-white flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                {selected === opt.id && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Seçim yalnız bu cihazda saxlanılır
        </p>
      </div>
    </div>
  );
}
