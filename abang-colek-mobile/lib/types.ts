// Data types for Abang Colek Mobile App

export type EventStatus = "lead" | "confirmed" | "completed";

export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  fee: number;
  status: EventStatus;
  eoContact: {
    name: string;
    phone: string;
    email?: string;
  };
  requirements?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  notes?: string;
}

export interface BoothChecklist {
  id: string;
  eventId: string;
  preEvent: ChecklistItem[];
  duringEvent: ChecklistItem[];
  postEvent: ChecklistItem[];
}

export interface Hook {
  id: string;
  text: string;
  tags: string[];
  performance?: {
    views: number;
    likes: number;
    shares: number;
    engagement: number; // percentage
  };
  usedCount: number; // how many times used in content
  lastUsed?: string; // ISO date
  createdAt: string;
}

export interface ContentPlan {
  id: string;
  eventId: string;
  date: string;
  hookId?: string;
  caption: string;
  shotList: string[];
  posted: boolean;
}

export interface Review {
  id: string;
  eventId: string;
  sales: number;
  views: number;
  engagement: number;
  topHooks: string[];
  issues?: string;
  learnings?: string;
  photos?: string[];
  createdAt: string;
}

export interface Milestone {
  id: string;
  type: "event" | "sales" | "followers" | "custom";
  title: string;
  description: string;
  achieved: boolean;
  achievedAt?: string;
  createdAt: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  achieved: boolean;
  achievedAt?: string;
}

export interface Testimonial {
  id: string;
  customerName: string;
  quote: string;
  source?: string;
  createdAt: string;
}

export interface SuccessStory {
  id: string;
  title: string;
  highlight: string;
  metric?: string;
}

export interface AppSettings {
  soundEffects: boolean;
  backgroundMusic: boolean;
  haptics: boolean;
}

export interface DailyMotivation {
  id: string;
  quote: string;
  author: string;
  category: "business" | "product" | "growth" | "founder";
}

export interface Tagline {
  id: string;
  text: string;
  context: "formal" | "social" | "emotional";
  emoji?: string;
}

export interface LuckyDrawCampaign {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  eventId?: string; // Optional link to event
  qrCodeUrl: string;
  googleFormUrl: string;
  requirements: {
    followTikTok: boolean;
    shareTikTok: boolean;
    tagFriends: number; // minimum number of friends to tag
  };
  prizeDescription: string;
  status: "draft" | "active" | "ended";
  createdAt: string;
}

export interface LuckyDrawEntry {
  id: string;
  campaignId: string;
  name: string;
  phone: string;
  email?: string;
  tiktokUsername?: string;
  verified: boolean;
  verificationNotes?: string;
  submittedAt: string;
}

export interface LuckyDrawWinner {
  id: string;
  campaignId: string;
  entryId: string;
  selectedAt: string;
  notified: boolean;
  claimed: boolean;
  claimedAt?: string;
}

export interface AppData {
  events: Event[];
  checklists: BoothChecklist[];
  hooks: Hook[];
  contentPlans: ContentPlan[];
  reviews: Review[];
  milestones: Milestone[];
  badges: AchievementBadge[];
  testimonials: Testimonial[];
  successStories: SuccessStory[];
  luckyDrawCampaigns: LuckyDrawCampaign[];
  luckyDrawEntries: LuckyDrawEntry[];
  luckyDrawWinners: LuckyDrawWinner[];
  settings: AppSettings;
  lastSync?: string;
}
