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

Follow these steps to get both the frontend UI and the Python trading backend running locally.

### 1. Clone and Install
```bash
git clone https://github.com/Karthikgaur8/Aura.git
cd Aura
npm install
```

### 2. Set up Python Backend
The Python backend handles the Alpaca trading and market data endpoints.
```bash
# Ensure you are in the root 'Aura' directory
py -m venv venv
venv\Scripts\pip install -r backend\requirements.txt
```

### 3. Environment Variables
Copy the example environment file and fill in your keys:
```bash
cp .env.example .env.local
```
*Note: Make sure to add your `OPENAI_API_KEY` and Alpaca keys (see the table below).*

### 4. Start the Application (Requires 2 Terminals)

To run the full application, **you must start the backend and frontend concurrently in separate terminals**.

**Terminal 1: Start the Python Backend**
```bash
# From the root 'Aura' directory
cd backend
..\venv\Scripts\python.exe -m uvicorn main:app --reload
```
*(Leave this terminal running in the background!)*

**Terminal 2: Start the Next.js Frontend**
Open a **new** terminal prompt, ensure you are in the root `Aura` directory, and run:
```bash
npm run dev
```

Finally, open your browser to [http://localhost:3000](http://localhost:3000) to start trading!
## 🔑 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o | ✅ |
| `ALPACA_API_KEY` | Alpaca paper trading API key | ✅ |
| `ALPACA_API_SECRET` | Alpaca paper trading API secret | ✅ |
| `ALPACA_BASE_URL` | `https://paper-api.alpaca.markets` | ✅ |
| `BACKEND_URL` | Python backend URL (default: `http://localhost:8000`) | Optional |
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
│       ├── trade/route.ts      # Trade proxy → Python backend (Dev C)
│       └── market/route.ts     # Market data proxy → Python backend (Dev C)
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
│   └── tools.ts                # LLM tool definitions (Dev B)
│
└── types/
    └── index.ts                # Shared TypeScript types

backend/                        # Python FastAPI backend (Dev C)
├── main.py                     # FastAPI app — /api/trade, /api/market, /api/health
├── alpaca_client.py            # Alpaca trading client (stocks + crypto)
├── market_data.py              # Market data via Alpaca Data API
└── requirements.txt            # Python dependencies
```

## 👥 Team Roles

| Developer | Focus Area | Key Files |
|---|---|---|
| **Dev A** | Frontend / Animations | `components/*`, `page.tsx`, `globals.css` |
| **Dev B** | AI / LLM / Voice | `hooks/*`, `lib/ai.ts`, `lib/tools.ts`, `api/chat/` |
| **Dev C** | Alpaca / Market Data | `backend/*`, `api/trade/`, `api/market/` |

## 🔀 Branch Strategy

```
main
├── feat/frontend   (Dev A — merges first)
├── feat/ai         (Dev B — merges second)
└── feat/alpaca     (Dev C — merges third)
```

## 📜 Scripts

```bash
# Frontend
npm run dev      # Start Next.js dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint

# Backend (run from backend/ folder)
..\venv\Scripts\python -m uvicorn main:app --port 8000          # Start backend
..\venv\Scripts\python -m uvicorn main:app --port 8000 --reload # Start with auto-reload
```

## 📄 License

MIT
