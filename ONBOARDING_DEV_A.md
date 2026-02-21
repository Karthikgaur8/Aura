# 🎨 Developer A — Frontend / Animations Onboarding

## Your Role
You own **all visual components and animations**. You are the one who makes this app look stunning for the judges.

## Setup
```bash
git clone https://github.com/Karthikgaur8/Aura.git
cd Aura
npm install
cp .env.example .env.local
git checkout -b feat/frontend
npm run dev
```

## Your Files (ONLY touch these)
```
src/components/         ← All 7 component files are yours
src/app/page.tsx        ← Main page with 3 visual states
src/app/globals.css     ← Dark theme, custom colors, glow effects
src/app/layout.tsx      ← Root layout
tailwind.config.ts      ← Custom theme tokens (if needed by Tailwind v4)
public/                 ← Any static assets
```

## DO NOT touch
- `src/hooks/*` (Dev B)
- `src/lib/*` (Dev B & C)
- `src/app/api/*` (Dev B & C)

## Your Tasks (in order)

### Phase 1 (~2 hours)
1. `npm install framer-motion` — Animation library
2. **`globals.css`** — Set up dark theme. Key colors: deep dark bg (`#0a0a0f`), purple accent (`#8b5cf6`), green accent (`#22c55e`), glassmorphism utilities
3. **`ModeToggle.tsx`** — Sleek toggle at bottom: 🎙️ Voice | 💬 Chat. Use Framer Motion for smooth pill slide
4. **`VoiceOrb.tsx`** — THE hero component. Glowing, pulsing orb with `<motion.div layoutId="orb">`. Must smoothly animate from center → top-left corner when data appears. Use radial gradients, blur, and scale animations
5. **`ChatInput.tsx`** — Floating glassmorphic input bar at the bottom of screen
6. **`page.tsx`** — Wire up State 1 (Entry): center orb + mode toggle. Use React state: `mode` (voice/chat), `appState` (entry/data-render/trade-confirm)

### Phase 2 (~3 hours)
7. `npm install lightweight-charts canvas-confetti` — Chart + confetti libraries
8. **`StockChart.tsx`** — Render stock chart from data props using `lightweight-charts`. Dark theme, glowing green/red candles
9. **`TradeReceipt.tsx`** — Glassmorphic card with backdrop blur. Shows ticker, shares, cost, order type. Slides up with `<motion.div>`
10. **`SlideToConfirm.tsx`** — Satisfying drag-to-confirm using Framer Motion `drag="x"` with spring physics. Glow trail on drag
11. **`ConfettiSuccess.tsx`** — Trigger `canvas-confetti` burst on trade success
12. **`page.tsx`** — Wire up State 2 (orb shrinks to top-left via `layout` animation, chart fades in) and State 3 (background dims, receipt slides up)

### Importing Dev B's hooks
Dev B provides hooks you'll consume in `page.tsx`:
```tsx
import { useAuraChat } from '@/hooks/useAuraChat';
import { useVoice } from '@/hooks/useVoice';
import { useTradeExecution } from '@/hooks/useTradeExecution';
```
The hooks expose: `messages`, `input`, `handleSubmit`, `isLoading`, `startListening`, `speak`, `executeTrade`.

### Key Types (from `src/types/index.ts`)
```typescript
type InteractionMode = 'voice' | 'chat';
type AppState = 'entry' | 'data-render' | 'trade-confirm';
interface StockBar { timestamp, open, high, low, close, volume }
interface TradeReceipt { ticker, qty, side, orderType, estimatedTotal, currentPrice, stopLoss? }
```

## Design North Star
- **Dark mode only** — pitch black backgrounds
- **Glassmorphism** everywhere — `backdrop-blur-xl`, semi-transparent cards
- **Glow effects** — purple/green glows using `box-shadow` and CSS animations
- **Framer Motion layout animations** — the orb transition IS the demo
- **Premium feel** — think Apple Keynote meets Bloomberg Terminal

## Merge Strategy
You merge to `main` FIRST (you own `page.tsx` and `layout.tsx`). Wait for Dev B and C to finish before integrating their hooks.
