import React from "react";
import { Grid, Typography, Box, CircularProgress, Alert } from "@mui/material";
import { useGetExamsQuery } from '../../../slices/examApiSlice';
import ExamCard from './ExamCard';

const Exams = () => {
  const { data: exams, error, isLoading } = useGetExamsQuery();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error?.data?.message || "Failed to fetch exams. Please try again later."}
      </Alert>
    );
  }

  // If no exams are available
  if (!exams || exams.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h6" color="textSecondary">
          No exams available at the moment.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', pt: 2, pb: 4 }}>
      <Grid 
        container 
        spacing={{ xs: 1.5, sm: 2, md: 3 }}
        sx={{ width: '100%', m: 0 }}
      >
        {exams.map((exam) => (
          <Grid 
            item 
            xs={12}
            sm={6}
            md={4}
            key={exam._id}
            sx={{ display: 'flex' }}
          >
            <ExamCard exam={exam} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Exams;
