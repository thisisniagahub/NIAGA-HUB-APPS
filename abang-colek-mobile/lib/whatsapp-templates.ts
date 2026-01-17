import type { MessageTemplate } from "./whatsapp-bot-types";

export const messageTemplates: MessageTemplate[] = [
  // CUSTOMER SERVICE
  {
    id: "cs-welcome",
    name: "Welcome Message",
    category: "customer_service",
    trigger: ["hi", "hello", "hey", "assalamualaikum", "salam"],
    message: `Assalamualaikum! 🌶️

Terima kasih kerana hubungi *Abang Colek*!

Kami ada untuk bantu anda:
1️⃣ Info produk & harga
2️⃣ Lokasi event & booth
3️⃣ Lucky draw & promosi
4️⃣ Tempah order

_"PEDAS MANIS STAYS"_ 🥭🌶️

Sila taip nombor atau soalan anda!`,
    requiresAdmin: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cs-product-info",
    name: "Product Information",
    category: "customer_service",
    trigger: ["produk", "product", "sambal", "harga", "price", "berapa"],
    message: `🌶️ *ABANG COLEK - SAMBAL COLEK*

✨ *Produk Kami:*
• Sambal Colek Original (Pedas Manis)
• Sambal Colek Extra Pedas
• Sambal Colek Mango Twist

📦 *Saiz & Harga:*
• 250ml - RM15
• 500ml - RM28
• 1L - RM50

🎁 *Promo:*
Beli 3 botol FREE 1 botol!

💬 Nak order? Reply "ORDER" untuk teruskan!`,
    requiresAdmin: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cs-location",
    name: "Event Location",
    category: "customer_service",
    trigger: ["lokasi", "location", "event", "booth", "mana", "where"],
    message: `📍 *LOKASI BOOTH ABANG COLEK*

Kami ada di event-event berikut:

📅 *Event Semasa:*
{current_events}

📢 Follow TikTok kami untuk update terkini:
@styloairpool

🔔 Nak notification event? Reply "DAFTAR EVENT"`,
    requiresAdmin: false,
    variables: ["current_events"],
    createdAt: new Date().toISOString(),
  },

  // EVENT REGISTRATION
  {
    id: "event-register",
    name: "Event Registration",
    category: "event",
    trigger: ["daftar event", "register event", "join event"],
    message: `📝 *PENDAFTARAN EVENT*

Terima kasih! Untuk daftar event, sila bagi info:

1. Nama penuh:
2. Nombor telefon:
3. Event yang nak join:

Contoh:
Ahmad bin Ali
0123456789
Makan Fest 2026

Admin kami akan confirm dalam 24 jam! ✅`,
    requiresAdmin: false,
    createdAt: new Date().toISOString(),
  },

  // LUCKY DRAW
  {
    id: "lucky-draw-info",
    name: "Lucky Draw Information",
    category: "lucky_draw",
    trigger: ["lucky draw", "cabutan", "contest", "hadiah", "prize", "menang"],
    message: `🎁 *LUCKY DRAW ABANG COLEK*

*Hadiah Utama:*
1 TAHUN SUPPLY ABANG COLEK FREE!
(12 botol x 12 bulan)

*Cara Join:*
1️⃣ Follow @styloairpool di TikTok
2️⃣ Share video ke story
3️⃣ Tag 3 kawan dalam comment
4️⃣ Isi Google Form: {form_link}

*Tarikh Akhir:* {end_date}

Reply "JOIN LUCKY DRAW" untuk link form!`,
    requiresAdmin: false,
    variables: ["form_link", "end_date"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "lucky-draw-join",
    name: "Lucky Draw Join",
    category: "lucky_draw",
    trigger: ["join lucky draw", "join cabutan", "nak join"],
    message: `🎉 *JOIN LUCKY DRAW SEKARANG!*

Klik link ni untuk isi form:
{form_link}

*Jangan lupa:*
✅ Follow @styloairpool
✅ Share video ke story
✅ Tag 3 kawan

Semoga berjaya! 🍀

_"Sekali rasa, you know. Pedas manis stays."_`,
    requiresAdmin: false,
    variables: ["form_link"],
    createdAt: new Date().toISOString(),
  },

  // ORDER MANAGEMENT
  {
    id: "order-inquiry",
    name: "Order Inquiry",
    category: "order",
    trigger: ["order", "beli", "buy", "nak beli", "tempah", "booking"],
    message: `🛒 *TEMPAHAN ABANG COLEK*

Terima kasih nak order! 

Sila bagi maklumat:
1. Produk & saiz:
2. Kuantiti:
3. Alamat penghantaran:
4. Nama penerima:
5. Nombor telefon:

Contoh:
Sambal Colek Original 500ml
3 botol
123 Jalan Merdeka, KL
Ahmad
0123456789

Admin akan quote harga + postage! 📦`,
    requiresAdmin: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "order-confirmation",
    name: "Order Confirmation",
    category: "order",
    message: `✅ *ORDER CONFIRMED*

Terima kasih {customer_name}!

*Order Details:*
{order_details}

*Total: RM{total}*
(Termasuk postage)

*Payment:*
Bank: Maybank
Acc: 1234567890
Name: Liurleleh House

Sila upload resit selepas payment!

Tracking number akan dihantar dalam 1-2 hari. 📦`,
    trigger: [],
    requiresAdmin: true,
    variables: ["customer_name", "order_details", "total"],
    createdAt: new Date().toISOString(),
  },

  // MARKETING BROADCASTS
  {
    id: "marketing-new-flavor",
    name: "New Flavor Launch",
    category: "marketing",
    trigger: [],
    message: `🎉 *NEW FLAVOR ALERT!*

Introducing: *Sambal Colek Mango Twist* 🥭🌶️

Pedas + Manis + Masam = PERFECT COMBO!

*Special Launch Price:*
500ml - RM25 (Save RM3!)

*Limited Time Only!*

Order sekarang:
Reply "ORDER MANGO"

_"Dari dapur rumah ke seluruh Malaysia - Mimpi boleh jadi kenyataan"_ 📈`,
    requiresAdmin: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "marketing-event-announcement",
    name: "Event Announcement",
    category: "marketing",
    trigger: [],
    message: `📢 *EVENT ANNOUNCEMENT*

Jumpa kami di:
*{event_name}*

📅 {event_date}
📍 {event_location}
⏰ {event_time}

*Special Promo:*
🎁 FREE tasting
🎁 Beli 2 FREE 1
🎁 Lucky draw on-site!

Jangan lepas peluang! See you there! 🌶️

_"Event penuh, booth kita pack. Queue panjang, semua datang back!"_`,
    requiresAdmin: true,
    variables: ["event_name", "event_date", "event_location", "event_time"],
    createdAt: new Date().toISOString(),
  },

  // ADMIN NOTIFICATIONS
  {
    id: "admin-new-inquiry",
    name: "Admin New Inquiry Notification",
    category: "customer_service",
    trigger: [],
    message: `🔔 *NEW CUSTOMER INQUIRY*

From: {customer_number}
Message: {customer_message}
Time: {timestamp}

Reply via app to respond!`,
    requiresAdmin: true,
    variables: ["customer_number", "customer_message", "timestamp"],
    createdAt: new Date().toISOString(),
  },
];

export function findTemplateByTrigger(message: string): MessageTemplate | null {
  const lowerMessage = message.toLowerCase().trim();
  
  for (const template of messageTemplates) {
    if (template.trigger.length === 0) continue;
    
    for (const trigger of template.trigger) {
      if (lowerMessage.includes(trigger.toLowerCase())) {
        return template;
      }
    }
  }
  
  return null;
}

export function replaceVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  
  return result;
}
