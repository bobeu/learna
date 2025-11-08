/**eslint-disable */

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

          // Optimized prompt for faster response - shorter and more direct
      // Includes specific instructions for code examples and strict JSON format
      const prompt = `Write a ${maxWords}-word article about "${topic}" for "${campaignName}".

IMPORTANT - Response Format:
Your response must be in JSON format without any markdown code blocks or preprend or append any symbol such as quote, backticks, etc. Do NOT add any text or symbol before or after the outer curly braces. MUST return ONLY valid JSON. Do NOT wrap it in markdown code blocks (\`\`\`json). Do NOT add any text before or after the JSON.
Return the JSON object directly starting with { and ending with } without any text or symbol before or after it. Return the result without appending or prepending the word 'json'.

Required JSON structure:
{"title":"Article Title Here","content":"Full markdown content with code examples","wordCount":${maxWords},"readingTime":${Math.ceil(maxWords / 200)}}

The "content" field should contain the full article in markdown format, including any code examples with proper markdown code blocks.
Return ONLY the raw JSON object starting with { and ending with } with no symbol append or prepend to it, nothing else.

Requirements:
- ${maxWords} maximum words. It could be greater if it contains coding examples or other content.
- Clear language
- Include practical code examples where necessary with proper syntax highlighting
- Where code examples are included, use markdown code blocks with language tags only (e.g., \`\`\`solidity, \`\`\`javascript, \`\`\`typescript, \`\`\`python)
- Code examples should be complete, runnable, and well-commented
- Include at least 2-3 code examples if the topic involves programming
- Markdown headings for structure
- Srutinize your final response very well ensuring it does not start or end with 'json'`;

    const { text } = await aiService.generateTextWithFallback('article', prompt);
    // console.log("Text: ", text)
    type ParsedResponse = { 
      title?: string; 
      content?: string; 
      wordCount?: number;
      readingTime?: number; 
    };

    let parsed: ParsedResponse | null = null;
    const cleanedText = text.trim();
    // console.log("Cleaned Text: ", cleanedText.substring(0, 60))
    try {
      const parsedValue = JSON.parse(cleanedText);
      // console.log("parsedArticle", parsedValue.substring(0, 60));
      if(parsedValue && typeof parsedValue === 'object' && 'content' in parsedValue) {
        parsed = parsedValue as ParsedResponse;
      }
      if(parsed && parsed.content) {
        // console.log("Parsed correct: ", parsed);
        return NextResponse.json({
          title: parsed.title,
          content: parsed.content,
          wordCount: parsed.wordCount,
          readingTime: parsed.readingTime
        });   
      }
    } catch (directParseError) {
      console.log("Direct Parse Error: ", directParseError instanceof Error ? directParseError.message : 'Unknown error');
      // If direct parse fails, try extraction methods
      const extracted = aiService.parseJsonFromText(cleanedText, 'object');
      // console.log("Extracted: ", extracted);
      if (extracted && typeof extracted === 'object' && 'content' in extracted) {
        parsed = extracted as ParsedResponse;
      }

      if(parsed && parsed.content) {
        // console.log("Parsed: ", parsed);
        return NextResponse.json({
          title: parsed.title,
          content: parsed.content || `# ${topic}\n\nThis article covers ${topic} in the context of ${campaignName}.\n\n## Overview\n\n${topic} is an important concept in ${campaignName}. This guide will help you understand the fundamentals and practical applications.\n\n## Key Concepts\n\nUnderstanding ${topic} requires knowledge of core principles and best practices.\n\n## Practical Applications\n\nReal-world examples demonstrate how ${topic} is used in ${campaignName}.\n\n## Conclusion\n\nMastering ${topic} is essential for success in ${campaignName}.`,
          wordCount: parsed.wordCount,
          readingTime: parsed.readingTime
        });   
      }

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
        _error: (directParseError instanceof Error ? directParseError.message : 'AI service unavailable')
      });
    }
  } catch (error: unknown) {
    console.error('Error in generate-article route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate article',
        message: (error instanceof Error ? error.message : 'Unknown error'),
        _fallback: true
      },
      { status: 500 }
    );
  }
}

// Do NOT include backticks or \`\`\`json or any markdown code block markers around the response itself.