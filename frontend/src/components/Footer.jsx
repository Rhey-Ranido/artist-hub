import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Palette } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Logo and Name */}
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg ring-1 ring-white/10">
              <Palette className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-medium tracking-tight text-white">Artist Hub</span>
          </div>

          {/* Quick Links */}
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => navigate('/')}
              className="text-sm text-zinc-400 hover:text-white transition-colors duration-200 font-medium"
            >
              Home
            </button>
            <button 
              onClick={() => navigate('/artworks')}
              className="text-sm text-zinc-400 hover:text-white transition-colors duration-200 font-medium"
            >
              Explore
            </button>
            <button 
              onClick={() => navigate('/create')}
              className="text-sm text-zinc-400 hover:text-white transition-colors duration-200 font-medium"
            >
              Create
            </button>
          </div>

          {/* Copyright */}
          <div className="flex items-center space-x-2 text-sm text-zinc-500">
            <span>© {currentYear} Artist Hub</span>
            <span className="text-zinc-700">•</span>
            <div className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="h-3.5 w-3.5 text-pink-500 fill-current" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 