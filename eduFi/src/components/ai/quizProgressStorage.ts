/**
 * Utility functions for storing and retrieving unsaved quiz progress
 */

export interface UnsavedQuizProgress {
  campaignId: string | number;
  campaignAddress: string;
  topic: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
  } | null;
  article: {
    title: string;
    content: string;
    wordCount: number;
    readingTime: number;
  } | null;
  quizzes: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
  userAnswers: number[];
  currentQuizIndex: number;
  quizScore: number;
  performance: {
    value: number;
    ratedAt: string;
  } | null;
  startTime: number;
  endTime: number;
  currentStep: 'topics' | 'article' | 'quiz' | 'results';
  savedAt: number; // timestamp when saved
}

const STORAGE_PREFIX = 'learna_unsaved_quiz_';

/**
 * Generate storage key for a user's unsaved progress in a campaign
 */
export function getStorageKey(address: string, campaignId: string | number): string {
  return `${STORAGE_PREFIX}${address.toLowerCase()}_${campaignId}`;
}

/**
 * Save unsaved aspart progress to localStorage
 */
export function saveUnsavedProgress(address: string, progress: UnsavedQuizProgress): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = getStorageKey(address, progress.campaignId);
    const data = JSON.stringify(progress);
    localStorage.setItem(key, data);
  } catch (error) {
    console.error('Failed to save progress to localStorage:', error);
  }
}

/**
 * Load unsaved progress from localStorage
 */
export function loadUnsavedProgress(address: string, campaignId: string | number): UnsavedQuizProgress | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const key = getStorageKey(address, campaignId);
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    return JSON.parse(data) as UnsavedQuizProgress;
  } catch (error) {
    console.error('Failed to load progress from localStorage:', error);
    return null;
  }
}

/**
 * Delete unsaved progress from localStorage
 */
export function clearUnsavedProgress(address: string, campaignId: string | number): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = getStorageKey(address, campaignId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear progress from localStorage:', error);
  }
}

/**
 * Check if there's unsaved progress for a campaign
 */
export function hasUnsavedProgress(address: string, campaignId: string | number): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const key = getStorageKey(address, campaignId);
    return localStorage.getItem(key) !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Get all unsaved progress keys for a user
 */
export function getAllUnsavedProgressKeys(address: string): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const prefix = getStorageKey(address.toLowerCase(), '');
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX) && key.includes(address.toLowerCase())) {
        keys.push(key);
      }
    }
    
    return keys;
  } catch (error) {
    console.error('Failed to get unsaved progress keys:', error);
    return [];
  }
}

/**
 * Check if progress matches already saved data on blockchain
 * Compares score, percentage, questionSize, and timeSpent to avoid duplicates
 */
export function isProgressAlreadySaved(
  progress: UnsavedQuizProgress,
  savedPoass: Array<{
    score: number;
    percentage: number;
    questionSize: number;
    timeSpent: number;
  }>
): boolean {
  if (!progress.performance || progress.currentStep !== 'results') return false;
  
  // Calculate timeSpent from progress
  const timeSpent = progress.endTime > 0 && progress.startTime > 0
    ? Math.floor((progress.endTime - progress.startTime) / 1000)
    : 0;
  
  // Check if any saved proof matches this progress
  return savedPoass.some(saved => {
    return (
      saved.score === progress.quizScore &&
      saved.percentage === progress.quizScore &&
      saved.questionSize === progress.quizzes.length &&
      Math.abs(saved.timeSpent - timeSpent) < 5 // Allow 5 second tolerance
    );
  });
}

