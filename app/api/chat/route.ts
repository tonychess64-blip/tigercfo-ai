import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
const client = new Anthropic();
export async function POST(req: NextRequest) {
  const { prompt, agent, entity, month } = await req.json();
  const sys = "You are " + agent + ", an AI finance assistant for " + entity + " in " + month + ". Provide concise, CFO-ready financial insights.";
  const stream = await client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    system: sys,
    messages: [{ role: "user", content: prompt }],
  });
  const enc = new TextEncoder();
  const body = new ReadableStream({
    async start(ctrl) {
      for await (const ev of stream) {
        if (ev.type === "content_block_delta" && ev.delta.type === "text_delta")
          ctrl.enqueue(enc.encode(ev.delta.text));
      }
      ctrl.close();
    },
  });
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
