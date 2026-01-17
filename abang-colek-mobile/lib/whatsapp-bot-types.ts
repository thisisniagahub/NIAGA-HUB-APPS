export interface WhatsAppConfig {
  adminNumbers: string[];
  businessName: string;
  businessNumber?: string;
  autoReplyEnabled: boolean;
  broadcastEnabled: boolean;
}

export interface MessageTemplate {
  id: string;
  name: string;
  category: "customer_service" | "event" | "lucky_draw" | "order" | "marketing";
  trigger: string[]; // Keywords that trigger this template
  message: string;
  requiresAdmin: boolean;
  variables?: string[]; // Placeholders like {name}, {event}, {prize}
  createdAt: string;
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  message: string;
  timestamp: string;
  type: "incoming" | "outgoing";
  status: "sent" | "delivered" | "read" | "failed";
  category?: string;
  isAutoReply: boolean;
}

export interface CustomerInquiry {
  id: string;
  customerNumber: string;
  customerName?: string;
  inquiry: string;
  category: "product" | "event" | "order" | "lucky_draw" | "general";
  status: "pending" | "replied" | "resolved";
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  customerNumber: string;
  customerName: string;
  registeredVia: "whatsapp" | "form" | "manual";
  confirmed: boolean;
  timestamp: string;
}

export interface OrderMessage {
  id: string;
  customerNumber: string;
  customerName: string;
  orderDetails: string;
  quantity?: number;
  deliveryAddress?: string;
  status: "inquiry" | "confirmed" | "processing" | "delivered";
  timestamp: string;
}

export interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  targetAudience: "all" | "event_attendees" | "lucky_draw_participants" | "customers";
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  deliveredCount: number;
  readCount: number;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
}

export interface BotAnalytics {
  totalMessages: number;
  autoReplies: number;
  manualReplies: number;
  inquiriesResolved: number;
  eventRegistrations: number;
  luckyDrawEntries: number;
  orders: number;
  broadcasts: number;
  averageResponseTime: number; // in minutes
  peakHours: number[];
}

export const defaultWhatsAppConfig: WhatsAppConfig = {
  adminNumbers: ["01168444656", "0178245667"],
  businessName: "Abang Colek",
  autoReplyEnabled: true,
  broadcastEnabled: true,
};
