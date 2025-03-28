import React, { useState } from 'react';
import { Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import CheatingTable from './components/CheatingTable';
import { useGetExamsQuery } from 'src/slices/examApiSlice';

const ExamLogPage = () => {
  const navigate = useNavigate();
  const [selectedExamId, setSelectedExamId] = useState('');
  const { data: examsData } = useGetExamsQuery();

  const handleViewResults = () => {
    if (selectedExamId) {
      navigate(`/exam-results/${selectedExamId}`);
    }
  };

  return (
    <PageContainer title="ExamLog Page" description="this is ExamLog page">
      <DashboardCard title="ExamLog Page">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            View Exam Results
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleViewResults}
            disabled={!selectedExamId}
          >
            View Results
          </Button>
        </Box>
        <Typography>This is a ExamLog page</Typography>
        <CheatingTable onExamSelect={setSelectedExamId} />
      </DashboardCard>
    </PageContainer>
  );
};

export default ExamLogPage;
