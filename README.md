# ROADSOS - Emergency Response Platform

ROADSOS is a comprehensive, industry-grade Emergency Response Platform designed to provide immediate assistance during road accidents and emergencies. By integrating real-time location tracking, Role-Based Access Control (RBAC), and parallel emergency dispatching, ROADSOS ensures that critical help (Hospitals, Police, Rescue Teams) reaches victims within seconds.

## 🚀 Features

- **Real-Time Geolocation & Dispatch**: Instantly fetches the victim's location and dispatches parallel SOS signals to the nearest emergency response units.
- **Role-Based Access Control (RBAC)**: Distinct dashboards and permissions for `USER`, `ADMIN`, `POLICE`, and `HOSPITAL` roles.
- **Simulated Crash Demo (Car Game)**: A 3D interactive car racing game built with React Three Fiber to demonstrate the SOS telemetry and dispatch capabilities upon crashing.
- **Interactive Dashboards**: Live monitoring of emergency requests with actionable response options for Police and Hospital admins.
- **Secure Authentication**: Robust JWT-based authentication system with password hashing and session management.

## 🛠 Tech Stack

### Frontend
- **Framework**: React + Vite
- **Routing**: TanStack Router
- **Styling**: Tailwind CSS, Radix UI, Framer Motion
- **Icons**: Lucide React
- **3D Engine**: React Three Fiber / Three.js (for the Car Game Simulation)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Caching & PubSub**: Redis
- **Authentication**: JWT, bcryptjs
- **Real-time Comms**: Socket.io

## 📂 Project Structure

```
ROADSOS/
├── frontend/           # React frontend application
│   ├── src/            # Source code, routes, components, and UI elements
│   ├── public/         # Static assets and built game files
│   └── package.json    # Frontend dependencies
├── backend/            # Express backend API
│   ├── src/            # Controllers, middleware, routes, and services
│   ├── prisma/         # Database schema and migrations
│   └── package.json    # Backend dependencies
├── car game/           # 3D Crash Simulation Demo (React Three Fiber)
│   ├── src/            # 3D models, logic, and rendering
│   └── index.html      # Game entry point
└── README.md           # Project documentation
```

## 🏁 Getting Started

To run the project locally, you will need to start the backend, the frontend, and the car game demo.

### 1. Backend Setup
```bash
cd backend
npm install
# Configure your .env file with DATABASE_URL and REDIS_URL
npm run dev
```

### 2. Car Game Demo Setup
The car game must be running for the frontend demo integration to work.
```bash
cd "car game"
npm install
npm run dev
# The game will run on http://localhost:5173
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# The frontend will automatically bind to http://localhost:5174 (or next available port)
```

## 🎮 How the Demo Works
1. Navigate to the ROADSOS frontend.
2. Click on the **Demo** button on the home page.
3. The 3D car game will load in an overlay.
4. If you crash the car in the game, an automated 10-second countdown will begin.
5. Once the countdown completes, live telemetry (speed, location) will be dispatched to the backend, triggering emergency alerts on the Hospital and Police Admin dashboards.
6. The demo gracefully simulates successful SOS dispatches even for unauthenticated guest users!

## 📜 License
ISC License
