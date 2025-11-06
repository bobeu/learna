
import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '../../../services/aiService';

export async function POST(request: NextRequest) {
  try {
    const { topicTitle, campaignName, campaignDescription } = await request.json();

    if (!topicTitle || !campaignName) {
      return NextResponse.json(
        { error: 'Topic title and campaign name are required' },
        { status: 400 }
      );
    }

    const prompt = `You are an AI tutor validating if a learning topic is relevant to a campaign.

Campaign Name: "${campaignName}"
Campaign Description: "${campaignDescription || 'A learning platform'}"

User wants to learn about: "${topicTitle}"

Determine if this topic is relevant to the campaign. Consider:
1. Is the topic related to the campaign's main subject?
2. Would learning this topic help someone understand the campaign better?
3. Is the topic appropriate for the campaign's learning goals?

Return your response as a JSON object with this exact structure:
{
  "isValid": true or false,
  "message": "A friendly message explaining your decision",
  "reason": "Brief reason for the validation result (optional)"
}

If the topic is relevant, set isValid to true and provide a positive message.
If the topic is not relevant, set isValid to false and politely explain why, suggesting they might want to choose a topic more aligned with the campaign.`;

    const { text } = await aiService.generateTextWithFallback('rating', prompt);
    
    // Parse JSON from response
    const parsed = aiService.parseJsonFromText(text, 'object');
    
    if (parsed && typeof parsed.isValid === 'boolean') {
      return NextResponse.json({
        isValid: parsed.isValid,
        message: parsed.message || 'Validation completed',
        reason: parsed.reason,
      });
    }

    // Fallback: basic validation (check for keyword matching)
    const normalizedTopic = topicTitle.toLowerCase();
    const normalizedCampaign = campaignName.toLowerCase();
    const normalizedDesc = (campaignDescription || '').toLowerCase();
    
    const isRelevant = normalizedTopic.includes(normalizedCampaign) || 
                      normalizedCampaign.includes(normalizedTopic) ||
                      normalizedDesc.includes(normalizedTopic) ||
                      normalizedTopic.split(' ').some((word: string) => normalizedDesc.includes(word));
    
    return NextResponse.json({
      isValid: isRelevant,
      message: isRelevant 
        ? `Great! "${topicTitle}" is a relevant topic for ${campaignName}.`
        : `"${topicTitle}" doesn't seem directly related to ${campaignName}. Please choose a topic more aligned with the campaign.`,
      reason: isRelevant ? 'Topic matches campaign theme' : 'Topic may not be directly relevant',
    });
  } catch (error) {
    console.error('Error validating topic:', error);
    return NextResponse.json(
      { 
        isValid: false,
        message: 'Failed to validate topic. Please try again.',
        reason: 'Network error',
      },
      { status: 500 }
    );
  }
}

