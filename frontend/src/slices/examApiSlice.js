import { apiSlice } from './apiSlice';

// Define the base URL for the exams API
const EXAMS_URL = '/api/exams';

// Inject endpoints for the exam slice
export const examApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all exams
    getExams: builder.query({
      query: () => ({
        url: EXAMS_URL,
        method: 'GET',
      }),
      providesTags: ['Exams'],
    }),
    // Create a new exam
    createExam: builder.mutation({
      query: (data) => ({
        url: EXAMS_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Exams'],
    }),
    // Get questions for a specific exam
    getQuestions: builder.query({
      query: (examId) => ({
        url: `${EXAMS_URL}/exam/questions/${examId}`,
        method: 'GET',
      }),
      providesTags: ['Questions'],
    }),
    // Create a new question for an exam
    createQuestion: builder.mutation({
      query: (data) => ({
        url: `${EXAMS_URL}/exam/questions`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Questions'],
    }),
  }),
});

// Export the generated hooks for each endpoint
export const {
  useGetExamsQuery,
  useCreateExamMutation,
  useGetQuestionsQuery,
  useCreateQuestionMutation,
} = examApiSlice;
