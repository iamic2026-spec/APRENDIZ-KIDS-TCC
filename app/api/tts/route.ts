import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, voice = "Nika" } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured", fallbackToBrowser: true },
        { status: 503 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // Generate content using gemini-2.5-flash with Nika voice as specified
    let base64Audio: string | null = null;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: text.trim(),
        config: {
          temperature: 1,
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voice || "Nika",
              },
            },
          },
        },
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData?.data) {
            base64Audio = part.inlineData.data;
            break;
          }
        }
      }
    } catch (primaryErr: unknown) {
      console.warn("Attempting gemini-3.8-flash-lite-tts fallback:", primaryErr);
      // Fallback to gemini-3.8-flash-lite-tts if gemini-2.5-flash has version quota difference
      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-3.8-flash-lite-tts",
        contents: text.trim(),
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voice || "Nika",
              },
            },
          },
        },
      });

      const parts = fallbackResponse.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData?.data) {
            base64Audio = part.inlineData.data;
            break;
          }
        }
      }
    }

    if (!base64Audio) {
      return NextResponse.json(
        { error: "No audio generated", fallbackToBrowser: true },
        { status: 500 }
      );
    }

    return NextResponse.json({
      audio: base64Audio,
      format: "audio/wav",
      voice: "Nika",
    });
  } catch (error: unknown) {
    console.warn("Gemini TTS endpoint error:", error);
    const message = error instanceof Error ? error.message : "TTS Generation error";
    return NextResponse.json(
      { error: message, fallbackToBrowser: true },
      { status: 500 }
    );
  }
}
