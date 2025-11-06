import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '../../../services/aiService';

/**
 * Generate Article API Route
 * 
 * Handles article generation with proper error handling and fallback
 * - Validates input parameters
 * - Calls AI service (timeouts handled internally by the service)
 * - Returns fallback content if API fails
 * - Provides detailed error messages
 */
export async function POST(request: NextRequest) {
  try {
    const { topic, campaignName, maxWords = 5000 } = await request.json();

    if (!topic || !campaignName) {
      return NextResponse.json(
        { error: 'Topic and campaign name are required' },
        { status: 400 }
      );
    }

    // Let the AI service handle timeouts internally
    // No route-level timeout - let the service handle all timeout logic
    try {
      const article = await aiService.generateArticle(topic, campaignName, maxWords);
      return NextResponse.json(article);
    } catch (apiError: any) {
      console.error('AI Service error:', apiError);
      
      // Return fallback article instead of failing completely
      const fallbackArticle = {
        title: `${topic} - ${campaignName}`,
        content: `# ${topic}\n\nThis article covers ${topic} in the context of ${campaignName}.\n\n## Overview\n\n${topic} is an important concept in ${campaignName}. This guide will help you understand the fundamentals and practical applications.\n\n## Key Concepts\n\nUnderstanding ${topic} requires knowledge of core principles and best practices.\n\n## Practical Applications\n\nReal-world examples demonstrate how ${topic} is used in ${campaignName}.\n\n## Conclusion\n\nMastering ${topic} is essential for success in ${campaignName}.`,
        wordCount: maxWords,
        readingTime: Math.ceil(maxWords / 200)
      };

      // Still return 200 but include error flag for client-side handling
      return NextResponse.json({
        ...fallbackArticle,
        _fallback: true,
        _error: apiError?.message || 'AI service unavailable'
      });
    }
  } catch (error: any) {
    console.error('Error in generate-article route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate article',
        message: error?.message || 'Unknown error',
        _fallback: true
      },
      { status: 500 }
    );
  }
}