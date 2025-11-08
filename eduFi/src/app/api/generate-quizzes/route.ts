import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '../../../services/aiService';

export async function POST(request: NextRequest) {
  const { articleContent, articleTitle, questionCount = 10 } = await request.json();
  try {
    if (!articleContent || !articleTitle) {
      return NextResponse.json(
        { error: 'Article content and title are required' },
        { status: 400 }
      );
    }
    // ${questionCount}
    const prompt = `Generate a minimum of 3 and maximum of 20 quiz questions based on this article about "${articleTitle}":
      
      Article content:
      ${articleContent}
      
      IMPORTANT - Response Format:
      Your response must be in JSON format without any markdown code blocks or preprend or append any symbol such as quote, backticks, etc. Do NOT add any text or symbol before or after the outer curly braces. MUST return ONLY valid JSON. Do NOT wrap it in markdown code blocks (\`\`\`json). Do NOT add any text before or after the JSON array.
      Return the JSON object directly starting with [ and ending with ] without any text or symbol before or after it.
      
      Required JSON structure:
      Return the JSON array directly in this exact format:
      [{"id":"quiz-1","question":"Question text?","options":["Option A","Option B","Option C","Option D"],"correctAnswer":0,"explanation":"Explanation text"},{"id":"quiz-2",...}]
      
      Requirements:
      - Create questions that test understanding of the article, not just memorization
      - Include 4 multiple choice options for each question
      - Provide clear explanations for correct answers
      - Mix difficulty levels (easy, medium, hard)
      - Focus on practical applications and key concepts
      - Return ONLY the raw JSON array, nothing else.`;
    
    const { text } = await aiService.generateTextWithFallback('quizzes', prompt);
    // console.log("Quiz text: ", text);
    // Parse JSON from response
    // First, try direct JSON parsing (AI should return raw JSON per instructions)

    type Response = { 
      id?: string; 
      question?: string; 
      options?: string[];
      correctAnswer?: number;
      explanation?: string;
    };
    type ParsedResponse = Array<Response>;
    
    let quizzes: ParsedResponse | null = null;
    const cleanedText = text.trim();
    // console.log("Cleaned text: ", cleanedText);
    
    try {
      const parsedValue = JSON.parse(cleanedText);
      // console.log("parsedValue: ", parsedValue);

      // console.log("parsedValue", parsedValue.substring(0, 60));
      if (parsedValue && typeof parsedValue === 'object' && Array.isArray(parsedValue)) {
        quizzes = parsedValue as ParsedResponse;
      }
      return NextResponse.json(quizzes);
    } catch (directParseError) {
      // If direct parse fails, try extraction methods
      const extracted = aiService.parseJsonFromText(cleanedText, 'object');
      if (extracted && typeof extracted === 'object') {
        quizzes = extracted as ParsedResponse;
      }
    }
    
    if(quizzes && Array.isArray(quizzes) && quizzes.length > 0) {
      return NextResponse.json(quizzes);
    }

    // Fallback to mock if parsing fails
    console.warn('Using mock quizzes due to parsing failure');
    return aiService.getMockQuizzes(articleTitle, questionCount);
  } catch (error: any) {
    console.error('Error generating quizzes:', error);
    // If it's a model error, log it specifically
    if(error?.message?.includes('404') || error?.message?.includes('not found')) {
      console.error('Model not found error. This might indicate an SDK version issue or incorrect model name.');
    }
    return aiService.getMockQuizzes(articleTitle, questionCount);
  }
}