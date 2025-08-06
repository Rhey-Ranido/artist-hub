/* eslint-disable no-unused-vars */
// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

export default function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      navigate('/'); // Redirect to home if already logged in
    }
  }, [navigate]);

  const handleLoginSuccess = (data) => {
    setUser(data.user);
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
