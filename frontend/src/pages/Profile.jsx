import { useState, useEffect } from "react";
import { Edit3, Save, X, BookOpen, Award, GraduationCap, Sparkles } from "lucide-react";
import api from "../api/client";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get("/users/me");
      setUser(res.data);
      setForm(res.data);
    } catch (err) {}
  };

  const handleSave = async () => {
    try {
      await api.put("/users/me", {
        full_name: form.full_name,
        major: form.major,
        course: form.course,
        bio: form.bio,
        skills: form.skills,
        is_open_for_team: form.is_open_for_team,
      });
      setEditing(false);
      loadProfile();
    } catch (err) {}
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Cover */}
      <div className="relative">
        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-t-3xl h-36 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6TTAgMjR2LTJIMTJ2Mkg2djJIMHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-b-3xl border border-gray-100 border-t-0 shadow-sm px-6 pb-8 relative">
        <div className="flex items-end justify-between -mt-12 mb-5">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-xl shadow-blue-200 ring-4 ring-blue-50">
            {user.full_name?.charAt(0)}
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              editing
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 hover:shadow-md hover:shadow-blue-100 border border-blue-100"
            }`}
          >
            {editing ? <><X size={16} /> Legv et</> : <><Edit3 size={16} /> Redakte</>}
          </button>
        </div>

        <h2 className="text-2xl font-bold text-gray-900">{user.full_name}</h2>
        <p className="text-gray-400 text-sm mt-1">{user.email}</p>

        {user.is_open_for_team && (
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 text-xs px-4 py-1.5 rounded-full mt-3 font-semibold border border-green-100">
            <Award size={13} /> Komanda ucun aciq
          </span>
        )}

        {editing ? (
          <div className="space-y-5 mt-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ad Soyad</label>
              <input
                type="text"
                value={form.full_name || ""}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ixtisas</label>
                <input
                  type="text"
                  value={form.major || ""}
                  onChange={(e) => setForm({ ...form, major: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kurs</label>
                <select
                  value={form.course || ""}
                  onChange={(e) => setForm({ ...form, course: parseInt(e.target.value) || null })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                >
                  <option value="">Secin</option>
                  <option value="1">1-ci kurs</option>
                  <option value="2">2-ci kurs</option>
                  <option value="3">3-cu kurs</option>
                  <option value="4">4-cu kurs</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Haqqinda</label>
              <textarea
                value={form.bio || ""}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all bg-gray-50 focus:bg-white"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bacariqlar</label>
              <input
                type="text"
                value={form.skills || ""}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="Python, React, Design"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition">
              <input
                type="checkbox"
                checked={form.is_open_for_team || false}
                onChange={(e) => setForm({ ...form, is_open_for_team: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded-lg border-gray-300"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Komanda ucun acigam</span>
                <p className="text-xs text-gray-400 mt-0.5">Basqalari sizi komandaya devet ede biler</p>
              </div>
            </label>
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 flex items-center gap-2"
            >
              <Save size={18} /> Yadda saxla
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {user.major && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <GraduationCap size={20} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium">Ixtisas</p>
                  <p className="text-gray-800 font-semibold">{user.major} {user.course && `· ${user.course}-ci kurs`}</p>
                </div>
              </div>
            )}

            {user.bio && (
              <div className="bg-gradient-to-r from-gray-50 to-white p-5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={16} className="text-gray-400" />
                  <p className="text-sm text-gray-400 font-medium">Haqqinda</p>
                </div>
                <p className="text-gray-700 leading-relaxed">{user.bio}</p>
              </div>
            )}

            {user.skills && (
              <div className="bg-gradient-to-r from-gray-50 to-white p-5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-gray-400" />
                  <p className="text-sm text-gray-400 font-medium">Bacariqlar</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.skills.split(",").map((s, i) => (
                    <span key={i} className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold border border-blue-100">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
