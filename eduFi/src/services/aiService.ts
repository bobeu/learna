/* eslint-disable */

/**
 * AI Service for Learna - Google Gemini Integration

 * MODEL SELECTION:
 * - Text Generation (topics, articles, quizzes, ratings): Uses NEXT_PUBLIC_TEXT_GENERATION_MODEL (default: gemini-2.5-flash)
 *   Falls back to: gemini-2.5-flash -> gemini-1.5-pro -> gemini-pro
 * - Image Generation: Uses NEXT_PUBLIC_IMAGE_GENERATION_MODEL (default: gemini-2.5-flash-image)
 *   Falls back to: gemini-2.5-flash-image
 * 
 * ENV VARIABLES:
 * API Keys: GEMINI_API_KEY, NEXT_PUBLIC_GEMINI_API_KEY, 
 *           GOOGLE_GEMINI_API_KEY, NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY
 * Text Model: NEXT_PUBLIC_TEXT_GENERATION_MODEL (default: gemini-2.5-flash)
 * Image Model: NEXT_PUBLIC_IMAGE_GENERATION_MODEL (default: gemini-2.5-flash-image)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Fallback models for text generation (used if env model fails)
const TEXT_GENERATION_FALLBACKS = ['gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-pro'];

// Fallback models for image generation
const IMAGE_GENERATION_FALLBACKS = ['gemini-2.5-flash-image'];

type TextTaskType = 'topics' | 'article' | 'quizzes' | 'rating';

class AIService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    // Support both old and new env variable names
    const apiKey = process.env.GEMINI_API_KEY || 
                   process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
                   process.env.GOOGLE_GEMINI_API_KEY ||
                   process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;
    
    if(apiKey && apiKey !== 'mock_gemini_key' && apiKey !== 'mock_google_ai_studio_key') {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
      } catch (error) {
        console.error('Failed to initialize Google Generative AI:', error);
      }
    }
  }

  /**
   * Generate text content with model fallback
   * Uses NEXT_PUBLIC_TEXT_GENERATION_MODEL or falls back to default models
   */
  private async generateTextWithFallback(
    taskType: TextTaskType,
    prompt: string
  ): Promise<{ response: any; text: string }> {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured');
    }

    // Get the text generation model from environment variable
    const envTextModel = process.env.NEXT_PUBLIC_TEXT_GENERATION_MODEL;
    
    // Build list of models to try: env model first, then fallbacks
    const modelsToTry = envTextModel 
      ? [envTextModel, ...TEXT_GENERATION_FALLBACKS.filter(m => m !== envTextModel)]
      : TEXT_GENERATION_FALLBACKS;

    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return { response, text };
      } catch (error: any) {
        lastError = error;
        console.warn(`Failed to use model ${modelName} for ${taskType}, trying next...`);
        
        // If it's a 404 (model not found), continue to next model
        if (error?.message?.includes('404') || error?.message?.includes('not found')) {
          continue;
        }
        
        // For other errors, still try next model but log the error
        continue;
      }
    }

    // If all models fail, throw the last error
    throw lastError || new Error(`All text generation model attempts failed for ${taskType}`);
  }

  /**
   * Parse JSON from AI response text
   * Handles various formats including markdown code blocks
   */
  private parseJsonFromText(text: string, expectedType: 'array' | 'object'): any {
    // First try to find JSON directly
    let jsonMatch = expectedType === 'array' 
      ? text.match(/\[[\s\S]*\]/)
      : text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      // Try to find JSON in markdown code blocks
      jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch (e) {
          // Try the whole match if first attempt fails
          jsonMatch = [jsonMatch[1]];
        }
      }
    }

    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.warn('Failed to parse JSON from response:', parseError);
        return null;
      }
    }

    return null;
  }

  async generateTopics(campaignName: string, campaignDescription: string): Promise<Array<{
    id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>> {
    try {
      if (!this.genAI) {
        // Fallback to mock data
        return this.getMockTopics(campaignName);
      }

      const prompt = `Generate 3 educational topics for a learning campaign about "${campaignName}". 
      Campaign description: "${campaignDescription}"
      
      Return a JSON array with objects containing:
      - id: unique identifier
      - title: topic title
      - description: brief description
      - difficulty: "easy", "medium", or "hard"
      
      Focus on practical, hands-on learning topics that would be valuable for developers and learners.`;

      // Generate content with automatic model fallback
      const { text } = await this.generateTextWithFallback('topics', prompt);
      
      // Parse JSON from response
      const parsed = this.parseJsonFromText(text, 'array');
      if (parsed && Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      
      // Fallback to mock if parsing fails
      console.warn('Using mock topics due to parsing failure');
      return this.getMockTopics(campaignName);
    } catch (error: any) {
      console.error('Error generating topics:', error);
      // If it's a model error, log it specifically
      if (error?.message?.includes('404') || error?.message?.includes('not found')) {
        console.error('Model not found error. This might indicate an SDK version issue or incorrect model name.');
      }
      return this.getMockTopics(campaignName);
    }
  }

  async generateArticle(topic: string, campaignName: string, maxWords: number = 500): Promise<{
    title: string;
    content: string;
    wordCount: number;
    readingTime: number;
  }> {
    try {
      if (!this.genAI) {
        return this.getMockArticle(topic, maxWords);
      }

      const prompt = `Write a comprehensive educational article about "${topic}" for the "${campaignName}" learning campaign.
      
      Requirements:
      - Write exactly ${maxWords} words
      - Use clear, engaging language
      - Include practical examples and code snippets where relevant
      - Structure with proper headings (##, ###)
      - Focus on hands-on learning and real-world applications
      - Make it suitable for developers and technical learners
      
      Format the response as JSON with:
      - title: article title
      - content: full article content in markdown
      - wordCount: actual word count
      - readingTime: estimated reading time in minutes`;

      // Generate content with automatic model fallback
      const { text } = await this.generateTextWithFallback('article', prompt);
      
      // Parse JSON from response
      const parsed = this.parseJsonFromText(text, 'object');
      if (parsed && typeof parsed === 'object') {
        return {
          title: parsed.title || topic,
          content: parsed.content || text,
          wordCount: parsed.wordCount || maxWords,
          readingTime: parsed.readingTime || (maxWords > 0 ? Math.ceil(maxWords / 200) : 0)
        };
      }
      
      // Fallback to mock if parsing fails
      console.warn('Using mock article due to parsing failure');
      return this.getMockArticle(topic, maxWords);
    } catch (error: any) {
      console.error('Error generating article:', error);
      // If it's a model error, log it specifically
      if (error?.message?.includes('404') || error?.message?.includes('not found')) {
        console.error('Model not found error. This might indicate an SDK version issue or incorrect model name.');
      }
      return this.getMockArticle(topic, maxWords);
    }
  }

  async generateQuizzes(articleContent: string, articleTitle: string, questionCount: number = 10): Promise<Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>> {
    try {
      if (!this.genAI) {
        return this.getMockQuizzes(articleTitle, questionCount);
      }

      const prompt = `Generate ${questionCount} quiz questions based on this article about "${articleTitle}":
      
      Article content:
      ${articleContent}
      
      Requirements:
      - Create questions that test understanding, not just memorization
      - Include 4 multiple choice options for each question
      - Provide clear explanations for correct answers
      - Mix difficulty levels (easy, medium, hard)
      - Focus on practical applications and key concepts
      
      Return JSON array with objects containing:
      - id: unique identifier
      - question: the question text
      - options: array of 4 answer options
      - correctAnswer: index of correct answer (0-3)
      - explanation: explanation for the correct answer`;

      // Generate content with automatic model fallback
      const { text } = await this.generateTextWithFallback('quizzes', prompt);
      
      // Parse JSON from response
      const parsed = this.parseJsonFromText(text, 'array');
      if (parsed && Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      
      // Fallback to mock if parsing fails
      console.warn('Using mock quizzes due to parsing failure');
      return this.getMockQuizzes(articleTitle, questionCount);
    } catch (error: any) {
      console.error('Error generating quizzes:', error);
      // If it's a model error, log it specifically
      if (error?.message?.includes('404') || error?.message?.includes('not found')) {
        console.error('Model not found error. This might indicate an SDK version issue or incorrect model name.');
      }
      return this.getMockQuizzes(articleTitle, questionCount);
    }
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      if (!this.genAI) {
        // Return a working IPFS URI for mock images
        return `ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme-original.png`;
      }

      // Get the image generation model from environment variable
      const envImageModel = process.env.NEXT_PUBLIC_IMAGE_GENERATION_MODEL;
      
      // Build list of models to try: env model first, then fallbacks
      const modelsToTry = envImageModel 
        ? [envImageModel, ...IMAGE_GENERATION_FALLBACKS.filter(m => m !== envImageModel)]
        : IMAGE_GENERATION_FALLBACKS;

      let lastError: any = null;

      for (const modelName of modelsToTry) {
        try {
          const model = this.genAI.getGenerativeModel({ model: modelName });
          
          // For image generation, we use generateContent with the prompt
          // The response should contain image data or a URL
          const result = await model.generateContent(prompt);
          const response = await result.response;
          
          // Check if response contains image data
          // Gemini 2.5 Flash Image may return base64 encoded image or a URL
          const parts = response.candidates?.[0]?.content?.parts;
          
          if (parts && parts.length > 0) {
            // Check for inline data (base64 image)
            const inlineData = parts.find(part => part.inlineData);
            if (inlineData?.inlineData) {
              // Convert base64 to data URL or save to IPFS
              // For now, return the data URL format
              const mimeType = inlineData.inlineData.mimeType || 'image/png';
              const base64Data = inlineData.inlineData.data;
              return `data:${mimeType};base64,${base64Data}`;
            }
            
            // Check for text that might contain a URL
            const text = parts.find(part => part.text);
            if (text?.text) {
              // Try to extract URL from text
              const urlMatch = text.text.match(/https?:\/\/[^\s]+|ipfs:\/\/[^\s]+/);
              if (urlMatch) {
                return urlMatch[0];
              }
            }
          }
          
          // If no image data found in response, try fallback
          console.warn(`No image data found in response from ${modelName}, trying next model...`);
          continue;
        } catch (error: any) {
          lastError = error;
          console.warn(`Failed to use model ${modelName} for image generation, trying next...`);
          
          // If it's a 404 (model not found), continue to next model
          if (error?.message?.includes('404') || error?.message?.includes('not found')) {
            continue;
          }
          
          // For other errors, still try next model
          continue;
        }
      }

      // If all models fail, log error and return fallback
      if (lastError) {
        console.error('Error generating image with all models:', lastError);
      }
      
      // Return a working fallback IPFS URI
      return `ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme-original.png`;
    } catch (error) {
      console.error('Error generating image:', error);
      // Return a working fallback IPFS URI
      return `ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme-original.png`;
    }
  }

  private getMockTopics(campaignName: string) {
    return [
      {
        id: '1',
        title: `${campaignName} Fundamentals`,
        description: 'Learn the basic concepts and principles',
        difficulty: 'easy' as const
      },
      {
        id: '2',
        title: `Advanced ${campaignName} Concepts`,
        description: 'Dive deeper into complex implementations',
        difficulty: 'medium' as const
      },
      {
        id: '3',
        title: `${campaignName} Best Practices`,
        description: 'Industry standards and optimization techniques',
        difficulty: 'hard' as const
      }
    ];
  }

  private getMockArticle(topic: string, maxWords: number) {
    const content = `# ${topic}

${topic} is a fundamental concept in modern technology that has revolutionized the way we approach digital solutions. This comprehensive guide will walk you through the essential principles, practical applications, and advanced techniques.

## Understanding the Basics

The core principles of ${topic} revolve around efficiency, scalability, and user experience. These foundational concepts form the backbone of successful implementations and are crucial for anyone looking to master this technology.

## Key Components

### Core Architecture
The architecture of ${topic} is built on several key components that work together to create a robust and reliable system. Understanding these components is essential for effective implementation.

### Implementation Patterns
There are several proven patterns for implementing ${topic} solutions. Each pattern has its own strengths and use cases, making it important to choose the right approach for your specific needs.

## Practical Applications

### Real-World Use Cases
${topic} has been successfully implemented across various industries, from finance to healthcare, demonstrating its versatility and potential for widespread adoption.

### Best Practices
Following industry best practices ensures that your ${topic} implementation is secure, maintainable, and scalable. These practices have been refined through years of real-world experience.

## Advanced Techniques

### Optimization Strategies
Advanced optimization techniques can significantly improve the performance and efficiency of your ${topic} implementation. These strategies require a deep understanding of the underlying principles.

### Integration Approaches
Integrating ${topic} with existing systems requires careful planning and consideration of various factors including compatibility, performance, and security.

## Getting Started

To begin your journey with ${topic}, start by understanding the basic concepts and gradually work your way up to more complex implementations. Practice with small projects before tackling larger, more complex systems.

## Conclusion

Mastering ${topic} opens up numerous opportunities in the technology landscape. With dedication and practice, you can become proficient in this powerful technology and contribute to innovative solutions that shape the future of digital systems.`;

    return {
      title: topic,
      content,
      wordCount: maxWords,
      readingTime: Math.ceil(maxWords / 200)
    };
  }

  private getMockQuizzes(articleTitle: string, questionCount: number) {
    const mockQuizzes = [
      {
        id: '1',
        question: `What is the primary focus of ${articleTitle}?`,
        options: ['Basic concepts', 'Advanced techniques', 'Practical applications', 'All of the above'],
        correctAnswer: 3,
        explanation: 'The article covers all aspects of the topic comprehensively.'
      },
      {
        id: '2',
        question: 'Which is most important for understanding this topic?',
        options: ['Memorization', 'Practical application', 'Theoretical knowledge', 'Speed'],
        correctAnswer: 1,
        explanation: 'Practical application helps solidify understanding and builds real-world skills.'
      },
      {
        id: '3',
        question: 'What should you do first when learning this topic?',
        options: ['Jump to advanced concepts', 'Understand the basics', 'Start with complex projects', 'Skip the fundamentals'],
        correctAnswer: 1,
        explanation: 'Understanding the basics is crucial before moving to more complex implementations.'
      },
      {
        id: '4',
        question: 'What makes this technology versatile?',
        options: ['High cost', 'Complex setup', 'Wide range of applications', 'Limited documentation'],
        correctAnswer: 2,
        explanation: 'The technology has been successfully implemented across various industries.'
      },
      {
        id: '5',
        question: 'What is essential for successful implementation?',
        options: ['Following best practices', 'Ignoring security', 'Rushing the process', 'Avoiding testing'],
        correctAnswer: 0,
        explanation: 'Following industry best practices ensures secure, maintainable, and scalable implementations.'
      }
    ];

    return mockQuizzes.slice(0, Math.min(questionCount, mockQuizzes.length));
  }
}

export const aiService = new AIService();
export default aiService;
