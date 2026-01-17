# Abang Colek Mobile - Brand OS

**Comprehensive Business Management System for Street Food Brand Operations**

Abang Colek Mobile is a production-ready React Native mobile application built with Expo SDK 54, designed specifically for managing all operational aspects of the Abang Colek street food brand. The application serves as a complete Brand Operating System (Brand OS) that integrates event management, content creation, customer engagement, marketing automation, and business intelligence into a single unified platform.

---

## 📱 Overview

Abang Colek Mobile transforms traditional street food operations into a data-driven, automated business system. The application addresses the unique challenges of managing a fast-growing food brand across multiple event locations, social media platforms, and customer touchpoints. By consolidating booth operations, TikTok content management, lucky draw campaigns, WhatsApp automation, and performance analytics into one mobile-first interface, the system enables founders and team members to run the entire business from their smartphones.

The platform is built on a founder-led brand philosophy, where motivational messaging, growth tracking, and authentic storytelling are embedded throughout the user experience. Every feature reflects the brand's core identity: "PEDAS MANIS STAYS" (spicy-sweet that lingers), combining bold flavors with addictive appeal. The system supports both online and offline operations, ensuring business continuity even in low-connectivity event environments.

---

## 🎯 Core Features

### Dashboard & Business Intelligence

The dashboard provides real-time visibility into business performance with motivational elements integrated throughout. Founders see daily inspirational quotes from the brand's philosophy, quick stats on upcoming events and completed milestones, and growth metrics visualized with celebration themes. The interface uses the brand's signature yellow-red-black color palette and displays the authentic Abang Colek logo prominently. Quick action buttons provide one-tap access to critical functions like adding events, creating TikTok content, managing lucky draws, and accessing WhatsApp automation.

### Event Management System

Event management covers the complete lifecycle from lead generation to post-event analysis. The system tracks event details including dates, locations, booth fees, event organizer contacts, and expected attendance. Status tracking progresses through stages: lead, confirmed, in-progress, and completed. Each event includes customizable checklists for pre-event preparation (equipment, inventory, permits), during-event operations (setup, sales tracking, customer engagement), and post-event tasks (teardown, revenue reconciliation, review collection). Photo attachments document booth setup, crowd engagement, and product displays for future reference and social media content.

### TikTok Hook Library

The TikTok Hook Library serves as a searchable repository of viral content hooks optimized for the food and street culture niche. Each hook includes the complete text, associated tags for categorization, performance metrics showing views, likes, shares and engagement rates, and usage tracking to identify top-performing content. The library supports real-time search filtering, tag-based filtering across categories like reaction, pedas (spicy), viral, storytelling, challenge, testimonial, behind-the-scenes, product showcase, event highlight, and founder story. Hooks can be sorted by popularity, most used, or most recent, and feature one-tap copy-to-clipboard functionality with haptic feedback for seamless content creation workflows.

### Lucky Draw Campaign Management

Lucky draw campaigns drive customer engagement and social media growth through structured giveaway mechanics. Campaign management includes prize definition, entry requirements (follow, share, tag friends, create viral TikTok), start and end dates, and winner selection criteria. The system tracks all entries with verification status, displays real-time statistics on total entries, verified participants, and pending verifications, generates QR codes for easy registration at events, integrates with Google Forms for data collection, and provides random winner selection with audit trails. Campaign dashboards show entry trends and help optimize future promotions.

### WhatsApp Bot & Automation

The WhatsApp Bot system provides 24/7 automated customer engagement through 15+ pre-built message templates across five categories. Customer service templates handle inquiries about products, flavors, locations, and pricing. Event registration templates collect booth visit RSVPs and send location details. Lucky draw templates automate entry confirmations and winner notifications. Order management templates process orders, confirm payments, and provide delivery updates. Marketing broadcast templates announce new flavors, event schedules, and special promotions. All templates support variable replacement for personalization, feature copy-to-clipboard for quick sending, and maintain brand voice with Malay-English code-switching and signature taglines.

### Audio Branding Integration

The application embeds the official Abang Colek brand anthem "Kasi Lagi-Lagi" throughout the user experience. An integrated audio player allows playback of the full jingle with play/pause controls and haptic feedback. A dedicated lyrics screen displays the complete song structure including intro, verses, pre-chorus, chorus, bridge, and outro, highlights key brand phrases like "CHO-LEK!", "PEDAS MANIS STAYS", and "SEKALI RASA YOU KNOW", provides audio identity details including genre (Hip-Hop/Trap), BPM range (85-95), language mix (Malay + English), and production style (tight 808s, crisp percussion, minimal synth), and offers usage guidelines for social media, live events, and marketing materials.

