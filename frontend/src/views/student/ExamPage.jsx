import React from 'react';
import { Typography, Box } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import Exams from './Components/Exams';

const ExamPage = () => {
  return (
    <PageContainer title="Available Exams" description="View and take your scheduled exams">
      <DashboardCard 
        title="Available Exams"
        sx={{
          maxWidth: '100%',
          overflowX: 'hidden',
          '& .MuiCardContent-root': {
            padding: { xs: '12px', sm: '20px', md: '24px' }
          }
        }}
      >
        <Box sx={{ 
          mb: { xs: 1, sm: 1.5, md: 2 },
          display: { xs: 'none', sm: 'block' } // Hide on extra small screens
        }}>
          <Typography 
            variant="body1" 
            color="textSecondary"
            sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
          >
            Select an exam below to view details or start taking it if it's currently active.
          </Typography>
        </Box>
        <Exams />
      </DashboardCard>
    </PageContainer>
  );
};

export default ExamPage;
