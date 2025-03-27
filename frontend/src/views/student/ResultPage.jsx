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
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';

const ResultPage = () => {
  const { data: results, isLoading, error } = useGetStudentResultsQuery();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">
          {error?.data?.message || 'Failed to load results'}
        </Typography>
      </Box>
    );
  }

  return (
    <PageContainer title="My Results" description="View your exam results">
      <Box p={3}>
        <Card>
          <CardContent>
            {!results || results.length === 0 ? (
              <Typography>No exam results found.</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Score</TableCell>
                      <TableCell>Total Questions</TableCell>
                      <TableCell>Time Taken</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result._id}>
                        <TableCell>{result.score}</TableCell>
                        <TableCell>{result.totalQuestions}</TableCell>
                        <TableCell>{Math.floor(result.timeTaken / 60)} minutes</TableCell>
                        <TableCell>
                          {new Date(result.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {result.score >= result.totalQuestions / 2 ? (
                            <Typography color="success.main">Passed</Typography>
                          ) : (
                            <Typography color="error.main">Failed</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>
    </PageContainer>
  );
};

export default ResultPage;
