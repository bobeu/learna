/**
 * Service for managing AITutor state storage in localStorage
 * Handles topics, articles, and quizzes state persistence
 */

import { GeneratedTopic } from '../TopicSelection';
import { QuizQuestion } from '../Quiz';

export interface SavedAITutorState {
  campaignId: string;
  campaignAddress: string;
  // Topics state
  topics: GeneratedTopic[];
  selectedTopic: GeneratedTopic | null;
  greeting: string | null;
  campaignInfo: string | null;
  // Article state
  article: {
    title: string;
    content: string;
    wordCount: number;
    readingTime: number;
  } | null;
  // Quiz state (temporary - 3 minutes)
  quizzes: QuizQuestion[];
  userAnswers: number[];
  currentQuizIndex: number;
  quizScore: number;
  startTime: number;
  endTime: number;
  // Current step
  currentStep: 'topics' | 'article' | 'quiz' | 'results';
  // Timestamps
  savedAt: number; // when state was saved
  quizSavedAt?: number; // when quizzes were saved (for 3-minute expiry)
}

const STORAGE_PREFIX = 'learna_aitutor_state_';
const QUIZ_STORAGE_PREFIX = 'learna_aitutor_quizzes_';
const QUIZ_EXPIRY_MS = 3 * 60 * 1000; // 3 minutes

/**
 * Generate storage key for AITutor state
 */
function getStateStorageKey(address: string, campaignId: string): string {
  return `${STORAGE_PREFIX}${address.toLowerCase()}_${campaignId}`;
}

/**
 * Generate storage key for temporary quiz state
 */
function getQuizStorageKey(address: string, campaignId: string): string {
  return `${QUIZ_STORAGE_PREFIX}${address.toLowerCase()}_${campaignId}`;
}

/**
 * Save AITutor state to localStorage
 */
export function saveAITutorState(address: string, state: SavedAITutorState): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = getStateStorageKey(address, state.campaignId);
    const data = JSON.stringify(state);
    localStorage.setItem(key, data);
  } catch (error) {
    console.error('Failed to save AITutor state:', error);
  }
}

/**
 * Load AITutor state from localStorage
 */
export function loadAITutorState(address: string, campaignId: string): SavedAITutorState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const key = getStateStorageKey(address, campaignId);
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    return JSON.parse(data) as SavedAITutorState;
  } catch (error) {
    console.error('Failed to load AITutor state:', error);
    return null;
  }
}

/**
 * Clear AITutor state from localStorage
 */
export function clearAITutorState(address: string, campaignId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = getStateStorageKey(address, campaignId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear AITutor state:', error);
  }
}

/**
 * Save quiz state temporarily (3 minutes expiry)
 */
export function saveQuizState(
  address: string, 
  campaignId: string, 
  quizzes: QuizQuestion[],
  userAnswers: number[],
  currentQuizIndex: number,
  quizScore: number,
  startTime: number,
  endTime: number
): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = getQuizStorageKey(address, campaignId);
    const quizState = {
      quizzes,
      userAnswers,
      currentQuizIndex,
      quizScore,
      startTime,
      endTime,
      savedAt: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(quizState));
  } catch (error) {
    console.error('Failed to save quiz state:', error);
  }
}

/**
 * Load quiz state if still valid (within 3 minutes)
 */
export function loadQuizState(
  address: string, 
  campaignId: string
): {
  quizzes: QuizQuestion[];
  userAnswers: number[];
  currentQuizIndex: number;
  quizScore: number;
  startTime: number;
  endTime: number;
  isValid: boolean;
  timeRemaining: number; // milliseconds remaining
} | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const key = getQuizStorageKey(address, campaignId);
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    const quizState = JSON.parse(data) as {
      quizzes: QuizQuestion[];
      userAnswers: number[];
      currentQuizIndex: number;
      quizScore: number;
      startTime: number;
      endTime: number;
      savedAt: number;
    };
    
    const now = Date.now();
    const elapsed = now - quizState.savedAt;
    const isValid = elapsed < QUIZ_EXPIRY_MS;
    const timeRemaining = Math.max(0, QUIZ_EXPIRY_MS - elapsed);
    
    return {
      ...quizState,
      isValid,
      timeRemaining
    };
  } catch (error) {
    console.error('Failed to load quiz state:', error);
    return null;
  }
}

/**
 * Clear quiz state from localStorage
 */
export function clearQuizState(address: string, campaignId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = getQuizStorageKey(address, campaignId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear quiz state:', error);
  }
}

/**
 * Check if quiz state is expired
 */
export function isQuizStateExpired(address: string, campaignId: string): boolean {
  const quizState = loadQuizState(address, campaignId);
  return quizState === null || !quizState.isValid;
}

/**
 * Get time remaining for quiz state in minutes
 */
export function getQuizTimeRemaining(address: string, campaignId: string): number {
  const quizState = loadQuizState(address, campaignId);
  if (!quizState || !quizState.isValid) return 0;
  return Math.ceil(quizState.timeRemaining / (60 * 1000)); // Convert to minutes
}

