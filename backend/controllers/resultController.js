import asyncHandler from 'express-async-handler';
import Result from '../models/resultModel.js';
import Exam from '../models/examModel.js';
import Question from '../models/quesModel.js';

// @desc    Submit exam result
// @route   POST /api/results
// @access  Private
const submitResult = asyncHandler(async (req, res) => {
  const {
    examId,
    answers,
    timeTaken,
    startTime,
    endTime,
    status,
    cheatingAttempts,
    cheatingLog
  } = req.body;

  console.log('Received cheating log:', cheatingLog);

  // Get exam details
  const exam = await Exam.findOne({ examId: examId });
  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }

  // Calculate score
  let score = 0;
  const totalQuestions = exam.totalQuestions;

  // Verify answers and calculate score
  for (const answer of answers) {
    const question = await Question.findById(answer.questionId);
    if (question && answer.selectedOption === question.options.find(opt => opt.isCorrect)?.optionText) {
      score++;
    }
  }

  // Process cheating log to ensure it matches the schema
  const validCheatingLog = Array.isArray(cheatingLog) ? cheatingLog.map(log => {
    // Ensure each log entry has a valid type and timestamp
    const validTypes = ['cell_phone', 'book', 'no_face', 'multiple_faces', 'tab_change', 'other'];
    return {
      type: validTypes.includes(log.type) ? log.type : 'other',
      timestamp: log.timestamp || new Date().toISOString()
    };
  }) : [];

  // Create result with cheatingLog included
  const result = await Result.create({
    studentId: req.user._id,
    examId,
    answers,
    score,
    totalQuestions,
    timeTaken,
    startTime,
    endTime,
    status,
    cheatingAttempts: cheatingAttempts || validCheatingLog.length,
    cheatingLog: validCheatingLog
  });

  if (result) {
    res.status(201).json(result);
  } else {
    res.status(400);
    throw new Error('Invalid result data');
  }
});

// @desc    Get results based on user role
// @route   GET /api/results
// @access  Private
const getResults = asyncHandler(async (req, res) => {
  const { role, _id } = req.user;
  let results;

  try {
    if (role === 'teacher') {
      // Teachers can see all results
      results = await Result.find().populate('studentId', 'name email');
    } else {
      // Students can only see their own results
      results = await Result.find({ studentId: _id });
    }
    
    // For all cases, manually fetch exam details instead of using populate
    const resultsWithExams = [];
    
    for (let i = 0; i < results.length; i++) {
      const resultObj = results[i].toObject();
      
      // Look up exam by examId (UUID string)
      const exam = await Exam.findOne({ examId: resultObj.examId });
      
      if (exam) {
        resultObj.examName = exam.examName;
        resultObj.examTotalQuestions = exam.totalQuestions;
        resultObj.examDuration = exam.duration;
      } else {
        console.log(`No exam found for examId: ${resultObj.examId}`);
      }
      
      resultsWithExams.push(resultObj);
    }
    
    res.status(200).json(resultsWithExams);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({
      message: 'Error fetching results',
      error: error.message
    });
  }
});

// @desc    Get exam results for a specific exam (teacher only)
// @route   GET /api/results/exam/:examId
// @access  Private/Teacher
const getExamResults = asyncHandler(async (req, res) => {
  try {
    // First, verify that the exam exists
    const exam = await Exam.findOne({ examId: req.params.examId });
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    // Get results for this exam
    const results = await Result.find({ examId: req.params.examId })
      .populate('studentId', 'name email')
      .sort('-createdAt');
    
    // Add exam details to each result
    const resultsWithExam = results.map(result => {
      const resultObj = result.toObject();
      resultObj.examName = exam.examName;
      resultObj.examTotalQuestions = exam.totalQuestions;
      resultObj.examDuration = exam.duration;
      return resultObj;
    });

    res.json(resultsWithExam);
  } catch (error) {
    console.error('Error fetching exam results:', error);
    res.status(500).json({
      message: 'Error fetching exam results',
      error: error.message
    });
  }
});

// @desc    Get detailed result for a specific exam
// @route   GET /api/results/:resultId
// @access  Private
const getResultDetails = asyncHandler(async (req, res) => {
  try {
    const result = await Result.findById(req.params.resultId)
      .populate('studentId', 'name email');
    
    if (result) {
      // Check if the requesting user is the student who took the exam or a teacher
      if (result.studentId._id.toString() !== req.user._id.toString() && req.user.role !== 'teacher') {
        res.status(403);
        throw new Error('Not authorized to view this result');
      }
      
      // Manually fetch the exam details
      const exam = await Exam.findOne({ examId: result.examId });
      const resultObj = result.toObject();
      
      if (exam) {
        resultObj.exam = {
          examName: exam.examName,
          totalQuestions: exam.totalQuestions,
          duration: exam.duration
        };
      }
      
      res.json(resultObj);
    } else {
      res.status(404);
      throw new Error('Result not found');
    }
  } catch (error) {
    console.error('Error fetching result details:', error);
    if (error.name === 'CastError') {
      res.status(404).json({ message: 'Result not found' });
    } else {
      res.status(error.statusCode || 500).json({
        message: error.message || 'Error fetching result details'
      });
    }
  }
});

export {
  submitResult,
  getResults,
  getExamResults,
  getResultDetails
}; 