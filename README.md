# ⚡ QuizBattle — Real-Time Multiplayer Quiz Platform

A production-ready, full-stack real-time quiz battle platform with AI-powered quiz generation, live leaderboards, and competitive gameplay mechanics.

---

## 🗂️ Project Structure

```
quiz-battle/
├── backend/          # Node.js + Express + MongoDB API
│   ├── src/
│   │   ├── config/       # DB & Socket.io setup
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Auth, validation, errors
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # Express routers
│   │   └── utils/        # Helpers, AI generator, seed data
│   ├── .env.example
│   └── package.json
│
└── frontend/         # React + Vite + Tailwind CSS v4
    ├── src/
    │   ├── components/   # UI, auth, layout components
    │   ├── pages/        # Route-level page components
    │   ├── store/        # Redux Toolkit slices
    │   ├── services/     # Axios API + Socket.io client
    │   ├── lib/          # Zod validation schemas
    │   └── utils/        # Helper functions
    ├── .env.example
    └── package.json
```

---

## 🚀 Tech Stack

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Database & ODM |
| Socket.io | Real-time communication |
| JWT + bcryptjs | Auth & password hashing |
| Zod | Schema validation |
| Helmet + Rate Limiter | Security middleware |
| Nodemon | Dev hot-reload |
| Anthropic Claude API | AI quiz generation |

### Frontend
| Tech | Purpose |
|------|---------|
| React 18 + Vite | UI framework & build tool |
| Tailwind CSS v4 | Utility-first styling |
| Redux Toolkit | State management |
| React Router v6 | Client-side routing |
| Framer Motion | Animations |
| Axios | HTTP client |
| Socket.io-client | Real-time updates |
| Zod | Form validation |
| React Hot Toast | Notifications |
| Lucide React | Icons |

---

## 🔧 Installation & Setup

### Prerequisites
- Node.js ≥ 18.0.0
- MongoDB (local or Atlas)
- Anthropic API Key (optional — for AI quiz generation)

---

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/quiz-battle.git
cd quiz-battle

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

---

### 2. Configure Environment Variables

#### Backend — `backend/.env`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/quiz-battle
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars_here
JWT_EXPIRES_IN=7d
ANTHROPIC_API_KEY=sk-ant-your-key-here   # Optional
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

#### Frontend — `frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=QuizBattle
```

---

### 3. Run Development Servers

```bash
# Terminal 1 — Start Backend
cd backend
npm run dev
# → API: http://localhost:5000/api
# → Sockets: ws://localhost:5000

# Terminal 2 — Start Frontend
cd frontend
npm run dev
# → App: http://localhost:5173
```

---

### 4. Seed the Database

On first visit to the dashboard, quizzes are auto-seeded. Or call manually:

```bash
curl http://localhost:5000/api/quizzes/seed
```

---

## 📋 Available Scripts

### Backend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start with Nodemon (hot reload) |
| `npm start` | Start in production mode |

### Frontend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 🌐 API Reference

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |
| PATCH | `/api/auth/profile` | Update profile | ✅ |

### Quizzes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/quizzes` | List quizzes (filter, paginate) | ❌ |
| GET | `/api/quizzes/:id` | Get quiz by ID | ❌ |
| POST | `/api/quizzes` | Create quiz | ✅ |
| POST | `/api/quizzes/ai/generate` | Generate AI quiz | ✅ |
| GET | `/api/quizzes/categories` | Get all categories | ❌ |
| GET | `/api/quizzes/seed` | Seed demo quizzes | ❌ |

