/**
 * Service for generating topics using Google Gemini API
 * Handles initial conversation with greeting and topic generation
 */

import { GeneratedTopic } from '../TopicSelection';

export interface TopicGenerationResponse {
  greeting: string;
  campaignInfo: string;
  topics: GeneratedTopic[];
}

/**
 * Generate initial conversation with Gemini including greeting and topics
 */
export async function generateTopicsWithGreeting(
  campaignName: string,
  campaignDescription: string
): Promise<TopicGenerationResponse> {
  try {
    const response = await fetch('/api/generate-topics-with-greeting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        campaignName,
        campaignDescription,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate topics: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating topics with greeting:', error);
    // Fallback to basic response
    return {
      greeting: `Hello! Welcome to the ${campaignName} learning campaign.`,
      campaignInfo: campaignDescription || `Learn about ${campaignName} and earn rewards.`,
      topics: [],
    };
  }
}

/**
 * Generate topics only (without greeting)
 */
export async function generateTopicsOnly(
  campaignName: string,
  campaignDescription: string
): Promise<GeneratedTopic[]> {
  try {
    const response = await fetch('/api/generate-topics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        campaignName,
        campaignDescription,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate topics: ${response.statusText}`);
    }

    const topics = await response.json();
    return Array.isArray(topics) ? topics : [];
  } catch (error) {
    console.error('Error generating topics:', error);
    return [];
  }
}

