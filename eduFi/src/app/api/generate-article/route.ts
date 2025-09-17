import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '../../../services/aiService';

export async function POST(request: NextRequest) {
  try {
    const { topic, campaignName, maxWords = 500 } = await request.json();

    if (!topic || !campaignName) {
      return NextResponse.json(
        { error: 'Topic and campaign name are required' },
        { status: 400 }
      );
    }

    const article = await aiService.generateArticle(topic, campaignName, maxWords);
    return NextResponse.json(article);
  } catch (error) {
    console.error('Error generating article:', error);
    return NextResponse.json(
      { error: 'Failed to generate article' },
      { status: 500 }
    );
  }
}