### Rooms & Game
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/rooms` | Create room | ✅ |
| POST | `/api/rooms/join` | Join room by code | ✅ |
| GET | `/api/rooms/:id` | Get room details | ✅ |
| POST | `/api/rooms/:id/start` | Start game (host only) | ✅ |
| POST | `/api/rooms/:roomId/answer` | Submit answer | ✅ |
| POST | `/api/rooms/:roomId/skip` | Skip question | ✅ |
| POST | `/api/rooms/:id/finish` | Finish game | ✅ |
| GET | `/api/rooms/:id/leaderboard` | Room leaderboard | ✅ |
| GET | `/api/rooms/leaderboard/global` | Global leaderboard | ❌ |

---

## 🔌 Socket.io Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join_room` | `{ roomId }` | Join a room channel |
| `leave_room` | `{ roomId }` | Leave a room channel |
| `game_started` | `{ roomId }` | Notify game started |
| `next_question` | `{ roomId, questionIndex }` | Move to next question |
| `score_update` | `{ roomId }` | Request score broadcast |
| `game_over` | `{ roomId, leaderboard }` | Notify game ended |
| `chat_message` | `{ roomId, message, username, avatar }` | Send chat |
| `player_ready` | `{ roomId, isReady }` | Toggle ready state |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `room_state` | `{ status, participants }` | Current room state |
| `player_joined` | `{ userId, participantCount }` | Player joined |
| `player_left` | `{ userId }` | Player left |
| `game_starting` | `{ countdown }` | Game countdown |
| `question_changed` | `{ questionIndex }` | Question advanced |
| `leaderboard_update` | `{ leaderboard }` | Live scores |
| `new_chat_message` | `{ userId, username, message, ... }` | Chat broadcast |
| `game_finished` | `{ leaderboard }` | Game ended |

---

## 🎮 Game Features

### Scoring System
- **Base Points**: Easy=100, Medium=150, Hard=200
- **Time Bonus**: Up to +50% for faster answers
- **Formula**: `score = basePoints + (basePoints × 0.5 × (1 - timeTaken/totalTime))`
- **Double Score**: Multiplies total by 2 when active

### Power-Ups
| Power-Up | Description | Uses |
|----------|-------------|------|
| ⏭️ Skip | Skip current question, no points lost | 3 per game |
| ✖️2 Double Score | Double points earned on next correct answer | 2 per game |

### Anti-Cheat
- Server-side answer validation (correct answers never sent to client until answered)
- Duplicate answer detection per question
- Timer enforced on backend

### Rank Progression
| Rank | Score Threshold |
|------|----------------|
| 🌱 Novice | 0+ |
| 🎯 Intermediate | 500+ |
| ⚡ Advanced | 1,000+ |
| 🔥 Expert | 2,000+ |
| ⚔️ Master | 5,000+ |
| 👑 Grandmaster | 10,000+ |

---

## 🚢 Deployment

### Frontend → Vercel

1. Push frontend to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Set build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Root Directory**: `frontend`
4. Add environment variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```

### Backend → Render

1. Push backend to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Set configuration:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables (all from `.env.example`)
5. Set `NODE_ENV=production`

### MongoDB Atlas (Production)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quiz-battle?retryWrites=true&w=majority
```

---

## 🔐 Security Features

- **JWT Authentication** with configurable expiry
- **bcryptjs** password hashing (salt rounds: 12)
- **Helmet.js** HTTP security headers
- **Rate limiting** — 100 req/15min globally, 20 req/15min on auth
- **CORS** restricted to frontend origin
- **Input validation** with Zod on both client and server
- **Anti-cheat** — server-side answer verification

---

## 🧩 Categories

- 🧮 **Math** — Arithmetic, calculus, probability, algebra
- 🌍 **GK** — Geography, history, world facts
- 💻 **Coding** — JavaScript, algorithms, CS fundamentals
- 🔬 **Science** — Physics, chemistry, biology
- 📜 **History** — World events, civilizations
- ⚽ **Sports** — World sports trivia
- 🤖 **AI-Generated** — Any topic via Anthropic Claude API

---

## 📝 License

MIT License. Free for personal and commercial use.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

Built with ⚡ by the QuizBattle team. Powered by [Anthropic Claude](https://anthropic.com).
