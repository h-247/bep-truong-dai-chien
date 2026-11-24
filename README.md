# Bếp Trưởng Đại Chiến (Overcooked-inspired Co-op Cooking Game)

A complete, playable, browser-based cooperative cooking simulation game inspired by *Overcooked*, engineered mobile-first with permanent dark mode, fully localized in natural Vietnamese, supporting 2 to 8 real-time online players per kitchen, and compatible with ChatGPT Sites on Cloudflare Workers / D1.

---

## 1. Project Overview

- **Genre:** Cooperative Cooking Simulation.
- **Frontend Language:** Vietnamese exclusively.
- **Platform:** Web Browser (Mobile phones first, tablets, desktop PCs).
- **Display Mode:** Permanent Dark Mode (`#212121` palette).
- **Multiplayer Capacity:** 2–8 concurrent players per room (Human & AI).
- **Perspective:** Top-Down 2D Canvas engine with smooth animations and multi-touch joystick controls.
- **Cost:** 100% Free / Open-Source technologies with zero paid runtime dependencies.

---

## 2. Features & Game Modes

### Game Modes

1. **Chơi đơn (Single Player):** Control one chef independently, manage orders, cooking timers, dishwashing, and fire hazards.
2. **Chơi với AI (AI Co-op):** Play cooperatively with autonomous AI chefs. Assign Vietnamese commands (*Tự động hỗ trợ, Chuẩn bị nguyên liệu, Nấu món ăn, Rửa đĩa, Giao món ăn, Theo tôi, Đứng yên*) and switch control between chefs.
3. **Chơi cùng bạn (Local Co-op):** Two players on one keyboard/device sharing the kitchen, orders, timer, and score.
4. **Chơi trực tuyến (Online Multiplayer):** 2–8 real players in public or private password-protected rooms. Synchronized movement, shared orders, equipment, dirty plates, and kitchen fires.
5. **Luyện tập (Practice Mode):** Infinite timer mode for exploring recipes and kitchen mechanics freely.
6. **Chiến dịch (Campaign Mode):** 20 playable levels across 5 kitchen environments with star ratings and unlocks.

### 5 Kitchen Worlds (20 Playable Levels)

1. **Nhà bếp cơ bản (World 1):** Introductory preparation, chopping, boiling soups, and cooperative basics.
2. **Nhà hàng thức ăn nhanh (World 2):** Fast-food rush, hamburgers, cheeseburgers, deep fryers, and high order volumes.
3. **Nhà hàng Ý (World 3):** Pizza ovens, pasta boiling pots, and complex multi-step ingredient assembly.
4. **Nhà hàng châu Á (World 4):** Rice cookers, sushi seaweed rolling, egg fried rice, and grilled fish.
5. **Nhà bếp hỗn loạn (World 5):** Spatial obstacles, narrow aisles, fire hazards, and intense 8-player coordination.

### 12 Initial Recipes

1. **Salad rau củ:** Lettuce (chopped) + Tomato (chopped) + Cucumber (chopped) on clean plate.
2. **Bánh hamburger:** Bun + Beef (cooked in pan) + Lettuce (chopped) + Tomato (chopped).
3. **Hamburger phô mai:** Bun + Beef (cooked in pan) + Cheese (chopped).
4. **Bánh pizza:** Dough + Tomato (chopped) + Cheese (chopped), baked in oven.
5. **Pizza nấm:** Dough + Tomato (chopped) + Cheese (chopped) + Mushroom (chopped), baked in oven.
6. **Sushi:** Rice (cooked in rice cooker) + Seaweed + Fish (chopped).
7. **Cơm chiên:** Rice (cooked in rice cooker) + Egg (chopped) + Vegetables (chopped), stir-fried in pan.
8. **Mì Ý:** Pasta (cooked in pot) + Tomato sauce (cooked in pot).
9. **Súp hành tây:** Onion (chopped + cooked in pot).
10. **Súp cà chua:** Tomato (chopped + cooked in pot).
11. **Khoai tây chiên:** Potato (chopped + deep fried in fryer).
12. **Cá nướng:** Fish (chopped + cooked in pan/oven).

