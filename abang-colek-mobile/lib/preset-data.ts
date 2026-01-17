import type { AchievementBadge, DailyMotivation, SuccessStory, Tagline, Testimonial } from "./types";

export const motivationalQuotes: DailyMotivation[] = [
  {
    id: "1",
    quote: "Rasa Sekali, Jatuh Cinta Selamanya",
    author: "Abang Colek",
    category: "product",
  },
  {
    id: "2",
    quote: "Pedas Manis Likat Melekat - Macam perniagaan, kena ada balance!",
    author: "Founder",
    category: "business",
  },
  {
    id: "3",
    quote: "Setiap event adalah peluang untuk buat customer jatuh cinta",
    author: "Founder",
    category: "growth",
  },
  {
    id: "4",
    quote: "Dari dapur rumah ke seluruh Malaysia - Mimpi boleh jadi kenyataan",
    author: "Founder Story",
    category: "founder",
  },
  {
    id: "5",
    quote: "Bukan calang-calang pedas, bukan calang-calang usahawan",
    author: "Abang Colek",
    category: "business",
  },
  {
    id: "6",
    quote: "Konsisten macam rasa sambal kita - Hari-hari padu!",
    author: "Founder",
    category: "growth",
  },
  {
    id: "7",
    quote: "Setiap booth adalah stage untuk showcase passion kita",
    author: "Founder",
    category: "business",
  },
  {
    id: "8",
    quote: "Sticky macam sambal, memorable macam brand",
    author: "Abang Colek",
    category: "product",
  },
];

export const taglines: Tagline[] = [
  {
    id: "1",
    text: "Rasa Padu, Pedas Menggamit",
    context: "formal",
    emoji: "🌶️",
  },
  {
    id: "2",
    text: "PEDAS MANIS LIKAT MELEKAT",
    context: "social",
    emoji: "🌶️🥭",
  },
  {
    id: "3",
    text: "Rasa Sekali Jatuh Cinta Selamanya",
    context: "emotional",
    emoji: "❤️",
  },
  {
    id: "4",
    text: "Pedas Tapi Puas",
    context: "social",
    emoji: "🌶️",
  },
  {
    id: "5",
    text: "Colek Sampai Licin",
    context: "social",
    emoji: "🥭",
  },
  {
    id: "6",
    text: "Bukan Calang-Calang Pedas",
    context: "formal",
    emoji: "🌶️",
  },
];

export const defaultChecklistItems = {
  preEvent: [
    "Semak inventory sambal (berapa botol/pack)",
    "Prepare booth setup equipment (meja, banner, standee)",
    "Print QR code untuk lucky draw",
    "Charge power bank dan phone",
    "Prepare cash float (duit kecil)",
    "Pack merchandise (sticker, flyer, business card)",
    "Prepare cooler box dengan ice pack",
    "Brief staff tentang product dan pricing",
    "Test payment system (QR pay, cash)",
    "Prepare shot list untuk TikTok content",
  ],
  duringEvent: [
    "Setup booth sebelum event start",
    "Display product dengan menarik",
    "Pasang banner dan standee",
    "Start greeting customers dengan senyum",
    "Record customer reactions untuk content",
    "Promote lucky draw registration",
    "Monitor stock level",
    "Engage dengan customers (build relationship)",
    "Capture behind-the-scenes content",
    "Note down customer feedback",
  ],
  postEvent: [
    "Pack semua equipment dengan kemas",
    "Count sales dan stock balance",
    "Collect customer feedback forms",
    "Download content dari phone ke laptop",
    "Update inventory system",
    "Thank EO dan exchange contact",
    "Post event highlight di social media",
    "Review apa yang berjaya dan perlu improve",
    "Plan content calendar untuk next week",
    "Rest dan celebrate! 🎉",
  ],
};

import type { Hook } from "./types";

