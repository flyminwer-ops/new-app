import { useState, useEffect } from "react";
import ZodiacPersonality from "./components/ZodiacPersonality";
import ZodiacFortune from "./components/ZodiacFortune";
import ZodiacCompatibility from "./components/ZodiacCompatibility";
import ZodiacSocial from "./components/ZodiacSocial";
import ZodiacConsultation from "./components/ZodiacConsultation";
import { Sparkles, Compass, Heart, MessageSquare, HelpCircle, Moon, Sun } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("personality");
  const [darkMode, setDarkMode] = useState<boolean>(true); // Default to a gorgeous dark cosmic theme

  useEffect(() => {
    // Sync theme with DOM class
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Read/Write activeTab in sessionStorage for state survival
  useEffect(() => {
    const savedTab = sessionStorage.getItem("zodiac_active_tab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    sessionStorage.setItem("zodiac_active_tab", tab);
  };

  const tabs = [
    { id: "personality", name: "個性分析", icon: Compass },
    { id: "fortune", name: "每日/每週運勢", icon: Sparkles },
    { id: "compatibility", name: "星曜配對評分", icon: Heart },
    { id: "social", name: "星友討論廣場", icon: MessageSquare },
    { id: "consultation", name: "命理師諮詢", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-12 font-sans selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-300" id="app-root">
      {/* Premium Cosmic Background Pattern */}
      <div className="absolute top-0 left-0 right-0 h-[450px] bg-gradient-to-b from-indigo-550/15 via-purple-550/5 to-transparent dark:from-indigo-950/40 dark:via-purple-950/10 pointer-events-none z-0" />
      
      {/* Top Banner Header */}
      <header className="relative z-10 border-b border-slate-200/80 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur-md sticky top-0" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleTabChange("personality")}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md animate-pulse">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                星曜天機 <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 rounded font-mono">AI v2.0</span>
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">客製化占星與星友互動平台</p>
            </div>
          </div>

          {/* Controls: DarkMode & Time */}
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-[10px] font-mono bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full text-slate-500 dark:text-slate-400">
              📅 {new Date().toLocaleDateString("zh-TW", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="切換主題"
              id="btn-theme-toggle"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Navigation Tabs */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6" id="app-nav">
        <div className="flex bg-white dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-900 shadow-sm overflow-x-auto no-scrollbar gap-1">
          {tabs.map((tab) => (
            <button
              onClick={() => handleTabChange(tab.id)}
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              className={`shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm scale-[1.01]"
                  : "text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Pane */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8" id="app-main-content">
        <div className="bg-white/50 dark:bg-transparent rounded-3xl min-h-[500px]">
          {activeTab === "personality" && <ZodiacPersonality />}
          {activeTab === "fortune" && <ZodiacFortune />}
          {activeTab === "compatibility" && <ZodiacCompatibility />}
          {activeTab === "social" && <ZodiacSocial />}
          {activeTab === "consultation" && <ZodiacConsultation />}
        </div>
      </main>

      {/* Footer credits */}
      <footer className="relative z-10 text-center text-[11px] text-slate-400 dark:text-slate-500 mt-20" id="app-footer">
        <p>© 2026 星曜天機 (Horoscope Astrological AI Platform). All Rights Reserved.</p>
        <p className="mt-1">結合神經網絡行星合盤與西方現代心理占星，旨在提供個人療癒與心靈成長指引。</p>
      </footer>
    </div>
  );
}