### WOCS (WhatsApp OPS Control System)

WOCS represents the next evolution of business automation, enabling command-center style control of all operations through WhatsApp messages. The system architecture includes a WhatsApp Cloud API webhook for receiving messages, an admin whitelist system restricting commands to authorized phone numbers, a command parser supporting text and voice input with grammar validation, a task engine managing the complete lifecycle from creation to execution, and a MySQL database storing tasks, logs, attachments, landing page versions, and app configurations. Supported command categories include agent task assignment, landing page creation and publishing, app configuration updates, TikTok semi-automated posting, content calendar scheduling, and automated report generation. The system maintains full audit trails, supports task approval workflows, enables scheduled execution with cron expressions, and provides rollback capabilities for critical operations.

---

## 🏗️ Technical Architecture

### Technology Stack

The application is built on **Expo SDK 54** with **React Native 0.81**, providing cross-platform support for iOS, Android, and web from a single codebase. The frontend uses **React 19** with **TypeScript 5.9** for type safety and developer productivity. Styling is handled by **NativeWind 4**, bringing Tailwind CSS utility classes to React Native components. Navigation is powered by **Expo Router 6** with file-based routing and type-safe navigation. Animations leverage **react-native-reanimated 4.x** for smooth 60fps interactions.

The backend runs on **Node.js** with **Express** and **Fastify** for API endpoints. Data persistence uses **MySQL** with **Drizzle ORM** for type-safe database queries and migrations. Authentication is managed through **OAuth** with secure token storage via **expo-secure-store** on native platforms and HTTP-only cookies on web. File storage integrates with **S3-compatible services** for user uploads and media assets. Real-time features are enabled through **WebSocket connections** for task updates and notifications.

State management follows a hybrid approach using **React Context** and **useReducer** for global app state, **AsyncStorage** for local data persistence, **TanStack Query** for server state and caching, and **Zustand** (optional) for complex state machines. The data layer implements an offline-first architecture where all user data is stored locally in AsyncStorage, changes sync to the server when connectivity is available, conflict resolution handles simultaneous edits, and the app remains fully functional without internet access.

### Database Schema

The database schema is organized into three main domains. The **Core Domain** includes the users table for authentication and profile data. The **Brand OS Domain** encompasses tables for events, hooks (TikTok content), lucky draw campaigns and entries, WhatsApp message templates, and app configuration settings. The **WOCS Domain** manages wocs_users for admin and agent access control, wocs_tasks for command execution tracking, wocs_task_logs for complete audit trails, wocs_attachments for media file references, wocs_landing_versions for page version control, and wocs_app_configs for dynamic feature flags.

All tables use **camelCase** column naming to match TypeScript conventions. Primary keys are auto-incrementing integers for performance. Timestamps track creation and update times with automatic maintenance. JSON columns store complex nested data structures. Foreign keys enforce referential integrity across related tables. Indexes optimize common query patterns for status lookups, date ranges, and user filtering.

### API Architecture

The API layer is built with **tRPC** providing end-to-end type safety from server to client. Procedures are organized into logical routers including auth for login and session management, events for CRUD operations on event data, hooks for TikTok content management, luckyDraw for campaign and entry handling, whatsapp for template management and message sending, wocs for command parsing and task execution, and storage for file uploads and retrieval. All procedures use **Zod** for runtime validation of inputs and outputs. Protected procedures require valid authentication tokens. Public procedures allow anonymous access for specific features. Middleware handles error logging, request timing, and CORS policies.

### Security Model

Security is implemented through multiple layers. Authentication uses **OAuth 2.0** with PKCE flow for native apps, session tokens stored in secure hardware-backed storage, automatic token refresh before expiration, and logout clearing all local credentials. Authorization employs role-based access control with user, agent, and admin roles, resource ownership checks ensuring users can only access their own data, admin-only endpoints for sensitive operations, and rate limiting preventing abuse. Data protection includes encryption at rest for sensitive fields, HTTPS-only communication in production, SQL injection prevention through parameterized queries, XSS protection via React's automatic escaping, and CSRF tokens for state-changing operations.

---

## 🚀 Getting Started

### Prerequisites

Before installation, ensure your development environment includes **Node.js 22.x or higher** (check with `node --version`), **pnpm 9.x** as the package manager (install via `npm install -g pnpm`), **Expo CLI** for running the development server (install via `npm install -g expo-cli`), **Expo Go app** installed on your iOS or Android device for testing, **MySQL 8.0+** for the database (local or cloud instance), and optionally **Xcode** (for iOS development on macOS) or **Android Studio** (for Android development).