export const sampleHooks: Hook[] = [
  {
    id: "hook-1",
    text: "Pedas sampai menangis tapi masih nak lagi! 🌶️😭",
    tags: ["reaction", "pedas", "viral"],
    performance: {
      views: 125000,
      likes: 8900,
      shares: 450,
      engagement: 7.5,
    },
    usedCount: 12,
    lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "hook-2",
    text: "Rahsia sambal yang buat pelanggan jatuh cinta 🥭🌶️",
    tags: ["product", "sambal", "tips"],
    performance: {
      views: 89000,
      likes: 6200,
      shares: 320,
      engagement: 7.3,
    },
    usedCount: 8,
    lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "hook-3",
    text: "Dari booth kecil ke viral TikTok - Journey Abang Colek 📈",
    tags: ["founder", "motivation", "story"],
    performance: {
      views: 210000,
      likes: 15400,
      shares: 890,
      engagement: 7.8,
    },
    usedCount: 5,
    lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "hook-4",
    text: "3 cara makan Colek yang ramai tak tahu! 🤯",
    tags: ["tips", "product", "viral"],
    performance: {
      views: 156000,
      likes: 11200,
      shares: 670,
      engagement: 7.6,
    },
    usedCount: 15,
    lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "hook-5",
    text: "Behind the scenes: Prep 100 boxes untuk event 🎪",
    tags: ["bts", "event", "hustle"],
    performance: {
      views: 67000,
      likes: 4800,
      shares: 210,
      engagement: 7.5,
    },
    usedCount: 6,
    lastUsed: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "hook-6",
    text: "Customer reaction: First time try Jumbo Colek! 😱",
    tags: ["reaction", "customer", "jumbo"],
    performance: {
      views: 98000,
      likes: 7100,
      shares: 380,
      engagement: 7.7,
    },
    usedCount: 10,
    lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "hook-7",
    text: "POV: Kau order level pedas 10 🔥💀",
    tags: ["pov", "pedas", "challenge"],
    performance: {
      views: 187000,
      likes: 13200,
      shares: 720,
      engagement: 7.5,
    },
    usedCount: 18,
    lastUsed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "hook-8",
    text: "Kenapa sambal kami MANIS dulu baru PEDAS? 🥭🌶️",
    tags: ["product", "education", "unique"],
    performance: {
      views: 143000,
      likes: 9800,
      shares: 540,
      engagement: 7.2,
    },
    usedCount: 9,
    lastUsed: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "hook-9",
    text: "Bila customer tanya 'Ada yang kurang pedas tak?' 😅",
    tags: ["funny", "customer", "relatable"],
    usedCount: 0,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "hook-10",
    text: "Setup booth dari pagi sampai malam - Worth it! 💪",
    tags: ["hustle", "bts", "motivation"],
    performance: {
      views: 45000,
      likes: 3200,
      shares: 150,
      engagement: 7.4,
    },
    usedCount: 4,
    lastUsed: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const celebrationMessages = [
  "🎉 Tahniah! Milestone achieved!",
  "🚀 Level up! Teruskan momentum!",
  "⭐ Hebat! Ini baru permulaan!",
  "💪 Padu! Keep pushing forward!",
  "🔥 On fire! Jangan stop sekarang!",
  "🌟 Amazing! Customer mesti jatuh cinta!",
  "📈 Growth mode activated!",
  "🎯 Target achieved! Set new goal!",
];

export const defaultBadges: AchievementBadge[] = [
  {
    id: "badge-1",
    title: "Event Rookie",
    description: "Completed your first event.",
    icon: "🥇",
    achieved: false,
  },
  {
    id: "badge-2",
    title: "Content Machine",
    description: "Posted 10 pieces of TikTok content.",
    icon: "🎬",
    achieved: false,
  },
  {
    id: "badge-3",
    title: "Customer Magnet",
    description: "Collected 5 testimonials.",
    icon: "🧲",
    achieved: false,
  },
  {
    id: "badge-4",
    title: "Milestone Hunter",
    description: "Achieved a growth milestone.",
    icon: "📈",
    achieved: false,
  },
];

export const defaultTestimonials: Testimonial[] = [
  {
    id: "test-1",
    customerName: "Aina",
    quote: "Sambal ni memang lain, pedas tapi ada sweet note. Terus repeat!",
    source: "Event booth",
    createdAt: new Date().toISOString(),
  },
  {
    id: "test-2",
    customerName: "Haziq",
    quote: "Makan sekali terus jatuh cinta. Packaging pun lawa.",
    source: "Instagram DM",
    createdAt: new Date().toISOString(),
  },
];

export const successStories: SuccessStory[] = [
  {
    id: "story-1",
    title: "Booth Sold Out in 2 Hours",
    highlight: "Makan Fest 2026 crowd gila-gila. Sambal habis awal!",
    metric: "RM 3,200 sales",
  },
  {
    id: "story-2",
    title: "TikTok Viral Hit",
    highlight: "Hook “Pedas sampai menangis” capai 200k views.",
    metric: "200k views",
  },
];
