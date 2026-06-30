import { useState, useEffect, FormEvent } from "react";
import { ZODIAC_SIGNS } from "../zodiacData";
import { Post, Comment, ZodiacSign } from "../types";
import { MessageSquare, Heart, Send, Plus, Loader2, RefreshCw, Sparkles, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ZodiacSocial() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("全部");
  const [error, setError] = useState("");
  
  // New Post Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newAuthorName, setNewAuthorName] = useState("");
  const [newAuthorSign, setNewAuthorSign] = useState<ZodiacSign | null>(null);
  const [newCategory, setNewCategory] = useState("感情困惑");
  const [submittingPost, setSubmittingPost] = useState(false);

  // New Comment state
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentSign, setCommentSign] = useState<ZodiacSign | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  const categories = ["全部", "感情困惑", "星象討論", "配對閃文", "生活雜談"];

  useEffect(() => {
    fetchPosts();
    // Auto refresh every 10 seconds to catch simulated community replies
    const interval = setInterval(fetchPosts, 10000);
    return () => clearInterval(interval);
  }, []);

  // Save/Load nickname & sign from localStorage for smooth user experience
  useEffect(() => {
    const savedName = localStorage.getItem("zodiac_user_name");
    const savedSignName = localStorage.getItem("zodiac_user_sign");
    if (savedName) {
      setNewAuthorName(savedName);
      setCommentAuthor(savedName);
    }
    if (savedSignName) {
      const matched = ZODIAC_SIGNS.find(s => s.name === savedSignName);
      if (matched) {
        setNewAuthorSign(matched);
        setCommentSign(matched);
      }
    }
  }, []);

  const saveUserInfo = (name: string, signName: string) => {
    localStorage.setItem("zodiac_user_name", name);
    localStorage.setItem("zodiac_user_sign", signName);
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      } else {
        setError("無法載入星象討論看板");
      }
    } catch (err) {
      console.error(err);
      setError("網路連線失敗，請檢查連線。");
    }
  };

  const handleCreatePost = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !newAuthorName.trim() || !newAuthorSign) {
      alert("請完整填寫所有欄位");
      return;
    }

    setSubmittingPost(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          authorName: newAuthorName.trim(),
          authorSign: newAuthorSign.name,
          category: newCategory
        })
      });

      if (res.ok) {
        saveUserInfo(newAuthorName.trim(), newAuthorSign.name);
        setNewTitle("");
        setNewContent("");
        setShowCreateModal(false);
        // Instant refresh
        await fetchPosts();
        alert("🎉 發表貼文成功！神祕的星空網友們正在閱讀並可能隨時留言回應喔，請等候幾秒並重新整理！");
      } else {
        alert("發表失敗，請再試一次。");
      }
    } catch (err) {
      console.error(err);
      alert("發生網路錯誤，請稍後再試。");
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (res.ok) {
        // Optimistic UI update
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: FormEvent, postId: string) => {
    e.preventDefault();
    if (!commentContent.trim() || !commentAuthor.trim() || !commentSign) {
      alert("請完整填寫留言欄位與選擇星座");
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: commentAuthor.trim(),
          authorSign: commentSign.name,
          content: commentContent.trim()
        })
      });

      if (res.ok) {
        saveUserInfo(commentAuthor.trim(), commentSign.name);
        setCommentContent("");
        // Refresh
        await fetchPosts();
      } else {
        alert("留言失敗，請稍後再試。");
      }
    } catch (err) {
      console.error(err);
      alert("網路連線錯誤。");
    } finally {
      setSubmittingComment(false);
    }
  };

  const filteredPosts = activeCategory === "全部" 
    ? posts 
    : posts.filter(p => p.category === activeCategory);

  return (
    <div className="py-2" id="zodiac-social-root">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            🌌 星象社群互動廣場
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            在這裡與各路星友分享你的人生際遇、情感故事、或吐嘈星盤運勢。AI 星友亦會常駐交流喔！
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setLoading(true);
              fetchPosts().finally(() => setLoading(false));
            }}
            className="p-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="重新整理討論串"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              // Ensure we prefill current commenter defaults if exists
              if (commentAuthor && !newAuthorName) setNewAuthorName(commentAuthor);
              if (commentSign && !newAuthorSign) setNewAuthorSign(commentSign);
              setShowCreateModal(true);
            }}
            className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
            id="btn-create-post-trigger"
          >
            <Plus className="w-4 h-4" /> 發表星友貼文
          </button>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-2 px-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            onClick={() => setActiveCategory(cat)}
            key={cat}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === cat
                ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-sm"
                : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Threads list */}
      <div className="space-y-6" id="threads-container">
        {filteredPosts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-16 text-center text-slate-500">
            <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-sm">這個分類目前還沒有星友發文，快來搶沙發吧！</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isCommenting = commentingPostId === post.id;
            const signData = ZODIAC_SIGNS.find(s => s.name === post.authorSign);

            return (
              <motion.div
                layout
                key={post.id}
                id={`post-card-${post.id}`}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-slate-200 dark:hover:border-slate-700/80 transition-all"
              >
                {/* Post Author info line */}
                <div className="flex items-center justify-between gap-4 mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-xs font-bold font-mono">
                      {signData?.symbol || "⭐"}
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {post.authorName}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500">·</span>
                    <span className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-medium scale-95">
                      {post.authorSign}
                    </span>
                  </div>

                  <span className="text-slate-400 dark:text-slate-500">
                    {new Date(post.createdAt).toLocaleDateString("zh-TW", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>

                {/* Post Title & Category */}
                <div className="mb-2 flex items-center gap-2">
                  <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100/35 dark:border-indigo-900/10">
                    {post.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-850 dark:text-slate-100">
                    {post.title}
                  </h3>
                </div>

                {/* Content body */}
                <p className="text-slate-650 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line mb-4">
                  {post.content}
                </p>

                {/* Footer Controls */}
                <div className="flex items-center gap-6 border-t border-slate-100 dark:border-slate-800/60 pt-3 text-xs text-slate-500">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className="flex items-center gap-1.5 hover:text-red-500 transition-colors group cursor-pointer"
                  >
                    <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>按讚 ({post.likes})</span>
                  </button>

                  <button
                    onClick={() => {
                      setCommentingPostId(isCommenting ? null : post.id);
                    }}
                    className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>留言交流 ({post.comments.length})</span>
                  </button>
                </div>

                {/* Comment Section Panel */}
                {isCommenting && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-4 bg-slate-50/50 dark:bg-slate-950/10 p-4 rounded-xl">
                    {/* Existing Comments */}
                    {post.comments.length > 0 && (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {post.comments.map((comm) => {
                          const commSign = ZODIAC_SIGNS.find(s => s.name === comm.authorSign);
                          const isAICorrespondence = comm.id.includes("ai");
                          
                          return (
                            <div
                              key={comm.id}
                              className={`text-xs p-3 rounded-xl border ${
                                isAICorrespondence
                                  ? "bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-100/30 dark:border-indigo-900/10"
                                  : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-850"
                              }`}
                            >
                              <div className="flex justify-between gap-2 mb-1.5 text-slate-400">
                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-slate-700 dark:text-slate-300">
                                    {comm.authorName}
                                  </span>
                                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded font-medium text-slate-500">
                                    {comm.authorSign}
                                  </span>
                                  {isAICorrespondence && (
                                    <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded-full font-bold flex items-center gap-0.5 scale-90">
                                      <Sparkles className="w-2.5 h-2.5" /> AI 星友
                                    </span>
                                  )}
                                </div>
                                <span>
                                  {new Date(comm.createdAt).toLocaleDateString("zh-TW", {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              </div>
                              <p className="text-slate-650 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-line">
                                {comm.content}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Create Comment Form */}
                    <form onSubmit={(e) => handleAddComment(e, post.id)} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="您的暱稱"
                          value={commentAuthor}
                          onChange={(e) => {
                            setCommentAuthor(e.target.value);
                            setNewAuthorName(e.target.value); // Sync with post creator default too
                          }}
                          className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none"
                        />
                        <select
                          required
                          value={commentSign?.name || ""}
                          onChange={(e) => {
                            const matched = ZODIAC_SIGNS.find(s => s.name === e.target.value);
                            if (matched) {
                              setCommentSign(matched);
                              setNewAuthorSign(matched);
                            }
                          }}
                          className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
                        >
                          <option value="">選擇您的星座</option>
                          {ZODIAC_SIGNS.map(s => (
                            <option key={s.name} value={s.name}>{s.symbol} {s.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <textarea
                          rows={2}
                          required
                          placeholder="輸入您的留言看法..."
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                        />
                        <button
                          type="submit"
                          disabled={submittingComment}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                        >
                          {submittingComment ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* CREATE POST MODAL DIALOG */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  🌌 發起新星象討論
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  傾訴感情疑惑、配對經歷、或對近期星座運勢的看法。
                </p>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">
                      您的暱稱
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="例如：迷茫的天蠍"
                      value={newAuthorName}
                      onChange={(e) => setNewAuthorName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">
                      您的星座
                    </label>
                    <select
                      required
                      value={newAuthorSign?.name || ""}
                      onChange={(e) => {
                        const matched = ZODIAC_SIGNS.find(s => s.name === e.target.value);
                        if (matched) setNewAuthorSign(matched);
                      }}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">請選擇</option>
                      {ZODIAC_SIGNS.map(s => (
                        <option key={s.name} value={s.name}>{s.symbol} {s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">
                      看板分類
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                      {categories.slice(1).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">
                      貼文標題
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="例如：雙魚跟處女座真的適合嗎？"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">
                    討論內容
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="請分享您的具體相處經驗或遇到的占星困惑，大家會真誠回覆你..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPost}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                  >
                    {submittingPost ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> 發表
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
