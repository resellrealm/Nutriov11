import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { logError } from '../utils/errorLogger';

/**
 * Service for managing scan feedback and analytics
 */
class ScanFeedbackService {
  constructor() {
    this.collectionName = 'scanFeedback';
  }

  /**
   * Submit feedback for a scan result
   * @param {Object} feedbackData - The feedback data
   * @returns {Promise<string>} The feedback document ID
   */
  async submitFeedback(feedbackData) {
    try {
      const {
        userId,
        scanId,
        isCorrect,
        wrongReason = null,
        aiResult,
        userCorrection = null,
        isPremium = false,
        hadOnlineResearch = false
      } = feedbackData;

      const docRef = await addDoc(collection(db, this.collectionName), {
        userId,
        scanId,
        isCorrect,
        wrongReason, // 'wrong_food', 'wrong_variant', 'wrong_portion', 'wrong_nutrition', 'multiple_items', 'other'
        aiResult: {
          name: aiResult.name,
          confidence: aiResult.confidence,
          nutrition: aiResult.nutrition,
          ingredients: aiResult.ingredients || []
        },
        userCorrection,
        isPremium,
        hadOnlineResearch,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      return docRef.id;
    } catch (error) {
      logError('scanFeedbackService.submitFeedback', error, { feedbackData });
      throw error;
    }
  }

  /**
   * Get feedback statistics for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} Feedback statistics
   */
  async getUserFeedbackStats(userId) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const feedbacks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const totalScans = feedbacks.length;
      const correctScans = feedbacks.filter(f => f.isCorrect).length;
      const incorrectScans = totalScans - correctScans;
      const accuracyRate = totalScans > 0 ? (correctScans / totalScans) * 100 : 0;

      // Break down wrong reasons
      const wrongReasons = feedbacks
        .filter(f => !f.isCorrect && f.wrongReason)
        .reduce((acc, f) => {
          acc[f.wrongReason] = (acc[f.wrongReason] || 0) + 1;
          return acc;
        }, {});

      return {
        totalScans,
        correctScans,
        incorrectScans,
        accuracyRate: Math.round(accuracyRate * 10) / 10,
        wrongReasons,
        premiumScans: feedbacks.filter(f => f.isPremium).length,
        basicScans: feedbacks.filter(f => !f.isPremium).length
      };
    } catch (error) {
      logError('scanFeedbackService.getUserFeedbackStats', error, { userId });
      throw error;
    }
  }

  /**
   * Get global accuracy statistics (for admin/analytics)
   * @returns {Promise<Object>} Global statistics
   */
  async getGlobalStats() {
    try {
      const snapshot = await getDocs(collection(db, this.collectionName));
      const feedbacks = snapshot.docs.map(doc => doc.data());

      const premiumFeedbacks = feedbacks.filter(f => f.isPremium && f.hadOnlineResearch);
      const basicFeedbacks = feedbacks.filter(f => !f.isPremium);

      const premiumAccuracy = premiumFeedbacks.length > 0
        ? (premiumFeedbacks.filter(f => f.isCorrect).length / premiumFeedbacks.length) * 100
        : 0;

      const basicAccuracy = basicFeedbacks.length > 0
        ? (basicFeedbacks.filter(f => f.isCorrect).length / basicFeedbacks.length) * 100
        : 0;

      return {
        totalFeedbacks: feedbacks.length,
        premiumAccuracy: Math.round(premiumAccuracy * 10) / 10,
        basicAccuracy: Math.round(basicAccuracy * 10) / 10,
        improvementDelta: Math.round((premiumAccuracy - basicAccuracy) * 10) / 10
      };
    } catch (error) {
      logError('scanFeedbackService.getGlobalStats', error);
      throw error;
    }
  }

  /**
   * Get recent incorrect scans to improve AI
   * @param {number} limitCount - Number of records to fetch
   * @returns {Promise<Array>} Recent incorrect scans
   */
  async getRecentIncorrectScans(limitCount = 50) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('isCorrect', '==', false),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      logError('scanFeedbackService.getRecentIncorrectScans', error, { limitCount });
      throw error;
    }
  }
}

export default new ScanFeedbackService();
