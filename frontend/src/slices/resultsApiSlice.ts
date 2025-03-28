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
    getResults: builder.query({
      query: () => ({
        url: RESULTS_URL,
        method: 'GET',
      }),
      // The backend API should handle role-specific filtering based on the user's token
      // This endpoint will return different data depending on the user's role
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
  useGetResultsQuery,
  useGetExamResultsQuery,
  useGetResultDetailsQuery,
} = resultsApiSlice; 