import { useState } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon, UserPlus, Filter, Sparkles, Users } from "lucide-react";
import api from "../api/client";

export default function Search() {
  const [query, setQuery] = useState("");
  const [skill, setSkill] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

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
      alert("Baglanti isteyi gonderildi!");
    } catch (err) {
      alert(err.response?.data?.detail || "Xeta bash verdi");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Telebe axtar</h2>
        <p className="text-gray-400 text-sm mt-1">Bacariq ve ya ad ile uygun telebeni tap</p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 hover:shadow-md transition-shadow duration-300">
        <div className="relative mb-4">
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ad ile axtar..."
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all text-sm"
          />
        </div>
        <div className="relative mb-5">
          <Sparkles size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="Bacariq filtri (mes: Python, Design)"
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
        >
          <SearchIcon size={18} /> Axtar
        </button>
      </form>

      {/* Results count */}
      {searched && results.length > 0 && (
        <p className="text-sm text-gray-400 mb-4 font-medium">{results.length} neticə tapildi</p>
      )}

      {/* Results */}
      <div className="space-y-3">
        {results.map((user, index) => (
          <div
            key={user.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center hover:shadow-md hover:border-blue-100 transition-all duration-300 group"
          >
            <Link to={`/profile/${user.id}`} className="w-14 h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-md shadow-blue-100 group-hover:shadow-blue-200 transition-shadow">
              {user.full_name?.charAt(0)}
            </Link>
            <div className="ml-4 flex-1 min-w-0">
              <Link to={`/profile/${user.id}`} className="font-semibold text-gray-900 text-[15px] hover:text-blue-600 transition">{user.full_name}</Link>
              <p className="text-sm text-gray-400 mt-0.5">
                {user.major} {user.course && `· Kurs ${user.course}`}
              </p>
              {user.skills && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {user.skills.split(",").slice(0, 4).map((s, i) => (
                    <span key={i} className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-semibold border border-blue-100">
                      {s.trim()}
                    </span>
                  ))}
                  {user.skills.split(",").length > 4 && (
                    <span className="bg-gray-50 text-gray-400 px-2.5 py-1 rounded-lg text-xs font-medium">
                      +{user.skills.split(",").length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => sendConnection(user.id)}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 p-3 rounded-xl hover:shadow-md hover:shadow-blue-100 transition-all duration-200 shrink-0 ml-3 border border-blue-100"
              title="Baglanti isteyi gonder"
            >
              <UserPlus size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {searched && results.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Users size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">Netice tapilmadi</p>
          <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">Bashqa acar sozle yoxlayin ve ya bacariq filtrini deyishin</p>
        </div>
      )}
    </div>
  );
}
