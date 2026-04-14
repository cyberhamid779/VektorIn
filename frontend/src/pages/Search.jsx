import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

export default function Search() {
  const [query, setQuery] = useState("");
  const [skill, setSkill] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await api.get("/users/search", {
        params: { q: query, skill },
      });
      setResults(res.data);
      setSearched(true);
    } catch (err) {}
  };

  const sendConnection = async (userId) => {
    try {
      await api.post(`/connections/${userId}`);
      alert("Bağlantı istəyi göndərildi!");
    } catch (err) {
      alert(err.response?.data?.detail || "Xəta baş verdi");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Tələbə axtar</h2>

      <form onSubmit={handleSearch} className="bg-white rounded-xl shadow p-4 mb-6 space-y-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ad ilə axtar..."
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          placeholder="Bacarıq filtr (məs: Python, Design)"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Axtar
        </button>
      </form>

      {results.map((user) => (
        <div key={user.id} className="bg-white rounded-xl shadow p-4 mb-3 flex items-center">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user.full_name?.charAt(0)}
          </div>
          <div className="ml-3 flex-1">
            <p className="font-semibold text-gray-800">{user.full_name}</p>
            <p className="text-sm text-gray-500">{user.major} {user.course && `| Kurs ${user.course}`}</p>
            {user.skills && (
              <div className="flex flex-wrap gap-1 mt-1">
                {user.skills.split(",").slice(0, 3).map((s, i) => (
                  <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{s.trim()}</span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => sendConnection(user.id)}
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-200"
          >
            Bağlan
          </button>
        </div>
      ))}

      {searched && results.length === 0 && (
        <p className="text-center text-gray-500">Nəticə tapılmadı</p>
      )}
    </div>
  );
}
