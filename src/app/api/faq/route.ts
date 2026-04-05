import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "AI answers are not configured." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const { question } = await req.json();

  if (!question || typeof question !== "string" || question.trim().length < 3) {
    return new Response(
      JSON.stringify({ error: "Please enter a question." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6-20250514",
      max_tokens: 512,
      system:
        "You are a helpful, honest senior care guide for NJ families. Plain English only. Be specific to NJ where relevant. Never recommend a specific facility. Keep answers under 200 words.",
      messages: [{ role: "user", content: question.trim() }],
    });

    // Stream as text/event-stream
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream interrupted." })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Failed to generate answer. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
