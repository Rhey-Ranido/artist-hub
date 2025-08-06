// src/pages/Login.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated()) {
      navigate('/'); // Redirect to home if already logged in
    }
  }, [navigate, isAuthenticated]);

  const handleLoginSuccess = (data) => {
    console.log('Login successful:', data);
    navigate('/'); // Redirect to home after successful login
  };

  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    </>
  );
}
