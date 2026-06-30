import { useState, useRef, useEffect } from "react";
import { ASTROLOGERS } from "../zodiacData";
import { Astrologer } from "../types";
import { MessageSquare, Send, Sparkles, Loader2, RefreshCw, AlertCircle, Trash2, ShieldCheck, Compass } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export default function ZodiacConsultation() {
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer>(ASTROLOGERS[0]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize/Load chat histories from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("zodiac_consultation_chats");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved chats", e);
      }
    }
  }, []);

  // Save chat histories when messages update
  const saveChats = (updated: Record<string, ChatMessage[]>) => {
    localStorage.setItem("zodiac_consultation_chats", JSON.stringify(updated));
  };

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedAstrologer, loading]);

  const currentChats = messages[selectedAstrologer.id] || [];

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputMessage).trim();
    if (!messageContent) return;

    if (!textToSend) {
      setInputMessage("");
    }
    setError("");
    setLoading(true);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageContent,
      timestamp: new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedChats = [...currentChats, userMessage];
    const newMessagesState = {
      ...messages,
      [selectedAstrologer.id]: updatedChats
    };
    setMessages(newMessagesState);
    saveChats(newMessagesState);

    try {
      // Map message history to simple structure required by backend
      const historyPayload = currentChats.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/gemini/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          astrologerId: selectedAstrologer.id,
          message: messageContent,
          history: historyPayload
        })
      });

      const data = await res.json();
      if (res.ok) {
        const modelMessage: ChatMessage = {
          id: `model-${Date.now()}`,
          role: "model",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" }),
        };
        const finalChats = [...updatedChats, modelMessage];
        const finalMessagesState = {
          ...messages,
          [selectedAstrologer.id]: finalChats
        };
        setMessages(finalMessagesState);
        saveChats(finalMessagesState);
      } else {
        setError(data.error || "大師正在冥想，無法立即回覆。");
      }
    } catch (err) {
      console.error(err);
      setError("連線大師的星能量中斷，請重試。");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm(`確定要清除與「${selectedAstrologer.name}」的對話紀錄嗎？`)) {
      const newMessagesState = {
        ...messages,
        [selectedAstrologer.id]: []
      };
      setMessages(newMessagesState);
      saveChats(newMessagesState);
    }
  };

  const suggestionQuestions = [
    "今年在事業、金錢上有什麼合適的轉機？",
    "我想了解我今年桃花運走勢，該如何把握？",
    "最近感覺壓力好大、迷茫，有什麼靈性心靈建議？",
    "我的守護星與近期星象（如水逆、金逆）會對我造成什麼影響？"
  ];

  return (
    <div className="py-2" id="zodiac-consultation-root">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch min-h-[580px]">
        
        {/* Left Column: Astrologer selector list */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                🔮 預約線上命理大師
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                選擇一位與您頻率契合的資深命理師，開啟一對一隱私占星能量解碼。
              </p>
            </div>

            <div className="space-y-3" id="astrologers-list">
              {ASTROLOGERS.map((ast) => {
                const isSelected = selectedAstrologer.id === ast.id;
                return (
                  <button
                    onClick={() => {
                      setSelectedAstrologer(ast);
                      setError("");
                    }}
                    key={ast.id}
                    id={`btn-astrologer-${ast.id}`}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex gap-3 items-center cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/40"
                        : "bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={ast.avatar}
                      alt={ast.name}
                      className="w-10 h-10 rounded-full object-cover shadow-sm bg-slate-100 shrink-0 border border-slate-200/40"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                        {ast.name}
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block"></span>
                        )}
                      </h4>
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold truncate mt-0.5">
                        {ast.specialty}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expert profile description box */}
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-inner space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                大師道行與簡介
              </span>
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-250">
                {selectedAstrologer.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {selectedAstrologer.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800 text-[10px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>本諮詢由 Google AI 雙向加密保護，隱私不外洩。</span>
            </div>
          </div>
        </div>

        {/* Right Column: Chat window */}
        <div className="lg:col-span-8 flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden h-[580px]">
          {/* Chat Window Header */}
          <div className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={selectedAstrologer.avatar}
                alt={selectedAstrologer.name}
                className="w-9 h-9 rounded-full object-cover bg-slate-100 border border-slate-200/40"
              />
              <div>
                <h3 className="text-xs font-bold text-slate-850 dark:text-slate-100">
                  與「{selectedAstrologer.name}」對談中
                </h3>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                  ● 占曜大師在線 · 即時感應解答中
                </span>
              </div>
            </div>

            {currentChats.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer"
                title="清除對話紀錄"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {/* Master Greeting */}
            <div className="flex gap-3 max-w-[85%]">
              <img
                src={selectedAstrologer.avatar}
                alt={selectedAstrologer.name}
                className="w-7 h-7 rounded-full object-cover bg-slate-100 self-start"
              />
              <div className="bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-150 rounded-2xl rounded-tl-none p-3.5 text-xs leading-relaxed">
                <p>{selectedAstrologer.greeting}</p>
              </div>
            </div>

            {currentChats.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                {msg.role === "model" && (
                  <img
                    src={selectedAstrologer.avatar}
                    alt={selectedAstrologer.name}
                    className="w-7 h-7 rounded-full object-cover bg-slate-100 self-start"
                  />
                )}
                <div
                  className={`rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-150 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span
                    className={`text-[9px] block text-right mt-1 opacity-60 ${
                      msg.role === "user" ? "text-indigo-100" : "text-slate-400"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 max-w-[85%] items-center" id="master-loading-indicator">
                <img
                  src={selectedAstrologer.avatar}
                  alt={selectedAstrologer.name}
                  className="w-7 h-7 rounded-full object-cover bg-slate-100 self-start"
                />
                <div className="bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl rounded-tl-none p-3 text-xs flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  大師正在感應星象，書寫玄機中...
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 rounded-xl text-red-600 text-xs flex items-center gap-2 max-w-md mx-auto justify-center">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions questions bar */}
          {currentChats.length === 0 && (
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/10 border-t border-slate-150/50 dark:border-slate-800/60 overflow-x-auto no-scrollbar whitespace-nowrap space-x-2">
              {suggestionQuestions.map((q, i) => (
                <button
                  onClick={() => handleSendMessage(q)}
                  key={i}
                  className="inline-block bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-350 cursor-pointer transition-colors"
                >
                  💬 {q}
                </button>
              ))}
            </div>
          )}

          {/* Chat Form Area */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                disabled={loading}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`向${selectedAstrologer.name}大師提問關於星座、流年或感情事...`}
                className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white px-4 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
