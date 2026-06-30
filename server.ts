import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini SDK with User-Agent header for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// In-memory data store for social features (seeded data)
interface Comment {
  id: string;
  authorName: string;
  authorSign: string;
  content: string;
  createdAt: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorSign: string;
  likes: number;
  comments: Comment[];
  category: string;
  createdAt: string;
}

let posts: Post[] = [
  {
    id: "1",
    title: "雙子座是不是真的很難懂？有時候熱情有時候突然很冷淡...",
    content: "跟一個雙子男相處了幾個月，有時候可以聊一整天，分享各種搞笑的事情。但有時候突然就已讀不回，或是回得很敷衍。請問各位雙子星友，這是在欲擒故縱，還是單純懶得回？我該主動還是等他？",
    authorName: "迷茫的天秤",
    authorSign: "天秤座",
    likes: 42,
    category: "感情困惑",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    comments: [
      {
        id: "1-1",
        authorName: "風一樣的雙子",
        authorSign: "雙子座",
        content: "身為雙子，老實告訴你：我們只是突然沒電了！真的不是討厭你，多半是正在專注別的新鮮事物，過兩天充電完又會自己蹦出來了，這時候不用逼太緊喔～",
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: "1-2",
        authorName: "水瓶觀察家",
        authorSign: "水瓶座",
        content: "風象星座真的都這樣，天秤的你應該也很懂這種需要個人空間的感覺才對，平常心看待就好！",
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
      }
    ]
  },
  {
    id: "2",
    title: "大家在即將到來的金星逆行期間，有感覺到舊情人回頭嗎？",
    content: "聽說這次金星逆行對土象星座影響蠻大的。身為處女座的我，昨天竟然收到兩年沒聯絡的前任傳來的問候訊息，真是嚇到我了。大家最近有類似的奇遇嗎？",
    authorName: "小潔癖",
    authorSign: "處女座",
    likes: 28,
    category: "星象討論",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    comments: [
      {
        id: "2-1",
        authorName: "傲嬌魔羯",
        authorSign: "摩羯座",
        content: "我魔羯，前幾天前男友也來按我舊照片讚，但我直接封鎖，好馬不吃回頭草！",
        createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
      }
    ]
  },
  {
    id: "3",
    title: "尋找魔羯跟金牛的完美契合經驗！",
    content: "都說土象星座配對指數極高，我是金牛女，最近跟一個魔羯男很有話聊，他做事非常有條理而且很有上進心，雖然木訥了一點但讓人感覺超安心。有人能分享你們的相處細節嗎？",
    authorName: "愛吃肉的金牛",
    authorSign: "金牛座",
    likes: 35,
    category: "配對閃文",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    comments: [
      {
        id: "3-1",
        authorName: "穩重老魔羯",
        authorSign: "摩羯座",
        content: "魔羯跟金牛真的是天作之合，價值觀超像，不用過度包裝自己，能一起踏實生活，祝福你們！",
        createdAt: new Date(Date.now() - 3600000 * 40).toISOString()
      }
    ]
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // HEALTH CHECK
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // ==================== ZODIAC DATA & GEMINI ENDPOINTS ====================

  // Endpoint for zodiac personality analysis
  app.post("/api/gemini/personality", async (req, res) => {
    const { sign } = req.body;
    if (!sign) {
      return res.status(400).json({ error: "請提供星座名稱" });
    }

    try {
      const prompt = `請針對「${sign}」提供極度詳細、深度且精美的星座個性分析。
請包含以下結構：
1. 【星座簡介】（包含守護星、屬性、代表能量）
2. 【核心性格特徵】（深層性格、優點與亮點）
3. 【陰暗面與弱點】（不為人知的盲點、防備機制與挑戰）
4. 【愛情觀與親密關係】（如何面對感情、喜歡的類型、在關係中的模樣）
5. 【事業與金錢觀】（工作風格、適合職業、理財態度）
6. 【命理師的成長指引】（給予該星座的靈魂成長建議）

請使用繁體中文（台灣習慣用語），語氣要專業、溫暖、具有啟發性與靈性深度，多使用精緻的排版與條列式說明。`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ analysis: response.text });
    } catch (error: any) {
      console.error("Gemini Personality API Error:", error);
      res.status(500).json({ error: "無法生成星座分析，請稍後再試。" });
    }
  });

  // Endpoint for daily & weekly fortunes
  app.post("/api/gemini/fortune", async (req, res) => {
    const { sign, type } = req.body; // type: "daily" | "weekly"
    if (!sign || !type) {
      return res.status(400).json({ error: "請提供星座與運勢類型" });
    }

    try {
      let prompt = "";
      if (type === "daily") {
        prompt = `請為「${sign}」生成今日（${new Date().toLocaleDateString('zh-TW')}）的每日運勢報告。
請務必包含以下資訊，並嚴格遵循 JSON 格式返回，不要包含額外的 Markdown 標記（除了 JSON 本身）：

{
  "summary": "一句話總結今日運勢，要富有哲理與詩意",
  "overallScore": 85, // 1-100 的數字
  "loveScore": 90, // 1-100 的數字
  "careerScore": 80, // 1-100 的數字
  "wealthScore": 75, // 1-100 的數字
  "healthScore": 85, // 1-100 的數字
  "luckyColor": "幸運顏色",
  "luckyNumber": 7, // 幸運數字
  "luckyDirection": "幸運方位",
  "overview": "今日綜合運勢的詳細說明，包含心情與精神狀態",
  "loveAdvice": "今日愛情指引與建議",
  "careerAdvice": "今日工作或學業的注意事項與機會",
  "wealthAdvice": "今日投資理財或開銷的指引"
}

請確保 JSON 欄位完全正確，並使用繁體中文。`;
      } else {
        prompt = `請為「${sign}」生成本週的星座運勢深度分析報告。
請務必包含以下結構，使用繁體中文回覆：
1. 【本週運勢總覽】（一週整體能量、核心氛圍）
2. 【愛情與人際關係】（單身與有伴者的桃花及互動建議）
3. 【事業與學業藍圖】（工作進度、亮眼表現或需要避開的雷區）
4. 【財運與投資佈局】（資金進出、理財直覺、開源節流機會）
5. 【健康與心靈淨化】（身體狀態、身心舒壓與能量調整方式）
6. 【每週幸運指南】（本週最適合做的一件事、幸運日、開運好物）

請使用溫柔且專業的占星師語氣，排版精美易讀。`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: type === "daily" ? {
          responseMimeType: "application/json",
        } : undefined,
      });

      if (type === "daily") {
        try {
          const parsed = JSON.parse(response.text || "{}");
          res.json({ fortune: parsed });
        } catch (e) {
          // Fallback if JSON parsing fails
          console.warn("Failed to parse daily fortune JSON, sending raw text", e);
          res.json({ rawText: response.text });
        }
      } else {
        res.json({ analysis: response.text });
      }
    } catch (error: any) {
      console.error("Gemini Fortune API Error:", error);
      res.status(500).json({ error: "無法生成運勢，請稍後再試。" });
    }
  });

  // Endpoint for zodiac compatibility mechanism
  app.post("/api/gemini/compatibility", async (req, res) => {
    const { signA, signB, nameA, nameB } = req.body;
    if (!signA || !signB) {
      return res.status(400).json({ error: "請選擇兩個星座進行配對" });
    }

    try {
      const prompt = `請為「${nameA || signA}」（星座：${signA}）與「${nameB || signB}」（星座：${signB}）進行深度的星座配對評分與合盤分析。
請務必包含以下資訊，並嚴格遵循 JSON 格式返回，不要包含額外的 Markdown 標記（除了 JSON 本身）：

{
  "loveMatch": 85, // 愛情契合度 1-100 的整數
  "friendMatch": 90, // 友情契合度 1-100 的整數
  "careerMatch": 75, // 事業契合度 1-100 的整數
  "matchLevel": "黃金拍檔 / 天作之合 / 相愛相殺 / 需要磨合 等四字簡短評語",
  "summary": "一到兩句富有哲理的關係總結",
  "chemistry": "詳細分析兩人的化學反應，包含星象屬性（如風象與火象）的碰撞與相處氛圍",
  "loveAnalysis": "兩人在愛情與親密關係中的互動模式、吸引力來源與甜蜜點",
  "friendshipAnalysis": "兩人在朋友關係、共同興趣與溝通理解上的契合度",
  "careerAnalysis": "兩人在職場上合作、分工、執行力與決策衝突時的配合度",
  "challenges": "兩人在相處中可能遇到的最大摩擦點或核心矛盾",
  "advice": "星象大師給予兩人的關係維繫與相處實用建議"
}

請確保 JSON 欄位完全正確，使用繁體中文。`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ compatibility: parsed });
    } catch (error: any) {
      console.error("Gemini Compatibility API Error:", error);
      res.status(500).json({ error: "無法生成配對分析，請稍後再試。" });
    }
  });

  // Endpoint for astrologer consultation portal
  app.post("/api/gemini/consultation", async (req, res) => {
    const { astrologerId, message, history } = req.body;
    if (!astrologerId || !message) {
      return res.status(400).json({ error: "缺少命理師 ID 或諮詢訊息" });
    }

    // Define custom system instructions based on astrologer
    let systemInstruction = "";
    if (astrologerId === "sophia") {
      systemInstruction = `你現在是「蘇菲雅大師（Master Sophia）」，一位資深的現代西方占星學與心理占星學專家。
你的風格特點：
- 溫暖、同理心極強、循循善誘。
- 善於從心理學的角度解析星座與本命盤，將宇宙能量轉化為具體的心理狀態與行動指引。
- 回覆語氣親切，常用「親愛的」、「星友」等溫柔稱呼。
- 強調「星星只是指引，命運掌握在自己手中」。
請務必使用繁體中文（台灣習慣用語）與使用者對話，回覆內容要兼具星座專業度與心靈療癒感，不要過於生硬，回覆字數適中（約150-250字）。`;
    } else if (astrologerId === "luke") {
      systemInstruction = `你現在是「陸克星君（Master Luke）」，一位精通古典占星、東方七政四餘與紫微斗數的命理大師。
你的風格特點：
- 睿智、深邃、直接且一針見血，不說無意義的客套話。
- 專注於命運軌跡、時機判斷、因果運勢與人生大方向的剖析。
- 說話帶有一點古典風範與哲理，冷靜而神祕。
- 常用「施主」、「命運自有机緣」或沈穩的句式，語氣帶有威嚴與洞察力。
請務必使用繁體中文（台灣習慣用語）與使用者對話，回覆要展現出博古通今的專業威嚴與直接洞察，回覆字數適中（約150-250字）。`;
    } else if (astrologerId === "celine") {
      systemInstruction = `你現在是「席琳老師（Miss Celine）」，一位直覺敏銳的塔羅占卜師與星靈能量療癒師。
你的風格特點：
- 極具詩意、療癒感、靈性色彩濃厚。
- 喜歡使用「月亮」、「流水」、「微風」等自然界的意象與星體能量來安慰和引導使用者。
- 說話慢條斯理、充滿神聖和諧的氛圍，擅長舒緩焦慮，解答情感與靈性困惑。
- 常用「聆聽你內心的聲音」、「宇宙正在擁抱你」等溫柔話語。
請務必使用繁體中文（台灣習慣用語）與使用者對話，回覆內容要極具畫面感與詩意療癒，像是一首溫暖的歌或一張平靜的塔羅牌，回覆字數適中（約150-250字）。`;
    } else {
      systemInstruction = "你是一位專業的占星師，請用繁體中文溫和且專業地回答使用者的星座與命理問題。";
    }

    try {
      // Reconstruct historical chat messages formatted for @google/genai SDK
      // Note: In @google/genai SDK, chats.create uses 'contents' which can have {role, parts: [{text}]}
      // But we can also just use the simple text chats flow. Let's create an ai.chats.create session
      // or directly use generateContent with the history passed in contents!
      // Using contents array is simpler and extremely reliable:
      const contents: any[] = [];
      
      // Seed history
      if (history && Array.isArray(history)) {
        history.forEach((msg: any) => {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }]
          });
        });
      }
      
      // Append newest message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.8,
        }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Gemini Consultation API Error:", error);
      res.status(500).json({ error: "大師正在冥想中，請稍後再試。" });
    }
  });


  // ==================== SOCIAL INTERACTION API ENDPOINTS ====================

  // Get all posts
  app.get("/api/posts", (req, res) => {
    // Sort posts by newest first
    const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(sortedPosts);
  });

  // Create a new post
  app.post("/api/posts", (req, res) => {
    const { title, content, authorName, authorSign, category } = req.body;
    if (!title || !content || !authorName || !authorSign) {
      return res.status(400).json({ error: "欄位填寫不完整" });
    }

    const newPost: Post = {
      id: String(posts.length + 1),
      title,
      content,
      authorName,
      authorSign,
      likes: 0,
      comments: [],
      category: category || "未分類",
      createdAt: new Date().toISOString()
    };

    posts.push(newPost);
    res.status(201).json(newPost);

    // Let's trigger a fun asynchronous AI reply in the background to simulate a active social community!
    // An AI reply will be added to this post after a brief delay so the page feels interactive.
    setTimeout(async () => {
      try {
        const aiPrompt = `你現在是一位星座社群的熱心網友。看到以下這篇貼文：
貼文標題：「${title}」
貼文內容：「${content}」
作者星座：${authorSign}

請你寫一條幽默、精闢、或非常溫暖的留言回覆。留言長度約在 30-80 字，使用繁體中文。請以一個隨機的星座網友身份回覆，並在開頭或結尾加上你自己的星座。
格式請返回 JSON：
{
  "name": "網友暱稱",
  "sign": "隨機星座名稱",
  "content": "回覆內容"
}
`;
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: aiPrompt,
          config: { responseMimeType: "application/json" }
        });

        const reply = JSON.parse(response.text || "{}");
        if (reply.name && reply.sign && reply.content) {
          const postIndex = posts.findIndex(p => p.id === newPost.id);
          if (postIndex !== -1) {
            posts[postIndex].comments.push({
              id: `${newPost.id}-ai-${Date.now()}`,
              authorName: reply.name,
              authorSign: reply.sign,
              content: reply.content,
              createdAt: new Date().toISOString()
            });
            console.log(`Simulated community reply added to post ${newPost.id}`);
          }
        }
      } catch (err) {
        console.warn("Background simulated reply generation failed:", err);
      }
    }, 4000);
  });

  // Like a post
  app.post("/api/posts/:id/like", (req, res) => {
    const { id } = req.params;
    const post = posts.find(p => p.id === id);
    if (!post) {
      return res.status(404).json({ error: "找不到貼文" });
    }
    post.likes += 1;
    res.json({ success: true, likes: post.likes });
  });

  // Comment on a post
  app.post("/api/posts/:id/comments", (req, res) => {
    const { id } = req.params;
    const { authorName, authorSign, content } = req.body;
    if (!authorName || !authorSign || !content) {
      return res.status(400).json({ error: "欄位填寫不完整" });
    }

    const post = posts.find(p => p.id === id);
    if (!post) {
      return res.status(404).json({ error: "找不到貼文" });
    }

    const newComment: Comment = {
      id: `${id}-${post.comments.length + 1}`,
      authorName,
      authorSign,
      content,
      createdAt: new Date().toISOString()
    };

    post.comments.push(newComment);
    res.status(201).json(newComment);
  });


  // ==================== VITE DEVELOPMENT & PRODUCTION SERVING ====================

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