### Installation Steps

Clone the repository and navigate to the project directory. Install all dependencies by running `pnpm install`, which will download and configure all required packages including React Native, Expo modules, database drivers, and development tools. Copy the environment template with `cp .env.example .env` and configure the following variables: `DATABASE_URL` pointing to your MySQL instance, `EXPO_PUBLIC_API_URL` for the backend API endpoint, `WHATSAPP_VERIFY_TOKEN` for webhook verification, `WHATSAPP_ACCESS_TOKEN` for the Meta Cloud API, and `S3_BUCKET_URL` for file storage.

Run database migrations with `pnpm db:push` to create all required tables and seed initial data including admin users and sample content. Start the development server with `pnpm dev`, which launches both the Metro bundler on port 8081 and the backend API server on port 3000. Open the Expo Go app on your mobile device, scan the QR code displayed in the terminal, and the app will load on your device with hot reload enabled for instant updates during development.

### Development Workflow

The recommended development workflow begins with editing screens in the `app/(tabs)/` directory, where each file represents a tab in the bottom navigation. Modify components in the `components/` directory to create reusable UI elements. Update data models in `lib/types.ts` to define TypeScript interfaces. Add database queries in `server/wocs-db.ts` using Drizzle ORM helpers. Create API endpoints in `server/routers.ts` with tRPC procedures. Test changes instantly with hot reload as you save files. Use the React DevTools browser extension to inspect component state and props. Monitor API calls in the Network tab of browser developer tools. Check TypeScript errors with `pnpm check` before committing code.

### Building for Production

To create production builds, generate Android APK with `pnpm android` or iOS IPA with `pnpm ios` (requires macOS). Configure app signing in `app.config.ts` with your bundle identifiers and provisioning profiles. Update the app version number in `app.config.ts` before each release. Run `pnpm build` to compile the backend server for deployment. Deploy the backend to your hosting provider ensuring environment variables are set. Upload the mobile app to Google Play Store and Apple App Store following their respective submission guidelines. Enable over-the-air updates with Expo Updates for instant bug fixes without app store approval.

---

## 📖 Usage Guide

### Dashboard Navigation

Upon launching the app, users land on the dashboard showing the Abang Colek logo, daily motivational quote from the founder's philosophy, quick stats displaying counts of upcoming events, completed milestones, TikTok hooks in the library, and pending content posts, and quick action buttons for adding new events, creating TikTok content, managing lucky draws, accessing WhatsApp automation, and viewing brand kit materials. The bottom tab bar provides navigation to Home (dashboard), Events (event management), TikTok (hook library), Lucky Draw (campaign management), WhatsApp Bot (automation), and More (settings and brand kit).

### Managing Events

To create a new event, tap the "Add Event" button on the dashboard, fill in event details including name, date, location, booth fee, EO contact, and expected attendance, upload a photo of the event flyer or location, add custom checklist items for preparation and execution, and save the event to the database. During the event, open the event detail screen, check off completed tasks in real-time, take photos of booth setup, crowd engagement, and product displays, track sales and customer interactions, and note any issues or opportunities for improvement. After the event, mark the event as completed, review all photos and notes, calculate final revenue and profit margins, collect customer reviews and testimonials, and export event data for reporting and analysis.

### Creating TikTok Content

Access the TikTok Hook Library from the tab bar to browse all available hooks with performance metrics. Use the search bar to filter hooks by keywords or phrases. Tap tag filters to show only hooks in specific categories like reaction, viral, or testimonial. Sort hooks by popularity to find top performers, by most used to see team favorites, or by most recent to discover new additions. Tap any hook card to view full details including complete text, all associated tags, performance metrics with views, likes, shares, and engagement rate, usage history showing when and how often the hook was used, and copy button for one-tap clipboard access. Create new hooks by tapping the "Add Hook" button, entering the hook text, selecting relevant tags, and saving to the library for team use.

### Running Lucky Draw Campaigns

Create a new campaign by defining the prize and its value, setting entry requirements such as follow the account, share a specific post, tag friends in comments, or create a viral TikTok with the product, specifying start and end dates for the campaign, and generating a QR code for easy registration at events. Promote the campaign through social media posts, event booth signage, WhatsApp broadcasts, and influencer partnerships. Monitor entries in real-time with the campaign dashboard showing total entries, verified participants meeting all requirements, pending verifications needing manual review, and entry trends over time. When the campaign ends, use the random winner selection tool to pick winners fairly, notify winners through WhatsApp automation, verify winner eligibility against entry requirements, announce winners publicly on social media, and document the entire process for transparency and future campaigns.

