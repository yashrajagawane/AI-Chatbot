# 🧠 AI Fitness Coach

An intelligent **AI-powered fitness and nutrition assistant** that generates personalized workout plans, diet suggestions, and fitness guidance in real time.

Built with **Next.js, AI APIs, and a modern chat interface**, this application simulates a professional **AI fitness coaching experience**.

---

# 🌐 Live Demo

🚀 **Try the application**

https://fitness-nutrition-chatbot.vercel.app

Anyone can access the AI coach directly from the browser.

---

# 📸 Preview

AI Fitness Coach interface with:

• Chat-based fitness assistant
• Personalized workout suggestions
• Nutrition guidance
• Structured AI responses

*(Add screenshots here later if you want)*

---

# ⚡ Features

### 🧠 AI Fitness Coach

An AI assistant capable of answering fitness and nutrition questions such as:

* workout plans
* fat loss strategies
* muscle gain programs
* nutrition guidance
* macro calculation
* training schedules

---

### 🧍 User Fitness Profile Memory

Users can store personal fitness data including:

* Age
* Height
* Weight
* Gender
* Fitness Goal
* Activity Level

This information is automatically used by the AI to generate **personalized fitness recommendations**.

---

### 💪 Workout Plan UI Cards

Workout plans are automatically rendered into **visual workout cards** instead of plain text.

Example:

```
Day 1 — Chest
Bench Press
Incline Dumbbell Press
Chest Fly

Day 2 — Back
Pull Ups
Lat Pulldown
Deadlift
```

This makes the UI feel more like a **fitness application** instead of a simple chatbot.

---

### ⚡ Streaming AI Responses

Responses are streamed progressively to simulate **real-time AI typing**, similar to modern AI tools like ChatGPT.

This improves the overall **user experience and interactivity**.

---

### 🗂 Multi Chat Sessions

Users can create multiple chat sessions.

Features include:

* create new consultation
* switch between sessions
* delete chat history

Session data is stored in **localStorage**.

---

### 📝 Markdown Rendering

The chatbot supports formatted responses including:

* headings
* bullet points
* structured plans
* formatted fitness guidance

This makes AI answers **clean and readable**.

---

# 🛠 Tech Stack

### Frontend

* **Next.js (App Router)**
* React
* TailwindCSS
* React Markdown
* Lucide Icons

---

### Backend

* Next.js API Routes
* AI integration using **Gemini API**

---

### Deployment

Hosted on:

**Vercel**

CI/CD deployment directly from GitHub.

---

# 📂 Project Structure

```
app
 ├─ api
 │   └─ chat
 │        route.ts        # AI backend route
 │
 ├─ page.tsx              # Main chatbot UI
 │
components
 └─ WorkoutCard.tsx       # Workout plan UI cards
```

---

# 🔐 Environment Variables

Create a `.env.local` file in the root directory.

Example:

```
GEMINI_API_KEY=your_api_key_here
```

---

# 🚀 Local Development

Clone the repository:

```
git clone https://github.com/yashrajagawane/Fitness-Nutrition-Chatbot.git
```

Install dependencies:

```
npm install
```

Run development server:

```
npm run dev
```

Open:

```
http://localhost:3000
```

---

# 🧠 AI Capabilities

The AI coach can help with:

* personalized workout plans
* diet recommendations
* fat loss strategies
* muscle gain training
* recovery guidance
* fitness goal planning

Responses are structured to resemble **professional fitness coaching advice**.

---

# 🎯 Project Purpose

This project demonstrates how to build a **modern AI-powered web application** using:

* conversational interfaces
* AI model integration
* structured responses
* real-time streaming UI

It serves as a **portfolio-level AI project** showcasing full-stack development and AI integration.

---

# 📈 Future Improvements

Possible future upgrades:

* authentication system
* user dashboard
* saved workout programs
* progress tracking
* mobile optimization
* AI-generated weekly meal plans

---

# 👨‍💻 Author

**Yashraj Agawane**

GitHub:
https://github.com/yashrajagawane

---

# ⭐ Support

If you like this project, please consider **starring the repository**.

It helps others discover the project.
