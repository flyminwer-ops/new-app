import { ZodiacSign, Astrologer } from "./types";

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    name: "牡羊座",
    englishName: "Aries",
    dateRange: "3/21 - 4/19",
    element: "火象",
    rulingPlanet: "火星",
    symbol: "♈",
    color: "from-red-500 to-orange-500",
    bgGradient: "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20",
    keyTraits: ["熱情", "勇敢", "自信", "衝動", "具領導力"]
  },
  {
    name: "金牛座",
    englishName: "Taurus",
    dateRange: "4/20 - 5/20",
    element: "土象",
    rulingPlanet: "金星",
    symbol: "♉",
    color: "from-emerald-500 to-green-600",
    bgGradient: "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20",
    keyTraits: ["踏實", "耐心", "可靠", "固執", "審美佳"]
  },
  {
    name: "雙子座",
    englishName: "Gemini",
    dateRange: "5/21 - 6/21",
    element: "風象",
    rulingPlanet: "水星",
    symbol: "♊",
    color: "from-cyan-400 to-blue-500",
    bgGradient: "bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20",
    keyTraits: ["聰慧", "好奇心強", "機智", "善變", "多才多藝"]
  },
  {
    name: "巨蟹座",
    englishName: "Cancer",
    dateRange: "6/22 - 7/22",
    element: "水象",
    rulingPlanet: "月亮",
    symbol: "♋",
    color: "from-blue-400 to-indigo-500",
    bgGradient: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
    keyTraits: ["溫柔", "敏感", "體貼", "缺乏安全感", "愛家"]
  },
  {
    name: "獅子座",
    englishName: "Leo",
    dateRange: "7/23 - 8/22",
    element: "火象",
    rulingPlanet: "太陽",
    symbol: "♌",
    color: "from-amber-500 to-yellow-600",
    bgGradient: "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20",
    keyTraits: ["慷慨", "霸氣", "熱心", "愛面子", "具創造力"]
  },
  {
    name: "處女座",
    englishName: "Virgo",
    dateRange: "8/23 - 9/22",
    element: "土象",
    rulingPlanet: "水星",
    symbol: "♍",
    color: "from-teal-500 to-emerald-600",
    bgGradient: "bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20",
    keyTraits: ["細心", "追求完美", "理智", "嘮叨", "擅長分析"]
  },
  {
    name: "天秤座",
    englishName: "Libra",
    dateRange: "9/23 - 10/23",
    element: "風象",
    rulingPlanet: "金星",
    symbol: "♎",
    color: "from-purple-400 to-pink-500",
    bgGradient: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
    keyTraits: ["優雅", "公正", "善社交", "猶豫不決", "追求和諧"]
  },
  {
    name: "天蠍座",
    englishName: "Scorpio",
    dateRange: "10/24 - 11/22",
    element: "水象",
    rulingPlanet: "冥王星",
    symbol: "♏",
    color: "from-fuchsia-600 to-purple-700",
    bgGradient: "bg-gradient-to-br from-fuchsia-50 to-purple-50 dark:from-fuchsia-950/20 dark:to-purple-950/20",
    keyTraits: ["神祕", "深情", "直覺強", "佔有慾", "意志堅定"]
  },
  {
    name: "射手座",
    englishName: "Sagittarius",
    dateRange: "11/23 - 12/21",
    element: "火象",
    rulingPlanet: "木星",
    symbol: "♐",
    color: "from-orange-500 to-rose-500",
    bgGradient: "bg-gradient-to-br from-orange-50 to-rose-50 dark:from-orange-950/20 dark:to-rose-950/20",
    keyTraits: ["樂觀", "愛自由", "幽默", "粗心", "熱愛探索"]
  },
  {
    name: "摩羯座",
    englishName: "Capricorn",
    dateRange: "12/22 - 1/19",
    element: "土象",
    rulingPlanet: "土星",
    symbol: "♑",
    color: "from-slate-600 to-stone-700",
    bgGradient: "bg-gradient-to-br from-slate-50 to-stone-50 dark:from-slate-950/20 dark:to-stone-950/20",
    keyTraits: ["穩重", "務實", "有毅力", "嚴肅", "責任感強"]
  },
  {
    name: "水瓶座",
    englishName: "Aquarius",
    dateRange: "1/20 - 2/18",
    element: "風象",
    rulingPlanet: "天王星",
    symbol: "♒",
    color: "from-indigo-400 to-cyan-500",
    bgGradient: "bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-950/20 dark:to-cyan-950/20",
    keyTraits: ["獨立", "具前瞻性", "友善", "特立獨行", "重精神交流"]
  },
  {
    name: "雙魚座",
    englishName: "Pisces",
    dateRange: "2/19 - 3/20",
    element: "水象",
    rulingPlanet: "海王星",
    symbol: "♓",
    color: "from-pink-400 to-violet-500",
    bgGradient: "bg-gradient-to-br from-pink-50 to-violet-50 dark:from-pink-950/20 dark:to-violet-950/20",
    keyTraits: ["浪漫", "富同情心", "直覺敏銳", "愛幻想", "溫和"]
  }
];

export const ASTROLOGERS: Astrologer[] = [
  {
    id: "sophia",
    name: "蘇菲雅大師 (Master Sophia)",
    title: "西方心理占星與本命盤解讀專家",
    specialty: "心理占星學 / 情感與職涯能量引導",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256&h=256",
    description: "結合西方現代占星術與深層心理學，擁有超過15年的命盤諮商經驗。相信星星只是一種氣候指引，而你的心才是真正的舵手。擅長情感、創傷療癒與個人天賦定位。",
    greeting: "親愛的星友，你好。我是蘇菲雅。讓我們一起聆聽星盤的絮語，解鎖你靈魂深處的潛能與天賦吧。"
  },
  {
    id: "luke",
    name: "陸克星君 (Master Luke)",
    title: "古典占星與東方七政四餘傳承人",
    specialty: "古典時機推運 / 財運與人生大方向剖析",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256&h=256",
    description: "鑽研古典西洋占星與東方七政四餘星象術，注重宿命軌跡、大運交接與吉凶得失。風格冷靜客觀、切中要害，不作無謂的包裝，專為重大人生轉折提供定時定量指引。",
    greeting: "命盤藏天機，吉凶有乾坤。我是陸克。今日能得此機緣相見，便說說你目前的瓶頸，我為你明辨前路。"
  },
  {
    id: "celine",
    name: "席琳老師 (Miss Celine)",
    title: "直覺塔羅占卜與星靈能量療癒師",
    specialty: "塔羅奧義占卜 / 星體能量淨化 / 愛情關係解答",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256",
    description: "自幼對宇宙能量具備敏銳知覺，擅長透過神秘學塔羅牌與行星精靈能量進行解讀。風格詩意且充滿療癒，能在最黑暗的迷霧中，用最輕柔的光輝為你照亮愛的歸途。",
    greeting: "靜下心來，深深呼吸... 聽見你內在靈魂的聲音了嗎？我是席琳，讓我和我的塔羅牌，一起為你卸下疲憊，找回心中的寧靜吧。"
  }
];
