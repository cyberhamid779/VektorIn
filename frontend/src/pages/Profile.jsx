import { useState, useEffect } from "react";
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

  if (!user) return <p className="text-center mt-10">Yüklənir...</p>;

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user.full_name?.charAt(0)}
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold text-gray-800">{user.full_name}</h2>
            <p className="text-gray-500">{user.email}</p>
            {user.is_open_for_team && (
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded mt-1 inline-block">
                Komanda üçün açıq
              </span>
            )}
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="ml-auto bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            {editing ? "Ləğv et" : "Redaktə"}
          </button>
        </div>

        {editing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={form.full_name || ""}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Ad Soyad"
              className="w-full p-3 border rounded-lg"
            />
            <input
              type="text"
              value={form.major || ""}
              onChange={(e) => setForm({ ...form, major: e.target.value })}
              placeholder="İxtisas"
              className="w-full p-3 border rounded-lg"
            />
            <select
              value={form.course || ""}
              onChange={(e) => setForm({ ...form, course: parseInt(e.target.value) || null })}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Kurs</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
            <textarea
              value={form.bio || ""}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Haqqında"
              className="w-full p-3 border rounded-lg resize-none"
              rows={3}
            />
            <input
              type="text"
              value={form.skills || ""}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              placeholder="Bacarıqlar (vergüllə ayır: Python, React, Design)"
              className="w-full p-3 border rounded-lg"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_open_for_team || false}
                onChange={(e) => setForm({ ...form, is_open_for_team: e.target.checked })}
              />
              Komanda üçün açığam
            </label>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              Yadda saxla
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {user.major && <p><span className="font-semibold">İxtisas:</span> {user.major}</p>}
            {user.course && <p><span className="font-semibold">Kurs:</span> {user.course}</p>}
            {user.bio && <p><span className="font-semibold">Haqqında:</span> {user.bio}</p>}
            {user.skills && (
              <div>
                <span className="font-semibold">Bacarıqlar:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {user.skills.split(",").map((s, i) => (
                    <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
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
