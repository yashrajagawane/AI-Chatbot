import { NextResponse } from "next/server";

/*
  VITALIS AI - FITNESS & NUTRITION ENGINE
  Backend API Route for Gemini AI
*/

const MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

export async function POST(req: Request) {
  try {

    /* -------------------------------
       1️⃣ Parse Request
    --------------------------------*/

    const body = await req.json();
    const message: string = body?.message;
    const history = body?.history || [];

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message must be a valid string." },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Message too long." },
        { status: 400 }
      );
    }

    /* -------------------------------
       2️⃣ Validate API Key
    --------------------------------*/

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY environment variable");
      return NextResponse.json(
        { error: "AI service configuration error." },
        { status: 500 }
      );
    }

    /* -------------------------------
       3️⃣ Prepare Conversation
    --------------------------------*/

    const recentHistory = history.slice(-10);

    const contents = recentHistory.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    /* -------------------------------
       4️⃣ Gemini Request Payload
    --------------------------------*/

    const payload = {
      contents,

      systemInstruction: {
        role: "system",
        parts: [
          {
            text: `
You are **Vitalis**, an elite AI Fitness Coach and Sports Nutrition Specialist.

EXPERTISE
• Workout programming (strength, hypertrophy, HIIT)
• Weight loss strategies
• Sports nutrition and macros
• Supplement science
• Recovery and lifestyle wellness

STYLE
• Professional and motivating
• Use bullet points and headings
• Use Markdown tables for workout or diet plans

DOMAIN RESTRICTION
If the user asks unrelated topics respond:
"As your personal fitness coach, I specialize exclusively in health, training, and nutrition."

SAFETY RULES
• Never give medical diagnosis
• Recommend consulting professionals for injuries

MANDATORY DISCLAIMER
Append this text at the end of every response:

---
*Disclaimer: This guidance is for educational purposes and should not replace advice from certified medical or fitness professionals.*
`
          }
        ]
      },

      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
      },

      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    /* -------------------------------
       5️⃣ Call Gemini API
    --------------------------------*/

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(
      `${GEMINI_ENDPOINT}/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);

      return NextResponse.json(
        { error: "AI service failed to respond." },
        { status: 500 }
      );
    }

    /* -------------------------------
       6️⃣ Parse AI Response
    --------------------------------*/

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn't generate a response right now.";

    return NextResponse.json({
      reply,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {

    console.error("Vitalis API route error:", error);

    if (error.name === "AbortError") {
      return NextResponse.json(
        { error: "The AI coach took too long to respond." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}