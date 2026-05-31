# 🛡️ Road Guardian — Complete Project

## AI Emergency Response Platform
**Android App + Production Backend**

---

## 📱 ANDROID APP — Setup

### Prerequisites
- Android Studio Hedgehog (2023.1.1) or newer
- JDK 17+
- Android SDK 34
- Google Maps API Key

### Quick Start

1. **Open in Android Studio**
   ```
   File → Open → RoadGuardian/
   ```

2. **Add Google Maps API Key**
   Edit `app/src/main/AndroidManifest.xml`:
   ```xml
   <meta-data
       android:name="com.google.android.geo.API_KEY"
       android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
   ```

3. **Add Gemini AI Key**
   In `AiChatActivity.kt`:
   ```kotlin
   private val GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"
   ```

4. **Sync Gradle** → Run on device/emulator

### App Features
| Feature | Description |
|---------|-------------|
| 🚨 SOS Button | Hold 3 seconds to trigger emergency alert |
| 🤖 AI Guide | Gemini AI powered emergency guidance |
| 📍 Report Accident | File incident reports with photo & location |
| 📞 Emergency Contacts | Quick dial 100, 101, 108, 112, 1033 |
| 🗺️ Live Map | Google Maps with nearby services |
| 📋 My Reports | Track all your submitted reports |

### Color Theme
| Color | Hex |
|-------|-----|
| Primary Red | `#EF4444` |
| Dark Red | `#DC2626` |
| Background | `#0F0F0F` |
| Surface | `#1A1A1A` |
| Success | `#22C55E` |

---

## 🖥️ BACKEND — Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 16
- Redis 7
- Docker (optional)

### Quick Start with Docker

```bash
cd roadsos-backend

# Copy env
cp .env.example .env
# Edit .env with your values

# Start all services
docker-compose up -d

# Run migrations & seed
docker exec roadsos_backend npx prisma migrate deploy
docker exec roadsos_backend npx ts-node prisma/seed.ts
```

### Manual Setup

```bash
cd roadsos-backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Setup database (PostgreSQL must be running)
npx prisma migrate dev --name init
npx prisma generate

# Seed sample data
npm run prisma:seed

# Start Redis
redis-server

# Start development server
npm run dev
```

### Default Credentials (after seed)
| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@roadguardian.com | Admin@123 |
| Test User | test@roadguardian.com | User@123 |

### API Documentation
Visit: `http://localhost:5000/api/docs`

### API Endpoints

#### Auth
```
POST /api/v1/auth/signup          Register
POST /api/v1/auth/login           Login
POST /api/v1/auth/logout          Logout
POST /api/v1/auth/refresh-token   Refresh JWT
POST /api/v1/auth/forgot-password Forgot password
POST /api/v1/auth/reset-password  Reset password
POST /api/v1/auth/verify-otp      Verify email OTP
POST /api/v1/auth/resend-otp      Resend OTP
GET  /api/v1/auth/me              Get current user
```

#### SOS Emergency
```
POST  /api/v1/sos/create          Trigger SOS 🚨
GET   /api/v1/sos/my-requests     My SOS history
GET   /api/v1/sos/:id             SOS details
PATCH /api/v1/sos/cancel/:id      Cancel SOS
```

#### Emergency Services
```
GET /api/v1/services/nearby       Nearby services (geo-location)
GET /api/v1/services/hospitals    Hospitals
GET /api/v1/services/ambulances   Ambulances
GET /api/v1/services/police       Police stations
GET /api/v1/services/towing       Towing services
```

#### Emergency Contacts
```
POST   /api/v1/contacts     Add contact
GET    /api/v1/contacts     Get all contacts
PATCH  /api/v1/contacts/:id Update contact
DELETE /api/v1/contacts/:id Delete contact
```

#### Admin
```
GET    /api/v1/admin/users         All users
PATCH  /api/v1/admin/block-user/:id   Block user
PATCH  /api/v1/admin/unblock-user/:id Unblock user
GET    /api/v1/admin/sos-requests  All SOS requests
GET    /api/v1/admin/analytics     Platform analytics
```

### Real-time Socket Events

Connect with Bearer token:
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: accessToken }
});

// Listen for SOS updates
socket.on('sos:status', (data) => { ... });
socket.on('sos:confirmed', (data) => { ... });
socket.on('notification:new', (data) => { ... });

// Share location
socket.emit('location:update', { latitude, longitude, sosId });
```

---

## 🔗 Connect Android App to Backend

In `AiChatActivity.kt` and any API calls, update the base URL:

```kotlin
const val BASE_URL = "http://YOUR_BACKEND_IP:5000/api/v1"
```

For local testing with an Android emulator:
```kotlin
const val BASE_URL = "http://10.0.2.2:5000/api/v1"
```

---

## 📦 Tech Stack

### Android
- **Language**: Kotlin
- **UI**: Material Design 3 + XML layouts
- **Network**: OkHttp3
- **Maps**: Google Maps SDK
- **AI**: Gemini API

### Backend
- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Auth**: JWT (access + refresh token rotation)
- **Real-time**: Socket.IO
- **Email**: Nodemailer
- **Validation**: Zod
- **Docs**: Swagger UI
- **Containers**: Docker + Docker Compose

---

*Built with ❤️ for Road Safety — Road Guardian AI*
