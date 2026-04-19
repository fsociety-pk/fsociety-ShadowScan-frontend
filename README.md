# 🖥️ Fsociety ShadowScan - Frontend

This is the user interface for **Fsociety ShadowScan**, a professional-grade OSINT and digital forensics platform. It provides a sleek, terminal-inspired interface for conducting digital investigations.

## 🚀 Features
- **Hacker Aesthetic**: Dark-themed, high-contrast UI inspired by the Fsociety toolkit.
- **Real-time Analytics**: Dashboard for monitoring scan counts and daily metrics.
- **Investigative Case Management**: Organize your search results into distinct investigative cases.
- **Responsive Tools**: Interactive forms for email, username, phone, and metadata extraction.

## 🛠️ Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Ant Design + Custom Hacker Theme
- **State Management**: Redux Toolkit (if applicable) / React Hooks

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+)

### 2. Installation
```bash
# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root based on the template:
```bash
cp .env.example .env
```
Ensure `VITE_API_URL` points to your running backend (e.g., `http://localhost:5000/api`).

### 4. Development
```bash
# Start development server
npm run dev
```

### 5. Production Build
```bash
# Create production bundle
npm run build
```

## 🔐 Security Note
This frontend communicates with the ShadowScan Backend. Ensure the backend is properly secured and environment variables are set before use.

---
*"One click of a mouse and I can take down your whole life."* — Fsociety
