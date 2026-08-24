# Smart Online Donation Platform with AI Campaign Recommendations 💖🤖

An intelligent, full-stack crowdfunding and donation platform built for the **Razorpay AI Builder / Open Track**. The platform empowers donors to discover relevant causes using a personalized AI recommendation engine and seamlessly contribute via integrated Razorpay Checkout.

---

## 🌟 Overview & Features

### Core Capabilities
- **Donor Portal**: Browse active campaigns, track personal donation history, manage donor profile.
- **Organization Portal**: Create, edit, and monitor fundraising campaigns, track funds raised.
- **Admin Dashboard**: Comprehensive overview of system stats, user management, and campaign monitoring.
- **Razorpay Payments**: Secure payment workflow featuring server-side order creation, HMAC SHA256 signature verification, and atomic database updates.

### ✨ AI Campaign Recommendation System (New Main Feature)
- **Personalized Cause Matching**: Donors choose from 9 core interest categories (*Education, Healthcare, Children, Rural Development, Environment, Food, Animal Welfare, Disaster Relief, Women Empowerment*) or enter a free-text preference (e.g., *"I want to support education for rural children"*).
- **Dual AI Engine Architecture**:
  - **External LLM Integration**: Uses Google Gemini API (via `AI_API_KEY`) to analyze campaign titles, categories, and descriptions, returning ranked recommendations with dynamic match percentages and custom AI explanations.
  - **Fallback NLP Engine**: If an external AI key is absent, the backend seamlessly executes an in-house weighted text similarity algorithm (TF-IDF, synonym expansion, and category weighting matrix).
- **Dynamic Relevance Scoring & Explanations**: Calculates real relevance match percentages (e.g. `94% Match`) and generates human-readable explanations ("*Why recommended*") for every campaign.
- **Direct Razorpay Payment Connection**: Every recommended campaign includes a **Donate Now** button connecting directly to the Razorpay payment checkout flow without bypassing security.

---

## 🏗️ Architecture & Technology Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v7)
- **State & Storage**: LocalStorage JWT handling
- **Payment SDK**: Razorpay Checkout JS SDK

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens) with Role-Based Access Control (`donor`, `organization`, `admin`)
- **AI Recommendation Engine**: Node.js Backend Service (`backend/services/aiRecommendationService.js`)
- **Payment Engine**: Razorpay Node SDK with server-side HMAC SHA256 verification

---

## 🔌 API Reference - AI Recommendation System

### POST `/api/ai/recommend-campaigns`

**Headers:**
```http
Authorization: Bearer <JWT_DONOR_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "interests": [
    "education",
    "children",
    "rural development"
  ],
  "query": "I want to support education for rural children"
}
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "count": 3,
  "recommendations": [
    {
      "campaign": {
        "_id": "6a34c83ba1cf88e7e75f4131",
        "title": "Education Support for Rural Students",
        "description": "Provide quality educational resources, digital tablets, and school supplies...",
        "category": "Education",
        "goalAmount": 50000,
        "raisedAmount": 35000,
        "image": "https://images.unsplash.com/photo-1509062522246-3755977927d7"
      },
      "score": 94,
      "reason": "This campaign strongly aligns with your interest in Education and Rural Development."
    }
  ]
}
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/online-donation-platform
JWT_SECRET=supersecretjwtkey_12345
RAZORPAY_KEY_ID=rzp_test_TSkx4trY3c4NKu
RAZORPAY_KEY_SECRET=P6ENOPFaej6oW6zeqEwFhdhE
RAZORPAY_WEBHOOK_SECRET=P6ENOPFaej6oW6zeqEwFhdhE

# Optional External AI Key (Falls back to built-in NLP similarity engine if omitted)
AI_API_KEY=your_gemini_or_llm_api_key
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_TSkx4trY3c4NKu
```

---

## 🚀 Local Setup & Running Instructions

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance running locally (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI

### 2. Backend Setup
```bash
cd backend
npm install
node seed_campaigns.js  # Seeds sample active campaigns into MongoDB
node server.js          # Starts backend on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev             # Starts frontend on http://localhost:5173
```

---

## 🧪 Demonstration & Testing Guide (5-Minute Pitch Flow)

1. Open frontend at `http://localhost:5173`.
2. Login as a **Donor** (or sign up a new donor account).
3. Click **✨ AI Recommendations** in the top navigation bar or the Donor Dashboard CTA.
4. Select interests (e.g. *Education*, *Children*, *Rural Development*) and enter a free-text preference.
5. Click **Find Recommended Campaigns**.
6. Observe real-time ranked recommendations with match scores (e.g. `94% Match`) and AI explanations ("Why recommended").
7. Click **Donate Now** on any recommended campaign.
8. Enter a donation amount and click **Proceed to Pay with Razorpay**.
9. Complete the Razorpay test payment modal.
10. Verify donation success notification and notice campaign `raisedAmount` update instantly in the database.
