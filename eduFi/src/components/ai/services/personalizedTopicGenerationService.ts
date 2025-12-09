/**
 * Service for generating personalized learning topics based on user's knowledge level
 * Uses Gemini AI to create tailored learning paths
 */

import { GeneratedTopic } from '../TopicSelection';
import { KnowledgeLevel } from '../components/KnowledgeLevelModal';

export interface PersonalizedLearningPath {
  topics: GeneratedTopic[];
  greeting: string;
  learningPathDescription: string;
}

/**
 * Generate personalized topics based on user's knowledge level
 */
export async function generatePersonalizedTopics(
  campaignName: string,
  campaignDescription: string,
  knowledgeLevel: KnowledgeLevel,
  experienceNotes: string = ''
): Promise<PersonalizedLearningPath> {
  try {
    const response = await fetch('/api/generate-personalized-topics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        campaignName,
        campaignDescription,
        knowledgeLevel,
        experienceNotes,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate personalized topics: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating personalized topics:', error);
    // Fallback to basic topics
    return {
      topics: [],
      greeting: `Welcome to ${campaignName}!`,
      learningPathDescription: `Your personalized learning path for ${campaignName}`,
    };
  }
}

