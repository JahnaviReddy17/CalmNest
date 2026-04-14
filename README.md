# 🌿 CalmNest

A full-stack **mental health and wellness web application** designed to support users dealing with stress, anxiety, loneliness, and crisis situations through AI, peer support, and professional mentorship.

---

## 🧠 Overview

**CalmNest** is a hackathon-built MVP that combines:

* 🤖 AI-powered emotional support
* 💬 Real-time peer & mentor chat
* 📊 Mood tracking & analytics
* 🚨 Crisis detection & alerts
* 🧑‍⚕️ Mentor and NGO dashboards

The platform provides a **safe, anonymous, and supportive environment** for mental well-being.

---

## 🚀 Live Architecture

```
Frontend (React + Vite) → Vercel
Backend (Node.js + Express) → Render
Database → MongoDB Atlas
Realtime → Socket.IO
AI → Groq (Llama3)
```

---

## 🏗️ Tech Stack

### Frontend

* React 18 + Vite
* React Router v6
* Tailwind CSS
* Framer Motion
* Axios
* Chart.js / Recharts
* Socket.IO Client

### Backend

* Node.js + Express
* MongoDB + Mongoose
* Socket.IO
* JWT Authentication
* bcryptjs
* Groq SDK (Llama3 AI)

---

## 📁 Project Structure

```
finalrepo-main/
├── client/        # React frontend
├── server/        # Node.js backend
```

---

## ✨ Features

### 👤 User Features

* Secure login & registration (JWT-based)
* Anonymous mode (UUID-based access)
* Daily mood tracking (1–5 scale)
* AI mental health chat
* Safe Circle (peer group chat)
* Mentor connection & 1:1 chat
* Wellness activities & modules
* Achievements & streak tracking
* Personalized insights dashboard

### 🧑‍⚕️ Mentor Features

* Mentor registration/login
* Patient management dashboard
* Mood & risk monitoring
* Assign wellness modules
* Real-time chat with users

### 🏢 Admin / NGO Features

* Platform-wide analytics dashboard
* Crisis alert monitoring
* User engagement insights

---

## 🚨 Crisis Detection System

CalmNest includes a **2-layer crisis detection system**:

1. **Keyword Detection**

   * Detects phrases like: *"suicide", "kill myself", "die"*

2. **Sentiment Analysis**

   * Detects emotional distress (sad, depressed)

### Flow:

* Trigger → AI chat / mood entry
* Alert → Crisis modal shown
* Stored → MongoDB (CrisisAlert)
* Visible → Admin dashboard

---

## 🔐 Authentication

* JWT-based authentication (7-day expiry)
* Stored in `localStorage`
* Axios interceptors attach tokens automatically
* Anonymous users supported via UUID

---

## 🔄 Real-Time Features

* Safe Circle (group chat)
* Mentor 1:1 chat
* Typing indicators
* Live notifications
* Mood updates

Powered by **Socket.IO**

---

## ⚙️ Environment Variables

Create a `.env` file in `/server`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_api_key
```

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/calmnest.git
cd calmnest
```

---

### 2️⃣ Backend Setup

```bash
cd server
npm install
npm run dev
```

---

### 3️⃣ Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## 🌐 Deployment

### Backend (Render)

* Connect GitHub repo
* Add environment variables
* Deploy as Web Service

### Frontend (Vercel)

* Import repo
* Set:

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

* Deploy

---

## 🎨 UI/UX Highlights

* Calm, wellness-focused design
* Glassmorphism cards
* Smooth animations (Framer Motion)
* Responsive layout
* Gamification (badges & streaks)

---

## 📊 Database Models

* User
* Mentor
* Mood
* Chat
* MentorChat
* GroupMessage
* Module
* Achievement
* WellnessPlan
* CrisisAlert
* Notification
* Analytics

---

## ⚠️ Important Notes

* Database name: `mindshield`
* Rotate API keys before production
* Restrict CORS in production
* Admin demo routes use mock data
* Anonymous users are stored in DB

---

## 🌟 Future Enhancements

* Advanced AI sentiment analysis
* Mobile app (React Native)
* Video/audio therapy sessions
* Push notifications
* Multi-language support

---

## 📜 License

This project is built for educational and hackathon purposes.

---
