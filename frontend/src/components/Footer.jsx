/* eslint-disable no-unused-vars */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Heart } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo and company name */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">ServiceHub</span>
          </div>

          {/* Copyright */}
          <div className="flex items-center space-x-1 text-sm text-gray-400">
            <span>© {currentYear} ServiceHub. Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>for connecting people.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 