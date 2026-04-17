import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Send, Pin, Sparkles, TrendingUp, Image as ImageIcon, Film, X } from "lucide-react";
import api from "../api/client";
import { formatBakuDate, formatBakuHM } from "../utils/time";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
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

  const handleMediaPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.resource_type === "video") {
        setVideoUrl(res.data.url);
        setImageUrl("");
      } else {
        setImageUrl(res.data.url);
        setVideoUrl("");
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Fayl yüklənmədi");
    }
    setUploading(false);
    e.target.value = "";
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && !imageUrl && !videoUrl) return;
    setPosting(true);
    try {
      await api.post("/posts", {
        content: newPost.trim() || "",
        image_url: imageUrl || null,
        video_url: videoUrl || null,
      });
      setNewPost("");
      setImageUrl("");
      setVideoUrl("");
      loadFeed();
    } catch (err) {
      alert(err.response?.data?.detail || "Post yaradılmadı");
    }
    setPosting(false);
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`);
      loadFeed();
    } catch (err) {}
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {user && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Salam, {user.full_name?.split(" ")[0]}
          </h1>
          <p className="text-gray-400 text-sm mt-1">Bugün nə paylasmaq isteyirsen?</p>
        </div>
      )}

      {/* Yeni post */}
      <form onSubmit={handlePost} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg shadow-blue-200">
            {user?.full_name?.charAt(0) || "?"}
          </div>
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Fikrin, layihen ve ya tecruben haqqinda yaz..."
              className="w-full p-3 border-0 resize-none focus:outline-none text-gray-700 placeholder-gray-300 text-[15px] leading-relaxed"
              rows={3}
            />

            {imageUrl && (
              <div className="relative mt-2 rounded-xl overflow-hidden border border-gray-100">
                <img src={imageUrl} alt="preview" className="w-full max-h-96 object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition"
                  title="Şəkli sil"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {videoUrl && (
              <div className="relative mt-2 rounded-xl overflow-hidden border border-gray-100">
                <video src={videoUrl} controls className="w-full max-h-96" />
                <button
                  type="button"
                  onClick={() => setVideoUrl("")}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition"
                  title="Videonu sil"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <label className="flex items-center gap-2 text-sm text-blue-600 font-medium cursor-pointer hover:bg-blue-50 px-3 py-2 rounded-xl transition">
              <ImageIcon size={16} />
              Şəkil
              <input
                type="file"
                accept="image/*"
                onChange={handleMediaPick}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-blue-600 font-medium cursor-pointer hover:bg-blue-50 px-3 py-2 rounded-xl transition">
              <Film size={16} />
              Video
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleMediaPick}
                disabled={uploading}
                className="hidden"
              />
            </label>
            {uploading && <span className="text-xs text-gray-400 ml-2">Yüklənir...</span>}
          </div>
          <button
            type="submit"
            disabled={(!newPost.trim() && !imageUrl && !videoUrl) || posting || uploading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none text-sm"
          >
            <Send size={15} />
            {posting ? "Paylaşılır..." : "Paylas"}
          </button>
        </div>
      </form>

      {/* Postlar */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all duration-300 group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center mb-4">
              <Link
                to={`/profile/${post.author_id}`}
                className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-100 group-hover:shadow-blue-200 transition-shadow"
              >
                {post.author_name?.charAt(0)}
              </Link>
              <div className="ml-3.5">
                <Link to={`/profile/${post.author_id}`} className="font-semibold text-gray-900 text-[15px] hover:text-blue-600 transition">
                  {post.author_name}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">{formatBakuDate(post.created_at)} · {formatBakuHM(post.created_at)}</p>
              </div>
              {post.is_pinned && (
                <span className="ml-auto flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 text-xs px-3.5 py-1.5 rounded-full font-semibold border border-amber-100">
                  <Pin size={12} /> Sabitlenmis
                </span>
              )}
            </div>

            {post.content && (
              <p className="text-gray-700 leading-relaxed mb-4 text-[15px] whitespace-pre-wrap">{post.content}</p>
            )}

            {post.image_url && (
              <div className="mb-4 rounded-xl overflow-hidden border border-gray-100">
                <img src={post.image_url} alt="post" className="w-full max-h-[500px] object-cover" />
              </div>
            )}

            {post.video_url && (
              <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 bg-black">
                <video src={post.video_url} controls className="w-full max-h-[500px]" />
              </div>
            )}

            <div className="flex items-center gap-1 pt-3 border-t border-gray-50">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  post.is_liked
                    ? "text-red-500 bg-red-50"
                    : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                }`}
              >
                <Heart size={18} fill={post.is_liked ? "currentColor" : "none"} className={post.is_liked ? "scale-110" : ""} />
                <span>{post.like_count}</span>
              </button>
              <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-400">
                <MessageCircle size={18} />
                <span>{post.comment_count}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <TrendingUp size={32} className="text-blue-400" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">Hele post yoxdur</p>
          <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">Ilk postu sen yaz ve sebekeni canlandir!</p>
        </div>
      )}
    </div>
  );
}
