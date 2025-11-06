/**eslint-disable */
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

    // Optimized prompt - explicitly request JSON only without markdown
    const prompt = `You are an AI tutor for "${campaignName}".

Campaign Description: ${campaignDescription || 'Learning platform'}

IMPORTANT - Response Format:
You MUST return ONLY valid JSON. Do NOT wrap it in markdown code blocks (\`\`\`json). Do NOT add any text before or after the JSON.
Return the JSON object directly starting with { and ending with }.

Required JSON structure:
{"greeting":"Welcome message (2-3 sentences)","campaignInfo":"Campaign info (2-3 sentences)","topics":[{"id":"topic-1","title":"Topic title","description":"Brief description","difficulty":"easy"},{"id":"topic-2","title":"Topic title","description":"Brief description","difficulty":"medium"},{"id":"topic-3","title":"Topic title","description":"Brief description","difficulty":"hard"},{"id":"topic-4","title":"Topic title","description":"Brief description","difficulty":"easy"},{"id":"topic-5","title":"Topic title","description":"Brief description","difficulty":"medium"}]}

Requirements:
- Minimum 5 topics
- Vary difficulty levels (easy, medium, hard)
- Practical, hands-on focus
- Return ONLY the raw JSON object, nothing else. No markdown, no code blocks, no explanations.`;

    const { text } = await aiService.generateTextWithFallback('topics', prompt);
    
    // Parse JSON from response
    // First, try direct JSON parsing (AI should return raw JSON per instructions)
    type ParsedResponse = { 
      greeting?: string; 
      campaignInfo?: string; 
      topics?: Array<{ id: string; title: string; description: string; difficulty: string }> 
    };
    
    let parsed: ParsedResponse | null = null;
    const cleanedText = text.trim();
    
    try {
      const parsedValue = JSON.parse(cleanedText);
      if (parsedValue && typeof parsedValue === 'object' && 'topics' in parsedValue) {
        parsed = parsedValue as ParsedResponse;
      }
    } catch (directParseError) {
      // If direct parse fails, try extraction methods
      const extracted = aiService.parseJsonFromText(cleanedText, 'object');
      if (extracted && typeof extracted === 'object' && 'topics' in extracted) {
        parsed = extracted as ParsedResponse;
      }
    }
    
    if (parsed && parsed.topics && Array.isArray(parsed.topics) && parsed.topics.length > 0) {
      return NextResponse.json({
        greeting: parsed.greeting || `Welcome to ${campaignName}!`,
        campaignInfo: parsed.campaignInfo || campaignDescription || '',
        topics: parsed.topics,
      });
    }

    // Fallback: generate topics separately
    const topics = await aiService.generateTopics(campaignName, campaignDescription || '');
    return NextResponse.json({
      greeting: `Hello! Welcome to the ${campaignName} learning campaign. Let's begin your learning journey!`,
      campaignInfo: campaignDescription || `Learn about ${campaignName} and earn crypto rewards for your progress.`,
      topics,
    });
  } catch (error) {
    console.error('Error generating topics with greeting:', error);
    return NextResponse.json(
      { error: 'Failed to generate topics' },
      { status: 500 }
    );
  }
}

