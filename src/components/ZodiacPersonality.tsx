import { useState } from "react";
import { ZODIAC_SIGNS } from "../zodiacData";
import { ZodiacSign } from "../types";
import { Compass, Sparkles, AlertCircle, Heart, Briefcase, Award, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "motion/react";

// Helper to format custom Astro headers into styled sections
export function AstroTextFormatter({ text }: { text: string }) {
  if (!text) return null;

  // Split content by main sections like "【...】" or "### ..." or "1. 【...】"
  const sections = text.split(/(?=【.*?】|###\s+|[1-6]\.\s+【.*?】)/g);

  return (
    <div className="space-y-6">
      {sections.map((section, index) => {
        const trimmed = section.trim();
        if (!trimmed) return null;

        // Extract title
        const match = trimmed.match(/^(?:[1-6]\.\s*)?【(.*?)】|^###\s*(.*?)(?:\n|$)/);
        const title = match ? (match[1] || match[2]) : "";
        const body = title ? trimmed.replace(/^(?:[1-6]\.\s*)?【.*?】|^###\s*.*?(?:\n|$)/, "").trim() : trimmed;

        if (!title) {
          // Plain paragraph fallback
          return (
            <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {trimmed}
            </p>
          );
        }

        // Assign icons based on title keywords
        let Icon = Sparkles;
        let colorClasses = "border-amber-200 bg-amber-50/50 text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300";
        if (title.includes("個性") || title.includes("特徵") || title.includes("性格")) {
          Icon = Compass;
          colorClasses = "border-blue-200 bg-blue-50/50 text-blue-800 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-300";
        } else if (title.includes("陰暗") || title.includes("弱點") || title.includes("盲點")) {
          Icon = AlertCircle;
          colorClasses = "border-red-200 bg-red-50/50 text-red-800 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300";
        } else if (title.includes("愛") || title.includes("親密")) {
          Icon = Heart;
          colorClasses = "border-rose-200 bg-rose-50/50 text-rose-800 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-300";
        } else if (title.includes("事業") || title.includes("財") || title.includes("金錢")) {
          Icon = Briefcase;
          colorClasses = "border-emerald-200 bg-emerald-50/50 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-300";
        } else if (title.includes("指引") || title.includes("建議") || title.includes("成長")) {
          Icon = Award;
          colorClasses = "border-purple-200 bg-purple-50/50 text-purple-800 dark:border-purple-900/30 dark:bg-purple-950/20 dark:text-purple-300";
        }

        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
            key={index}
            className={`rounded-2xl border p-6 shadow-sm ${colorClasses}`}
            id={`astro-section-${index}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-sm">
                <Icon className="w-5 h-5 text-current" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-current">{title}</h3>
            </div>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm pl-1 space-y-2">
              {body.split("\n").map((line, lIdx) => {
                const isBullet = line.trim().startsWith("-") || line.trim().startsWith("*");
                if (isBullet) {
                  return (
                    <div key={lIdx} className="flex gap-2 pl-2">
                      <span className="text-current mt-1.5 shrink-0 block w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                      <span>{line.replace(/^[-*]\s*/, "")}</span>
                    </div>
                  );
                }
                return <p key={lIdx}>{line}</p>;
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function ZodiacPersonality() {
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSelectSign = async (sign: ZodiacSign) => {
    setSelectedSign(sign);
    setLoading(true);
    setError("");
    setAnalysis("");

    try {
      const res = await fetch("/api/gemini/personality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sign: sign.name })
      });
      const data = await res.json();
      if (res.ok) {
        setAnalysis(data.analysis);
      } else {
        setError(data.error || "無法取得分析資料");
      }
    } catch (e) {
      console.error(e);
      setError("網路連線異常，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-2" id="zodiac-personality-root">
      {!selectedSign ? (
        <div>
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight" id="main-heading">
              探索十二星座靈魂印記
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              選擇你的星座，由 AI 占星大師為你揭示不為人知的內在天賦、靈魂盲點與未來成長指引。
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" id="zodiac-grid">
            {ZODIAC_SIGNS.map((sign) => (
              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectSign(sign)}
                key={sign.name}
                id={`btn-sign-${sign.englishName.toLowerCase()}`}
                className={`text-left p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-shadow hover:shadow-md cursor-pointer flex flex-col justify-between h-44`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase font-mono">
                      {sign.englishName}
                    </span>
                    <span className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                      {sign.name}
                    </span>
                    <span className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                      {sign.dateRange}
                    </span>
                  </div>
                  <span className="text-4xl leading-none select-none filter drop-shadow-sm opacity-90">
                    {sign.symbol}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex gap-1.5 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      sign.element === "火象" ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400" :
                      sign.element === "土象" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" :
                      sign.element === "風象" ? "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/30 dark:text-cyan-400" :
                      "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                    }`}>
                      {sign.element}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      🌌 {sign.rulingPlanet}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-2 overflow-hidden max-h-5 items-center">
                    {sign.keyTraits.slice(0, 3).map((trait) => (
                      <span key={trait} className="text-[9px] text-slate-400 dark:text-slate-500">
                        #{trait}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div id="zodiac-analysis-details">
          {/* Header Bar */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setSelectedSign(null)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-sm cursor-pointer"
              id="back-to-signs"
            >
              <ArrowLeft className="w-4 h-4" /> 返回星座列表
            </button>
          </div>

          {/* Sign Intro Card */}
          <div className={`p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 ${selectedSign.bgGradient} mb-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6`}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-5xl shrink-0">
                {selectedSign.symbol}
              </div>
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{selectedSign.name}</h2>
                  <span className="text-sm font-mono text-slate-400 tracking-wider uppercase font-medium">{selectedSign.englishName}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">生日範圍：{selectedSign.dateRange} | 守護主星：{selectedSign.rulingPlanet}</p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    selectedSign.element === "火象" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" :
                    selectedSign.element === "土象" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" :
                    selectedSign.element === "風象" ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300" :
                    "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  }`}>
                    {selectedSign.element}氣能量
                  </span>
                  {selectedSign.keyTraits.map((trait) => (
                    <span key={trait} className="text-xs px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm px-3 py-1.5 rounded-2xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/20">
                <Sparkles className="w-3.5 h-3.5" /> AI 大師星盤定位
              </div>
            </div>
          </div>

          {/* Analysis Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4" id="analysis-loading">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">
                正在調度靈魂星軌，請稍候...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12 px-6 rounded-2xl border border-red-100 dark:border-red-950/20 bg-red-50/50 dark:bg-red-950/5 text-red-600 max-w-lg mx-auto" id="analysis-error">
              <AlertCircle className="w-8 h-8 mx-auto mb-3" />
              <p>{error}</p>
              <button
                onClick={() => handleSelectSign(selectedSign)}
                className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-xl font-semibold hover:bg-red-700 transition-colors cursor-pointer"
              >
                重試一次
              </button>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto" id="analysis-content">
              <AstroTextFormatter text={analysis} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
