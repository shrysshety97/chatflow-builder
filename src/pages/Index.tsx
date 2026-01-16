import React from 'react';
import { useAuth } from '@/features/auth';
import { AuthPage } from '@/features/auth';
import Dashboard from './Dashboard';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <AuthPage />;
};

export default Index;
