import React, { lazy } from 'react';
import { Navigate, Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import { useSelector } from 'react-redux';
import ErrorBoundary from '@/components/container/ErrorBoundary';
// import ErrorBoundary from '../components/container/ErrorBoundary';

/* ***Layouts**** */
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const ExamLayout = Loadable(lazy(() => import('../layouts/full/ExamLayout')));

/* ****Pages***** */
// const Dashboard = Loadable(lazy(() => import('../views/dashboard/Dashboard')));
const SamplePage = Loadable(lazy(() => import('../views/sample-page/SamplePage')));
const Success = Loadable(lazy(() => import('../views/Success')));
// const Icons = Loadable(lazy(() => import('../views/icons/Icons')));
// const TypographyPage = Loadable(lazy(() => import('../views/utilities/TypographyPage')));
// const Shadow = Loadable(lazy(() => import('../views/utilities/Shadow')));
//Student Routes

const TestPage = Loadable(lazy(() => import('../views/student/TestPage')));
const ExamPage = Loadable(lazy(() => import('../views/student/ExamPage')));
const ExamDetails = Loadable(lazy(() => import('../views/student/ExamDetails')));
const ResultPage = Loadable(lazy(() => import('../views/student/ResultPage')));
//Auth Routes
const Error = Loadable(lazy(() => import('../views/authentication/Error')));
const Register = Loadable(lazy(() => import('../views/authentication/Register')));
const Login = Loadable(lazy(() => import('../views/authentication/Login')));
const UserAccount = Loadable(lazy(() => import('../views/authentication/UserAccount')));

// Teacher Routes
const CreateExamPage = Loadable(lazy(() => import('../views/teacher/CreateExamPage')));
const ExamLogPage = Loadable(lazy(() => import('../views/teacher/ExamLogPage')));
const AddQuestions = Loadable(lazy(() => import('../views/teacher/AddQuestions')));
const PrivateRoute = Loadable(lazy(() => import('../views/authentication/PrivateRoute')));
const TeacherRoute = Loadable(lazy(() => import('../views/authentication/TeacherRoute')));

// Computer Vision Routes
const ObjectDetectionScreen = Loadable(lazy(() => import('../components/computer-vision/ObjectDetectionScreen')));

// Public URL path from environment or empty string
const publicUrl = import.meta.env.BASE_URL || '' as string;
const isDevelopment = (import.meta.env.MODE === 'development') as boolean;

const Router = createBrowserRouter(
  createRoutesFromElements(
    // Removed root level error boundary
    <>
      {/* // Private Routes */}
      <Route 
        path="" 
        element={<PrivateRoute />}
        errorElement={<ErrorBoundary showDetails={isDevelopment} />}
      >
        {/* // Main layout */}
        <Route path="/" element={<FullLayout />}>
          <Route index={true} path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<ExamPage />} />
          <Route path="/sample-page" element={<SamplePage />} />
          <Route path="/Success" element={<Success />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/exam-results/:examId" element={<ResultPage />} />
          <Route path="/object-detection" element={<ObjectDetectionScreen />} />
          <Route path="" element={<TeacherRoute />}>
            <Route path="/create-exam" element={<CreateExamPage />} />
            <Route path="/add-questions" element={<AddQuestions />} />
            <Route path="/exam-log" element={<ExamLogPage />} />
          </Route>
        </Route>
        <Route path="/" element={<ExamLayout />}>
          <Route path="exam/:examId" element={<ExamDetails />} />
          <Route path="exam/:examId/:testId" element={<TestPage />} />
        </Route>
      </Route>
      {/* User layout */}
      <Route path="/user" element={<FullLayout />} 
       errorElement={<ErrorBoundary showDetails={isDevelopment} />}>
        <Route path="account" element={<UserAccount />} />
      </Route>

      {/* Authentication layout */}
      <Route 
        path="/auth" 
        element={<BlankLayout />}
        errorElement={<ErrorBoundary showDetails={isDevelopment} />}
      >
        <Route path="404" element={<Error />} />
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="*" element={<Navigate to="/auth/404" />} />
      </Route>
      <Route path="*" element={<Navigate to="/auth/404" />} />
    </>
  ),
  { basename: publicUrl } // Add basename configuration
);

export default Router;
