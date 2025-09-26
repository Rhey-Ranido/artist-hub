import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DarkModeToggle from './DarkModeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, User, LogOut, Settings, Home, ChevronDown, Palette, Shield, Search, Plus, MessageCircle, BookOpen, GraduationCap, Bell } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Add debug function to global scope (for troubleshooting)
  useEffect(() => {
    window.debugProfileImage = () => {
      if (user) {
        console.log('🔍 Profile Image Debug Info:');
        console.log('User object:', user);
        console.log('Profile Image URL:', user.profileImageUrl || user.profileImage || 'Not set');
        console.log('Has profile image:', !!(user.profileImageUrl || user.profileImage));
        return user;
      } else {
        console.log('❌ No user data found');
        return null;
      }
    };

    // Listen for profile updates
    const handleProfileUpdate = () => {
      console.log('🔄 Profile update event received in Navbar');
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);

    // Cleanup debug function and event listener
    return () => {
      delete window.debugProfileImage;
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, [user]);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) {
        setUnreadNotifications(0);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/notifications/unread-count', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUnreadNotifications(data.unreadCount);
        }
      } catch (error) {
        console.error('Failed to fetch unread notifications count:', error);
      }
    };

    fetchUnreadCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ href, children, onClick, isActive = false }) => (
    <button
      onClick={onClick || (() => handleNavigation(href))}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-foreground hover:text-primary hover:bg-muted'
      }`}
    >
      {children}
    </button>
  );

  const MobileNavLink = ({ href, children, icon: Icon, isActive = false }) => (
    <button
      onClick={() => handleNavigation(href)}
      className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-foreground hover:text-primary hover:bg-muted'
      }`}
    >
      {Icon && <Icon className="mr-3 h-5 w-5" />}
      {children}
    </button>
  );

  // Profile Image Component
  const ProfileAvatar = ({ className = "h-8 w-8" }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    
    // Check for profile image URL in multiple possible locations
    const profileImageUrl = user?.profileImageData || user?.profileImageUrl || user?.profileImage;
    
    // Reset error state when user changes
    useEffect(() => {
      setImageError(false);
      setImageLoaded(false);
    }, [user]);
    
    // Helper function to check if URL is valid
    const isValidImageUrl = (url) => {
      if (!url) return false;
      if (typeof url !== 'string') return false;
      // Check if it's base64 data
      if (url.startsWith('data:image/')) return true;
      // Check if it's a valid URL format
      try {
        new URL(url);
        return true;
      } catch {
        // If not a full URL, check if it's a relative path
        return url.startsWith('/') || url.includes('uploads/');
      }
    };

    const hasValidProfileImage = isValidImageUrl(profileImageUrl);

    if (hasValidProfileImage && !imageError) {
      return (
        <div className="relative">
          <img
            src={profileImageUrl}
            alt="Profile"
            className={`${className} rounded-full object-cover border border-gray-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(false);
            }}
          />
          {/* Loading placeholder */}
          {!imageLoaded && (
            <div className={`absolute inset-0 ${className} bg-gray-200 rounded-full flex items-center justify-center animate-pulse`}>
              <User className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>
      );
    }

    // Fallback: Show default user icon
    return (
      <div className={`${className} bg-primary rounded-full flex items-center justify-center`}>
        <User className="h-4 w-4 text-primary-foreground" />
      </div>
    );
  };

  return (
    <nav className="bg-background shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button 
              onClick={() => handleNavigation('/')}
              className="flex items-center space-x-2 text-xl font-bold text-primary hover:text-primary/80 transition-colors"
            >
              <Palette className="h-6 w-6" />
              <span>Artist Hub</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {/* Navigation Links */}
              <NavLink href="/" isActive={isActiveRoute('/')}>
                Home
              </NavLink>

              {user ? (
                <>
                  <NavLink href="/create" isActive={isActiveRoute('/create')}>
                    <Plus className="h-4 w-4 mr-1 inline" />
                    Create
                  </NavLink>
                  <NavLink href="/my-artworks" isActive={isActiveRoute('/my-artworks')}>
                    <BookOpen className="h-4 w-4 mr-1 inline" />
                    My Artworks
                  </NavLink>
                  <NavLink href="/tutorials" isActive={isActiveRoute('/tutorials')}>
                    <GraduationCap className="h-4 w-4 mr-1 inline" />
                    Tutorials
                  </NavLink>
                  <NavLink href="/messages" isActive={isActiveRoute('/messages')}>
                    <MessageCircle className="h-4 w-4 mr-1 inline" />
                    Messages
                  </NavLink>
                  {user.role === 'admin' && (
                    <NavLink href="/admin" isActive={isActiveRoute('/admin')}>
                      <Shield className="h-4 w-4 mr-1 inline" />
                      Admin
                    </NavLink>
                  )}
                  
                  {/* Search Bar */}
                  <form onSubmit={handleSearch} className="flex items-center">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 w-64 h-9 text-sm"
                      />
                    </div>
                  </form>
                  
                  {/* User Profile Dropdown */}
                  <div className="relative ml-4 pl-4 border-l border-gray-200" ref={profileDropdownRef}>
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <ProfileAvatar />
                      <div className="hidden lg:block text-left">
                        <p className="text-sm font-medium text-foreground truncate max-w-32">
                          {user.username || user.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground">Artist</p>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {profileDropdownOpen && (
                      <div className="absolute top-full right-0 mt-1 w-48 bg-background rounded-md shadow-lg border border-border py-1 z-50 animate-in fade-in duration-200 transform origin-top-right">
                        <button
                          onClick={() => {
                            handleNavigation(`/profile/${user.username}`);
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-200"
                        >
                          <User className="h-4 w-4 mr-3" />
                          My Profile
                        </button>
                        <button
                          onClick={() => {
                            handleNavigation('/notifications');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-200"
                        >
                          <div className="flex items-center flex-1">
                            <Bell className="h-4 w-4 mr-3" />
                            <span>Notifications</span>
                          </div>
                          {unreadNotifications > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {unreadNotifications > 99 ? '99+' : unreadNotifications}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            handleNavigation('/settings');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-200"
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Settings
                        </button>
                        <div className="w-full flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-200">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <Palette className="h-4 w-4 mr-3" />
                              <span>Dark Mode</span>
                            </div>
                            <DarkModeToggle className="h-6 w-6" />
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            handleLogout();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <NavLink href="/tutorials" isActive={isActiveRoute('/tutorials')}>
                    <GraduationCap className="h-4 w-4 mr-1 inline" />
                    Tutorials
                  </NavLink>
                  <NavLink href="/login" isActive={isActiveRoute('/login')}>
                    Sign In
                  </NavLink>
                  <Button onClick={() => handleNavigation('/register')}>
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors duration-200"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
            <MobileNavLink href="/" icon={Home} isActive={isActiveRoute('/')}>
              Home
            </MobileNavLink>
            
            {user ? (
              <>
                <MobileNavLink href="/create" icon={Plus} isActive={isActiveRoute('/create')}>
                  Create
                </MobileNavLink>
                <MobileNavLink href="/my-artworks" icon={BookOpen} isActive={isActiveRoute('/my-artworks')}>
                  My Artworks
                </MobileNavLink>
                <MobileNavLink href="/tutorials" icon={GraduationCap} isActive={isActiveRoute('/tutorials')}>
                  Tutorials
                </MobileNavLink>
                <MobileNavLink href="/messages" icon={MessageCircle} isActive={isActiveRoute('/messages')}>
                  Messages
                </MobileNavLink>
                {user.role === 'admin' && (
                  <MobileNavLink href="/admin" icon={Shield} isActive={isActiveRoute('/admin')}>
                    Admin
                  </MobileNavLink>
                )}
                
                {/* Mobile Search Bar */}
                <div className="px-3 py-2">
                  <form onSubmit={handleSearch} className="flex items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 w-full h-10 text-sm"
                      />
                    </div>
                  </form>
                </div>
                
                {/* User info section */}
                <div className="pt-4 pb-3 border-t border-border">
                  <div className="flex items-center px-3">
                    <ProfileAvatar className="h-10 w-10" />
                    <div className="ml-3">
                      <div className="text-base font-medium text-foreground">{user.username || user.email}</div>
                      <div className="text-sm text-muted-foreground">Artist</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <MobileNavLink href={`/profile/${user.username}`} icon={User}>
                      My Profile
                    </MobileNavLink>
                    <MobileNavLink href="/notifications" icon={Bell}>
                      <div className="flex items-center justify-between w-full">
                        <span>Notifications</span>
                        {unreadNotifications > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {unreadNotifications > 99 ? '99+' : unreadNotifications}
                          </span>
                        )}
                      </div>
                    </MobileNavLink>
                    <MobileNavLink href="/settings" icon={Settings}>
                      Settings
                    </MobileNavLink>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-red-600 hover:bg-muted transition-colors duration-200"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <MobileNavLink href="/tutorials" icon={GraduationCap} isActive={isActiveRoute('/tutorials')}>
                  Tutorials
                </MobileNavLink>
                <MobileNavLink href="/login" isActive={isActiveRoute('/login')}>
                  Sign In
                </MobileNavLink>
                <MobileNavLink href="/register" isActive={isActiveRoute('/register')}>
                  Sign Up
                </MobileNavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 