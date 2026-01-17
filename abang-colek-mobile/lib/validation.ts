import { z } from "zod";

const eventStatusSchema = z.enum(["lead", "confirmed", "completed"]);

const eventSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string(),
  location: z.string(),
  fee: z.number(),
  status: eventStatusSchema,
  eoContact: z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string().nullable().optional(),
  }),
  requirements: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const checklistItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  completed: z.boolean(),
  notes: z.string().nullable().optional(),
});

const boothChecklistSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  preEvent: z.array(checklistItemSchema),
  duringEvent: z.array(checklistItemSchema),
  postEvent: z.array(checklistItemSchema),
});

const hookSchema = z.object({
  id: z.string(),
  text: z.string(),
  tags: z.array(z.string()),
  performance: z
    .object({
      views: z.number(),
      likes: z.number(),
      shares: z.number(),
      engagement: z.number(),
    })
    .optional(),
  usedCount: z.number(),
  lastUsed: z.string().optional(),
  createdAt: z.string(),
});

const contentPlanSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  date: z.string(),
  hookId: z.string().optional(),
  caption: z.string(),
  shotList: z.array(z.string()),
  posted: z.boolean(),
});

const reviewSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  sales: z.number(),
  views: z.number(),
  engagement: z.number(),
  topHooks: z.array(z.string()),
  issues: z.string().nullable().optional(),
  learnings: z.string().nullable().optional(),
  photos: z.array(z.string()).optional(),
  createdAt: z.string(),
});

const milestoneSchema = z.object({
  id: z.string(),
  type: z.enum(["event", "sales", "followers", "custom"]),
  title: z.string(),
  description: z.string(),
  achieved: z.boolean(),
  achievedAt: z.string().optional(),
  createdAt: z.string(),
});

const badgeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  achieved: z.boolean(),
  achievedAt: z.string().optional(),
});

const testimonialSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  quote: z.string(),
  source: z.string().optional(),
  createdAt: z.string(),
});

const successStorySchema = z.object({
  id: z.string(),
  title: z.string(),
  highlight: z.string(),
  metric: z.string().optional(),
});

const luckyDrawCampaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  eventId: z.string().optional(),
  qrCodeUrl: z.string(),
  googleFormUrl: z.string(),
  requirements: z.object({
    followTikTok: z.boolean(),
    shareTikTok: z.boolean(),
    tagFriends: z.number(),
  }),
  prizeDescription: z.string(),
  status: z.enum(["draft", "active", "ended"]),
  createdAt: z.string(),
});

const luckyDrawEntrySchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string().nullable().optional(),
  tiktokUsername: z.string().nullable().optional(),
  verified: z.boolean(),
  verificationNotes: z.string().nullable().optional(),
  submittedAt: z.string(),
});

const luckyDrawWinnerSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  entryId: z.string(),
  selectedAt: z.string(),
  notified: z.boolean(),
  claimed: z.boolean(),
  claimedAt: z.string().nullable().optional(),
});

export const appDataSchema = z.object({
  events: z.array(eventSchema),
  checklists: z.array(boothChecklistSchema),
  hooks: z.array(hookSchema),
  contentPlans: z.array(contentPlanSchema),
  reviews: z.array(reviewSchema),
  milestones: z.array(milestoneSchema),
  badges: z.array(badgeSchema),
  testimonials: z.array(testimonialSchema),
  successStories: z.array(successStorySchema),
  luckyDrawCampaigns: z.array(luckyDrawCampaignSchema),
  luckyDrawEntries: z.array(luckyDrawEntrySchema),
  luckyDrawWinners: z.array(luckyDrawWinnerSchema),
  settings: z.object({
    soundEffects: z.boolean(),
    backgroundMusic: z.boolean(),
    haptics: z.boolean(),
  }),
  lastSync: z.string().optional(),
});

export function safeParseAppData(input: unknown) {
  return appDataSchema.safeParse(input);
}
