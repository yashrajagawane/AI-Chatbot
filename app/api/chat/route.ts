import { NextResponse } from "next/server";

/**
 * AI FITNESS COACH - GEMINI ENGINE
 * Persona: Elite Fitness & Nutrition Coach
 * Features: Highly Structured Output, Conversation Memory, Domain Guardrails
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "A valid message string is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY environment variable.");
      return NextResponse.json(
        { error: "AI service configuration error." },
        { status: 500 }
      );
    }

    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // Map conversation history to Gemini format (user -> user, assistant -> model)
    const contents = (history || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const payload = {
      contents,
      systemInstruction: {
        role: "system",
        parts: [
          {
            text: `You are **AI Fitness Coach**, an elite fitness and nutrition expert.

IMPORTANT RESPONSE FORMAT:

Always answer using the following structure.

## 🧠 Quick Summary
Give a short 1–2 sentence overview.

## 💪 Key Points
Use bullet points explaining the main idea.

## 📋 Action Plan
Give practical steps the user can follow.

## 🥗 Nutrition Tips (if relevant)
Provide diet guidance.

## ⚠️ Important Notes
Mention safety or professional advice if needed.

STYLE RULES
• Use headings with emojis
• Use bullet points for clarity
• Keep answers structured and easy to read
• Avoid long paragraphs
• Focus on practical advice

DOMAIN LIMIT
Only answer fitness, workout, nutrition, health optimization topics.

If the question is unrelated respond with:
"As your AI Fitness Coach I specialize only in fitness and nutrition guidance."

DISCLAIMER
Always add this at the end:

---
*Disclaimer: This guidance is for educational purposes and should not replace professional medical or fitness advice.*`,
          },
        ],
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API Error:", errorData);
      return NextResponse.json(
        { error: "The AI coach encountered an error. Please try again." },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Extract Gemini's text response
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "I'm sorry, I encountered a roadblock in generating your fitness plan. Please rephrase your query.";

    return NextResponse.json({
      reply,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("Vitalis API Route Error:", error);

    if (error.name === "AbortError") {
      return NextResponse.json(
        { error: "The AI coach took too long to respond. Please simplify your request." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Coach is currently offline. Please try again in a few moments." },
      { status: 500 }
    );
  }
}