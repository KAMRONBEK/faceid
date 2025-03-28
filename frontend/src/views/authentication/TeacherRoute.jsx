import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const TeacherRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const isTeacher = userInfo?.role === 'teacher';
  
  // Debug output
  useEffect(() => {
    console.log('TeacherRoute - userInfo:', userInfo);
    console.log('TeacherRoute - isTeacher:', isTeacher);
  }, [userInfo, isTeacher]);

  return isTeacher ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default TeacherRoute;