### WhatsApp Automation

Configure the WhatsApp Bot by connecting your WhatsApp Business account, setting up webhook endpoints for message receiving, adding admin phone numbers to the whitelist, and testing the connection with a sample message. Browse the template library organized by category including customer service, event registration, lucky draw, order management, and marketing broadcasts. Select a template to view the full message text with variable placeholders, customize variables like customer name, event location, or product details, preview the final message before sending, and copy to clipboard for manual sending or trigger automated sending through the bot. Monitor bot performance with analytics showing messages sent, delivery rates, response rates, and customer satisfaction scores. Update templates as needed to improve messaging effectiveness and maintain brand voice consistency.

---

## 🎨 Brand Identity

### Visual Design System

The Abang Colek brand identity is built on a bold, energetic visual language that reflects the product's spicy-sweet flavor profile and street food culture roots. The color palette uses **Colek Yellow (#FFC107)** as the primary brand color representing mango sweetness and energy, **Sambal Red (#E53935)** for spicy intensity and passion, **Midnight Black (#1A1A1A)** for bold contrast and sophistication, **Chili Green (#4CAF50)** for freshness and natural ingredients, and **Cloud White (#FFFFFF)** for clean backgrounds and text clarity.

Typography combines **bold brushstroke lettering** for "ABANG" conveying masculine confidence, **playful rounded lettering** for "COLEX" with the "O" featuring a chili icon, and **handwritten script** for "by liurleleh house" adding personal founder touch. The logo treatment includes a white cloud-like border creating a sticker effect, green chili leaves in corners adding organic elements, and high contrast ensuring visibility on any background.

### Audio Branding

The official brand anthem "Kasi Lagi-Lagi" establishes audio identity through a punchy hip-hop/trap production at 85-95 BPM. The song features a confident chant hook "ABANG CHO-LEK!" that kicks off instantly, layered over tight 808s and crisp percussion. Vocals alternate between Malay and English in short, hyped phrases, creating an infectious, looping anthem perfect for social media and live events. Key brand phrases include "CHO-LEK!" as the signature call, "PEDAS MANIS STAYS" as the core tagline, "SEKALI RASA YOU KNOW" emphasizing instant addiction, and "RASA PADU, PEDAS MENGGAMIT" as the formal descriptor.

### Brand Voice & Messaging

The brand voice balances motivational entrepreneurship with authentic street culture. Messaging emphasizes the founder's journey from one booth to regional expansion, the product's unique spicy-sweet-sticky flavor profile that creates instant addiction, the community aspect of events and customer experiences, and the growth mindset celebrating small wins and big milestones. Content strategy mixes product showcases with behind-the-scenes operations, customer reactions and testimonials, founder motivational messages, event highlights and crowd engagement, and business growth metrics and achievements.

---

## 🔧 Configuration

### Environment Variables

The application requires several environment variables for proper operation. Database configuration includes `DATABASE_URL` in the format `mysql://user:password@host:port/database` for connecting to the MySQL instance. API configuration requires `EXPO_PUBLIC_API_URL` pointing to the backend server (e.g., `https://api.abangcolek.com`), `API_PORT` defaulting to 3000 for local development, and `NODE_ENV` set to `development` or `production`. WhatsApp integration needs `WHATSAPP_VERIFY_TOKEN` for webhook verification, `WHATSAPP_ACCESS_TOKEN` for Meta Cloud API authentication, and `WHATSAPP_PHONE_NUMBER_ID` identifying the business phone number. Storage configuration uses `S3_BUCKET_URL` for file uploads, `S3_ACCESS_KEY` for authentication, and `S3_SECRET_KEY` for secure access. OAuth settings include `OAUTH_CLIENT_ID` for authentication, `OAUTH_CLIENT_SECRET` for secure token exchange, and `OAUTH_REDIRECT_URI` for callback handling.

### App Configuration

The `app.config.ts` file controls app-level settings including `appName` displayed in the app launcher and headers, `appSlug` used as a unique identifier (do not change after deployment), `logoUrl` pointing to the S3-hosted app icon, `scheme` for deep linking (format: `ac{timestamp}`), `iosBundleId` and `androidPackage` for platform-specific identifiers, `version` following semantic versioning (e.g., `1.0.0`), and `orientation` locked to `portrait` for optimal mobile experience.

### Theme Configuration

