import mongoose from "mongoose";

const resultSchema = mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    examId: {
      type: String,
      required: true,
      // Note: This is storing the UUID from the exam's examId field, not the MongoDB _id
      // We do not use ref here as Mongoose would try to match this with the _id field
    },
    answers: [{
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
      },
      selectedOption: {
        type: String,
        required: true
      },
      isCorrect: {
        type: Boolean,
        required: true
      }
    }],
    score: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    timeTaken: {
      type: Number, // in minutes
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['completed', 'timeout', 'terminated'],
      default: 'completed'
    },
    cheatingAttempts: {
      type: Number,
      default: 0
    },
    cheatingDetails: {
      usedPhone: {
        type: Boolean,
        default: false
      },
      usedBook: {
        type: Boolean,
        default: false
      },
      leftExamScreen: {
        type: Boolean,
        default: false
      },
      otherPersonDetected: {
        type: Boolean,
        default: false
      },
      audioDetected: {
        type: Boolean,
        default: false
      },
      additionalNotes: {
        type: String,
        default: ''
      }
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
resultSchema.index({ studentId: 1, examId: 1 });

const Result = mongoose.model("Result", resultSchema);

export default Result; 