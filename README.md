# 🔮 Aura (BuffetBro)

**The Agent-First Brokerage.** No tabs, no spreadsheets — just talk, see, and trade.

> Built at Hacklytics 2026 (Finance Track)

## ✨ What is Aura?

Aura replaces the "15-tab trading spreadsheet" with a **Generative Spatial UI**. The app builds itself dynamically around your conversation — use voice or chat to explore stocks, visualize data, and execute trades through a secure human-in-the-loop flow.

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) + TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Animations** | Framer Motion |
| **AI/LLM** | OpenAI GPT-4o via Vercel AI SDK |
| **Voice** | Web Speech API (STT) + ElevenLabs (TTS) |
| **Trading** | Alpaca Paper Trading API |
| **Market Data** | Alpaca Market Data / Alpha Vantage |

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone https://github.com/your-org/Aura.git
cd Aura
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Fill in your API keys (see table below)

# 3. Run dev server
npm run dev
# Open http://localhost:3000
```

## 🔑 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o | ✅ |
| `ALPACA_API_KEY` | Alpaca paper trading API key | ✅ |
| `ALPACA_API_SECRET` | Alpaca paper trading API secret | ✅ |
| `ALPACA_BASE_URL` | Alpaca API base URL (paper) | ✅ |
| `ELEVENLABS_API_KEY` | ElevenLabs TTS API key | Optional |
| `NEXT_PUBLIC_APP_URL` | App URL (default: http://localhost:3000) | Optional |

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (Dev A)
│   ├── page.tsx                # Main page — 3 visual states (Dev A)
│   ├── globals.css             # Global styles + dark theme (Dev A)
│   └── api/
│       ├── chat/route.ts       # LLM streaming endpoint (Dev B)
│       ├── trade/route.ts      # Trade execution endpoint (Dev C)
│       └── market/route.ts     # Market data endpoint (Dev C)
│
├── components/                 # UI components (Dev A)
│   ├── VoiceOrb.tsx            # Animated center orb
│   ├── ChatInput.tsx           # Floating chat input
│   ├── StockChart.tsx          # Stock chart renderer
│   ├── TradeReceipt.tsx        # Trade confirmation card
│   ├── SlideToConfirm.tsx      # Drag-to-execute button
│   ├── ConfettiSuccess.tsx     # Success celebration
│   └── ModeToggle.tsx          # Voice/Chat toggle
│
├── hooks/                      # React hooks (Dev B)
│   ├── useAuraChat.ts          # Chat state management
│   ├── useVoice.ts             # Voice I/O (STT + TTS)
│   └── useTradeExecution.ts    # Trade API calls
│
├── lib/                        # Shared utilities
│   ├── ai.ts                   # OpenAI config + system prompt (Dev B)
│   ├── tools.ts                # LLM tool definitions (Dev B)
│   ├── alpaca.ts               # Alpaca client (Dev C)
│   └── market.ts               # Market data fetching (Dev C)
│
└── types/
    └── index.ts                # Shared TypeScript types
```

## 👥 Team Roles

| Developer | Focus Area | Key Files |
|---|---|---|
| **Dev A** | Frontend / Animations | `components/*`, `page.tsx`, `globals.css` |
| **Dev B** | AI / LLM / Voice | `hooks/*`, `lib/ai.ts`, `lib/tools.ts`, `api/chat/` |
| **Dev C** | Alpaca / Market Data | `lib/alpaca.ts`, `lib/market.ts`, `api/trade/`, `api/market/` |

## 🔀 Branch Strategy

```
main
├── feat/frontend   (Dev A — merges first)
├── feat/ai         (Dev B — merges second)
└── feat/alpaca     (Dev C — merges third)
```

## 📜 Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📄 License

MIT
