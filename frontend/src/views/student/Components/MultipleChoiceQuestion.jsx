import React, { useEffect, useState } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

import { Container } from '@mui/material';
import { useGetQuestionsQuery } from 'src/slices/examApiSlice';
import { useParams } from 'react-router';

export default function MultipleChoiceQuestion({ questions, saveUserTestScore }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedOptionText, setSelectedOptionText] = useState('');
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [isFinishTest, setisFinishTest] = useState(false);

  useEffect(() => {
    if (questions && questions.length > 0) {
      setIsLastQuestion(currentQuestion === questions.length - 1);
    }
  }, [currentQuestion, questions]);

  const handleOptionChange = (event) => {
    const optionId = event.target.value;
    setSelectedOption(optionId);
    const option = questions[currentQuestion].options.find(opt => opt._id === optionId);
    setSelectedOptionText(option.optionText);
  };

  const handleNextQuestion = () => {
    const currentQuestionData = questions[currentQuestion];
    const correctOption = currentQuestionData.options.find(option => option.isCorrect);
    const isCorrect = correctOption._id === selectedOption;

    // Save the answer
    saveUserTestScore(
      currentQuestionData._id,
      selectedOptionText,
      isCorrect
    );

    setSelectedOption(null);
    setSelectedOptionText('');
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setisFinishTest(true);
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress sx={{ mb: 3 }} />
        <Typography variant="body1" color="text.secondary">
          Loading questions... If this persists, there might be an issue with the exam setup.
        </Typography>
      </Box>
    );
  }

  // Make sure we have options available before rendering
  const currentQuestionData = questions[currentQuestion];
  if (!currentQuestionData || !currentQuestionData.options || currentQuestionData.options.length === 0) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="body1" color="error">
          Error: Question data is incomplete or missing options.
        </Typography>
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={3}>
          Question {currentQuestion + 1}:
        </Typography>
        <Typography variant="body1" mb={3}>
          {currentQuestionData.question}
        </Typography>
        <Box mb={3}>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label="quiz"
              name="quiz"
              value={selectedOption}
              onChange={handleOptionChange}
            >
              {currentQuestionData.options.map((option, index) => (
                <FormControlLabel
                  key={option._id || index}
                  value={option._id || index}
                  control={<Radio />}
                  label={option.optionText}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button
            variant="contained"
            color="primary"
            onClick={handleNextQuestion}
            disabled={selectedOption === null}
            style={{ marginLeft: 'auto' }}
          >
            {isLastQuestion ? 'Finish' : 'Next Question'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
