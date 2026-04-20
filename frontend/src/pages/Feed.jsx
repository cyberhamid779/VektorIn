import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, ThumbsDown, MessageCircle, Send, Pin, TrendingUp, Image as ImageIcon, Film, Flag, X, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import api from "../api/client";
import UserAvatar from "../components/UserAvatar";
import { formatBakuDate, formatBakuHM } from "../utils/time";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [showDislikes, setShowDislikes] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [user, setUser] = useState(null);
  const [reportPostId, setReportPostId] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const [openComments, setOpenComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});

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
        show_dislikes: showDislikes,
      });
      setNewPost("");
      setImageUrl("");
      setVideoUrl("");
      setShowDislikes(true);
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

  const handleDislike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/dislike`);
      loadFeed();
    } catch (err) {}
  };

  const handleDelete = async (postId) => {
    if (!confirm("Bu postu silmək istədiyinə əminsən?")) return;
    try {
      await api.delete(`/posts/${postId}`);
      loadFeed();
    } catch (err) {
      alert(err.response?.data?.detail || "Post silinmədi");
    }
  };

  const toggleComments = async (postId) => {
    if (openComments[postId]) {
      setOpenComments({ ...openComments, [postId]: false });
      return;
    }
    try {
      const res = await api.get(`/posts/${postId}/comments`);
      setComments({ ...comments, [postId]: res.data });
      setOpenComments({ ...openComments, [postId]: true });
    } catch (err) {}
  };

  const submitComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    try {
      await api.post(`/posts/${postId}/comment`, { content: text });
      setCommentText({ ...commentText, [postId]: "" });
      const res = await api.get(`/posts/${postId}/comments`);
      setComments({ ...comments, [postId]: res.data });
      loadFeed();
    } catch (err) {}
  };

  const submitReport = async () => {
    if (!reportPostId) return;
    setReporting(true);
    try {
      await api.post(`/posts/${reportPostId}/report`, { reason: reportReason.trim() || null });
      setReportPostId(null);
      setReportReason("");
      alert("Şikayət göndərildi. Admin yoxlayacaq.");
    } catch (err) {
      alert(err.response?.data?.detail || "Şikayət göndərilmədi");
    }
    setReporting(false);
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
          <div className="w-12 h-12 shrink-0">
            <UserAvatar user={user} size="md" />
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
                <button type="button" onClick={() => setImageUrl("")} className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition" title="Şəkli sil">
                  <X size={16} />
                </button>
              </div>
            )}

            {videoUrl && (
              <div className="relative mt-2 rounded-xl overflow-hidden border border-gray-100">
                <video src={videoUrl} controls className="w-full max-h-96" />
                <button type="button" onClick={() => setVideoUrl("")} className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition" title="Videonu sil">
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
              <input type="file" accept="image/*" onChange={handleMediaPick} disabled={uploading} className="hidden" />
            </label>
            <label className="flex items-center gap-2 text-sm text-blue-600 font-medium cursor-pointer hover:bg-blue-50 px-3 py-2 rounded-xl transition">
              <Film size={16} />
              Video
              <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleMediaPick} disabled={uploading} className="hidden" />
            </label>
            {uploading && <span className="text-xs text-gray-400 ml-2">Yüklənir...</span>}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-500" title="Dislike sayını hamıya göstər">
              <input
                type="checkbox"
                checked={showDislikes}
                onChange={(e) => setShowDislikes(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300"
              />
              <ThumbsDown size={14} /> göstər
            </label>
            <button
              type="submit"
              disabled={(!newPost.trim() && !imageUrl && !videoUrl) || posting || uploading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none text-sm"
            >
              <Send size={15} />
              {posting ? "Paylaşılır..." : "Paylas"}
            </button>
          </div>
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
              <Link to={`/profile/${post.author_id}`} className="shrink-0">
                <UserAvatar user={{ full_name: post.author_name, profile_picture: post.author_picture }} size="md" />
              </Link>
              <div className="ml-3.5 flex-1">
                <Link to={`/profile/${post.author_id}`} className="font-semibold text-gray-900 text-[15px] hover:text-blue-600 transition">
                  {post.author_name}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">{formatBakuDate(post.created_at)} · {formatBakuHM(post.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                {post.is_pinned && (
                  <span className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 text-xs px-3.5 py-1.5 rounded-full font-semibold border border-amber-100">
                    <Pin size={12} /> Sabitlenmis
                  </span>
                )}
                {user && post.author_id === user.id && (
                  <button onClick={() => handleDelete(post.id)} className="text-gray-300 hover:text-red-500 transition p-1" title="Postu sil">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
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
              {/* Like */}
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

              {/* Dislike */}
              <button
                onClick={() => handleDislike(post.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  post.is_disliked
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <ThumbsDown size={18} fill={post.is_disliked ? "currentColor" : "none"} className={post.is_disliked ? "scale-110" : ""} />
                {post.show_dislikes && <span>{post.dislike_count}</span>}
              </button>

              {/* Comments */}
              <button
                onClick={() => toggleComments(post.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  openComments[post.id]
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <MessageCircle size={18} />
                <span>{post.comment_count}</span>
                {openComments[post.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {user && post.author_id !== user.id && (
                <button
                  onClick={() => setReportPostId(post.id)}
                  className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                  title="Şikayət et"
                >
                  <Flag size={14} />
                </button>
              )}
            </div>

            {/* Comment section */}
            {openComments[post.id] && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                {/* Comment input */}
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={commentText[post.id] || ""}
                    onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && submitComment(post.id)}
                    placeholder="Şərh yaz..."
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition"
                  />
                  <button
                    onClick={() => submitComment(post.id)}
                    disabled={!commentText[post.id]?.trim()}
                    className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-30"
                  >
                    <Send size={14} />
                  </button>
                </div>

                {/* Comments list */}
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {(comments[post.id] || []).length === 0 ? (
                    <p className="text-gray-300 text-sm text-center py-3">Hələ şərh yoxdur</p>
                  ) : (
                    (comments[post.id] || []).map((c) => (
                      <div key={c.id} className="flex gap-3">
                        <Link to={`/profile/${c.user_id}`} className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {c.user_name?.charAt(0)}
                        </Link>
                        <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Link to={`/profile/${c.user_id}`} className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition">{c.user_name}</Link>
                            <span className="text-xs text-gray-300">{formatBakuHM(c.created_at)}</span>
                          </div>
                          <p className="text-sm text-gray-600">{c.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Report modal */}
      {reportPostId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={() => !reporting && setReportPostId(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <Flag size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Postu şikayət et</h3>
                <p className="text-xs text-gray-400">Admin yoxladıqdan sonra tədbir görüləcək</p>
              </div>
            </div>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Səbəb (istəyə bağlı) — spam, mənasız, təhqiredici..."
              className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
              rows={3}
              maxLength={300}
            />
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => { setReportPostId(null); setReportReason(""); }}
                disabled={reporting}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-xl transition"
              >
                Ləğv et
              </button>
              <button
                onClick={submitReport}
                disabled={reporting}
                className="px-5 py-2 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition disabled:opacity-50"
              >
                {reporting ? "Göndərilir..." : "Şikayət göndər"}
              </button>
            </div>
          </div>
        </div>
      )}

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
