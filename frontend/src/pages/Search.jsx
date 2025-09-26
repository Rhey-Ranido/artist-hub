import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { 
  Search as SearchIcon, 
  User, 
  Loader2,
  MessageCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/api';

const Search = () => {
  // Using centralized API base URL
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
      handleSearch(searchQuery);
    }
  }, [searchParams]);

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    await searchUsers(searchQuery);
    setLoading(false);
  };

  const searchUsers = async (searchQuery) => {
    try {
      setUsersLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/users/search?query=${encodeURIComponent(searchQuery)}&limit=20`
      );
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('User search error:', err);
    } finally {
      setUsersLoading(false);
    }
  };



  const handleMessageUser = (userId, username) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/messages?user=${userId}&username=${encodeURIComponent(username)}`);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Search Results</h1>
          {query && (
            <p className="text-gray-600">
              Showing results for "{query}"
            </p>
          )}
        </div>

        {/* Search Results */}
        {(users.length > 0 || loading) ? (
          <div className="mt-6">
              {usersLoading ? (
                <div className="flex justify-center items-center min-h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : users.length === 0 && query ? (
                <div className="text-center py-12">
                  <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No artists found for "{query}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.map((user) => (
                    <Card key={user._id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar className="h-16 w-16">
                                                         {user?.profileImageData || user?.profileImage ? (
                               <img
                                 src={user?.profileImageData || `${window.location.origin}/uploads/profiles/${user.profileImage}`}
                                 alt={user.username}
                                 className="w-full h-full object-cover"
                               />
                            ) : (
                              <div className="w-full h-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                                {user?.firstName && user?.lastName
                                  ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                                  : user?.username?.substring(0, 2).toUpperCase() || 'U'
                                }
                              </div>
                            )}
                          </Avatar>
                          <div className="flex-1">
                            <Link 
                              to={`/profile/${user._id}`}
                              className="font-medium text-lg hover:underline"
                            >
                              {user.username}
                            </Link>
                            {(user.firstName || user.lastName) && (
                              <p className="text-gray-600 text-sm">
                                {user.firstName} {user.lastName}
                              </p>
                            )}
                          </div>
                        </div>

                        {user.bio && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {user.bio}
                          </p>
                        )}

                        <div className="grid grid-cols-3 gap-4 text-center text-sm mb-4">
                          <div>
                            <div className="font-semibold">{user.artworksCount || 0}</div>
                            <div className="text-gray-500">Artworks</div>
                          </div>
                          <div>
                            <div className="font-semibold">{user.likesReceived || 0}</div>
                            <div className="text-gray-500">Likes</div>
                          </div>
                          <div>
                            <div className="font-semibold">
                              {(user.followers?.length || 0) + (user.following?.length || 0)}
                            </div>
                            <div className="text-gray-500">Connections</div>
                          </div>
                        </div>

                        {/* Message Button */}
                        {user && user.id !== user._id && (
                          <Button
                            onClick={() => handleMessageUser(user._id, user.username)}
                            className="w-full"
                            size="sm"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
          </div>
        ) : query ? (
          <div className="text-center py-12">
            <SearchIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No results found for "{query}"</p>
            <p className="text-gray-400 text-sm mt-2">
              Try searching for different keywords or check your spelling
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <SearchIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Search for users by name or username</p>
            <p className="text-gray-400 text-sm mt-2">
              Connect with other users and start collaborating
            </p>
          </div>
        )}


      </div>

      <Footer />
    </div>
  );
};

export default Search;