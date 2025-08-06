// src/pages/Register.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupForm from '../components/SignupForm';

export default function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      navigate('/'); // Redirect to home if already logged in
    }
  }, [navigate]);

  const handleSignupSuccess = (data) => {
    console.log('Signup successful:', data);
    navigate('/'); // Redirect to home after successful registration
  };

  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <SignupForm onSignupSuccess={handleSignupSuccess} />
      </div>
    </>
  );
}
