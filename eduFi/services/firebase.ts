// import { 
//   collection, 
//   doc, 
//   getDocs, 
//   getDoc, 
//   addDoc, 
//   updateDoc, 
//   query, 
//   orderBy, 
//   limit,
//   where
// } from 'firebase/firestore';
// import { db } from '../config/firebase';
// import { Quiz, QuizResult, User } from '../types/quiz';

// export class FirebaseService {
//   async getQuizzes(): Promise<Quiz[]> {
//     try {
//       const quizzesRef = collection(db, 'quizzes');
//       const snapshot = await getDocs(query(quizzesRef, orderBy('createdAt', 'desc')));
      
//       return snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//         createdAt: doc.data().createdAt?.toDate() || new Date()
//       } as Quiz));
//     } catch (error) {
//       console.error('Error fetching quizzes:', error);
//       return [];
//     }
//   }

//   async getQuiz(id: string): Promise<Quiz | null> {
//     try {
//       const quizRef = doc(db, 'quizzes', id);
//       const snapshot = await getDoc(quizRef);
      
//       if (snapshot.exists()) {
//         return {
//           id: snapshot.id,
//           ...snapshot.data(),
//           createdAt: snapshot.data().createdAt?.toDate() || new Date()
//         } as Quiz;
//       }
      
//       return null;
//     } catch (error) {
//       console.error('Error fetching quiz:', error);
//       return null;
//     }
//   }

//   async saveQuizResult(result: Omit<QuizResult, 'id'>): Promise<string | null> {
//     try {
//       const resultsRef = collection(db, 'results');
//       const docRef = await addDoc(resultsRef, result);
//       return docRef.id;
//     } catch (error) {
//       console.error('Error saving quiz result:', error);
//       return null;
//     }
//   }

//   async getLeaderboard(limit: number = 10): Promise<QuizResult[]> {
//     try {
//       const resultsRef = collection(db, 'results');
//       const snapshot = await getDocs(
//         query(resultsRef, orderBy('percentage', 'desc'), limit(limit))
//       );
      
//       return snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//         completedAt: doc.data().completedAt?.toDate() || new Date()
//       } as QuizResult));
//     } catch (error) {
//       console.error('Error fetching leaderboard:', error);
//       return [];
//     }
//   }

//   async getUserResults(walletAddress: string): Promise<QuizResult[]> {
//     try {
//       const resultsRef = collection(db, 'results');
//       const snapshot = await getDocs(
//         query(resultsRef, where('walletAddress', '==', walletAddress), orderBy('completedAt', 'desc'))
//       );
      
//       return snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//         completedAt: doc.data().completedAt?.toDate() || new Date()
//       } as QuizResult));
//     } catch (error) {
//       console.error('Error fetching user results:', error);
//       return [];
//     }
//   }

//   async createOrUpdateUser(userData: Omit<User, 'id'>): Promise<string | null> {
//     try {
//       const usersRef = collection(db, 'users');
//       const existingUserQuery = query(usersRef, where('walletAddress', '==', userData.walletAddress));
//       const existingUserSnapshot = await getDocs(existingUserQuery);
      
//       if (!existingUserSnapshot.empty) {
//         const userDoc = existingUserSnapshot.docs[0];
//         await updateDoc(userDoc.ref, {
//           ...userData,
//           totalScore: userData.totalScore,
//           quizzesCompleted: userData.quizzesCompleted
//         });
//         return userDoc.id;
//       } else {
//         const docRef = await addDoc(usersRef, userData);
//         return docRef.id;
//       }
//     } catch (error) {
//       console.error('Error creating/updating user:', error);
//       return null;
//     }
//   }
// }

// export const firebaseService = new FirebaseService();