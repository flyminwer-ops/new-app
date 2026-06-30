export interface ZodiacSign {
  name: string;
  englishName: string;
  dateRange: string;
  element: "火象" | "土象" | "風象" | "水象";
  rulingPlanet: string;
  symbol: string;
  color: string; // Tailwind class color accent
  bgGradient: string; // Tailwind bg gradient class
  keyTraits: string[];
}

export interface Astrologer {
  id: string;
  name: string;
  title: string;
  specialty: string;
  avatar: string; // Unsplash image or icon
  description: string;
  greeting: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorSign: string;
  content: string;
  createdAt: string;
}

export interface Post {
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

export interface DailyFortune {
  summary: string;
  overallScore: number;
  loveScore: number;
  careerScore: number;
  wealthScore: number;
  healthScore: number;
  luckyColor: string;
  luckyNumber: number;
  luckyDirection: string;
  overview: string;
  loveAdvice: string;
  careerAdvice: string;
  wealthAdvice: string;
}

export interface CompatibilityResult {
  loveMatch: number;
  friendMatch: number;
  careerMatch: number;
  matchLevel: string;
  summary: string;
  chemistry: string;
  loveAnalysis: string;
  friendshipAnalysis: string;
  careerAnalysis: string;
  challenges: string;
  advice: string;
}
