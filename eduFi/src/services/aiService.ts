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
// import { GoogleGenAI } from "@google/genai";

// Fallback models for text generation (used if env model fails)
const TEXT_GENERATION_FALLBACKS = [
  process.env.TEXT_GENERATION_MODEL,
  process.env.ARTICLE_GENERATION_MODEL_FIRST_TRY
].filter((model): model is string => !!model); // Filter out undefined/null values

// Fallback models for image generation
const IMAGE_GENERATION_FALLBACKS = [
  process.env.IMAGE_GENERATION_MODEL
].filter((model): model is string => !!model);

type TextTaskType = 'topics' | 'article' | 'quizzes' | 'rating';

class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  // private imagenAI: GoogleGenAI | null = null;

  constructor() {
    // Support both old and new env variable names
    const apiKey = process.env.GEMINI_API_KEY;
    
    if(apiKey && apiKey !== 'mock_gemini_key' && apiKey !== 'mock_google_ai_studio_key') {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        // console.log("apiKey", process.env.GEMINI_API_KEY);
        // this.imagenAI = new GoogleGenAI({apiKey});
        // console.log("this.imagenAI", this.imagenAI);
        // console.log("this.genAI", this.genAI);
      } catch (error) {
        console.error('Failed to initialize Google Generative AI:', error);
      }
    }
  }

  /**
   * Create a timeout promise that rejects after specified milliseconds
   */
  private createTimeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms);
    });
  }

  /**
   * Generate text content with model fallback, timeout, and retry logic
   * Uses NEXT_PUBLIC_TEXT_GENERATION_MODEL or falls back to default models
   */
  async generateTextWithFallback(
    taskType: TextTaskType,
    prompt: string,
    timeoutMs: number = taskType === 'article' ? 60000 : 30000 // 60s for articles, 30s for others
  ): Promise<{ response: any; text: string }> {
    if(!this.genAI) {
      throw new Error('Gemini API key not configured');
    }

    // Get the text generation model from environment variable
    const envTextModel = process.env.TEXT_GENERATION_MODEL;
    
    // Build list of models to try: env model first, then fallbacks (excluding the env model if it's in fallbacks)
    const modelsToTry = envTextModel 
      ? [envTextModel, ...TEXT_GENERATION_FALLBACKS.filter(m => m && m !== envTextModel)]
      : TEXT_GENERATION_FALLBACKS;
    
    // Ensure we have at least one model to try
    if(modelsToTry.length === 0) {
      throw new Error('No models available for text generation');
    }

    let lastError: any = null;
    const maxRetries = 2;

    for (const modelName of modelsToTry) {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const model = this.genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              // maxOutputTokens: taskType === 'article' ? 2048 : 1024, // Reduce tokens for topics
            }
          });

          // Add timeout wrapper with proper promise handling
          const generatePromise = model.generateContent(prompt).then(result => result.response);
          const timeoutPromise = this.createTimeoutPromise(timeoutMs);
          
          const response = await Promise.race([generatePromise, timeoutPromise]);
          const text = response.text();
          
          return { response, text };
        } catch (error: any) {
          console.warn("Error: ", error);
          lastError = error;
          
          // Check for specific error types
          const errorMessage = error?.message || String(error) || '';
          const errorString = errorMessage.toLowerCase();
          const isNetworkError = errorString.includes('fetch failed') || 
                                errorString.includes('network') ||
                                errorString.includes('timeout') ||
                                errorString.includes('econnreset') ||
                                errorString.includes('enotfound') ||
                                errorString.includes('econnrefused') ||
                                error?.name === 'TypeError' && errorMessage.includes('fetch');
          const isModelNotFound = errorString.includes('404') || 
                                 errorString.includes('not found') ||
                                 errorString.includes('model not found');
          const isRateLimit = errorString.includes('429') || 
                            errorString.includes('rate limit') ||
                            errorString.includes('quota');
          
          // If model not found, skip to next model
          if(isModelNotFound) {
            console.warn(`Model ${modelName} not found, trying next...`);
            break; // Break inner loop, continue to next model
          }
          
          // If rate limited, wait and retry
          if(isRateLimit && attempt < maxRetries) {
            const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
            console.warn(`Rate limited on ${modelName}, retrying in ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue; // Retry same model
          }
          
          // If network error and not last attempt, retry
          if(isNetworkError && attempt < maxRetries) {
            const waitTime = Math.pow(2, attempt) * 1000;
            console.warn(`Network error on ${modelName}, retrying in ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue; // Retry same model
          }
          
          // If last attempt for this model, log and try next model
          if(attempt === maxRetries) {
            console.warn(`Failed to use model ${modelName} for ${taskType} after ${maxRetries + 1} attempts, trying next...`);
            break; // Break inner loop, continue to next model
          }
        }
      }
    }

    // If all models fail, provide a helpful error message
    const errorMessage = lastError?.message || 'Unknown error';
    throw new Error(`Failed to generate ${taskType} after trying all models. Last error: ${errorMessage}`);
  }

  /**
   * Clean and repair JSON string
   */
  private cleanJsonString(jsonStr: string): string {
    if(!jsonStr || typeof jsonStr !== 'string') return '';
    
    // Remove markdown code block markers if still present
    jsonStr = jsonStr.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/g, '');
    
    // Remove trailing commas before closing brackets/braces (multiple passes for nested structures)
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1'); // Second pass for nested
    
    // Remove comments (single line and multi-line)
    jsonStr = jsonStr.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Remove any trailing commas in arrays/objects (final pass)
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
    
    // Remove any leading/trailing whitespace and newlines
    return jsonStr.trim();
  }

  /**
   * Extract JSON from markdown code blocks with improved regex
   * Handles cases where JSON content itself contains code blocks
   */
  private extractFromMarkdown(text: string): string | null {
    // Strategy: Find ```json or ```, then extract JSON using brace counting
    // This avoids issues with nested ``` in JSON content
    
    // Find the start of ```json or ```
    const jsonBlockMatch = text.match(/```json/i);
    const genericBlockMatch = text.match(/```(?!json)/i);
    
    let blockStart = -1;
    let contentStartOffset = 3; // Default for ```
    
    if(jsonBlockMatch && jsonBlockMatch.index !== undefined) {
      blockStart = jsonBlockMatch.index;
      contentStartOffset = 8; // ```json is 8 chars
    } else if(genericBlockMatch && genericBlockMatch.index !== undefined) {
      blockStart = genericBlockMatch.index;
      contentStartOffset = 3; // ``` is 3 chars
    }
    
    if(blockStart !== -1) {
      // Find where the actual JSON content starts (after ```json or ``` and optional newline)
      let contentStart = blockStart + contentStartOffset;
      // Skip whitespace and newlines
      while(contentStart < text.length && /\s/.test(text[contentStart])) {
        contentStart++;
      }
      
      // Now extract the JSON object/array using brace counting
      // This properly handles nested code blocks in JSON strings
      const contentFromStart = text.substring(contentStart);
      const jsonStart = contentFromStart.indexOf('{');
      const arrayStart = contentFromStart.indexOf('[');
      
      if(jsonStart !== -1 && (arrayStart === -1 || jsonStart < arrayStart)) {
        // Extract JSON object
        const jsonExtract = this.extractJsonObject(contentFromStart.substring(jsonStart));
        if(jsonExtract) {
          return jsonExtract;
        }
      } else if(arrayStart !== -1) {
        // Extract JSON array
        const jsonExtract = this.extractJsonArray(contentFromStart.substring(arrayStart));
        if(jsonExtract) {
          return jsonExtract;
        }
      }
    }
    
    // Fallback: Try regex patterns (works if no nested ``` in JSON)
    const patterns = [
      /```json\s*\n?([\s\S]*?)\n?\s*```/i,
      /```\s*\n?([\s\S]*?)\n?\s*```/,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if(match && match[1]) {
        let content = match[1].trim();
        
        // Verify it looks like JSON
        if(content.startsWith('{') || content.startsWith('[')) {
          // Use the existing extractJsonObject/extractJsonArray methods which properly handle strings
          if(content.startsWith('{')) {
            const jsonExtract = this.extractJsonObject(content);
            if(jsonExtract) {
              return jsonExtract;
            }
          } else if(content.startsWith('[')) {
            const jsonExtract = this.extractJsonArray(content);
            if(jsonExtract) {
              return jsonExtract;
            }
          }
          
          // Fallback: return the content as-is if extraction fails
          // (the parseJsonFromText will try to repair it)
          return content;
        }
      }
    }
    
    // Last resort: Find JSON directly in text (no code blocks)
    const jsonStart = text.indexOf('{');
    if(jsonStart !== -1) {
      const jsonExtract = this.extractJsonObject(text.substring(jsonStart));
      if(jsonExtract) {
        return jsonExtract;
      }
    }
    
    return null;
  }

  /**
   * Extract JSON object by counting braces (handles nested objects)
   * Also handles incomplete JSON by finding the last valid position
   */
  private extractJsonObject(text: string): string | null {
    const startIndex = text.indexOf('{');
    if(startIndex === -1) return null;

    let braceCount = 0;
    let inString = false;
    let escapeNext = false;
    let lastValidEnd = -1;

    for (let i = startIndex; i < text.length; i++) {
      const char = text[i];

      if(escapeNext) {
        escapeNext = false;
        continue;
      }

      if(char === '\\') {
        escapeNext = true;
        continue;
      }

      if(char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }

      if(!inString) {
        if(char === '{') braceCount++;
        if(char === '}') {
          braceCount--;
          if(braceCount === 0) {
            return text.substring(startIndex, i + 1);
          }
          // Track the last closing brace we've seen
          if(braceCount === 1) {
            lastValidEnd = i;
          }
        }
      }
    }

    // If we didn't find a complete object but found a partial one, try to extract it
    if(braceCount > 0 && lastValidEnd > startIndex) {
      // Try to close the object by finding where we can safely cut
      let extracted = text.substring(startIndex, lastValidEnd + 1);
      // Try to repair by adding closing braces
      const missingBraces = braceCount;
      extracted += '}'.repeat(missingBraces);
      return extracted;
    }

    // Last resort: if we have an opening brace but incomplete JSON, try to extract and repair
    if(braceCount > 0) {
      let extracted = text.substring(startIndex);
      
      // If we're in the middle of a string, find where it started and close it
      if(inString) {
        // Find the last complete property before the incomplete string
        // Look for pattern: "key": "value",
        const lastCompleteProperty = extracted.lastIndexOf('",');
        if(lastCompleteProperty > 0) {
          // Cut at the end of the last complete property
          extracted = extracted.substring(0, lastCompleteProperty + 2);
        } else {
          // If no complete property found, find the last key-value separator
          const lastColon = extracted.lastIndexOf(':');
          if(lastColon > 0) {
            // Find the key before this colon
            const beforeColon = extracted.substring(0, lastColon);
            const keyStart = beforeColon.lastIndexOf('"');
            if(keyStart > 0) {
              // Remove the incomplete property entirely
              const keyEnd = beforeColon.indexOf('"', keyStart + 1);
              if(keyEnd > keyStart) {
                // Keep everything up to the key, then close
                extracted = extracted.substring(0, keyStart - 1); // Remove the comma before the key
                // Remove trailing comma if present
                if(extracted.endsWith(',')) {
                  extracted = extracted.slice(0, -1);
                }
              }
            }
          }
        }
      } else {
        // Not in a string, find the last complete property
        const lastComma = extracted.lastIndexOf(',');
        if(lastComma > 0) {
          // Check if there's a complete property after the last comma
          const afterComma = extracted.substring(lastComma + 1).trim();
          // If it doesn't look like a complete key-value pair, remove it
          if(!afterComma.match(/^"[^"]+"\s*:\s*"[^"]*",?\s*$/)) {
            extracted = extracted.substring(0, lastComma);
          }
        }
      }
      
      // Remove trailing whitespace and commas
      extracted = extracted.trim();
      if(extracted.endsWith(',')) {
        extracted = extracted.slice(0, -1);
      }
      
      // Close any open strings
      const quoteCount = (extracted.match(/"/g) || []).length;
      if(quoteCount % 2 !== 0) {
        extracted += '"';
      }
      
      // Add closing braces
      extracted += '}'.repeat(braceCount);
      return extracted;
    }

    return null;
  }

  /**
   * Extract JSON array by counting brackets
   */
  private extractJsonArray(text: string): string | null {
    const startIndex = text.indexOf('[');
    if(startIndex === -1) return null;

    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = startIndex; i < text.length; i++) {
      const char = text[i];

      if(escapeNext) {
        escapeNext = false;
        continue;
      }

      if(char === '\\') {
        escapeNext = true;
        continue;
      }

      if(char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }

      if(!inString) {
        if(char === '[') bracketCount++;
        if(char === ']') {
          bracketCount--;
          if(bracketCount === 0) {
            return text.substring(startIndex, i + 1);
          }
        }
      }
    }
    return null;
  }

  /**
   * Extract code examples from markdown content
   * Returns an array of code blocks with their language and content
   * 
   * Handles various code block formats:
   * - ```language\ncode\n```
   * - ```language code```
   * - ```\ncode\n``` (no language)
   * - ```code``` (no language, no newline)
   */
  extractCodeExamples(markdownContent: string): Array<{
    language: string;
    code: string;
    index: number;
  }> {
    if(!markdownContent || typeof markdownContent !== 'string') {
      return [];
    }

    const codeExamples: Array<{
      language: string;
      code: string;
      index: number;
    }> = [];

    // Pattern to match code blocks with improved handling:
    // - Optional language identifier (word characters, hyphens, dots)
    // - Optional whitespace/newline after language
    // - Code content (non-greedy to match until closing ```)
    // - Handles both ```language\ncode``` and ```language code``` formats
    const codeBlockPattern = /```(\w[\w.-]*)?\s*\n?([\s\S]*?)```/g;
    let match;
    let index = 0;

    while ((match = codeBlockPattern.exec(markdownContent)) !== null) {
      const language = match[1]?.trim() || 'text';
      let code = match[2] || '';
      
      // Clean up code: remove leading/trailing whitespace but preserve internal formatting
      code = code.trim();
      
      if(code) {
        codeExamples.push({
          language: language.toLowerCase(), // Normalize language to lowercase
          code,
          index: index++
        });
      }
    }

    return codeExamples;
  }

  /**
   * Extract and validate code examples from article content
   * Returns structured code examples with metadata
   */
  extractAndValidateCodeExamples(articleContent: string): {
    codeExamples: Array<{
      language: string;
      code: string;
      index: number;
      lineCount: number;
    }>;
    hasCodeExamples: boolean;
    languages: string[];
  } {
    const codeExamples = this.extractCodeExamples(articleContent);
    
    const validatedExamples = codeExamples.map(example => ({
      ...example,
      lineCount: example.code.split('\n').length
    }));

    const languages = [...new Set(validatedExamples.map(ex => ex.language))];

    return {
      codeExamples: validatedExamples,
      hasCodeExamples: validatedExamples.length > 0,
      languages
    };
  }

  /**
   * Repair incomplete JSON by removing incomplete array items
   * Specifically handles cases where the last item in an array is incomplete
   */
  private repairIncompleteArrayItems(jsonStr: string): string {
    // Simple approach: find arrays with incomplete last items
    // Look for pattern: "topics": [ ... incomplete content
    const topicsArrayMatch = jsonStr.match(/"topics"\s*:\s*\[([\s\S]*?)(?:\]|$)/);
    
    if(topicsArrayMatch) {
      const arrayContent = topicsArrayMatch[1];
      // Find the last complete object in the array (ending with })
      const lastCompleteObject = arrayContent.lastIndexOf('}');
      
      if(lastCompleteObject > 0) {
        // Check if there's incomplete content after the last complete object
        const afterLastObject = arrayContent.substring(lastCompleteObject + 1).trim();
        
        // If there's content that doesn't look like just whitespace and closing bracket
        if(afterLastObject && !afterLastObject.match(/^\s*\]?\s*$/)) {
          // Find the position of the array start
          const arrayStartPos = topicsArrayMatch.index! + topicsArrayMatch[0].indexOf('[');
          
          // Reconstruct: everything before array, array content up to last complete object, close array and object
          const beforeArray = jsonStr.substring(0, arrayStartPos + 1);
          const completeArrayContent = arrayContent.substring(0, lastCompleteObject + 1).trim();
          // Remove trailing comma if present
          const cleanContent = completeArrayContent.endsWith(',') 
            ? completeArrayContent.slice(0, -1).trim() 
            : completeArrayContent;
          
          // Close the array and the root object
          return beforeArray + cleanContent + '\n  ]\n}';
        }
      }
    }
    
    // Fallback: try to find any incomplete array and repair it
    // Find arrays that don't have a closing bracket
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;
    let arrayStart = -1;
    let lastCompleteObjectPos = -1;
    
    for (let i = 0; i < jsonStr.length; i++) {
      const char = jsonStr[i];
      
      if(escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if(char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if(char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }
      
      if(!inString) {
        if(char === '[') {
          if(bracketCount === 0) {
            arrayStart = i;
            lastCompleteObjectPos = -1;
          }
          bracketCount++;
        } else if(char === ']') {
          bracketCount--;
          if(bracketCount === 0) {
            arrayStart = -1;
            lastCompleteObjectPos = -1;
          }
        } else if(char === '}') {
          // Track the last complete object we've seen
          if(bracketCount > 0) {
            lastCompleteObjectPos = i;
          }
        }
      }
    }
    
    // If we have an incomplete array
    if(bracketCount > 0 && arrayStart !== -1 && lastCompleteObjectPos > arrayStart) {
      // Cut after the last complete object, skipping whitespace and comma
      let cutPoint = lastCompleteObjectPos + 1;
      while (cutPoint < jsonStr.length && 
             /[\s,]/.test(jsonStr[cutPoint])) {
        cutPoint++;
      }
      
      const beforeArray = jsonStr.substring(0, arrayStart + 1);
      const arrayContent = jsonStr.substring(arrayStart + 1, cutPoint).trim();
      const cleanContent = arrayContent.endsWith(',') 
        ? arrayContent.slice(0, -1).trim() 
        : arrayContent;
      
      // Close array and root object
      return beforeArray + cleanContent + ']\n}';
    }
    
    return jsonStr;
  }

  /**
   * Parse JSON from AI response text
   * Handles various formats including markdown code blocks
   * Includes robust error handling and JSON repair
   */
  parseJsonFromText(text: string, expectedType: 'array' | 'object'): any {
    if(!text || typeof text !== 'string') {
      return null;
    }

    // Strategy 1: Extract from markdown code blocks (most common case)
    const markdownExtract = this.extractFromMarkdown(text);
    if(markdownExtract) {
      try {
        const cleaned = this.cleanJsonString(markdownExtract);
        return JSON.parse(cleaned);
      } catch (error) {
        // Try repair - first try removing incomplete array items
        try {
          let repaired = this.repairIncompleteArrayItems(markdownExtract);
          repaired = this.cleanJsonString(repaired);
          return JSON.parse(repaired);
        } catch (repairError1) {
          // Try simpler repair
          try {
            let repaired = this.cleanJsonString(markdownExtract);
            const lastBrace = repaired.lastIndexOf(expectedType === 'array' ? ']' : '}');
            if(lastBrace > 0) {
              repaired = repaired.substring(0, lastBrace + 1);
              return JSON.parse(repaired);
            }
          } catch (repairError2) {
            // Continue to next strategy
          }
        }
      }
    }

    // Strategy 2: Extract JSON object/array directly using brace/bracket counting
    if(expectedType === 'array') {
      const arrayExtract = this.extractJsonArray(text);
      if(arrayExtract) {
        try {
          const cleaned = this.cleanJsonString(arrayExtract);
          return JSON.parse(cleaned);
        } catch (error) {
          // Try repair - remove incomplete array items
          try {
            let repaired = this.repairIncompleteArrayItems(arrayExtract);
            repaired = this.cleanJsonString(repaired);
            return JSON.parse(repaired);
          } catch (repairError1) {
            // Try simpler repair
            try {
              const cleaned = this.cleanJsonString(arrayExtract);
              const lastBracket = cleaned.lastIndexOf(']');
              if(lastBracket > 0) {
                return JSON.parse(cleaned.substring(0, lastBracket + 1));
              }
            } catch (repairError2) {
              // Continue
            }
          }
        }
      }
    } else {
      const objectExtract = this.extractJsonObject(text);
      if(objectExtract) {
        try {
          const cleaned = this.cleanJsonString(objectExtract);
          return JSON.parse(cleaned);
        } catch (error) {
          // Try repair - first try removing incomplete array items
          try {
            let repaired = this.repairIncompleteArrayItems(objectExtract);
            repaired = this.cleanJsonString(repaired);
            return JSON.parse(repaired);
          } catch (repairError1) {
            // Try simpler repair
            try {
              const cleaned = this.cleanJsonString(objectExtract);
              const lastBrace = cleaned.lastIndexOf('}');
              if(lastBrace > 0) {
                return JSON.parse(cleaned.substring(0, lastBrace + 1));
              }
            } catch (repairError2) {
              // Continue
            }
          }
        }
      }
    }

    // Strategy 3: Find JSON after common prefixes
    const prefixMatch = text.match(/(?:json|JSON|response|result)[\s:]*([\[\{][\s\S]*[\]\}])/i);
    if(prefixMatch && prefixMatch[1]) {
      try {
        const cleaned = this.cleanJsonString(prefixMatch[1]);
        return JSON.parse(cleaned);
      } catch (error) {
        // Try repair
        try {
          let repaired = this.cleanJsonString(prefixMatch[1]);
          const lastBrace = repaired.lastIndexOf(expectedType === 'array' ? ']' : '}');
          if(lastBrace > 0) {
            repaired = repaired.substring(0, lastBrace + 1);
            return JSON.parse(repaired);
          }
        } catch (repairError) {
          // Continue
        }
      }
    }

    // Last resort: aggressive extraction - remove all markdown and extract JSON
    try {
      // Remove all markdown code block markers
      let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      
      // Find the JSON structure
      const jsonStart = cleaned.indexOf(expectedType === 'array' ? '[' : '{');
      
      if(jsonStart !== -1) {
        // Try to find complete JSON first
        const jsonEnd = cleaned.lastIndexOf(expectedType === 'array' ? ']' : '}');
        
        if(jsonEnd !== -1 && jsonEnd > jsonStart) {
          cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
          cleaned = this.cleanJsonString(cleaned);
          try {
            return JSON.parse(cleaned);
          } catch (parseError) {
            // If parsing fails, try to repair incomplete JSON
            // First try removing incomplete array items
            try {
              let repaired = this.repairIncompleteArrayItems(cleaned);
              repaired = this.cleanJsonString(repaired);
              return JSON.parse(repaired);
            } catch (repairError1) {
              // Continue with other repair strategies
            }
            
            if(expectedType === 'object') {
              // Count braces to see if we need to close them
              const openBraces = (cleaned.match(/\{/g) || []).length;
              const closeBraces = (cleaned.match(/\}/g) || []).length;
              const missingBraces = openBraces - closeBraces;
              
              if(missingBraces > 0) {
                // Try to find a safe place to cut and close
                let repaired = cleaned;
                // Remove any trailing incomplete property
                const lastComma = repaired.lastIndexOf(',');
                if(lastComma > 0) {
                  // Check if there's a complete property after the last comma
                  const afterComma = repaired.substring(lastComma + 1).trim();
                  // If it doesn't look like a complete key-value pair, remove it
                  if(!afterComma.includes(':') || afterComma.split(':').length < 2) {
                    repaired = repaired.substring(0, lastComma);
                  }
                }
                // Close any open strings
                const openQuotes = (repaired.match(/"/g) || []).length;
                if(openQuotes % 2 !== 0) {
                  // Find the last unclosed quote and close it
                  let quoteCount = 0;
                  for (let i = repaired.length - 1; i >= 0; i--) {
                    if(repaired[i] === '"' && (i === 0 || repaired[i - 1] !== '\\')) {
                      quoteCount++;
                      if(quoteCount === 1) {
                        // This is the last quote, check if it's closed
                        const afterQuote = repaired.substring(i + 1);
                        if(!afterQuote.includes('"')) {
                          repaired += '"';
                        }
                        break;
                      }
                    }
                  }
                }
                // Add missing closing braces
                repaired += '}'.repeat(missingBraces);
                repaired = this.cleanJsonString(repaired);
                try {
                  return JSON.parse(repaired);
                } catch (repairError) {
                  // If repair still fails, return null
                }
              }
            }
          }
        } else {
          // No closing brace found - JSON is incomplete
          // Try to extract what we have and repair it using extractJsonObject
          if(expectedType === 'object') {
            const objectExtract = this.extractJsonObject(cleaned);
            if(objectExtract) {
              try {
                const cleanedExtract = this.cleanJsonString(objectExtract);
                return JSON.parse(cleanedExtract);
              } catch (repairError) {
                // Try one more repair pass
                try {
                  // Count braces and close them
                  const openBraces = (objectExtract.match(/\{/g) || []).length;
                  const closeBraces = (objectExtract.match(/\}/g) || []).length;
                  const missingBraces = openBraces - closeBraces;
                  
                  if(missingBraces > 0) {
                    // Find the last complete property
                    const lastCompleteProp = objectExtract.lastIndexOf('",');
                    let repaired = lastCompleteProp > 0 
                      ? objectExtract.substring(0, lastCompleteProp + 2)
                      : objectExtract;
                    
                    // Remove trailing comma
                    repaired = repaired.trim();
                    if(repaired.endsWith(',')) {
                      repaired = repaired.slice(0, -1);
                    }
                    
                    // Close open strings
                    const quoteCount = (repaired.match(/"/g) || []).length;
                    if(quoteCount % 2 !== 0) {
                      repaired += '"';
                    }
                    
                    // Add closing braces
                    repaired += '}'.repeat(missingBraces);
                    repaired = this.cleanJsonString(repaired);
                    return JSON.parse(repaired);
                  }
                } catch (finalError) {
                  // If all repairs fail, return null
                }
              }
            }
          }
        }
      }
    } catch (finalError) {
      console.warn('Failed to parse JSON from response after all strategies');
      console.warn('Response preview (first 500 chars):', text.substring(0, 500));
      console.warn('Error:', finalError);
      return null;
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
      if(!this.genAI) {
        // Fallback to mock data
        return this.getMockTopics(campaignName);
      }

      // Optimized prompt for faster response
      const prompt = `Generate 5+ educational topics for "${campaignName}".

Description: ${campaignDescription || 'Learning campaign'}

IMPORTANT - Response Format:
You MUST return ONLY valid JSON i.e {}. Do NOT wrap the result it in markdown code blocks or preprend or append any symbol such as quote, backticks, etc. Do NOT add any text or symbol before or after the outer curly braces.
Return the JSON array directly in this exact format:

[{"id":"topic-1","title":"Topic Title","description":"Brief description","difficulty":"easy"},{"id":"topic-2","title":"Topic Title","description":"Brief description","difficulty":"medium"},...]

Requirements:
- Maximum of 20 topics
- Vary difficulty (easy, medium, hard)
- Practical, hands-on focus
- Return ONLY the raw JSON array, nothing else.`;

      // Generate content with automatic model fallback
      const { text } = await this.generateTextWithFallback('topics', prompt);
      console.log("text topic", text.substring(0, 50));
      // Parse JSON from response
      const parsed = this.parseJsonFromText(text, 'array');
      console.log("Parsed topic", parsed);
      if(parsed && Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      
      // Fallback to mock if parsing fails
      console.warn('Using mock topics due to parsing failure');
      return this.getMockTopics(campaignName);
    } catch (error: any) {
      console.error('Error generating topics:', error);
      // If it's a model error, log it specifically
      if(error?.message?.includes('404') || error?.message?.includes('not found')) {
        console.error('Model not found error. This might indicate an SDK version issue or incorrect model name.');
      }
      return this.getMockTopics(campaignName);
    }
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      if(!this.genAI) {
        // Return a working IPFS URI for mock images
        return `ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme-original.png`;
      }

      // Get the image generation model from environment variable
      const envImageModel = process.env.NEXT_PUBLIC_IMAGE_GENERATION_MODEL;
      
      // Build list of models to try: env model first, then fallbacks
      const modelsToTry = envImageModel 
        ? [envImageModel, ...IMAGE_GENERATION_FALLBACKS.filter(m => m !== envImageModel)]
        : IMAGE_GENERATION_FALLBACKS;
        // console.log("modelsToTry", modelsToTry);
      let lastError: any = null;
      const maxRetries = 2;

      for (const modelName of modelsToTry) {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            const model = this.genAI.getGenerativeModel({ model: modelName });
            
            // For image generation, we use generateContent with the prompt
            // The response should contain image data or a URL
            const response = (await model.generateContent(prompt)).response;
            console.log("response", response);

            // const image = await this.imagenAI?.models.generateImages({
            //   model: "gemini-3-pro-preview",
            //   prompt,
            //   config: {
            //     aspectRatio: "16:9",
            //     imageSize: "1024x1024",
            //     addWatermark: true,
            //     labels: { },
            //     numberOfImages: 1
            //   }
            // });
            // console.log('image?.generatedImages?.[0].image?.imageBytes', image?.generatedImages?.[0].image?.imageBytes);
            // Check if response contains image data
            // Gemini 2.5 Flash Image may return base64 encoded image or a URL
            const parts = response.candidates?.[0]?.content?.parts;
            console.log("parts: ", parts);
            if(parts && parts.length > 0) {
              // Check for inline data (base64 image)
              const inlineData = parts.find(part => part.inlineData);
              if(inlineData?.inlineData) {
                // Convert base64 to data URL or save to IPFS
                // For now, return the data URL format
                const mimeType = inlineData.inlineData.mimeType || 'image/png';
                const base64Data = inlineData.inlineData.data;
                return `data:${mimeType};base64,${base64Data}`;
              }
              
              // Check for text that might contain a URL
              const text = parts.find(part => part.text);
              if(text?.text) {
                // Try to extract URL from text
                const urlMatch = text.text.match(/https?:\/\/[^\s]+|ipfs:\/\/[^\s]+/);
                if(urlMatch) {
                  return urlMatch[0];
                }
              }
            }
            
            // If no image data found in response, try next model
            console.warn(`No image data found in response from ${modelName}, trying next model...`);
            break; // Break inner loop, continue to next model
          } catch (error: any) {
            lastError = error;
            
            // Check for specific error types
            const errorMessage = error?.message || String(error) || '';
            const errorString = errorMessage.toLowerCase();
            const isModelNotFound = errorString.includes('404') || 
                                 errorString.includes('not found') ||
                                 errorString.includes('model not found');
            const isRateLimit = errorString.includes('429') || 
                              errorString.includes('rate limit') ||
                              errorString.includes('quota') ||
                              errorString.includes('quota exceeded');
            
            // If model not found, skip to next model
            if(isModelNotFound) {
              console.warn(`Model ${modelName} not found, trying next...`);
              break; // Break inner loop, continue to next model
            }
            
            // If rate limited, wait and retry with exponential backoff or extracted retry delay
            if(isRateLimit && attempt < maxRetries) {
              // Try to extract retry delay from error (Google API provides this in errorDetails)
              let waitTime = Math.pow(2, attempt) * 1000; // Default exponential backoff
              
              // Try to extract retry delay from error message or errorDetails
              const retryDelayMatch = errorMessage.match(/retry in ([\d.]+)s/i);
              if(retryDelayMatch) {
                waitTime = Math.ceil(parseFloat(retryDelayMatch[1]) * 1000);
              } else if(error?.errorDetails) {
                // Check errorDetails array for RetryInfo
                const retryInfo = error.errorDetails.find((detail: any) => 
                  detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
                );
                if(retryInfo?.retryDelay) {
                  // retryDelay is usually in seconds, convert to milliseconds
                  waitTime = Math.ceil(parseFloat(retryInfo.retryDelay) * 1000);
                }
              }
              
              console.warn(`Rate limited on ${modelName} (quota exceeded), retrying in ${waitTime}ms...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue; // Retry same model
            }
            
            // If last attempt for this model, log and try next model
            if(attempt === maxRetries) {
              if(isRateLimit) {
                console.error(`Quota exceeded for ${modelName} after ${maxRetries + 1} attempts. This model has hit its free tier limits.`);
              } else {
                console.warn(`Failed to use model ${modelName} for image generation after ${maxRetries + 1} attempts, trying next...`);
              }
              break; // Break inner loop, continue to next model
            }
          }
        }
      }

      // If all models fail, log error and return fallback
      if(lastError) {
        const errorMessage = lastError?.message || 'Unknown error';
        const isQuotaError = errorMessage.toLowerCase().includes('quota') || 
                           errorMessage.toLowerCase().includes('429');
        
        if(isQuotaError) {
          console.error('All image generation models have exceeded their quota limits. Please check your Gemini API plan and billing details.');
          console.error('Error details:', lastError);
        } else {
          console.error('Error generating image with all models:', lastError);
        }
      }
      
      // Return a working fallback IPFS URI
      return `ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme-original.png`;
    } catch (error) {
      console.error('Error generating image:', error);
      // Return a working fallback IPFS URI
      return `ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme-original.png`;
    }
  }

  private getMockTopics(campaignName: string): Array<{
    id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }> {
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
      },
      {
        id: '4',
        title: `${campaignName} Implementation Guide`,
        description: 'Step-by-step guide to implementing real-world solutions',
        difficulty: 'medium' as const
      },
      {
        id: '5',
        title: `${campaignName} Troubleshooting`,
        description: 'Common issues and how to resolve them effectively',
        difficulty: 'easy' as const
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

Here's a basic example:

\`\`\`javascript
// Example implementation
function example() {
  console.log("Hello, ${topic}!");
  return true;
}
\`\`\`

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

    const codeExamplesData = this.extractAndValidateCodeExamples(content);
    
    return {
      title: topic,
      content,
      wordCount: maxWords,
      readingTime: Math.ceil(maxWords / 200),
      codeExamples: codeExamplesData.codeExamples,
      hasCodeExamples: codeExamplesData.hasCodeExamples,
      codeLanguages: codeExamplesData.languages
    };
  }

  getMockQuizzes(articleTitle: string, questionCount: number) {
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
