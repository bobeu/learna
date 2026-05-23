import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  collection, 
  getDocs, 
  setDoc, 
  updateDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  where,
  Firestore 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously,
  onAuthStateChanged,
  Auth 
} from 'firebase/auth';
import { getFirebaseConfig, getAppId, getInitialAuthToken } from './firebaseConfig';

// Learning Progress Interfaces
export interface LearningTopic {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  articleCompleted: boolean;
  quizCompleted: boolean;
  quizScore?: number;
  lastAccessedAt: any;
  createdAt: any;
  progress: number; // 0-100
}

export interface LearningArticle {
  id: string;
  topicId: string;
  content: string;
  title: string;
  completed: boolean;
  lastReadAt: any;
  createdAt: any;
}

export interface LearningQuiz {
  id: string;
  topicId: string;
  questions: any[];
  score?: number;
  completed: boolean;
  attemptedAt: any;
  createdAt: any;
}

export interface CampaignProgress {
  campaignId: string;
  campaignName: string;
  knowledgeLevel: 'beginner' | 'intermediate' | 'advanced';
  topics: LearningTopic[];
  lastSelectedTopicId?: string;
  startedAt: any;
  updatedAt: any;
  learningPath?: {
    level: 'beginner' | 'intermediate' | 'advanced';
    targetLevel: 'beginner' | 'intermediate' | 'advanced';
    topics: string[];
    generatedAt: any;
  };
}

export interface UserProfile {
  walletAddress: string;
  campaigns: { [campaignId: string]: CampaignProgress };
  createdAt: any;
  updatedAt: any;
}

