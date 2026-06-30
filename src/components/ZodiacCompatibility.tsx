import { useState, FormEvent } from "react";
import { ZODIAC_SIGNS } from "../zodiacData";
import { ZodiacSign, CompatibilityResult } from "../types";
import { Heart, Users, Briefcase, AlertTriangle, Sparkles, Loader2, RefreshCw, Star, Info } from "lucide-react";
import { motion } from "motion/react";

export default function ZodiacCompatibility() {
  const [signA, setSignA] = useState<ZodiacSign | null>(null);
  const [signB, setSignB] = useState<ZodiacSign | null>(null);
  const [nameA, setNameA] = useState("");
  const [nameB, setNameB] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [error, setError] = useState("");

  const handleMatch = async (e: FormEvent) => {
    e.preventDefault();
    if (!signA || !signB) {
      setError("請先選擇兩方的星座");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/gemini/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signA: signA.name,
          signB: signB.name,
          nameA: nameA.trim() || signA.name,
          nameB: nameB.trim() || signB.name,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data.compatibility);
      } else {
        setError(data.error || "無法完成配對分析，請稍後再試。");
      }
    } catch (err) {
      console.error(err);
      setError("連線伺服器異常，請檢查網路狀態後再試。");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSignA(null);
    setSignB(null);
    setNameA("");
    setNameB("");
    setResult(null);
    setError("");
  };

  return (
    <div className="py-2" id="zodiac-compatibility-root">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight" id="compat-heading">
          星盤相吸配對機制
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          輸入雙方的名稱，選擇彼此的星座，透過 AI 星體引力合盤演算，為您解碼愛情、友情與職場上的真實契合程度。
        </p>
      </div>

      {!result ? (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleMatch} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              {/* Divider Decorator */}
              <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs select-none shadow-sm">
                VS
              </div>

              {/* Side A: Left */}
              <div className="space-y-4" id="party-a-container">
                <div className="bg-indigo-50/40 dark:bg-indigo-950/10 p-4 rounded-2xl border border-indigo-100/30 dark:border-indigo-900/10">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase block mb-1">
                    PARTY A · 第一方
                  </span>
                  <input
                    type="text"
                    placeholder="請輸入名字 (選填)"
                    value={nameA}
                    onChange={(e) => setNameA(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase">
                    選擇星座
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {ZODIAC_SIGNS.map((sign) => (
                      <button
                        type="button"
                        onClick={() => setSignA(sign)}
                        key={`signA-${sign.name}`}
                        className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                          signA?.name === sign.name
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-sm font-bold scale-[1.03]"
                            : "bg-white dark:bg-slate-850 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 text-xs"
                        }`}
                      >
                        <span className="block text-lg leading-tight">{sign.symbol}</span>
                        <span className="text-[11px]">{sign.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Side B: Right */}
              <div className="space-y-4" id="party-b-container">
                <div className="bg-purple-50/40 dark:bg-purple-950/10 p-4 rounded-2xl border border-purple-100/30 dark:border-purple-900/10">
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 tracking-wider uppercase block mb-1">
                    PARTY B · 第二方
                  </span>
                  <input
                    type="text"
                    placeholder="請輸入名字 (選填)"
                    value={nameB}
                    onChange={(e) => setNameB(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase">
                    選擇星座
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {ZODIAC_SIGNS.map((sign) => (
                      <button
                        type="button"
                        onClick={() => setSignB(sign)}
                        key={`signB-${sign.name}`}
                        className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                          signB?.name === sign.name
                            ? "bg-purple-600 border-purple-600 text-white shadow-sm font-bold scale-[1.03]"
                            : "bg-white dark:bg-slate-850 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 text-xs"
                        }`}
                      >
                        <span className="block text-lg leading-tight">{sign.symbol}</span>
                        <span className="text-[11px]">{sign.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 rounded-xl text-red-600 text-xs text-center">
                {error}
              </div>
            )}

            <div className="pt-4 flex justify-center">
              <button
                type="submit"
                disabled={loading || !signA || !signB}
                className="w-full sm:w-64 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-400 text-white text-sm font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                id="btn-match-calculate"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    正在共振宇宙命盤中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                    展開星曜合盤分析
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-6" id="compatibility-results-view">
          {/* Main Compatibility Card */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-955 to-purple-900 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-indigo-900/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative">
              <div className="flex items-center gap-4">
                {/* Visual Bubble A */}
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl shadow">
                    {signA?.symbol}
                  </div>
                  <span className="text-xs font-bold block mt-1.5 opacity-80">{nameA || signA?.name}</span>
                </div>

                <div className="text-xs font-mono tracking-widest text-indigo-200">
                  ✖
                </div>

                {/* Visual Bubble B */}
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl shadow">
                    {signB?.symbol}
                  </div>
                  <span className="text-xs font-bold block mt-1.5 opacity-80">{nameB || signB?.name}</span>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <span className="text-[10px] font-bold text-indigo-200 tracking-widest uppercase block mb-1">
                  星象契合神契
                </span>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-2xl font-black text-indigo-100 text-sm">
                  🎯 {result.matchLevel}
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm sm:text-base font-medium italic border-t border-white/10 pt-5 leading-relaxed text-indigo-100/90 text-center sm:text-left">
              「{result.summary}」
            </p>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 pt-6 border-t border-white/10 text-center">
              <div>
                <span className="block text-[10px] text-indigo-200 font-bold uppercase mb-1">愛情甜蜜度</span>
                <div className="text-lg sm:text-xl font-black">{result.loveMatch}%</div>
              </div>
              <div>
                <span className="block text-[10px] text-indigo-200 font-bold uppercase mb-1">友情契合度</span>
                <div className="text-lg sm:text-xl font-black">{result.friendMatch}%</div>
              </div>
              <div>
                <span className="block text-[10px] text-indigo-200 font-bold uppercase mb-1">事業契合度</span>
                <div className="text-lg sm:text-xl font-black">{result.careerMatch}%</div>
              </div>
            </div>
          </div>

          {/* Detailed analysis tabs/sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Col details */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"><Sparkles className="w-3.5 h-3.5" /></span> 星象元素化學反應
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {result.chemistry}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"><Heart className="w-3.5 h-3.5" /></span> 情感互動解析
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {result.loveAnalysis}
                </p>
              </div>
            </div>

            {/* Right Col details */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"><Users className="w-3.5 h-3.5" /></span> 友情溝通能量
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {result.friendshipAnalysis}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"><Briefcase className="w-3.5 h-3.5" /></span> 職場與合夥調性
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {result.careerAnalysis}
                </p>
              </div>
            </div>
          </div>

          {/* Friction points & Astro advice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-50/40 dark:bg-red-950/5 border border-red-100 dark:border-red-950/20 p-6 rounded-2xl shadow-sm">
              <h4 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <span className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300"><AlertTriangle className="w-3.5 h-3.5" /></span> 潛在相處摩擦點
              </h4>
              <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
                {result.challenges}
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/10 dark:to-purple-950/10 border border-indigo-100/50 dark:border-indigo-900/30 p-6 rounded-2xl shadow-sm">
              <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <span className="p-1.5 rounded-lg bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-sm"><Sparkles className="w-3.5 h-3.5" /></span> 大師維繫關係指南
              </h4>
              <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
                {result.advice}
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              重新匹配別的星座組合
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
