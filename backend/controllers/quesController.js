import asyncHandler from "express-async-handler";
import Question from "../models/quesModel.js";

const getQuestionsByExamId = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  console.log("Question Exam id ", examId);

  if (!examId) {
    return res.status(400).json({ error: "examId is missing or invalid" });
  }

  // We only use the examId field (UUID) for querying - no ambiguous checks
  const questions = await Question.find({ examId });
  console.log(`Found ${questions.length} questions for exam ID ${examId}`);
  
  if (questions.length === 0) {
    console.log("No questions found for exam ID:", examId);
    return res.status(404).json({ 
      message: "No questions found for this exam", 
      examId 
    });
  }

  res.status(200).json(questions);
});

const createQuestion = asyncHandler(async (req, res) => {
  const { question, options, examId } = req.body;

  if (!examId) {
    return res.status(400).json({ error: "examId is missing or invalid" });
  }

  const newQuestion = new Question({
    question,
    options,
    examId,
  });

  const createdQuestion = await newQuestion.save();

  if (createdQuestion) {
    res.status(201).json(createdQuestion);
  } else {
    res.status(400);
    throw new Error("Invalid Question Data");
  }
});

export { getQuestionsByExamId, createQuestion };
