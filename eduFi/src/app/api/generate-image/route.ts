import { NextRequest, NextResponse } from "next/server";
import { aiService } from '../../../services/aiService';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: 'no_prompt' }, { status: 400 });

    const uri = await aiService.generateImage(prompt);
    return NextResponse.json({ uri });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}


