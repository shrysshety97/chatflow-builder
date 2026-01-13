import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthPage from './AuthPage';
import Dashboard from './Dashboard';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <Dashboard />;
};

export default Index;