---

## 3. Technology Stack

- **Framework:** React 19 + TypeScript + Tailwind CSS v4, built on the official OpenAI Sites Vinext starter (`vinext`).
- **Build Integration:** Preserved `@openai/sites-vite-plugin` (`sites()`) inside `vite.config.ts`.
- **Game Engine:** Native HTML5 Canvas 2D + TypeScript (no bulky paid engine dependencies).
- **Backend Runtime:** Cloudflare Workers edge runtime compatible route handlers.
- **Database & ORM:** Cloudflare D1 (SQLite) with Drizzle ORM and committed SQL migrations.
- **Audio:** Web Audio API sound synthesizer with zero external audio assets.
- **Validation:** Zod for server-side API request schemas.
- **Testing:** Vitest for deterministic unit/integration logic; Playwright for browser e2e testing.

---

## 4. Repository Structure

```text
├── .openai/
│   └── hosting.json              # OpenAI Sites hosting and D1/R2 binding declarations
├── app/
│   ├── api/                      # TypeScript API route handlers
│   │   ├── achievements/
│   │   ├── guest/session/
│   │   ├── leaderboard/
│   │   ├── levels/
│   │   ├── profile/
│   │   └── rooms/                # Multiplayer room management & sync APIs
│   ├── globals.css               # Permanent dark mode styles
│   ├── layout.tsx                # Mobile-first viewport & Vietnamese metadata
│   └── page.tsx                  # Client application router
├── db/
│   ├── env.d.ts
│   ├── index.ts                  # Drizzle D1 client
│   └── schema.ts                 # Relational schema (13 tables)
├── drizzle/                      # Committed D1 SQL migrations
│   └── 0000_quick_romulus.sql
├── src/
│   ├── components/               # UI buttons, cards, modals & HUD overlays
│   │   ├── hud/                  # MobileControls, OrderQueue, QuickChat, AiCommands
│   │   ├── modals/               # Recipe, Leaderboard, Achievements, Profile, Settings
│   │   └── ui/                   # Button, Card, Modal
│   ├── features/                 # Application screens
│   │   ├── campaign/             # LevelSelectScreen
│   │   ├── gameplay/             # GameScreen
│   │   ├── home/                 # HomeScreen
│   │   └── multiplayer/          # RoomBrowserScreen, RoomLobbyScreen
│   ├── game/
│   │   ├── ai/                   # Deterministic A* pathfinding & AI Chef controller
│   │   ├── audio/                # Web Audio API synthesizer
│   │   ├── characters.ts         # 8 distinct chef character definitions
│   │   ├── core/                 # KitchenGrid, GameEngine (physics, stations, items)
│   │   ├── input/                # InputManager (keyboard & virtual joystick)
│   │   ├── levels/               # 20 level configs & multiplayer scaling
│   │   ├── multiplayer/          # MultiplayerNetworkClient
│   │   ├── recipes/              # 12 recipes & scoring logic
│   │   └── rendering/            # CanvasRenderer
│   ├── locales/                  # Natural Vietnamese localization dictionary
│   ├── server/                   # Authoritative RoomManager singleton
│   └── types/                    # Core TypeScript interfaces
├── tests/
│   ├── integration/              # 8-player concurrent synchronization test
│   └── unit/                     # Recipe, cooking engine, AI pathfinding, room tests
├── drizzle.config.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

---

## 5. Prerequisites

- **Node.js:** v22.13.0 or later (tested on v24.19.0).
- **Package Manager:** `npm` (v11 or later).
- **Git**

---

## 6. Installation & Local Development

### Windows (PowerShell)

```powershell
# 1. Clone or navigate to the repository
cd "c:\Users\toanv\OneDrive\Desktop\Game 2"

# 2. Install dependencies
npm install

# 3. Generate database migrations (if schema updated)
npm run db:generate

# 4. Start local development server
npm run dev
```

### macOS / Linux

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```

The application will be live at `http://localhost:3000` (or the port output by `vinext dev`).

---

## 7. Build & Preview

