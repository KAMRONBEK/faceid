import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import BlankCard from 'src/components/shared/BlankCard';
import { Box, Button, Stack, Typography } from '@mui/material';
import Countdown from 'react-countdown';

const NumberOfQuestions = ({ 
  questionLength, 
  submitTest, 
  examDurationInSeconds, 
  currentQuestion = 0, 
  onQuestionSelect
}) => {
  const totalQuestions = questionLength;
  // Generate an array of question numbers from 1 to totalQuestions
  const questionNumbers = Array.from({ length: totalQuestions }, (_, index) => index + 1);
  
  const handleQuestionButtonClick = (questionNumber) => {
    // Call the parent's function to change the question (0-based index)
    if (onQuestionSelect) {
      onQuestionSelect(questionNumber - 1);
    }
  };

  // Create an array of rows, each containing up to 5 question numbers
  const rows = [];
  for (let i = 0; i < questionNumbers.length; i += 5) {
    rows.push(questionNumbers.slice(i, i + 5));
  }

  // Timer related states
  const [timeRemaining, setTimeRemaining] = useState(examDurationInSeconds);
  
  // Countdown timer
  useEffect(() => {
    if (examDurationInSeconds <= 0) return;
    
    setTimeRemaining(examDurationInSeconds);
    const countdown = setInterval(() => {
      setTimeRemaining((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(countdown);
          if (submitTest) submitTest(); // Automatically submit the test when time runs out
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdown); // Cleanup the timer when the component unmounts
    };
  }, [examDurationInSeconds, submitTest]);

  // Format the time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Box
        position="sticky"
        top="0"
        zIndex={1}
        bgcolor="white"
        paddingY="10px"
        width="100%"
        px={3}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Questions: {currentQuestion + 1}/{totalQuestions}</Typography>
          <Typography variant="h6">
            Time Left: {formatTime(timeRemaining)}
          </Typography>
          <Button variant="contained" onClick={submitTest} color="error" disabled={!submitTest}>
            Finish Test
          </Button>
        </Stack>
      </Box>

      <Box p={2} maxHeight="150px" overflow="auto">
        <Grid container spacing={1}>
          {rows.map((row, rowIndex) => (
            <Grid key={rowIndex} item xs={12}>
              <Stack direction="row" alignItems="center" justifyContent="start">
                {row.map((questionNumber) => (
                  <Avatar
                    key={questionNumber}
                    variant="rounded"
                    style={{
                      width: '36px',
                      height: '36px',
                      fontSize: '16px',
                      cursor: 'pointer',
                      margin: '3px',
                      background: questionNumber === currentQuestion + 1 ? '#1976d2' : '#ccc',
                      color: questionNumber === currentQuestion + 1 ? 'white' : 'black',
                    }}
                    onClick={() => handleQuestionButtonClick(questionNumber)}
                  >
                    {questionNumber}
                  </Avatar>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export default NumberOfQuestions;
