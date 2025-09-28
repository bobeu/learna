import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '../../../services/aiService';

export async function POST(request: NextRequest) {
  try {
    const { campaignName, campaignDescription } = await request.json();

    if (!campaignName) {
      return NextResponse.json(
        { error: 'Campaign name is required' },
        { status: 400 }
      );
    }

    const topics = await aiService.generateTopics(campaignName, campaignDescription || '');
    return NextResponse.json(topics);
  } catch (error) {
    console.error('Error generating topics:', error);
    return NextResponse.json(
      { error: 'Failed to generate topics' },
      { status: 500 }
    );
  }
}