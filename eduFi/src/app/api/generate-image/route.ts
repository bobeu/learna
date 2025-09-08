import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  if (!prompt) return NextResponse.json({ error: 'no_prompt' }, { status: 400 });

  // Mock image generation. Replace with Google AI Studio / OpenAI Images.
  // Save API keys in env.example as placeholders.
  // const resp = await fetch('https://generative-api', { ... })
  const uri = `ipfs://ai-generated/mock/${encodeURIComponent(prompt.slice(0, 32))}`;
  return NextResponse.json({ uri });
}


