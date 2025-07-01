
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Quiz = () => {
  const { user } = useAuth();

  // Redirect to learn page since quizzes are now integrated into courses
  if (user) {
    return <Navigate to="/learn" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default Quiz;
