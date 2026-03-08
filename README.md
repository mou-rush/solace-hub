# SolaceHub

> **Your personal AI therapist, available anytime.**

SolaceHub is an AI-powered mental health support platform built with Next.js 15 and TypeScript. It provides accessible, compassionate mental health support through conversational AI, mood tracking, guided journaling, and a personalised wellness dashboard — all backed by Firebase and Google's Gemini AI.

---

## Table of Contents

1. [Purpose & Problem Statement](#1-purpose--problem-statement)
2. [Architecture Overview](#2-architecture-overview)
3. [Frontend Components & Interactions](#3-frontend-components--interactions)
4. [State Management & Data Flow](#4-state-management--data-flow)
5. [User Data Storage & Processing](#5-user-data-storage--processing)
6. [Dashboard & Visualisations](#6-dashboard--visualisations)
7. [Design Patterns & Reusable Components](#7-design-patterns--reusable-components)
8. [Performance & UX Decisions](#8-performance--ux-decisions)
9. [Potential Production Improvements](#9-potential-production-improvements)
10. [Loom Video Script](#10-loom-video-script-12-minutes)
11. [Getting Started](#11-getting-started)

---

## 1. Purpose & Problem Statement

Mental health care is expensive, under-resourced, and often carries stigma that prevents people from seeking help. Waiting lists for licensed therapists can stretch months, and many people simply cannot afford regular sessions.

**SolaceHub** bridges that gap by offering:

- **Always-available AI therapy sessions** powered by Google Gemini 2.0, with four selectable response styles (compassionate, balanced, direct, reflective)
- **Mood tracking** so users can log their emotional state daily and see trends over time
- **AI-assisted journaling** with automatic insight generation from written entries
- **Curated mental-health resources** including crisis helplines and coping guides
- **A personal wellness dashboard** surfacing key metrics (sessions, mood trend, journal streak)

The platform does **not** replace licensed therapists; it acts as an accessible first layer of support and a safe space for self-reflection.

---

## 2. Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│                        Next.js 15 (App Router)             │
│   ┌──────────────┐  ┌────────────────┐  ┌──────────────┐  │
│   │  Landing /   │  │  Auth pages    │  │  Dashboard   │  │
│   │  Marketing   │  │  (login/signup)│  │  (protected) │  │
│   └──────────────┘  └────────────────┘  └──────┬───────┘  │
│                                                 │          │
│         ┌───────────────────────────────────────┤          │
│         │          Zustand Stores (5)            │          │
│         │  auth · app · session · mood · journal │          │
│         └───────────────────────────────────────┘          │
│                         │                                   │
│    ┌────────────────────┼───────────────────┐              │
│    ▼                    ▼                   ▼              │
│  Firebase Auth    Firebase Firestore    Google Gemini AI   │
│  (email/pass)     (realtime data)       (Gemini 2.0 Flash) │
│                         │                   │              │
│                         │            ┌──────┴────────┐     │
│                         │            │  RAG Service  │     │
│                         │            │  Sentiment AI │     │
│                         │            │  Context Mgr  │     │
│                         │            └───────────────┘     │
└────────────────────────────────────────────────────────────┘
```

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, React 19) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Radix UI primitives) |
| State Management | Zustand (with `persist` and `subscribeWithSelector` middleware) |
| Auth & Database | Firebase Authentication + Cloud Firestore + Cloud Storage |
| AI | Google Generative AI (Gemini 2.0 Flash) |
| AI Enhancement | Custom RAG service, Sentiment Analyser, Context Manager |
| External API | ZenQuotes (`/api/today`) for daily motivational tips |
| Voice (optional) | Vapi AI (`@vapi-ai/web`) |

---

## 3. Frontend Components & Interactions

### Application Shell

```
app/
├── page.tsx                  # Public landing page (Hero, Features, How It Works)
├── login/page.tsx            # Firebase email/password sign-in
├── signup/page.tsx           # Firebase account creation
└── dashboard/
    ├── layout.tsx            # Protected shell — mounts <Sidebar /> + main content
    ├── page.tsx              # Dashboard overview (StatCard, ActionCard, DailyTipCard)
    ├── chat/page.tsx         # AI therapy chat session
    ├── mood/page.tsx         # Mood tracking form + history
    ├── journal/page.tsx      # AI-assisted journaling
    ├── resources/page.tsx    # Mental health resources list
    └── settings/page.tsx     # User preferences (profile, appearance, privacy…)
```

### Key Component Map

| Component | Location | Responsibility |
|---|---|---|
| `Sidebar` | `components/layout/Sidebar.tsx` | Collapsible desktop nav + mobile drawer; shows streak badge |
| `TherapySession` | `components/therapySession/TherapySession.tsx` | Main AI chat UI; manages real-time Firestore messages |
| `ChatForm` | `components/therapySession/ChatForm.tsx` | Message input, send button, suggestion chips |
| `AISettings` | `components/therapySession/AISettings.tsx` | Response-style selector, enhanced-mode toggle |
| `SessionHistory` | `components/therapySession/SessionHistory.tsx` | List of past sessions from Firestore |
| `InsightPanel` | `components/ai-insights/InsightPanel.tsx` | Modal: sentiment trend, key themes, recommendations |
| `MoodTracker` | `components/mood/Mood.tsx` | 5-point emoji mood selector + Firestore persistence |
| `Journal` | `components/journal/Journal.tsx` | Rich text journal with AI-generated insights per entry |
| `StatCard` | `components/dashboard/StatCard.tsx` | 4 KPI tiles: mood, sessions, journal entries, streak |
| `DashboardHeader` | `components/dashboard/DashboardHeader.tsx` | Time-based greeting + user name |
| `DailyTipCard` | `components/dashboard/DailyTipCard.tsx` | Motivational quote from ZenQuotes |
| `Settings` | `components/settings/Settings.tsx` | Tabbed settings (profile, appearance, notifications, privacy, security) |

### Component Interaction Flow (Chat)

```
TherapySession
 ├── reads/writes: useSessionStore (Zustand)
 ├── reads/writes: Firebase Firestore (messages, session metadata)
 ├── renders: MoodSelector, SessionControls, ChatForm, SessionHistory
 ├── renders: SessionNotesPanel, AISettings, MessageFeedback
 └── on 5 new messages → triggers InsightsModal (InsightPanel)
         └── calls: getConversationInsights(), getMoodBasedRecommendations(),
                    searchMentalHealthResources() from lib/ai/ai-service.ts
```

---

## 4. State Management & Data Flow

State is managed with **Zustand** across five purpose-built stores, all exported from `stores/index.ts`:

### Store Overview

| Store | File | Persisted | Description |
|---|---|---|---|
| `useAuthStore` | `stores/auth-store.ts` | ✅ user object only | Holds Firebase `User`, loading flag, `signOut` action |
| `useAppStore` | `stores/app-store.ts` | ❌ in-memory | Theme, sidebar state, notification queue (auto-dismiss) |
| `useSessionStore` | `stores/session-store.ts` | ✅ AI prefs only | All therapy-session UI flags, goals, notes, AI response style |
| `useMoodStore` | `stores/mood-store.ts` | ✅ full | Mood entries array + `getMoodTrend()` computed value |
| `useJournalStore` | `stores/journal-store.ts` | ✅ full | Journal entries CRUD |

### Data Flow Diagram

```
User Action
    │
    ▼
React Component
    │  (reads/writes)
    ▼
Zustand Store ──────── (persist middleware) ──► localStorage
    │
    │  (async side-effects for remote data)
    ▼
Firebase Firestore / Google Gemini AI
    │
    │  (onSnapshot callbacks → setState)
    ▼
Re-render
```

**Key pattern:** Local Zustand stores act as the single source of truth for UI state and offline-first data. Firebase Firestore stores the authoritative remote data and pushes live updates back to components via `onSnapshot` listeners, which then update local React `useState`.

---

## 5. User Data Storage & Processing

### Firebase Firestore Schema

```
moods/
  {userId}
    entries: [
      { mood: "😊 Great", notes: "...", timestamp: ISO string }
    ]

users/
  {userId}/
    sessions/
      {sessionId}
        theme, date, notes, goals[], lastUpdated
        messages/
          {messageId}
            text, sender ("user"|"ai"), timestamp

    journal/
      {entryId}
        entries: [
          { title, content, tag, insight, timestamp }
        ]
```

### AI Processing Pipeline

When a user sends a chat message, the following pipeline runs in `lib/ai/ai-service.ts` → `lib/ai/enhanced-ai-service.ts`:

```
User message
    │
    ▼
SentimentAnalyzer.analyzeSentiment(text)
  └─ Lexicon-based scoring → { score, label, emotions: {anxiety, depression, happiness…} }
    │
    ▼
RAGService.query(text, userId, history)
  └─ VectorStore.search() → retrieves relevant mental-health knowledge chunks
  └─ ContextManager.updateContext() → extracts themes, mood patterns, builds conversationSummary
  └─ Gemini 2.0 Flash → generates answer grounded in retrieved knowledge
    │
    ▼
generateRecommendations() → personalised coping suggestions
    │
    ▼
EnhancedAIResponse { response, sentiment, sources, recommendations, context }
```

### Mood Trend Calculation (`useMoodStore.getMoodTrend`)

The store computes an `"improving" | "declining" | "stable"` trend by comparing the average numeric score of the 5 most-recent entries against the previous 5 entries, using a simple emoji-to-integer mapping (😊=5, 😌=4, 😐=3, 😔=2, 😢=1).

---

## 6. Dashboard & Visualisations

The `app/dashboard/page.tsx` page queries Firestore on mount (no real-time subscription, single fetch) and builds the following UI:

```
DashboardHeader       ← personalised greeting (morning / afternoon / evening)
StatCard (×4)         ← Mental Wellness Score · Active Sessions · Journal Insights · Streak
ActionCard            ← quick-link buttons to Chat / Mood / Journal
DailyTipCard          ← quote fetched from zenquotes.io via internal API proxy
```

### StatCard Metrics

| Tile | Source | Computed From |
|---|---|---|
| Mental Wellness Score | Firestore `moods/{uid}` | Last mood entry emoji label |
| Active Sessions | Firestore `users/{uid}/sessions` | `chatSnapshot.size` (collection count) |
| Journal Insights | Firestore `users/{uid}/journal` | Sum of `entries` arrays across all documents |
| Consistency Streak | Firestore `moods/{uid}` | Set of unique `toDateString()` values in mood entries |

The `InsightPanel` modal (triggered after every 5 new chat messages) renders:
- **Sentiment trend** tab — improving / declining / stable label + average score
- **Key themes** tab — top conversation topics extracted by `ContextManager`
- **Recommendations** tab — personalised coping strategies from Gemini
- **Resources** tab — matched knowledge-base articles (RAG sources)

---

## 7. Design Patterns & Reusable Components

### shadcn/ui Component Library

All primitive UI elements (`Button`, `Card`, `Dialog`, `Tabs`, `Badge`, `Progress`, `Textarea`, etc.) are sourced from **shadcn/ui** — a collection of copy-owned, accessible components built on Radix UI and styled with Tailwind. This gives the app a consistent design language without a CSS-in-JS runtime cost.

### Notification System

A custom notification queue lives in `useAppStore`. Components call `addNotification({ title, description, variant })` and the `ToastProvider` renders them via `sonner`. Notifications auto-dismiss after 5 seconds (configurable with `duration: Infinity`).

### RAG (Retrieval-Augmented Generation)

The `RAGService` maintains an in-memory `VectorStore` pre-loaded with a mental-health knowledge base (anxiety, depression, breathing techniques, grounding, CBT, mindfulness…). On each user message, semantically relevant chunks are retrieved and injected into the Gemini prompt — grounding responses in evidence-based information rather than relying on pure model recall.

### Context Manager

`ContextManager` maintains short-term (last 20 messages) and long-term (key insights, recurring themes, goals) conversation memory per user in `localStorage`. This lets the AI reference earlier themes even in new sessions.

### Skeleton Loading

`DashboardSkeleton` renders placeholder shimmer cards while Firestore data loads, preventing layout shift.

### Responsive Sidebar

`Sidebar` renders as a collapsible rail on desktop (icon-only when collapsed) and as a slide-over drawer on mobile, controlled by `useAppStore.sidebarExpanded` and `sidebarMobileOpen`.

---

## 8. Performance & UX Decisions

| Decision | Rationale |
|---|---|
| **Zustand over Redux/Context** | Minimal boilerplate, no Provider wrapping, direct store subscriptions reduce unnecessary re-renders |
| **Firebase `onSnapshot`** in TherapySession | Real-time message delivery without polling; automatic cleanup via returned `unsubscribe` |
| **Single-fetch on Dashboard** | Dashboard data is read-only on load; `onSnapshot` is reserved for the chat where real-time matters |
| **`persist` middleware for user data** | Mood and journal entries are available offline instantly; Firestore is the source of truth for sync |
| **Lazy AI service initialisation** | `EnhancedAIService` and `SentimentAnalyzer` are instantiated on first use, not at app boot, keeping TTI low |
| **Skeleton screens** | `DashboardSkeleton` prevents cumulative layout shift (CLS) during async Firestore fetches |
| **Dark / light / system theme** | `useAppStore.setTheme` writes to `document.documentElement.classList` directly; no flash on navigation |
| **Audio feedback** | `playSuccessSound()` on login, signup, and sign-out provides a satisfying micro-interaction |
| **`subscribeWithSelector` on AppStore** | Allows components to subscribe to a specific slice (e.g. only `notifications`) without re-rendering on unrelated state changes |

---

## 9. Potential Production Improvements

### Security

> 🔴 **CRITICAL:** `NEXT_PUBLIC_GOOGLE_AI_API_KEY` is currently exposed to the browser. **Do not deploy to production without moving this key server-side first** (see first bullet below).

- **Move AI API key server-side.** `NEXT_PUBLIC_GOOGLE_AI_API_KEY` is currently exposed to the browser. All Gemini calls should be proxied through a Next.js Route Handler so the key never leaves the server.
- **Firebase Security Rules.** Firestore rules should be tightened to `allow read, write: if request.auth.uid == userId` on every collection to prevent cross-user data access.
- **Rate limiting.** The AI Route Handler should rate-limit per user to prevent abuse.
- **HIPAA / GDPR considerations.** Mental health data is highly sensitive. The app needs a clear data retention policy, right-to-deletion flow, and potentially end-to-end encryption for journal entries.

### Features

- **Sleep tracking.** Mentioned in the platform vision but not yet implemented; a `sleepStore` + Firestore `sleep/{uid}` collection would complete the core health-data triad.
- **Anxiety level tracking.** The `SentimentAnalyzer` already detects anxiety signals; these could be surfaced as a dedicated chart on the dashboard.
- **Real mood-trend chart.** Replace the text-based `getMoodTrend()` with a `recharts` `LineChart` over time (the library is already installed).
- **Fix hardcoded streak/progressValue in Sidebar.** `components/layout/Sidebar.tsx` currently has `const [streak] = useState(7)` and `const [progressValue] = useState(68)` marked with a `//ToDo` comment in the source code. These should read from `useMoodStore` or Firestore so the sidebar reflects real user data.
- **Vapi voice sessions.** `@vapi-ai/web` is installed but integration is incomplete; voice-based therapy could be a key differentiator.

### Reliability & Scalability

- **Test infrastructure.** There are currently no tests. Adding Jest + React Testing Library for unit tests and Playwright for end-to-end tests would be the first step toward CI/CD confidence.
- **Error boundaries.** React `ErrorBoundary` components should wrap the Dashboard and TherapySession to gracefully handle Firestore or AI failures.
- **Optimistic UI updates.** Mood and journal submissions currently wait for Firestore confirmation; optimistic local updates + rollback on error would feel snappier.
- **Server-Side Rendering for dashboard.** Using React Server Components to pre-fetch Firestore stats would improve LCP and eliminate the skeleton screen for authenticated users.
- **Monitoring & observability.** Sentry for error tracking + Firebase Performance Monitoring for API latency.

---

## 10. Loom Video Script (1–2 Minutes)

> *Use this as a guide for your Loom recording when presenting SolaceHub to a CTO.*

---

**[0:00 – 0:15] Hook**

> "Hi — I built SolaceHub, an AI-powered mental health companion. The problem I'm solving is simple: most people can't afford or access a therapist on demand. SolaceHub provides a safe, always-available first layer of support."

**[0:15 – 0:35] Architecture in 15 seconds**

> "The stack is Next.js 15 with the App Router, TypeScript, Firebase for auth and real-time data, and Google's Gemini 2.0 Flash as the AI brain. State is managed with Zustand — five purpose-built stores that keep UI snappy with zero boilerplate."

**[0:35 – 0:55] Key features demo (show screen)**

> "Users can start an AI therapy session — the AI uses a RAG pipeline that grounds responses in a mental-health knowledge base, and a sentiment analyser tracks emotional signals across the conversation. There's also mood tracking — five emoji check-ins that build a trend over time — and an AI-assisted journal that generates insights from written entries."

**[0:55 – 1:10] Dashboard**

> "The dashboard aggregates all of this into four KPIs: mood score, active sessions, journal entries, and a daily consistency streak — all pulled live from Firestore. After every five messages, an Insights panel surfaces sentiment trends, key conversation themes, and personalised coping recommendations."

**[1:10 – 1:30] What I'd do next**

> "For production, the three things I'd tackle first are: moving the AI key server-side so it's never exposed to the browser, adding a proper test suite, and completing the sleep-tracking module to round out the health-data picture. The foundation is solid — clean component architecture, real-time data, and a meaningful AI pipeline. I'm excited to show you more."

---

## 11. Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project (Auth + Firestore + Storage enabled)
- A Google AI Studio API key (Gemini) — get one at [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### Environment Variables

Create `.env.local` at the project root:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Google Gemini AI
NEXT_PUBLIC_GOOGLE_AI_API_KEY=
```

> ⚠️ **Note:** `NEXT_PUBLIC_GOOGLE_AI_API_KEY` is currently client-side. See [§ 9 Security](#9-potential-production-improvements) for the recommended server-side migration.

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

*Built with ❤️ using Next.js, Firebase, and Google Gemini AI.*
