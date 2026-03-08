<div align="center">
  <h1>🧠 SolaceHub</h1>
  <p><strong>Your personal AI therapist, available anytime.</strong></p>
  <p>
    SolaceHub is a compassionate, AI-powered mental health platform offering voice and text therapy sessions, mood tracking, journaling, real-time sentiment analysis, and curated wellness resources — all in one place.
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js 15" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase" alt="Firebase" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?logo=tailwindcss" alt="Tailwind CSS" />
  </p>
</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup](#frontend-setup)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Contributing](#contributing)

---

## Overview

SolaceHub is a full-stack mental health support application that combines AI-driven therapy, emotional tracking, and professional resources into a single, privacy-conscious platform. It is designed to provide accessible mental health support for users at any time, with a focus on empathy, personalization, and continuous improvement.

---

## Features

### 🤖 AI Therapy Sessions

- Text-based and **voice-powered**(Under development) conversations with an AI therapist via [Vapi AI](https://vapi.ai)
- Powered by **Google Gemini** for contextual, empathetic responses
- Session history, session notes, and goal tracking
- Configurable AI settings and session themes
- Post-session AI-generated insights

### 📊 Real-Time Sentiment Analysis

- WebSocket-powered live sentiment monitoring during sessions
- Tracks sentiment trends (improving / stable / declining) across a session
- Visual confidence scoring and sentiment badges

### 📅 Mood Tracker

- Log daily moods (Great → Struggling) with optional notes
- View mood history and streaks via charts (Recharts)
- Firebase Firestore persistence per user

### 📓 Journaling

- Private journal entries organized by date
- Rich-text support and per-user Firestore storage

### 📚 Resources

- Curated mental health articles covering anxiety, depression, mindfulness, and more
- Emergency contact resources (localized for Namibia, expandable globally)
- LGBTQIA+ and crisis support links
- Wellness tools and self-help guides

### 🛡️ Authentication & Privacy

- Firebase Authentication (email/password)
- User-specific, isolated data collections in Firestore
- Privacy and security settings panel

### ⚙️ Settings & Personalization

- Profile management
- Appearance settings (light / dark / system theme via `next-themes`)
- Notification preferences
- Security and privacy controls

### 📈 Dashboard

- At-a-glance stats: last mood, therapy session count, journal entry count, and streak
- Daily motivational quotes fetched from [ZenQuotes API](https://zenquotes.io)
- Quick-access action cards to all major features

---

## Tech Stack

### Frontend

| Technology                                                         | Purpose                 |
| ------------------------------------------------------------------ | ----------------------- |
| [Next.js 15](https://nextjs.org) (App Router)                      | Framework & routing     |
| [React 19](https://react.dev)                                      | UI library              |
| [TypeScript](https://www.typescriptlang.org)                       | Type safety             |
| [Tailwind CSS](https://tailwindcss.com)                            | Styling                 |
| [shadcn/ui](https://ui.shadcn.com) + Radix UI                      | Component library       |
| [Zustand](https://zustand-demo.pmnd.rs)                            | Global state management |
| [Firebase](https://firebase.google.com) (Auth, Firestore, Storage) | Backend-as-a-service    |
| [Google Generative AI (Gemini)](https://ai.google.dev)             | AI chat responses       |
| [Vapi AI](https://vapi.ai)                                         | Voice AI sessions       |
| [Recharts](https://recharts.org)                                   | Data visualization      |
| [React Hook Form](https://react-hook-form.com) + Zod               | Form validation         |
| [date-fns](https://date-fns.org)                                   | Date utilities          |
| [Lucide React](https://lucide.dev)                                 | Icons                   |

---

## Project Structure

```
solacehub/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Landing page
│   ├── layout.tsx              # Root layout
│   ├── globals.css
│   ├── api/                    # Next.js API routes
│   │   ├── ai/                 # AI integration endpoints
│   │   └── daily-quote/        # Daily quote endpoint
│   ├── dashboard/              # Protected dashboard routes
│   │   ├── chat/               # Therapy session page
│   │   ├── journal/            # Journal page
│   │   ├── mood/               # Mood tracker page
│   │   ├── resources/          # Resources page
│   │   └── settings/           # Settings page
│   ├── login/
│   └── signup/
├── components/                 # Reusable React components
│   ├── dashboard/              # Dashboard widgets
│   ├── therapySession/         # Therapy chat components
│   ├── mood/                   # Mood tracker
│   ├── journal/                # Journal editor
│   ├── resources/              # Resource library
│   ├── settings/               # Settings panels
│   ├── sidebar/                # Navigation sidebar
│   ├── ai-insights/            # AI insight panels
│   ├── RealTimeSentiment.tsx   # Live sentiment display
│   └── ui/                     # shadcn/ui primitives
├── stores/                     # Zustand state stores
│   ├── auth-store.ts
│   ├── session-store.ts
│   ├── mood-store.ts
│   ├── journal-store.ts
│   └── app-store.ts
├── lib/                        # Utilities and service clients
│   ├── firebase.ts
│   ├── ai/
│   ├── api/
│   ├── hooks/
│   └── utils/

└── public/                     # Static assets
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- Firebase project (Auth + Firestore + Storage enabled)
- Google Gemini API key

---

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/mou-rush/solace-hub
cd solacehub

# Install dependencies
npm install

# Start the development server
npm rub dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

### Environment Variables

Create a `.env.local` file in the root directory:

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


## Usage

1. **Sign up** for an account or **log in** at `/login`.
2. Navigate the **Dashboard** to view your stats and daily quote.
3. Start an **AI therapy session** in the Chat section — choose text or voice mode.
4. Log your daily **mood** and review your emotional history.
5. Write **journal entries** to reflect on your day.
6. Explore **Resources** for articles, emergency contacts, and self-help tools.
7. Customize your experience via **Settings**.

---

## Contributing

Contributions are welcome! Please open an issue first to discuss what you would like to change, then submit a pull request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

---

```

<div align="center">
  Made with ❤️ to make mental health support more accessible.
</div>
