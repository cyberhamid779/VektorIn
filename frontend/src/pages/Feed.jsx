import { useState, useEffect } from "react";
import api from "../api/client";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadFeed();
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const res = await api.get("/users/me");
      setUser(res.data);
    } catch (err) {}
  };

  const loadFeed = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data);
    } catch (err) {}
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    try {
      await api.post("/posts", { content: newPost });
      setNewPost("");
      loadFeed();
    } catch (err) {}
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`);
      loadFeed();
    } catch (err) {}
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Yeni post */}
      <form onSubmit={handlePost} className="bg-white rounded-xl shadow p-4 mb-6">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Nə düşünürsən?"
          className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Paylaş
          </button>
        </div>
      </form>

      {/* Postlar */}
      {posts.map((post) => (
        <div key={post.id} className="bg-white rounded-xl shadow p-4 mb-4">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {post.author_name?.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="font-semibold text-gray-800">{post.author_name}</p>
              <p className="text-sm text-gray-500">{post.created_at?.slice(0, 16)}</p>
            </div>
            {post.is_pinned && (
              <span className="ml-auto bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">Pin</span>
            )}
          </div>
          <p className="text-gray-700 mb-3">{post.content}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <button
              onClick={() => handleLike(post.id)}
              className={`flex items-center gap-1 hover:text-blue-600 ${post.is_liked ? "text-blue-600 font-semibold" : ""}`}
            >
              {post.is_liked ? "Bəyəndin" : "Bəyən"} ({post.like_count})
            </button>
            <span>Şərh ({post.comment_count})</span>
          </div>
        </div>
      ))}

      {posts.length === 0 && (
        <p className="text-center text-gray-500 mt-10">Hələ post yoxdur. İlk postu sən yaz!</p>
      )}
    </div>
  );
}
