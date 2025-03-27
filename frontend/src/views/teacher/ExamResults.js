import React, { useState } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useGetExamResultsQuery } from '../../slices/resultsApiSlice';
import PageContainer from '../../components/container/PageContainer';

const ExamResults = ({ examId }) => {
  const [selectedResult, setSelectedResult] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { data: results, isLoading, error } = useGetExamResultsQuery(examId);

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedResult(null);
  };

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

  // Calculate statistics
  const stats = {
    totalStudents: results?.length || 0,
    averageScore: results?.reduce((acc, curr) => acc + curr.score, 0) / (results?.length || 1),
    highestScore: Math.max(...(results?.map(r => r.score) || [0])),
    lowestScore: Math.min(...(results?.map(r => r.score) || [0])),
  };

  return (
    <PageContainer title="Exam Results" description="View exam results for all students">
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Students
              </Typography>
              <Typography variant="h4">{stats.totalStudents}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Score
              </Typography>
              <Typography variant="h4">{stats.averageScore.toFixed(1)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Highest Score
              </Typography>
              <Typography variant="h4">{stats.highestScore}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Lowest Score
              </Typography>
              <Typography variant="h4">{stats.lowestScore}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                Student Results
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell align="right">Score</TableCell>
                      <TableCell align="right">Time Taken (min)</TableCell>
                      <TableCell align="right">Status</TableCell>
                      <TableCell align="right">Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results?.map((result) => (
                      <TableRow key={result._id}>
                        <TableCell>{result.studentId.name}</TableCell>
                        <TableCell>{result.studentId.email}</TableCell>
                        <TableCell align="right">{result.score}</TableCell>
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
                        <TableCell align="right">
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleViewDetails(result)}
                          >
                            View Details
                          </Button>
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

      {/* Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Result Details</DialogTitle>
        <DialogContent>
          {selectedResult && (
            <List>
              <ListItem>
                <ListItemText
                  primary="Student"
                  secondary={`${selectedResult.studentId.name} (${selectedResult.studentId.email})`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Score"
                  secondary={`${selectedResult.score} out of ${selectedResult.totalQuestions}`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Time Taken"
                  secondary={`${selectedResult.timeTaken} minutes`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Status"
                  secondary={selectedResult.status.charAt(0).toUpperCase() + selectedResult.status.slice(1)}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Cheating Attempts"
                  secondary={selectedResult.cheatingAttempts}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Answers"
                  secondary={
                    <List>
                      {selectedResult.answers.map((answer, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`Question ${index + 1}`}
                            secondary={`Selected: ${answer.selectedOption} (${answer.isCorrect ? 'Correct' : 'Incorrect'})`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  }
                />
              </ListItem>
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ExamResults; 