The `theme.config.js` file defines color tokens used throughout the app. Light mode colors include `primary` (#0a7ea4) for accent elements, `background` (#ffffff) for screen backgrounds, `surface` (#f5f5f5) for cards and elevated elements, `foreground` (#11181C) for primary text, `muted` (#687076) for secondary text, `border` (#E5E7EB) for dividers and outlines, `success` (#22C55E) for positive actions, `warning` (#F59E0B) for caution states, and `error` (#EF4444) for error messages. Dark mode provides alternative values for each token, automatically applied based on system preferences. Custom brand colors can be added by extending the `themeColors` object and updating `theme.config.d.ts` for TypeScript support.

---

## 🧪 Testing

### Unit Testing

Unit tests are written with **Vitest** and located in the `tests/` directory. Run all tests with `pnpm test` or watch mode with `pnpm test --watch`. Test coverage is generated with `pnpm test --coverage`. Critical areas to test include database helper functions in `server/wocs-db.ts`, API procedures in `server/routers.ts`, data transformation logic in `lib/` utilities, component rendering and user interactions, form validation and error handling, and authentication flows including login, logout, and token refresh.

### Integration Testing

Integration tests verify end-to-end workflows across multiple system components. Test scenarios include creating an event, adding checklist items, marking tasks complete, and uploading photos; searching for hooks, filtering by tags, copying to clipboard, and tracking usage; launching a campaign, registering entries, verifying requirements, and selecting winners; sending WhatsApp messages, handling responses, and tracking delivery; and submitting WOCS commands, parsing syntax, executing tasks, and logging results.

### Manual Testing Checklist

Before each release, manually verify core functionality on both iOS and Android devices. Test app launch and splash screen display, authentication flow with login and logout, navigation between all tabs, data persistence after app restart, offline functionality without internet, file uploads and downloads, push notifications, deep linking from external URLs, and accessibility with VoiceOver and TalkBack screen readers.

---

## 📊 Analytics & Monitoring

### Performance Metrics

The application tracks key performance indicators to measure business success and user engagement. Event metrics include total events per month, average booth fee revenue, customer attendance per event, and conversion rate from lead to confirmed. Content metrics measure TikTok hooks created, hook usage frequency, average engagement rate, and viral content percentage. Campaign metrics track lucky draw entries, verification completion rate, winner selection time, and social media reach. Automation metrics monitor WhatsApp messages sent, delivery success rate, response time, and customer satisfaction scores.

### Error Tracking

Production errors are logged and monitored through integrated error tracking services. Frontend errors capture component crashes, unhandled promise rejections, network failures, and user-reported issues. Backend errors log API endpoint failures, database connection issues, third-party service outages, and authentication problems. All errors include contextual information such as user ID, device type, app version, timestamp, and stack trace. Critical errors trigger immediate alerts to the development team for rapid response.

### User Analytics

User behavior is tracked to understand engagement patterns and optimize the user experience. Session analytics measure daily active users, session duration, screen views per session, and feature adoption rates. Interaction analytics track button taps, form submissions, search queries, and navigation paths. Retention analytics calculate day 1, day 7, and day 30 retention rates, identify churn risk factors, and measure feature stickiness. All analytics respect user privacy with opt-in consent, data anonymization, and compliance with GDPR and CCPA regulations.

---

## 🤝 Contributing

Contributions to the Abang Colek Mobile project are welcome from the development community. Before submitting changes, review the existing codebase to understand architectural patterns, read the PRD.md and ARCHITECTURE.md documents for context, check the todo.md file for planned features and known issues, and join the project Discord or Slack channel for discussions. When contributing code, fork the repository and create a feature branch, write tests for new functionality, ensure all tests pass with `pnpm test`, run the linter with `pnpm lint` and fix any issues, update documentation to reflect changes, and submit a pull request with a clear description of the changes and their purpose.

---

## 📄 License

This project is proprietary software owned by Liurleleh House. All rights reserved. Unauthorized copying, distribution, or modification of this software is strictly prohibited. For licensing inquiries, contact the project maintainers.

---

## 📞 Support

For technical support, bug reports, or feature requests, please contact the development team through the following channels: email at support@abangcolek.com, GitHub Issues at https://github.com/cornmanwtf/ABANG-COLEK/issues, or WhatsApp at +60 11-6844 4656 (Admin 1) or +60 17-824 5667 (Admin 2). Response times are typically within 24 hours for critical issues and 48-72 hours for general inquiries.

---

**Built with ❤️ by the Abang Colek Team**

*Rasa Sekali, Jatuh Cinta Selamanya* 🌶️🥭
