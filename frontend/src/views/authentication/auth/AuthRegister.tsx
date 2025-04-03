import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Select, MenuItem, Paper, Stepper, Step, StepLabel, TextField } from '@mui/material';

// Import the original CustomTextField
import OriginalCustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import { Stack } from '@mui/system';
import FaceCapture from '../../../components/face-recognition/FaceCapture';
import { toast } from 'react-toastify';

// Create a wrapper component that filters props before passing them to CustomTextField
const CustomTextField = (props) => {
  // Filter out properties that aren't valid for the underlying MUI TextField
  const { ...validProps } = props;
  return <OriginalCustomTextField {...validProps} />;
};

interface AuthRegisterProps {
  formik: any;
  title?: string;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
}

const AuthRegister: React.FC<AuthRegisterProps> = ({ formik, title, subtitle, subtext }) => {
  const { values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue } = formik;
  const [activeStep, setActiveStep] = useState(0);
  const [processingFace, setProcessingFace] = useState(false);

  // Define steps based on role
  const getSteps = () => {
    if (values.role === 'teacher') {
      return ['Account Details']; // Teachers only need account details
    } else {
      return ['Account Details', 'Face Capture']; // Students need both steps
    }
  };

  // Update steps when role changes
  useEffect(() => {
    // If user is on face capture step but changed role to teacher, go back to account details
    if (activeStep > 0 && values.role === 'teacher') {
      setActiveStep(0);
    }
  }, [values.role, activeStep]);

  const handleNext = () => {
    // Check if current step is valid before moving to next step
    if (activeStep === 0) {
      // Validate fields in first step
      const firstStepFields = ['name', 'email', 'password', 'confirm_password', 'role'];
      let hasError = false;

      for (const field of firstStepFields) {
        if (!values[field]) {
          toast.error(`${field.replace('_', ' ')} is required`);
          hasError = true;
        }
      }

      if (values.password !== values.confirm_password) {
        toast.error('Passwords do not match');
        hasError = true;
      }

      if (hasError) return;

      // If role is teacher, submit form directly instead of moving to next step
      if (values.role === 'teacher') {
        handleSubmit();
        return;
      }
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleEmbeddingGenerated = (embedding) => {
    try {
      setProcessingFace(true);

      // Store the embedding in form values
      setFieldValue('faceEmbedding', embedding);

      toast.success('Face captured and processed successfully!');
    } catch (error) {
      console.error('Error processing face:', error);
      toast.error(error.message || 'Failed to process face. Please try again.');
      setFieldValue('faceEmbedding', null);
    } finally {
      setProcessingFace(false);
    }
  };

  // Get steps based on current role
  const steps = getSteps();

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <Box component="form" onSubmit={handleSubmit}>
        {/* Stepper for multi-step form (shows only one step for teachers) */}
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 1: Account Details */}
        {activeStep === 0 && (
          <Stack mb={3}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="name"
              mb="5px"
            >
              Name
            </Typography>
            <TextField
              name="name"
              placeholder="Enter Your Name"
              variant="outlined"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.name && errors.name ? true : false}
              helperText={touched.name && errors.name ? errors.name : null}
              fullWidth
              required
            />

            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="email"
              mb="5px"
              mt="10px"
            >
              Email Address
            </Typography>
            <TextField
              name="email"
              variant="outlined"
              placeholder="Enter Your Email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && errors.email ? true : false}
              helperText={touched.email && errors.email ? errors.email : null}
              required
              fullWidth
            />

            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="password"
              mb="5px"
              mt="10px"
            >
              Password
            </Typography>
            <TextField
              name="password"
              type="password"
              variant="outlined"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password && errors.password ? true : false}
              helperText={touched.password && errors.password ? errors.password : null}
              required
              fullWidth
            />
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="confirm_password"
              mb="5px"
              mt="10px"
            >
              Confirm Password
            </Typography>
            <TextField
              name="confirm_password"
              type="password"
              autoComplete="false"
              variant="outlined"
              value={values.confirm_password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.confirm_password && errors.confirm_password ? true : false}
              helperText={
                touched.confirm_password && errors.confirm_password ? errors.confirm_password : null
              }
              fullWidth
              required
            />
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="role"
              mb="5px"
              mt="10px"
            >
              Role
            </Typography>
            <Select
              name="role"
              required
              displayEmpty
              value={values.role}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!(touched.role && errors.role)}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
            </Select>
          </Stack>
        )}

        {/* Step 2: Face Capture (only for students) */}
        {activeStep === 1 && values.role === 'student' && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Capture Your Face
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              For student registration, we need to capture your face for identity verification during exams.
              We will only store a mathematical representation of your face, not the actual image.
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <FaceCapture onEmbeddingGenerated={handleEmbeddingGenerated} />
            </Paper>

            {values.faceEmbedding && (
              <Typography color="success.main" variant="body2" sx={{ mt: 1 }}>
                Face captured and processed successfully. You can proceed with registration.
              </Typography>
            )}
          </Box>
        )}

        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          {activeStep > 0 && (
            <Button
              variant="outlined"
              onClick={handleBack}
            >
              Back
            </Button>
          )}

          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              sx={{ ml: 'auto' }}
            >
              Next
            </Button>
          ) : (
            <Button
              color="primary"
              variant="contained"
              size="large"
              type="submit"
              disabled={values.role === 'student' && !values.faceEmbedding}
              sx={{ ml: 'auto' }}
            >
              {processingFace ? 'Processing...' : 'Sign Up'}
            </Button>
          )}
        </Box>
      </Box>
      {subtitle}
    </>
  );
};

export default AuthRegister;
