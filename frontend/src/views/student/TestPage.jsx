import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Grid, CircularProgress, Typography } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import BlankCard from 'src/components/shared/BlankCard';
import MultipleChoiceQuestion from './Components/MultipleChoiceQuestion';
import NumberOfQuestions from './Components/NumberOfQuestions';
import WebCam from './Components/WebCam';
import { useGetExamsQuery, useGetQuestionsQuery } from '../../slices/examApiSlice';
import { useSaveCheatingLogMutation } from 'src/slices/cheatingLogApiSlice';
import { useSubmitResultMutation } from '../../slices/resultsApiSlice';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

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

  const [saveCheatingLogMutation] = useSaveCheatingLogMutation();
  const [submitResult] = useSubmitResultMutation();
  const { userInfo } = useSelector((state) => state.auth);

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
        cheatingLog
      };

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

  const saveCheatingLog = (log) => {
    setCheatingLog(prevLogs => [...prevLogs, log]);
  };

  // Show loading state if either exams or questions are still loading
  if (examsLoading || questionsLoading) {
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
      <Box pt="3rem">
        <Grid container spacing={3}>
          <Grid item xs={12} md={7} lg={7}>
            <BlankCard>
              <Box
                width="100%"
                minHeight="400px"
                boxShadow={3}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
              >
                <MultipleChoiceQuestion
                  questions={questions}
                  saveUserTestScore={saveUserTestScore}
                  onFinish={handleTestSubmission}
                />
              </Box>
            </BlankCard>
          </Grid>
          <Grid item xs={12} md={5} lg={5}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <BlankCard>
                  <Box
                    maxHeight="300px"
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'start',
                      justifyContent: 'center',
                      overflowY: 'auto',
                      height: '100%',
                    }}
                  >
                    <NumberOfQuestions
                      questionLength={questions.length}
                      submitTest={handleTestSubmission}
                      examDurationInSeconds={examDurationInSeconds}
                    />
                  </Box>
                </BlankCard>
              </Grid>
              <Grid item xs={12}>
                <BlankCard>
                  <Box
                    width="300px"
                    maxHeight="180px"
                    boxShadow={3}
                    display="flex"
                    flexDirection="column"
                    alignItems="start"
                    justifyContent="center"
                  >
                    <WebCam onCheatingDetected={saveCheatingLog} />
                  </Box>
                </BlankCard>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default TestPage;
