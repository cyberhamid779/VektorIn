import { useState, useEffect } from "react";
import { Check, X, Users, Clock, UserCheck, Sparkles } from "lucide-react";
import api from "../api/client";

export default function Connections() {
  const [connections, setConnections] = useState([]);
  const [pending, setPending] = useState([]);
  const [tab, setTab] = useState("my");

  useEffect(() => {
    loadConnections();
    loadPending();
  }, []);

  const loadConnections = async () => {
    try {
      const res = await api.get("/connections/my");
      setConnections(res.data);
    } catch (err) {}
  };

  const loadPending = async () => {
    try {
      const res = await api.get("/connections/pending");
      setPending(res.data);
    } catch (err) {}
  };

  const handleAccept = async (id) => {
    try {
      await api.put(`/connections/${id}/accept`);
      loadPending();
      loadConnections();
    } catch (err) {}
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/connections/${id}/reject`);
      loadPending();
    } catch (err) {}
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Baglantilarin</h2>
        <p className="text-gray-400 text-sm mt-1">Professional sebekeni idar et</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-2xl">
        <button
          onClick={() => setTab("my")}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
            tab === "my"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <UserCheck size={17} /> Baglantilarin ({connections.length})
        </button>
        <button
          onClick={() => setTab("pending")}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
            tab === "pending"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Clock size={17} /> Gozleyen ({pending.length})
          {pending.length > 0 && (
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>

      {/* Connections list */}
      <div className="space-y-3">
        {tab === "my" && connections.map((c, index) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center hover:shadow-md hover:border-blue-100 transition-all duration-300 group"
          >
            <div className="w-13 h-13 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md shadow-blue-100 group-hover:shadow-blue-200 transition-shadow" style={{ width: '52px', height: '52px' }}>
              {c.full_name?.charAt(0)}
            </div>
            <div className="ml-4 flex-1">
              <p className="font-semibold text-gray-900">{c.full_name}</p>
              <p className="text-sm text-gray-400 mt-0.5">{c.major}</p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-green-500 font-medium bg-green-50 px-3 py-1 rounded-full">Bagli</span>
            </div>
          </div>
        ))}

        {tab === "pending" && pending.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center hover:shadow-md transition-all duration-300 group"
          >
            <div className="w-13 h-13 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md shadow-orange-100" style={{ width: '52px', height: '52px' }}>
              {p.sender_name?.charAt(0)}
            </div>
            <div className="ml-4 flex-1">
              <p className="font-semibold text-gray-900">{p.sender_name}</p>
              <p className="text-sm text-gray-400 mt-0.5">{p.sender_major}</p>
            </div>
            <div className="flex gap-2 shrink-0 ml-3">
              <button
                onClick={() => handleAccept(p.id)}
                className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 p-3 rounded-xl hover:shadow-md hover:shadow-green-100 transition-all duration-200 border border-green-100"
                title="Qebul et"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => handleReject(p.id)}
                className="bg-red-50 text-red-400 p-3 rounded-xl hover:bg-red-100 hover:text-red-500 transition-all duration-200 border border-red-100"
                title="Redd et"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty states */}
      {tab === "my" && connections.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Users size={32} className="text-blue-400" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">Hele baglantiniz yoxdur</p>
          <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">Telebe axtarishindan birini tapin ve baglanti isteyi gonderin</p>
        </div>
      )}
      {tab === "pending" && pending.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Clock size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">Gozleyen istek yoxdur</p>
          <p className="text-gray-400 text-sm mt-2">Butun istekler cavablandirilmishdir</p>
        </div>
      )}
    </div>
  );
}
