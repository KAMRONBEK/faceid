import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Grid, CircularProgress, Typography, Card, TextField, IconButton, Avatar, Paper, List, ListItem, ListItemIcon, ListItemText, Divider, Button } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import BlankCard from 'src/components/shared/BlankCard';
import MultipleChoiceQuestion from './Components/MultipleChoiceQuestion';
import NumberOfQuestions from './Components/NumberOfQuestions';
import WebCam from './Components/WebCam';
import { useGetExamsQuery, useGetQuestionsQuery } from '../../slices/examApiSlice';
import { useSaveCheatingLogMutation } from 'src/slices/cheatingLogApiSlice';
import { useSubmitResultMutation, useGetResultsQuery } from '../../slices/resultsApiSlice';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SendIcon from '@mui/icons-material/Send';

const TestPage = () => {
  const { examId, testId } = useParams();
  const navigate = useNavigate();
  const [startTime] = useState(new Date());

  const [selectedExam, setSelectedExam] = useState(null);
  const [examDurationInSeconds, setexamDurationInSeconds] = useState(0);
  const { data: userExamdata, isLoading: examsLoading } = useGetExamsQuery();

  const [questions, setQuestions] = useState([]);
  const { data, isLoading: questionsLoading, error: questionsError } = useGetQuestionsQuery(examId);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [cheatingLog, setCheatingLog] = useState([]);

  // Keep the query but remove the state and related logic
  const { data: results, isLoading: resultsLoading } = useGetResultsQuery();
  
  // Add current question state to parent component
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  const [saveCheatingLogMutation] = useSaveCheatingLogMutation();
  const [submitResult] = useSubmitResultMutation();
  const { userInfo } = useSelector((state) => state.auth);

  // Track tab changes as cheating
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched to another tab or minimized the window
        const tabChangeLog = {
          type: 'tab_change',
          timestamp: new Date().toISOString(),
          count: 1
        };
        setCheatingLog(prevLogs => [...prevLogs, tabChangeLog]);
        toast.error('Leaving the test window has been recorded as a cheating attempt', {
          position: 'top-center',
          autoClose: 3000
        });
      }
    };

    // Add event listener for visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (userExamdata) {
      console.log("Available exams:", userExamdata);
      console.log("Looking for exam with ID:", examId);
      
      // Simplified approach: first look for exam by examId
      const examByExamId = userExamdata.find(exam => exam.examId === examId);
      
      if (examByExamId) {
        console.log("Found exam by examId:", examByExamId);
        setSelectedExam(examByExamId);
        
        if (examByExamId.duration) {
          setexamDurationInSeconds(examByExamId.duration * 60);
        } else {
          setexamDurationInSeconds(30 * 60); // 30 minutes
          console.warn('Exam duration not found, using default of 30 minutes');
        }
      } else {
        // Fallback: look for exam by _id (MongoDB id) for backward compatibility
        const examById = userExamdata.find(exam => exam._id === examId);
        
        if (examById) {
          console.warn("Found exam by _id instead of examId:", examById);
          setSelectedExam(examById);
          
          if (examById.duration) {
            setexamDurationInSeconds(examById.duration * 60);
          } else {
            setexamDurationInSeconds(30 * 60); // 30 minutes
            console.warn('Exam duration not found, using default of 30 minutes');
          }
        } else {
          console.error('Exam not found with ID:', examId);
          toast.error('Exam not found');
          navigate('/exam');
        }
      }
    }
  }, [userExamdata, examId, navigate]);

  useEffect(() => {
    if (data) {
      console.log("Received questions data:", data);
      console.log("Number of questions found:", data.length);
      setQuestions(data);
      
      if (data.length === 0) {
        // If no questions were found, display an error message
        toast.error('No questions found for this exam. Please contact your instructor.');
      }
    } else if (questionsError) {
      console.error('Error loading questions:', questionsError);
      toast.error(questionsError?.data?.message || 'Failed to load questions');
    }
  }, [data, questionsError]);

  const handleTestSubmission = async () => {
    try {
      const endTime = new Date();
      const timeTaken = Math.floor((endTime - startTime) / 1000);

      // Format cheating logs to ensure they match the backend model
      const formattedCheatingLog = cheatingLog.map(log => {
        const validTypes = ['cell_phone', 'book', 'no_face', 'multiple_faces', 'tab_change', 'other'];
        let type = log.type;
        
        // Handle any potential mappings that may still need to be done
        if (!validTypes.includes(type)) {
          // Convert any non-standard types to the backend expected format
          if (type === 'cellPhoneCount' || type === 'cell phone') {
            type = 'cell_phone';
          } else if (type === 'ProhibitedObjectCount') {
            type = 'book';
          } else if (type === 'noFaceCount') {
            type = 'no_face';
          } else if (type === 'multipleFaceCount') {
            type = 'multiple_faces';
          } else {
            type = 'other'; // Default to 'other' if type is not recognized
          }
        }

        // Ensure valid structure for backend
        return {
          type: type,
          timestamp: log.timestamp || new Date().toISOString()
        };
      });

      // Log the cheating attempts for debugging
      console.log('Submitting cheating log:', formattedCheatingLog);

      const resultData = {
        examId,
        score,
        totalQuestions: questions.length,
        timeTaken,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        answers: answers.map(answer => ({
          questionId: answer.questionId,
          selectedOption: answer.selectedAnswer,
          isCorrect: answer.isCorrect
        })),
        cheatingLog: formattedCheatingLog,
        cheatingAttempts: formattedCheatingLog.length // Add the count of cheating attempts
      };

      // Log the entire result data for debugging
      console.log('Submitting result data:', resultData);

      await submitResult(resultData).unwrap();
      toast.success('Exam submitted successfully!');
      navigate('/success');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to submit exam');
      console.error('Error submitting exam:', err);
    }
  };

  const saveUserTestScore = (questionId, selectedAnswer, isCorrect) => {
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }
    setAnswers(prevAnswers => [...prevAnswers, {
      questionId,
      selectedAnswer,
      isCorrect
    }]);
  };

  // Add function to handle question navigation
  const handleQuestionChange = (newQuestionIndex) => {
    if (newQuestionIndex >= 0 && newQuestionIndex < questions.length) {
      setCurrentQuestion(newQuestionIndex);
    }
  };

  const saveCheatingLog = (log) => {
    setCheatingLog(prevLogs => [...prevLogs, log]);
  };

  // Show loading state if either exams or questions are still loading
  if (examsLoading || questionsLoading || resultsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Handle errors from questions query
  if (questionsError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">
          {questionsError?.data?.message || 'Failed to load questions'}
        </Typography>
      </Box>
    );
  }

  // Make sure we have an exam selected
  if (!selectedExam) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">
          Exam not found or not available. Please go back to the exam list.
        </Typography>
      </Box>
    );
  }

  return (
    <PageContainer title="TestPage" description="This is TestPage">
      <Box sx={{ height: 'calc(100vh - 100px)', p: 3 }}>
        <Grid container spacing={3} sx={{ height: '100%' }}>
          {/* Main Camera Area (Left Side) */}
          <Grid item xs={12} md={7} sx={{ height: '100%' }}>
            <BlankCard sx={{ height: '100%' }}>
              <Box 
                sx={{ 
                  position: 'relative', 
                  height: '100%', 
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden'
                }}
              >
                <WebCam onCheatingDetected={saveCheatingLog} />
              </Box>
            </BlankCard>
          </Grid>
          
          {/* Right Panel */}
          <Grid item xs={12} md={5} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Controls at top, made smaller */}
            <Grid item sx={{ mb: 2 }}>
              <BlankCard>
                <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <NumberOfQuestions
                    questionLength={questions.length}
                    submitTest={handleTestSubmission}
                    examDurationInSeconds={examDurationInSeconds}
                    currentQuestion={currentQuestion}
                    onQuestionSelect={handleQuestionChange}
                  />
                </Box>
              </BlankCard>
            </Grid>
            
            {/* Questions with larger space */}
            <Grid item sx={{ flex: 1 }}>
              <BlankCard sx={{ height: '100%' }}>
                <Box 
                  sx={{ 
                    height: '100%',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    overflow: 'auto'
                  }}
                >
                  <MultipleChoiceQuestion
                    questions={questions}
                    saveUserTestScore={saveUserTestScore}
                    onFinish={handleTestSubmission}
                    currentQuestion={currentQuestion}
                    setCurrentQuestion={handleQuestionChange}
                  />
                </Box>
              </BlankCard>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default TestPage;
