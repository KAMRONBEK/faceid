import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
import { useGetStudentResultsQuery, useGetExamResultsQuery } from '../../slices/resultsApiSlice';
import { useSelector } from 'react-redux';
import PageContainer from 'src/components/container/PageContainer';

const ResultPage = () => {
  const { examId } = useParams();
  const [selectedResult, setSelectedResult] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);
  const isTeacher = userInfo?.role === 'teacher';

  console.log('ResultPage - Current path params:', { examId, isTeacher, userRole: userInfo?.role });

  // For teacher viewing specific exam results
  const { 
    data: examResults, 
    isLoading: examResultsLoading, 
    error: examResultsError 
  } = useGetExamResultsQuery(examId, { 
    skip: !examId || !isTeacher 
  });

  // For student viewing their own results
  const { 
    data: studentResults, 
    isLoading: studentResultsLoading, 
    error: studentResultsError 
  } = useGetStudentResultsQuery(undefined, {
    skip: isTeacher && examId
  });

  // Use examResults if we're a teacher viewing exam results, otherwise use studentResults
  const results = examId && isTeacher ? examResults : studentResults;
  const isLoading = examId && isTeacher ? examResultsLoading : studentResultsLoading;
  const error = examId && isTeacher ? examResultsError : studentResultsError;

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedResult(null);
  };

  // Calculate statistics for teacher view
  const stats = examId && isTeacher && results ? {
    totalStudents: results.length || 0,
    averageScore: results.reduce((acc, curr) => acc + curr.score, 0) / (results.length || 1),
    highestScore: Math.max(...(results.map(r => r.score) || [0])),
    lowestScore: Math.min(...(results.map(r => r.score) || [0])),
    cheatingCount: results.filter(r => r.cheatingAttempts > 0).length || 0,
    cheatingPercentage: results.length ? (results.filter(r => r.cheatingAttempts > 0).length / results.length) * 100 : 0
  } : null;

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
    <PageContainer title={isTeacher && examId ? "Exam Results" : "My Results"} description="View exam results">
      <Box p={3}>
        {/* Teacher View with Statistics */}
        {isTeacher && examId && stats && (
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Students
                  </Typography>
                  <Typography variant="h4">{stats.totalStudents}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Average Score
                  </Typography>
                  <Typography variant="h4">{stats.averageScore.toFixed(1)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Highest Score
                  </Typography>
                  <Typography variant="h4">{stats.highestScore}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Lowest Score
                  </Typography>
                  <Typography variant="h4">{stats.lowestScore}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Cheating Detected
                  </Typography>
                  <Typography variant="h4" color={stats.cheatingCount > 0 ? "error.main" : "success.main"}>
                    {stats.cheatingCount} ({stats.cheatingPercentage.toFixed(0)}%)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <Card>
          <CardContent>
            {!results || results.length === 0 ? (
              <Typography>No exam results found.</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {isTeacher && examId && (
                        <>
                          <TableCell>Student Name</TableCell>
                          <TableCell>Email</TableCell>
                        </>
                      )}
                      <TableCell>Score</TableCell>
                      <TableCell>Total Questions</TableCell>
                      <TableCell>Time Taken (min)</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Cheated</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result._id}>
                        {isTeacher && examId && (
                          <>
                            <TableCell>{result.studentId.name}</TableCell>
                            <TableCell>{result.studentId.email}</TableCell>
                          </>
                        )}
                        <TableCell>{result.score}</TableCell>
                        <TableCell>{result.totalQuestions}</TableCell>
                        <TableCell>{Math.floor(result.timeTaken / 60)} minutes</TableCell>
                        <TableCell>
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
                        <TableCell>
                          <Typography
                            color={(result.cheatingAttempts && result.cheatingAttempts > 0) ? 'error.main' : 'success.main'}
                          >
                            {(result.cheatingAttempts && result.cheatingAttempts > 0) ? 'Yes' : 'No'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(result.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
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
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Result Details</DialogTitle>
        <DialogContent>
          {selectedResult && (
            <List>
              {isTeacher && examId && (
                <>
                  <ListItem>
                    <ListItemText
                      primary="Student"
                      secondary={`${selectedResult.studentId.name} (${selectedResult.studentId.email})`}
                    />
                  </ListItem>
                  <Divider />
                </>
              )}
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
                  secondary={`${Math.floor(selectedResult.timeTaken / 60)} minutes`}
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
                  secondary={
                    selectedResult.cheatingAttempts > 0 ? (
                      <Box sx={{ mt: 1 }}>
                        <Typography color="error.main" sx={{ fontWeight: 'bold' }}>
                          Detected: {selectedResult.cheatingAttempts} total attempt(s)
                        </Typography>
                        
                        {selectedResult.cheatingLog && selectedResult.cheatingLog.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="subtitle2">Types of cheating detected:</Typography>
                            <List dense disablePadding>
                              {/* Count each type of cheating */}
                              {(() => {
                                const counts = {};
                                
                                // Count occurrences of each type
                                selectedResult.cheatingLog.forEach(log => {
                                  counts[log.type] = (counts[log.type] || 0) + 1;
                                });
                                
                                // Display each type with count
                                return Object.entries(counts).map(([type, count]) => {
                                  let typeName = "Unknown";
                                  
                                  // Map type to readable name
                                  switch(type) {
                                    case 'cell_phone':
                                      typeName = "Used phone";
                                      break;
                                    case 'book':
                                      typeName = "Used prohibited materials";
                                      break;
                                    case 'no_face':
                                      typeName = "Face not visible";
                                      break;
                                    case 'multiple_faces':
                                      typeName = "Multiple people detected";
                                      break;
                                    case 'tab_change':
                                      typeName = "Left exam window";
                                      break;
                                    default:
                                      typeName = type; // Use the type code if unknown
                                  }
                                  
                                  return (
                                    <ListItem key={type} dense sx={{ py: 0.5 }}>
                                      <Typography variant="body2" color="error.main">
                                        • {typeName}: <strong>{count} time(s)</strong>
                                      </Typography>
                                    </ListItem>
                                  );
                                });
                              })()}
                            </List>
                          </Box>
                        )}
                        
                        {(!selectedResult.cheatingLog || selectedResult.cheatingLog.length === 0) && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Cheating detected but no detailed information available.
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography color="success.main">
                        No cheating detected
                      </Typography>
                    )
                  }
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

export default ResultPage;
