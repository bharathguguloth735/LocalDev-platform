# LocalDev Connect

A premium, full-stack business platform designed to connect local talent with business opportunities. This platform features a high-fidelity "Pure White" executive aesthetic, real-time messaging, AI-powered project estimation, and secure payment integrations.

## 🚀 Key Features
- **Client & Student Portals**: Specialized dashboards for project management and talent showcase.
- **AI Concierge (Aura)**: A Gemini-powered neural assistant for project drafting and budget estimation.
- **Real-time Collaboration**: Integrated messaging system with Socket.io.
- **Secure Payments**: Razorpay integration for milestone-based settlements.
- **Project Tracking**: Milestone-driven progress monitoring with automated status updates.

## 🛠️ Technology Stack
- **Frontend**: React.js, Vite, Vanilla CSS (Premium UI System), Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express.js, MongoDB (Atlas), Mongoose.
- **AI**: Google Gemini Pro & Flash, Groq.
- **Storage**: AWS S3 for secure file management.

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- AWS S3 Bucket
- API Keys for Gemini, Razorpay, and Brevo (Email).

### 2. Installation
Clone the repository and install dependencies in both root, frontend, and backend:
```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 3. Environment Setup
Create a `.env` file in the `backend` folder and add your credentials (refer to `.env.example`).

### 4. Running the Project
```bash
npm run dev
```

## 📄 License
This project is for internal development and private business use.
