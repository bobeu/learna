/**eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '../../../services/aiService';

export async function POST(request: NextRequest) {
  try {
    const { campaignName, campaignDescription, knowledgeLevel, experienceNotes } = await request.json();

    if (!campaignName || !knowledgeLevel) {
      return NextResponse.json(
        { error: 'Campaign name and knowledge level are required' },
        { status: 400 }
      );
    }

    // Determine target level based on current level
    const targetLevel = 
      knowledgeLevel === 'beginner' ? 'intermediate' :
      knowledgeLevel === 'intermediate' ? 'advanced' :
      'advanced';

    // Create personalized prompt
    const prompt = `You are an AI tutor for "${campaignName}". Generate a personalized learning path for a user.

Campaign Description: ${campaignDescription || 'Learning platform'}

User's Current Knowledge Level: ${knowledgeLevel}
User's Experience Notes: ${experienceNotes || 'No additional notes provided'}

Learning Goal: Design a learning path that will elevate the user from ${knowledgeLevel} level to ${targetLevel} level.

IMPORTANT - Response Format:
Your response must be in JSON format without any markdown code blocks or prepend or append any symbol such as quote, backticks, etc. Do NOT add any text or symbol before or after the outer curly braces. MUST return ONLY valid JSON. Do NOT wrap it in markdown code blocks (\`\`\`json). Do NOT add any text before or after the JSON.
Return the JSON object directly starting with { and ending with } without any text or symbol before or after it.

Required JSON structure:
{
  "greeting": "Personalized welcome message (2-3 sentences acknowledging their level)",
  "learningPathDescription": "Brief description of the learning path (2-3 sentences)",
  "topics": [
    {
      "id": "topic-1",
      "title": "Topic title",
      "description": "Brief description tailored to ${knowledgeLevel} level",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Requirements:
- Generate 8-15 topics that are appropriate for ${knowledgeLevel} level
- Topics should progressively build from ${knowledgeLevel} to ${targetLevel}
- Consider the user's experience notes: ${experienceNotes || 'none'}
- Vary difficulty levels but ensure they're appropriate for the learning path
- Focus on practical, hands-on learning
- Topics should be sequential and build upon each other
- Return ONLY the raw JSON object, nothing else. No markdown, no code blocks, no explanations.`;

    const { text } = await aiService.generateTextWithFallback('personalized-topics', prompt);
    
    // Parse JSON from response
    type ParsedResponse = { 
      greeting?: string;
      learningPathDescription?: string;
      topics?: Array<{ id: string; title: string; description: string; difficulty: string }>;
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
        greeting: parsed.greeting || `Welcome to ${campaignName}! Let's start your learning journey.`,
        learningPathDescription: parsed.learningPathDescription || `Your personalized learning path for ${campaignName}`,
        topics: parsed.topics,
      });
    }

    // Fallback: generate basic topics
    const fallbackTopics = await aiService.generateTopics(campaignName, campaignDescription || '');
    return NextResponse.json({
      greeting: `Hello! Welcome to the ${campaignName} learning campaign. Let's begin your learning journey!`,
      learningPathDescription: `Your personalized learning path for ${campaignName}`,
      topics: fallbackTopics,
    });
  } catch (error) {
    console.error('Error generating personalized topics:', error);
    return NextResponse.json(
      { error: 'Failed to generate personalized topics' },
      { status: 500 }
    );
  }
}

