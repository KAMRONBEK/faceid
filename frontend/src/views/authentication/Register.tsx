import React, { useEffect } from 'react';
import { Grid, Box, Card, Typography, Stack } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/layouts/full/shared/logo/Logo';
import AuthRegister from './auth/AuthRegister';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useRegisterMutation } from './../../slices/usersApiSlice';
import { setCredentials } from './../../slices/authSlice';
import Loader from './Loader';

// Define RootState interface for TypeScript
interface RootState {
  auth: {
    userInfo: any;
  };
}

// Define base registration data interface
interface BaseRegistrationData {
  name: string;
  email: string;
  password: string;
  role: string;
}

// Define student-specific registration data (with face embedding)
interface StudentRegistrationData extends BaseRegistrationData {
  role: 'student';
  faceEmbedding: number[];
}

// Define teacher-specific registration data (without face embedding)
interface TeacherRegistrationData extends BaseRegistrationData {
  role: 'teacher';
  faceEmbedding?: never; // This makes it explicitly unavailable
}

// Union type for all valid registration data
type RegistrationData = StudentRegistrationData | TeacherRegistrationData;

// Extend validation schema to include face embedding (conditionally required for students)
const userValidationSchema = yup.object({
  name: yup.string().min(2).max(25).required('Please enter your name'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password should be of minimum 6 characters length')
    .required('Password is required'),
  confirm_password: yup
    .string()
    .required('Confirm Password is required')
    .oneOf([yup.ref('password')], 'Password must match'),
  role: yup.string().oneOf(['student', 'teacher'], 'Invalid role').required('Role is required'),
  // Face embedding is only required when role is 'student'
  faceEmbedding: yup.mixed().when('role', {
    is: 'student',
    then: () => yup.array().required('Face capture is required for student registration'),
    otherwise: () => yup.mixed().notRequired(),
  }),
});

// Initial values including face embedding
const initialUserValues = {
  name: '',
  email: '',
  password: '',
  confirm_password: '',
  role: 'student',
  faceEmbedding: null,
};

const Register = () => {
  const formik = useFormik({
    initialValues: initialUserValues,
    validationSchema: userValidationSchema,
    onSubmit: (values, action) => {
      handleSubmit(values);
    },
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

  const { userInfo } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  const handleSubmit = async ({
    name,
    email,
    password,
    confirm_password,
    role,
    faceEmbedding
  }) => {
    if (password !== confirm_password) {
      toast.error('Passwords do not match');
    } else {
      try {
        // Prepare registration data based on role
        const baseData = {
          name,
          email,
          password,
          role
        };

        // Create properly typed registration data based on role
        let registrationData: RegistrationData;

        if (role === 'student') {
          if (!faceEmbedding) {
            toast.error('Face capture is required for student registration');
            return;
          }

          // Student registration with face embedding
          registrationData = {
            ...baseData,
            role: 'student',
            faceEmbedding
          } as StudentRegistrationData;
        } else {
          // Teacher registration without face embedding
          registrationData = {
            ...baseData,
            role: 'teacher'
          } as TeacherRegistrationData;
        }

        // Register user with face embedding included only for students
        const res = await register(registrationData).unwrap();
        dispatch(setCredentials({ ...res }));

        toast.success('Registration successful!');
        formik.resetForm();
        navigate('/auth/login');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <PageContainer title="Register" description="this is Register page">
      <Box
        sx={{
          position: 'relative',
          '&:before': {
            content: '""',
            background: 'radial-gradient(#d2f1df, #d3d7fa, #bad8f4)',
            backgroundSize: '400% 400%',
            animation: 'gradient 15s ease infinite',
            position: 'absolute',
            height: '100%',
            width: '100%',
            opacity: '0.3',
          },
        }}
      >
        <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
          <Grid
            item
            xs={12}
            sm={12}
            lg={6}
            xl={12}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Card elevation={9} sx={{ p: 2, zIndex: 1, width: '100%', maxWidth: '500px' }}>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Logo />
              </Box>
              <AuthRegister
                formik={formik}
                title="Sign Up"
                subtext={
                  <Typography variant="subtitle1" textAlign="center" color="textSecondary" mb={1}>
                    CONDUCT SECURE ONLINE EXAMS NOW
                  </Typography>
                }
                subtitle={
                  <Stack direction="row" justifyContent="center" spacing={1} mt={3}>
                    <Typography color="textSecondary" variant="h6" fontWeight="400">
                      Already have an Account?
                    </Typography>
                    <Typography
                      component={Link}
                      to="/auth/login"
                      fontWeight="500"
                      sx={{
                        textDecoration: 'none',
                        color: 'primary.main',
                      }}
                    >
                      Sign In
                    </Typography>
                    {isLoading && <Loader />}
                  </Stack>
                }
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};
export default Register;
