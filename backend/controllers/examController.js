import asyncHandler from "express-async-handler";
import Exam from "./../models/examModel.js";

// @desc Get exams based on user role
// @route GET /api/exams
// @access Private
const getExams = asyncHandler(async (req, res) => {
  const { role } = req.user;

  // Handle both teacher and student cases in the controller
  if (role === 'teacher') {
    const exams = await Exam.find();
    return res.status(200).json(exams);
  } else {
    // For students, only show active exams
    const currentDate = new Date();
    const exams = await Exam.find({
      liveDate: { $lte: currentDate },
      deadDate: { $gte: currentDate }
    });
    return res.status(200).json(exams);
  }
});

// @desc Create a new exam
// @route POST /api/exams
// @access Private (admin)
const createExam = asyncHandler(async (req, res) => {
  const { examName, totalQuestions, duration, liveDate, deadDate } = req.body;

  const exam = new Exam({
    examName,
    totalQuestions,
    duration,
    liveDate,
    deadDate,
  });

  const createdExam = await exam.save();

  if (createdExam) {
    res.status(201).json(createdExam);
  } else {
    res.status(400);
    throw new Error("Invalid Exam Data");
  }
});

export { getExams, createExam };
