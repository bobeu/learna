import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { topic, count = 10 } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Create ${count} multiple choice quiz questions about ${topic}. 
    Each question should have 4 options with only one correct answer. 
    Return the response as a JSON array with this structure:
    [
      {
        "question": "Question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct": 0
      }
    ]
    Make sure the questions are educational and test understanding of key concepts.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const quizzes = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error('Error generating quizzes:', error);
    return NextResponse.json({ error: 'Failed to generate quizzes' }, { status: 500 });
  }
}