```bash
# Type check TypeScript codebase
npm run typecheck

# Run automated Vitest test suite
npm run test

# Build production bundle for Cloudflare Workers / ChatGPT Sites
npm run build

# Preview production build locally via Wrangler
npm run start
```

---

## 8. Controls

### Mobile Touch Controls

- **Virtual Joystick (Bottom Left):** Touch and drag to move in any direction (supports left-handed mode in Settings).
- **Nhặt/Đặt (Bottom Right):** Pick up ingredient from box/counter or place item on counter/plate/sink/trash.
- **Tương tác (Bottom Right):** Chop on cutting board, wash dirty plates at sink, or spray fire extinguisher at fire.
- **Tăng tốc (Dash):** Dash boost to move faster with brief cooldown.
- **Đổi đầu bếp:** Switch chef control in AI co-op mode.
- **Giao tiếp:** Open predefined Vietnamese quick-chat menu.
- **Đánh dấu (Ping):** Ping station, ingredient, or hazard for teammates.

### Desktop Controls

| Action | Player 1 | Player 2 (Local Co-op) |
| --- | --- | --- |
| Movement | W, A, S, D | Arrow Keys |
| Pick up / Drop | E | Enter |
| Interact | F | Right Shift |
| Dash | Space | Right Ctrl |
| Switch Chef | Tab | Numpad 0 |
| Quick Chat | Q | P |
| Ping | R | O |
| Pause / Menu | Escape | Escape |

---

## 9. Online Multiplayer Architecture

1. **Room Lifecycle:**
   - Host creates a room with configured capacity (2–8 players), level, and difficulty.
   - Server issues a 6-character room code (e.g. `K7P9X2`) and invitation link.
   - Players connect via browser from phones, tablets, or computers.
   - Lobby requires all human players to be marked as **Sẵn sàng** before the host can click **Bắt đầu**.
   - Optional AI assistant chefs can be added/removed by the host to fill slots.

2. **Real-Time Synchronization:**
   - **Engine:** Authoritative simulation managed on the server with deterministic fixed timestep updates.
   - **Client Sync:** Client polls/synchronizes actions via `/api/rooms/[id]/sync` at 15–20 updates/second.
   - **Client-Side Prediction:** Local player moves immediately with local collision resolution; remote players interpolate smoothly.
   - **Reconnection Recovery:** Each member receives a unique secure session token. If temporary disconnection occurs, the slot is reserved and state resynchronizes immediately upon reconnection.

---

## 10. Eight-Player Multiplayer Testing

An automated integration test verifies 8 simultaneous clients participating in a shared match without desynchronization:

```bash
npx vitest run tests/integration/eight-player-sync.test.ts
```

### Manual 8-Player Testing

1. Open `http://localhost:3000` in 8 separate browser windows / incognito tabs (or across 8 phones on the same LAN).
2. Player 1: Click **Chơi trực tuyến** ➔ **Tạo phòng** ➔ Select 8 players ➔ Create.
3. Players 2–8: Click **Chơi trực tuyến** ➔ Enter the 6-character Room Code ➔ Join.
4. Players 2–8: Toggle **Sẵn sàng**.
5. Player 1 (Host): Click **Bắt đầu**.
6. All 8 chefs spawn in the kitchen simultaneously with synchronized orders, timers, and station occupancy.

---

## 11. ChatGPT Sites Deployment

1. The repository maintains `.openai/hosting.json` declaring the D1 binding (`DB`).
2. Build integration in `vite.config.ts` retains `sites()` from `@openai/sites-vite-plugin`.
3. Server route handlers are 100% Workers runtime compatible (no native Node.js TCP drivers or blocking fs calls).
4. Deploy using the ChatGPT Sites plugin or workspace tool. If hosted deployment is executed, the remote platform deploys the built worker and attaches the D1 SQLite database.

---

## 12. License & Asset Attribution

- All code, game systems, characters, audio synthesizers, maps, and branding are 100% original.
- No copyrighted *Overcooked* assets, proprietary code, audio, or textures were used.
- Zero paid API keys, paid cloud LLMs, or paid external services required.
