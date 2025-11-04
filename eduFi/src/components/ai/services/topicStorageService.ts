/**
 * Service for managing completed topic storage in localStorage
 * Only stores topics that have been successfully completed (quiz finished)
 */

export interface CompletedTopic {
  campaignId: string;
  campaignAddress: string;
  topicId: string;
  topicTitle: string;
  topicDescription: string;
  difficulty: string;
  completedAt: number; // timestamp
}

const STORAGE_PREFIX = 'learna_completed_topics_';

/**
 * Generate storage key for a user's completed topics
 */
function getStorageKey(address: string): string {
  return `${STORAGE_PREFIX}${address.toLowerCase()}`;
}

/**
 * Get all completed topics for a user
 */
export function getCompletedTopics(address: string): CompletedTopic[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const key = getStorageKey(address);
    const data = localStorage.getItem(key);
    if (!data) return [];
    
    return JSON.parse(data) as CompletedTopic[];
  } catch (error) {
    console.error('Failed to load completed topics:', error);
    return [];
  }
}

/**
 * Save a completed topic to localStorage
 */
export function saveCompletedTopic(address: string, topic: CompletedTopic): void {
  if (typeof window === 'undefined') return;
  
  try {
    const topics = getCompletedTopics(address);
    
    // Check if topic already exists for this campaign
    const existingIndex = topics.findIndex(
      t => t.campaignId === topic.campaignId && t.topicId === topic.topicId
    );
    
    if (existingIndex >= 0) {
      // Update existing topic
      topics[existingIndex] = topic;
    } else {
      // Add new topic
      topics.push(topic);
    }
    
    const key = getStorageKey(address);
    localStorage.setItem(key, JSON.stringify(topics));
  } catch (error) {
    console.error('Failed to save completed topic:', error);
  }
}

/**
 * Check if a topic has been completed for a specific campaign
 * Uses regex to match topic titles (case-insensitive, partial match)
 */
export function isTopicCompleted(
  address: string,
  campaignId: string,
  topicTitle: string
): CompletedTopic | null {
  const topics = getCompletedTopics(address);
  
  // Normalize topic title for matching (remove extra spaces, lowercase)
  const normalizedTitle = topicTitle.trim().toLowerCase().replace(/\s+/g, ' ');
  
  // Find matching topic using regex for flexible matching
  const regex = new RegExp(normalizedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  
  const match = topics.find(
    topic => 
      topic.campaignId === campaignId && 
      regex.test(topic.topicTitle.toLowerCase())
  );
  
  return match || null;
}

/**
 * Get all completed topics for a specific campaign
 */
export function getCampaignCompletedTopics(
  address: string,
  campaignId: string
): CompletedTopic[] {
  const topics = getCompletedTopics(address);
  return topics.filter(topic => topic.campaignId === campaignId);
}

/**
 * Clear all completed topics for a user (useful for logout)
 */
export function clearCompletedTopics(address: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = getStorageKey(address);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear completed topics:', error);
  }
}

