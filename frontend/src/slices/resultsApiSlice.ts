import { apiSlice } from './apiSlice';

const RESULTS_URL = '/api/results';

export const resultsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    submitResult: builder.mutation({
      query: (data) => ({
        url: `${RESULTS_URL}`,
        method: 'POST',
        body: data,
      }),
    }),
    getStudentResults: builder.query({
      query: () => ({
        url: RESULTS_URL,
        method: 'GET',
      }),
      keepUnusedDataFor: 5,
    }),
    getExamResults: builder.query({
      query: (examId) => ({
        url: `${RESULTS_URL}/exam/${examId}`,
      }),
    }),
    getResultDetails: builder.query({
      query: (resultId) => ({
        url: `${RESULTS_URL}/${resultId}`,
      }),
    }),
  }),
});

export const {
  useSubmitResultMutation,
  useGetStudentResultsQuery,
  useGetExamResultsQuery,
  useGetResultDetailsQuery,
} = resultsApiSlice; 