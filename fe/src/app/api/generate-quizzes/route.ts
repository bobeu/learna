import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '../../../services/aiService';

export async function POST(request: NextRequest) {
  try {
    const { articleContent, articleTitle, questionCount = 10 } = await request.json();

    if (!articleContent || !articleTitle) {
      return NextResponse.json(
        { error: 'Article content and title are required' },
        { status: 400 }
      );
    }

    const quizzes = await aiService.generateQuizzes(articleContent, articleTitle, questionCount);
    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Error generating quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to generate quizzes' },
      { status: 500 }
    );
  }
}