import express from 'express';
import {
  submitResult,
  getResultDetails, 
  getResults
} from '../controllers/resultController.js';
import { protect, teacher } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes
router.route('/').post(protect, submitResult);
router.route('/').get(protect, getResults);
router.route('/:resultId').get(protect, getResultDetails);

export default router; 