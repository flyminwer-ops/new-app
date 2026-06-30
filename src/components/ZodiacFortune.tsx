import { useState, useEffect, FormEvent } from "react";
import { ZODIAC_SIGNS } from "../zodiacData";
import { ZodiacSign, DailyFortune } from "../types";
import { Sparkles, Calendar, Loader2, RefreshCw, Star, Heart, Briefcase, DollarSign, Activity, HelpCircle, Compass } from "lucide-react";
import { motion } from "motion/react";
import { AstroTextFormatter } from "./ZodiacPersonality";

export default function ZodiacFortune() {
  const [selectedSign, setSelectedSign] = useState<ZodiacSign>(ZODIAC_SIGNS[0]);
  const [fortuneType, setFortuneType] = useState<"daily" | "weekly">("daily");
  const [loading, setLoading] = useState(false);
  const [dailyData, setDailyData] = useState<DailyFortune | null>(null);
  const [weeklyText, setWeeklyText] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [dailySubscription, setDailySubscription] = useState<boolean>(false);
  const [submittingSub, setSubmittingSub] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>("");

  useEffect(() => {
    // Load local subscription preferences
    const isSubbed = localStorage.getItem(`sub_${selectedSign.name}`) === "true";
    setDailySubscription(isSubbed);
    
    // Fetch initial fortune
    fetchFortune(selectedSign, fortuneType);
  }, [selectedSign, fortuneType]);

  const fetchFortune = async (sign: ZodiacSign, type: "daily" | "weekly") => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/gemini/fortune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sign: sign.name, type })
      });
      const data = await res.json();
      if (res.ok) {
        if (type === "daily") {
          if (data.fortune) {
            setDailyData(data.fortune);
          } else if (data.rawText) {
            // Safe fallback parsing
            try {
              const cleaned = data.rawText.replace(/```json|```/g, "").trim();
              setDailyData(JSON.parse(cleaned));
            } catch (e) {
              setError("運勢解析異常，請重試");
            }
          }
        } else {
          setWeeklyText(data.analysis);
        }
      } else {
        setError(data.error || "無法取得運勢資料");
      }
    } catch (e) {
      console.error(e);
      setError("網路連線異常，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubscription = (e: FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) {
      alert("請輸入有效的電子信箱位址");
      return;
    }
    setSubmittingSub(true);
    setTimeout(() => {
      const targetState = !dailySubscription;
      setDailySubscription(targetState);
      if (targetState) {
        localStorage.setItem(`sub_${selectedSign.name}`, "true");
        alert(`🎉 訂閱成功！您已成功訂閱【${selectedSign.name}】的每日運勢推播報告。系統將於每日上午 8:00 發送至 ${emailInput}`);
      } else {
        localStorage.removeItem(`sub_${selectedSign.name}`);
        alert(`已取消【${selectedSign.name}】的每日運勢訂閱。`);
      }
      setSubmittingSub(false);
      setEmailInput("");
    }, 1200);
  };

  const handleCancelSubscription = () => {
    setDailySubscription(false);
    localStorage.removeItem(`sub_${selectedSign.name}`);
    alert(`已取消【${selectedSign.name}】的每日運勢訂閱。`);
  };

  return (
    <div className="py-2" id="zodiac-fortune-root">
      {/* Sign Selector Ribbon */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 mb-8">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-3 text-center sm:text-left">
          切換目前查看星軌
        </h3>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 scroll-smooth">
          {ZODIAC_SIGNS.map((sign) => (
            <button
              onClick={() => setSelectedSign(sign)}
              key={sign.name}
              id={`fortune-ribbon-${sign.englishName.toLowerCase()}`}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                selectedSign.name === sign.name
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300"
              }`}
            >
              <span className="text-sm">{sign.symbol}</span>
              <span>{sign.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left pane: Profile & Type Selector & Push Subscribe */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-4xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                {selectedSign.symbol}
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {selectedSign.name} 運勢預言
              </h2>
              <p className="text-xs font-mono text-slate-400 tracking-wider uppercase mt-0.5">
                {selectedSign.englishName} ({selectedSign.dateRange})
              </p>
            </div>

            <div className="mt-6 flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setFortuneType("daily")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  fortuneType === "daily"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-800"
                }`}
                id="btn-fortune-daily"
              >
                <Calendar className="w-3.5 h-3.5" /> 每日運勢
              </button>
              <button
                onClick={() => setFortuneType("weekly")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  fortuneType === "weekly"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-800"
                }`}
                id="btn-fortune-weekly"
              >
                <Compass className="w-3.5 h-3.5" /> 本週運勢
              </button>
            </div>

            <button
              onClick={() => fetchFortune(selectedSign, fortuneType)}
              disabled={loading}
              className="mt-4 w-full py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              重新感應能量軌跡
            </button>
          </div>

          {/* Daily push notification sub Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl p-6 shadow-sm">
            <div className="flex gap-3 mb-3">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  每日運勢晨光推播
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  每天清晨 8:00，將 AI 專屬客製化運勢報告寄送至您的信箱，陪伴您開啟神聖的一天。
                </p>
              </div>
            </div>

            {dailySubscription ? (
              <div className="mt-4 bg-white/80 dark:bg-slate-900/80 rounded-xl p-4 border border-indigo-100/50 dark:border-indigo-900/10 text-center">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                  🌟 已成功訂閱推播
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  【{selectedSign.name}】的每日星能量將持續守護您。
                </p>
                <button
                  onClick={handleCancelSubscription}
                  className="mt-3 text-[11px] text-red-500 hover:underline font-semibold cursor-pointer"
                >
                  取消訂閱
                </button>
              </div>
            ) : (
              <form onSubmit={handleToggleSubscription} className="mt-4 space-y-2">
                <input
                  type="email"
                  required
                  placeholder="輸入您的電子信箱"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={submittingSub}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl transition-colors shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submittingSub ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    "開啟每日運勢免費訂閱"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right pane: Fortunes details */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center shadow-sm">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">
                正調和行星引力、推演命盤進度中...
              </p>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
              <p className="text-red-500 text-sm font-semibold">{error}</p>
              <button
                onClick={() => fetchFortune(selectedSign, fortuneType)}
                className="mt-4 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                重新載入
              </button>
            </div>
          ) : fortuneType === "daily" && dailyData ? (
            <div className="space-y-6" id="daily-fortune-panel">
              {/* Overall Banner */}
              <div className="bg-gradient-to-r from-indigo-900 to-indigo-850 dark:from-slate-950 dark:to-indigo-950 rounded-2xl p-6 text-white shadow-md border border-indigo-800/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-200 tracking-widest uppercase block mb-1">
                      今日星象格言
                    </span>
                    <h3 className="text-lg font-bold tracking-wide italic">
                      「{dailyData.summary}」
                    </h3>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 text-center shrink-0">
                    <span className="block text-[10px] text-indigo-200 font-bold uppercase tracking-wider">
                      今日綜合指數
                    </span>
                    <span className="text-2xl font-black">{dailyData.overallScore}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 pt-6 border-t border-white/10 text-center">
                  <div>
                    <span className="block text-[10px] text-indigo-200 font-semibold mb-0.5">幸運色</span>
                    <span className="text-xs font-bold">{dailyData.luckyColor}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-indigo-200 font-semibold mb-0.5">幸運數</span>
                    <span className="text-xs font-bold">{dailyData.luckyNumber}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-indigo-200 font-semibold mb-0.5">幸運方位</span>
                    <span className="text-xs font-bold">{dailyData.luckyDirection}</span>
                  </div>
                </div>
              </div>

              {/* Individual Aspect Meters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "愛情運勢", score: dailyData.loveScore, icon: Heart, color: "text-rose-500 bg-rose-50 dark:bg-rose-950/20" },
                  { label: "事業工作", score: dailyData.careerScore, icon: Briefcase, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20" },
                  { label: "財運走勢", score: dailyData.wealthScore, icon: DollarSign, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" },
                  { label: "身心能量", score: dailyData.healthScore, icon: Activity, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20" },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm text-center">
                    <div className="flex justify-between items-center mb-2">
                      <div className={`p-1.5 rounded-lg ${item.color}`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                    </div>
                    <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                      {item.score}%
                    </div>
                    {/* Tiny visual progress bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.score >= 80 ? "bg-emerald-500" : item.score >= 60 ? "bg-indigo-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Core Fortunes Descriptions */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                    <span className="w-1 h-3.5 bg-indigo-600 rounded-full"></span> 綜合運勢詳解
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {dailyData.overview}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                    <span className="w-1 h-3.5 bg-rose-500 rounded-full"></span> 情感親密指引
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {dailyData.loveAdvice}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                    <span className="w-1 h-3.5 bg-blue-500 rounded-full"></span> 職場學業建議
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {dailyData.careerAdvice}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                    <span className="w-1 h-3.5 bg-emerald-500 rounded-full"></span> 財富增長契機
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {dailyData.wealthAdvice}
                  </p>
                </div>
              </div>
            </div>
          ) : fortuneType === "weekly" && weeklyText ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6" id="weekly-fortune-panel">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
                    深度運勢分析
                  </span>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                    【{selectedSign.name}】本週神聖預言
                  </h3>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto">
                  🗓️ 預測跨度：一整週 (7天)
                </div>
              </div>

              <AstroTextFormatter text={weeklyText} />
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center shadow-sm">
              <HelpCircle className="w-10 h-10 text-slate-400 mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                尚無星曜資料，請選擇一個星座並點擊「感應」
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
