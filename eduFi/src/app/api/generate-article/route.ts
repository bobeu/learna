import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { topic, campaign } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Create a comprehensive 500-word article about ${topic} in the context of ${campaign}. 
    The article should be educational, engaging, and suitable for learners. 
    Include practical examples and key concepts. Format it in markdown.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const article = response.text();

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Error generating article:', error);
    return NextResponse.json({ error: 'Failed to generate article' }, { status: 500 });
  }
}
