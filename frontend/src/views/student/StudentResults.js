import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useGetStudentResultsQuery } from '../../slices/resultsApiSlice';
import PageContainer from '../../components/container/PageContainer';

const StudentResults = () => {
  const { data: results, isLoading, error } = useGetStudentResultsQuery();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error">Error loading results</Typography>
      </Box>
    );
  }

  return (
    <PageContainer title="My Exam Results" description="View your exam results">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                Exam Results
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Exam Name</TableCell>
                      <TableCell align="right">Score</TableCell>
                      <TableCell align="right">Total Questions</TableCell>
                      <TableCell align="right">Time Taken (min)</TableCell>
                      <TableCell align="right">Status</TableCell>
                      <TableCell align="right">Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results?.map((result) => (
                      <TableRow key={result._id}>
                        <TableCell component="th" scope="row">
                          {result.examId.examName}
                        </TableCell>
                        <TableCell align="right">{result.score}</TableCell>
                        <TableCell align="right">{result.totalQuestions}</TableCell>
                        <TableCell align="right">{result.timeTaken}</TableCell>
                        <TableCell align="right">
                          <Typography
                            color={
                              result.status === 'completed'
                                ? 'success.main'
                                : result.status === 'timeout'
                                ? 'warning.main'
                                : 'error.main'
                            }
                          >
                            {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {new Date(result.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default StudentResults; 