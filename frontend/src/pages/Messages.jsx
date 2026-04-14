import { useState, useEffect } from "react";
import api from "../api/client";

export default function Messages() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const res = await api.get("/messages");
      setChats(res.data);
    } catch (err) {}
  };

  const openChat = async (userId, fullName) => {
    setActiveChat({ userId, fullName });
    try {
      const res = await api.get(`/messages/${userId}`);
      setMessages(res.data);
      loadChats();
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
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Mesajlar</h2>

      <div className="flex bg-white rounded-xl shadow overflow-hidden" style={{ height: "500px" }}>
        {/* Chat siyahısı */}
        <div className="w-1/3 border-r overflow-y-auto">
          {chats.length === 0 && (
            <p className="text-center text-gray-500 mt-10 text-sm">Hələ mesaj yoxdur</p>
          )}
          {chats.map((chat) => (
            <div
              key={chat.user_id}
              onClick={() => openChat(chat.user_id, chat.full_name)}
              className={`p-4 cursor-pointer hover:bg-gray-50 border-b ${
                activeChat?.userId === chat.user_id ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {chat.full_name?.charAt(0)}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{chat.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">{chat.last_message}</p>
                </div>
                {chat.unread_count > 0 && (
                  <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {chat.unread_count}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mesaj sahəsi */}
        <div className="flex-1 flex flex-col">
          {activeChat ? (
            <>
              <div className="p-4 border-b bg-gray-50">
                <p className="font-semibold text-gray-800">{activeChat.fullName}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.is_mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl ${
                        msg.is_mine
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.is_mine ? "text-blue-200" : "text-gray-500"}`}>
                        {msg.created_at?.slice(11, 16)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Mesaj yaz..."
                  className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Göndər
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Söhbət seçin
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
