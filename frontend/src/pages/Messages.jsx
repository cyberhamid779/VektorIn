import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, MessageCircle, ArrowLeft, Circle } from "lucide-react";
import api from "../api/client";
import { formatBakuHM, isActiveNow, formatLastSeen } from "../utils/time";

export default function Messages() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const messagesEndRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    const to = searchParams.get("to");
    const name = searchParams.get("name");
    if (to) {
      openChat(Number(to), name || "İstifadəçi");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChats = async () => {
    try {
      const res = await api.get("/messages");
      setChats(res.data);
    } catch (err) {}
  };

  const openChat = async (userId, fullName, lastSeen = null) => {
    setActiveChat({ userId, fullName, lastSeen });
    try {
      const res = await api.get(`/messages/${userId}`);
      setMessages(res.data);
      loadChats();
      if (!lastSeen) {
        try {
          const userRes = await api.get(`/users/${userId}`);
          setActiveChat((prev) => prev && prev.userId === userId ? { ...prev, lastSeen: userRes.data.last_seen } : prev);
        } catch (err) {}
      }
    } catch (err) {}
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeChat) return;
    try {
      await api.post(`/messages/${activeChat.userId}`, { content: newMsg });
      setNewMsg("");
      const res = await api.get(`/messages/${activeChat.userId}`);
      setMessages(res.data);
    } catch (err) {}
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mesajlar</h2>
        <p className="text-gray-400 text-sm mt-1">Baglantilarin ile sohbet et</p>
      </div>

      <div className="flex bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: "560px" }}>
        {/* Chat siyahisi */}
        <div className={`w-full md:w-80 border-r border-gray-100 overflow-y-auto ${activeChat ? "hidden md:block" : ""}`}>
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Sohbetler</h3>
          </div>
          {chats.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[calc(100%-57px)] text-gray-400 px-6">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
                <MessageCircle size={28} />
              </div>
              <p className="text-sm font-medium">Hele mesaj yoxdur</p>
              <p className="text-xs text-gray-300 mt-1 text-center">Baglantilarin ile mesajlasmaga bashla</p>
            </div>
          )}
          {chats.map((chat) => (
            <div
              key={chat.user_id}
              onClick={() => openChat(chat.user_id, chat.full_name, chat.last_seen)}
              className={`p-4 cursor-pointer border-b border-gray-50 transition-all duration-200 ${
                activeChat?.userId === chat.user_id
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-2 border-l-blue-500"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-md ${
                  activeChat?.userId === chat.user_id
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-200"
                    : "bg-gradient-to-br from-blue-500 to-indigo-500 shadow-blue-100"
                }`}>
                  {chat.full_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 text-sm">{chat.full_name}</p>
                    {chat.unread_count > 0 && (
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm shadow-blue-200">
                        {chat.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-1">{chat.last_message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mesaj sahesi */}
        <div className={`flex-1 flex flex-col ${!activeChat ? "hidden md:flex" : ""}`}>
          {activeChat ? (
            <>
              <div className="px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm flex items-center gap-3">
                <button
                  onClick={() => setActiveChat(null)}
                  className="md:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 transition text-gray-500"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-100">
                  {activeChat.fullName?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{activeChat.fullName}</p>
                  {(() => {
                    const active = isActiveNow(activeChat.lastSeen);
                    return (
                      <div className="flex items-center gap-1.5">
                        <Circle size={8} fill={active ? "#22c55e" : "#9ca3af"} className={active ? "text-green-500" : "text-gray-400"} />
                        <p className={`text-xs font-medium ${active ? "text-green-500" : "text-gray-400"}`}>
                          {active ? "Aktiv" : formatLastSeen(activeChat.lastSeen)}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gradient-to-b from-gray-50 to-white">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.is_mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-3 ${
                        msg.is_mine
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-md shadow-md shadow-blue-100"
                          : "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-md shadow-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-[11px] mt-1.5 ${msg.is_mine ? "text-blue-200" : "text-gray-300"}`}>
                        {formatBakuHM(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 bg-white flex gap-3">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Mesaj yaz..."
                  className="flex-1 px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMsg.trim()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-2xl hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 disabled:opacity-30 disabled:shadow-none"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 px-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl flex items-center justify-center mb-5 shadow-sm">
                <MessageCircle size={32} className="text-blue-400" />
              </div>
              <p className="font-semibold text-gray-700 text-lg">Sohbet secin</p>
              <p className="text-sm mt-2 text-gray-400 text-center max-w-xs">Soldaki siyahidan bir sohbet secerek mesajlasmaga bashlayin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
