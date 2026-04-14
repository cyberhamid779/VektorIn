import { useState, useEffect } from "react";
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
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Bağlantılar</h2>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("my")}
          className={`px-4 py-2 rounded-lg font-semibold ${tab === "my" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          Bağlantılarım ({connections.length})
        </button>
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-2 rounded-lg font-semibold ${tab === "pending" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          Gözləyən ({pending.length})
        </button>
      </div>

      {tab === "my" && connections.map((c) => (
        <div key={c.id} className="bg-white rounded-xl shadow p-4 mb-3 flex items-center">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {c.full_name?.charAt(0)}
          </div>
          <div className="ml-3 flex-1">
            <p className="font-semibold text-gray-800">{c.full_name}</p>
            <p className="text-sm text-gray-500">{c.major}</p>
          </div>
        </div>
      ))}

      {tab === "pending" && pending.map((p) => (
        <div key={p.id} className="bg-white rounded-xl shadow p-4 mb-3 flex items-center">
          <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
            {p.sender_name?.charAt(0)}
          </div>
          <div className="ml-3 flex-1">
            <p className="font-semibold text-gray-800">{p.sender_name}</p>
            <p className="text-sm text-gray-500">{p.sender_major}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAccept(p.id)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
            >
              Qəbul
            </button>
            <button
              onClick={() => handleReject(p.id)}
              className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-200"
            >
              Rədd
            </button>
          </div>
        </div>
      ))}

      {tab === "my" && connections.length === 0 && (
        <p className="text-center text-gray-500 mt-6">Hələ bağlantınız yoxdur</p>
      )}
      {tab === "pending" && pending.length === 0 && (
        <p className="text-center text-gray-500 mt-6">Gözləyən istək yoxdur</p>
      )}
    </div>
  );
}
