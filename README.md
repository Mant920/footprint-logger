# 🌿 EcoTrace — Carbon Footprint Logger Platform

> DA Capstone Project | Node.js + Express + MongoDB + Vanilla JS

## Features

- **Activity Logging** — 20+ preset activities across transport, food, energy & other categories, each with real CO₂ values
- **Visual Dashboard** — Doughnut (by category) and bar (weekly trend) charts powered by Chart.js
- **User Accounts** — Secure registration & login with bcrypt password hashing and JWT authentication
- **MongoDB Storage** — All activities and user profiles stored in MongoDB
- **Insight Engine** — Personalised tips based on your highest-emission categories
- **Weekly Goals** — Set and track CO₂ reduction targets with a live progress bar
- **Community Compare** — See your emissions vs the average of all users
- **Streaks** — Tracks consecutive days of logging to build habits
- **Category Filtering** — Filter activity log by transport, food, energy or other

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | HTML5, CSS3, Vanilla JS, Chart.js |
| Backend  | Node.js, Express.js               |
| Database | MongoDB, Mongoose ODM             |
| Auth     | JWT (jsonwebtoken), bcryptjs      |
| Sessions | express-session, connect-mongo    |

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or MongoDB Atlas)

### For Installation

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/footprint-logger.git
cd footprint-logger

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env — set your MONGODB_URI, JWT_SECRET, SESSION_SECRET

# 4. Start the server
npm start
# or for development with auto-reload:
npm run dev

# 5. Open in browser
open http://localhost:3000
```

### Environment Variables

| Variable        | Description                        | Default                                      |
|-----------------|------------------------------------|----------------------------------------------|
| `PORT`          | Server port                        | `3000`                                       |
| `MONGODB_URI`   | MongoDB connection string          | `mongodb://localhost:27017/footprint-logger` |
| `JWT_SECRET`    | JWT signing secret (keep private!) | —                                            |
| `SESSION_SECRET`| Session secret (keep private!)     | —                                            |
| `NODE_ENV`      | `development` or `production`      | `development`                                |

---

## Project Structure

```
footprint-logger/
├── public/
│   ├── css/
│   │   └── style.css          # Global styles (dark nature theme)
│   ├── js/
│   │   └── app.js             # API client, utilities, activity presets
│   ├── pages/
│   │   ├── dashboard.html     # Main dashboard (protected)
│   │   ├── login.html         # Login page
│   │   └── register.html      # Registration page
│   └── index.html             # Landing page
│
├── server/
│   ├── index.js               # Express entry point
│   ├── middleware/
│   │   └── auth.js            # JWT auth middleware
│   ├── models/
│   │   ├── User.js            # User schema (Mongoose)
│   │   └── Activity.js        # Activity schema (Mongoose)
│   └── routes/
│       ├── auth.js            # /api/auth — register, login, logout
│       ├── activities.js      # /api/activities — CRUD + stats
│       └── users.js           # /api/users — profile, goal
│
├── .env.example
├── package.json
└── README.md
```

---

## API Reference

### Auth
| Method | Path                  | Description                  |
|--------|-----------------------|------------------------------|
| POST   | `/api/auth/register`  | Create a new account         |
| POST   | `/api/auth/login`     | Login and receive JWT        |
| POST   | `/api/auth/logout`    | Clear session                |
| GET    | `/api/auth/me`        | Get current user (protected) |

### Activities (all protected)
| Method | Path                          | Description                       |
|--------|-------------------------------|-----------------------------------|
| GET    | `/api/activities`             | List user's activities (filterable) |
| POST   | `/api/activities`             | Log a new activity                |
| DELETE | `/api/activities/:id`         | Delete an activity                |
| GET    | `/api/activities/stats/summary` | Aggregated stats + community avg |

### Users (protected)
| Method | Path              | Description         |
|--------|-------------------|---------------------|
| GET    | `/api/users/profile` | Get user profile |
| PATCH  | `/api/users/goal` | Update weekly goal  |

---

## CO₂ Reference Values

All CO₂ values (kg per unit) are based on commonly cited lifecycle emissions data:

| Activity            | CO₂ (kg/unit) | Unit  |
|---------------------|---------------|-------|
| Car (petrol)        | 0.21          | km    |
| Train               | 0.04          | km    |
| Short-haul flight   | 255           | trip  |
| Beef meal           | 6.6           | meal  |
| Vegan meal          | 0.3           | meal  |
| Electricity (ZA grid) | 0.23        | kWh   |