class FirebaseService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private auth: Auth | null = null;
  private userId: string | null = null;
  private authInitialized = false;
  private onAuthChangeCallbacks: ((userId: string | null) => void)[] = [];
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.initializationPromise = this.initializeFirebase();
      console.log("Firebase initialized");
    } else {
      // Server-side: mark as initialized but not available
      this.authInitialized = true;
    }
  }

  private async initializeFirebase(): Promise<void> {
    try {
      // Get Firebase config from environment variables or window
      const firebaseConfig = getFirebaseConfig();
      
      if (!firebaseConfig) {
        console.warn('Firebase config not available. Using localStorage fallback for data persistence.');
        this.authInitialized = true;
        return;
      }

      // Validate Firebase config before initializing
      if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        console.warn('Firebase config is incomplete. Using localStorage fallback.');
        this.authInitialized = true;
        return;
      }

      // Initialize Firebase app
      this.app = initializeApp(firebaseConfig);
      this.db = getFirestore(this.app);
      this.auth = getAuth(this.app);

      // Set up auth state listener with error handling
      try {
        onAuthStateChanged(this.auth, (user) => {
          this.userId = user?.uid || null;
          this.authInitialized = true;
          
          // Notify all callbacks
          this.onAuthChangeCallbacks.forEach(callback => {
            callback(this.userId);
          });
        });

        // Attempt authentication (will handle errors gracefully)
        await this.authenticate();
      } catch (authError: any) {
        // If auth setup fails, continue without auth
        if (authError?.code === 'auth/configuration-not-found' || 
            authError?.code === 'auth/operation-not-allowed') {
          console.warn('Firebase Authentication is not properly configured. Continuing without auth.');
          this.authInitialized = true;
          // Still notify callbacks that auth is ready (but failed)
          this.onAuthChangeCallbacks.forEach(callback => {
            callback(null);
          });
        } else {
          throw authError;
        }
      }
    } catch (error: any) {
      console.error('Firebase initialization failed:', error);
      // Mark as initialized even on error to prevent infinite waiting
      this.authInitialized = true;
      // Notify callbacks that initialization is complete (even if failed)
      this.onAuthChangeCallbacks.forEach(callback => {
        callback(null);
      });
    }
  }

  private async authenticate(): Promise<void> {
    if (!this.auth) return;

    try {
      const initialToken = getInitialAuthToken();

      if (initialToken) {
        await signInWithCustomToken(this.auth, initialToken);
      } else {
        await signInAnonymously(this.auth);
      }
    } catch (error: any) {
      // Check if it's a configuration error
      if (error?.code === 'auth/configuration-not-found' || 
          error?.code === 'auth/operation-not-allowed') {
        console.warn('Firebase Authentication is not configured or anonymous auth is disabled.');
        console.warn('The app will continue to work, but some features may be limited.');
        // Don't throw - allow app to continue without auth
        return;
      }
      
      console.error('Authentication failed:', error);
      // Fallback to anonymous auth only if it's not a configuration error
      if (error?.code !== 'auth/configuration-not-found' && 
          error?.code !== 'auth/operation-not-allowed') {
        try {
          await signInAnonymously(this.auth);
        } catch (fallbackError: any) {
          // Only log if it's not the same configuration error
          if (fallbackError?.code !== 'auth/configuration-not-found' && 
              fallbackError?.code !== 'auth/operation-not-allowed') {
            console.error('Anonymous auth failed:', fallbackError);
          } else {
            console.warn('Firebase Authentication is not configured. App will use localStorage fallback.');
          }
        }
      }
    }
  }

  /**
   * Wait for Firebase to be initialized
   */
  async waitForInitialization(): Promise<void> {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
  }

  onAuthChange(callback: (userId: string | null) => void) {
    this.onAuthChangeCallbacks.push(callback);
    
    // If auth is already initialized, call immediately
    if (this.authInitialized) {
      callback(this.userId);
    }
  }

  getCurrentUserId(): string | null {
    return this.userId;
  }

  isReady(): boolean {
    return this.authInitialized;
  }

  private getAppId(): string {
    return getAppId();
  }

  /**
   * Get user path using wallet address as key
   */
  private getUserPath(walletAddress: string, collection: string): string {
    return `artifacts/${this.getAppId()}/users/${walletAddress.toLowerCase()}/${collection}`;
  }

  /**
   * Get or create user profile
   */
  async getUserProfile(walletAddress: string): Promise<UserProfile | null> {
    if (!this.db || !walletAddress) {
      return this.getUserProfileFromLocalStorage(walletAddress);
    }

    try {
      const userRef = doc(this.db, `artifacts/${this.getAppId()}/users/${walletAddress.toLowerCase()}`);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
      }
      
      // Create new profile
      const newProfile: UserProfile = {
        walletAddress: walletAddress.toLowerCase(),
        campaigns: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(userRef, newProfile);
      return newProfile;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return this.getUserProfileFromLocalStorage(walletAddress);
    }
  }

  /**
   * Get campaign progress for a user
   */
  async getCampaignProgress(walletAddress: string, campaignId: string): Promise<CampaignProgress | null> {
    if (!this.db || !walletAddress) {
      return this.getCampaignProgressFromLocalStorage(walletAddress, campaignId);
    }

    try {
      const profile = await this.getUserProfile(walletAddress);
      return profile?.campaigns[campaignId] || null;
    } catch (error) {
      console.error('Failed to get campaign progress:', error);
      return this.getCampaignProgressFromLocalStorage(walletAddress, campaignId);
    }
  }

  /**
   * Save or update campaign progress
   */
  async saveCampaignProgress(
    walletAddress: string, 
    campaignProgress: CampaignProgress
  ): Promise<boolean> {
    if (!this.db || !walletAddress) {
      return this.saveCampaignProgressToLocalStorage(walletAddress, campaignProgress);
    }

    try {
      const userRef = doc(this.db, `artifacts/${this.getAppId()}/users/${walletAddress.toLowerCase()}`);
      const userSnap = await getDoc(userRef);
      
      const profile: UserProfile = userSnap.exists() 
        ? (userSnap.data() as UserProfile)
        : {
            walletAddress: walletAddress.toLowerCase(),
            campaigns: {},
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

      profile.campaigns[campaignProgress.campaignId] = {
        ...campaignProgress,
        updatedAt: serverTimestamp(),
      };
      profile.updatedAt = serverTimestamp();

      await setDoc(userRef, profile);
      return true;
    } catch (error) {
      console.error('Failed to save campaign progress:', error);
      return this.saveCampaignProgressToLocalStorage(walletAddress, campaignProgress);
    }
  }

  /**
   * Update topic progress
   */
  async updateTopicProgress(
    walletAddress: string,
    campaignId: string,
    topicId: string,
    updates: Partial<LearningTopic>
  ): Promise<boolean> {
    if (!this.db || !walletAddress) {
      return this.updateTopicProgressInLocalStorage(walletAddress, campaignId, topicId, updates);
    }

    try {
      const progress = await this.getCampaignProgress(walletAddress, campaignId);
      if (!progress) return false;

      const topicIndex = progress.topics.findIndex(t => t.id === topicId);
      if (topicIndex === -1) return false;

      progress.topics[topicIndex] = {
        ...progress.topics[topicIndex],
        ...updates,
        lastAccessedAt: updates.lastAccessedAt || new Date().toISOString(),
      };

      // Recalculate progress
      if (updates.articleCompleted !== undefined || updates.quizCompleted !== undefined) {
        const topic = progress.topics[topicIndex];
        let progressValue = 0;
        if (topic.articleCompleted) progressValue += 50;
        if (topic.quizCompleted) progressValue += 50;
        progress.topics[topicIndex].progress = progressValue;
        
        // Mark topic as completed if both are done
        if (topic.articleCompleted && topic.quizCompleted) {
          progress.topics[topicIndex].completed = true;
        }
      }

      return await this.saveCampaignProgress(walletAddress, progress);
    } catch (error) {
      console.error('Failed to update topic progress:', error);
      return this.updateTopicProgressInLocalStorage(walletAddress, campaignId, topicId, updates);
    }
  }

  /**
   * Save learning article
   */
  async saveArticle(
    walletAddress: string,
    campaignId: string,
    article: LearningArticle
  ): Promise<boolean> {
    if (!this.db || !walletAddress) {
      return this.saveArticleToLocalStorage(walletAddress, campaignId, article);
    }

    try {
      const articleRef = doc(
        this.db, 
        this.getUserPath(walletAddress, `campaigns/${campaignId}/articles/${article.id}`)
      );
      await setDoc(articleRef, {
        ...article,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Failed to save article:', error);
      return this.saveArticleToLocalStorage(walletAddress, campaignId, article);
    }
  }

  /**
   * Get article for a topic
   */
  async getArticle(
    walletAddress: string,
    campaignId: string,
    topicId: string
  ): Promise<LearningArticle | null> {
    if (!this.db || !walletAddress) {
      return this.getArticleFromLocalStorage(walletAddress, campaignId, topicId);
    }

    try {
      const articlesRef = collection(
        this.db,
        this.getUserPath(walletAddress, `campaigns/${campaignId}/articles`)
      );
      const q = query(articlesRef, where('topicId', '==', topicId), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        return snapshot.docs[0].data() as LearningArticle;
      }
      return null;
    } catch (error) {
      console.error('Failed to get article:', error);
      return this.getArticleFromLocalStorage(walletAddress, campaignId, topicId);
    }
  }

  /**
   * Save quiz attempt
   */
  async saveQuiz(
    walletAddress: string,
    campaignId: string,
    quiz: LearningQuiz
  ): Promise<boolean> {
    if (!this.db || !walletAddress) {
      return this.saveQuizToLocalStorage(walletAddress, campaignId, quiz);
    }

    try {
      const quizRef = doc(
        this.db,
        this.getUserPath(walletAddress, `campaigns/${campaignId}/quizzes/${quiz.id}`)
      );
      await setDoc(quizRef, {
        ...quiz,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Failed to save quiz:', error);
      return this.saveQuizToLocalStorage(walletAddress, campaignId, quiz);
    }
  }

  /**
   * Subscribe to campaign progress changes
   */
  subscribeToCampaignProgress(
    walletAddress: string,
    campaignId: string,
    callback: (progress: CampaignProgress | null) => void
  ): () => void {
    if (!this.db || !walletAddress) {
      // Fallback: call once with localStorage data
      const progress = this.getCampaignProgressFromLocalStorage(walletAddress, campaignId);
      callback(progress);
      return () => {};
    }

    try {
      const userRef = doc(this.db, `artifacts/${this.getAppId()}/users/${walletAddress.toLowerCase()}`);
      
      return onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const profile = snapshot.data() as UserProfile;
          callback(profile.campaigns[campaignId] || null);
        } else {
          callback(null);
        }
      });
    } catch (error) {
      console.error('Failed to subscribe to campaign progress:', error);
      return () => {};
    }
  }

  // LocalStorage fallback methods
  private getUserProfileFromLocalStorage(walletAddress: string): UserProfile | null {
    try {
      const stored = localStorage.getItem(`learna_profile_${walletAddress.toLowerCase()}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private getCampaignProgressFromLocalStorage(walletAddress: string, campaignId: string): CampaignProgress | null {
    try {
      const profile = this.getUserProfileFromLocalStorage(walletAddress);
      return profile?.campaigns[campaignId] || null;
    } catch {
      return null;
    }
  }

  private saveCampaignProgressToLocalStorage(walletAddress: string, progress: CampaignProgress): boolean {
    try {
      let profile = this.getUserProfileFromLocalStorage(walletAddress);
      if (!profile) {
        profile = {
          walletAddress: walletAddress.toLowerCase(),
          campaigns: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      profile.campaigns[progress.campaignId] = {
        ...progress,
        updatedAt: new Date().toISOString(),
      };
      profile.updatedAt = new Date().toISOString();
      localStorage.setItem(`learna_profile_${walletAddress.toLowerCase()}`, JSON.stringify(profile));
      return true;
    } catch {
      return false;
    }
  }

  private updateTopicProgressInLocalStorage(
    walletAddress: string,
    campaignId: string,
    topicId: string,
    updates: Partial<LearningTopic>
  ): boolean {
    const progress = this.getCampaignProgressFromLocalStorage(walletAddress, campaignId);
    if (!progress) return false;

    const topicIndex = progress.topics.findIndex(t => t.id === topicId);
    if (topicIndex === -1) return false;

    progress.topics[topicIndex] = {
      ...progress.topics[topicIndex],
      ...updates,
      lastAccessedAt: new Date().toISOString(),
    };

    return this.saveCampaignProgressToLocalStorage(walletAddress, progress);
  }

  private saveArticleToLocalStorage(walletAddress: string, campaignId: string, article: LearningArticle): boolean {
    try {
      const key = `learna_article_${walletAddress.toLowerCase()}_${campaignId}_${article.topicId}`;
      localStorage.setItem(key, JSON.stringify(article));
      return true;
    } catch {
      return false;
    }
  }

  private getArticleFromLocalStorage(walletAddress: string, campaignId: string, topicId: string): LearningArticle | null {
    try {
      const key = `learna_article_${walletAddress.toLowerCase()}_${campaignId}_${topicId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private saveQuizToLocalStorage(walletAddress: string, campaignId: string, quiz: LearningQuiz): boolean {
    try {
      const key = `learna_quiz_${walletAddress.toLowerCase()}_${campaignId}_${quiz.topicId}`;
      localStorage.setItem(key, JSON.stringify(quiz));
      return true;
    } catch {
      return false;
    }
  }
}

export const firebaseService = new FirebaseService();

