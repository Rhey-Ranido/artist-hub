/* eslint-disable no-unused-vars */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Heart, 
  Palette, 
  Instagram, 
  Twitter, 
  Facebook, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Users,
  Shield,
  HelpCircle,
  FileText
} from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
                <Palette className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Artist Hub</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Discover, create, and share amazing digital art. Connect with talented artists 
              from around the world and showcase your creative vision.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => navigate('/')}
                  className="text-gray-300 hover:text-white transition-colors flex items-center"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/search')}
                  className="text-gray-300 hover:text-white transition-colors flex items-center"
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Explore Artworks
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/create')}
                  className="text-gray-300 hover:text-white transition-colors flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Create Artwork
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/my-artworks')}
                  className="text-gray-300 hover:text-white transition-colors flex items-center"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  My Artworks
                </button>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Community</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => navigate('/messages')}
                  className="text-gray-300 hover:text-white transition-colors flex items-center"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Messages
                </button>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Artist Directory
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-300">
                <Mail className="h-4 w-4 mr-3" />
                <span>support@artisthub.com</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="h-4 w-4 mr-3" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="h-4 w-4 mr-3" />
                <span>123 Creative Street<br />Art District, CA 90210</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <span>© {currentYear} Artist Hub. Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>for artists worldwide.</span>
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                DMCA
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 