import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search as SearchIcon, 
  User, 
  Palette, 
  Loader2,
  Heart,
  MessageCircle,
  Eye
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [artworks, setArtworks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [artworksLoading, setArtworksLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('artworks');
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
    
    // Search artworks and users in parallel
    await Promise.all([
      searchArtworks(searchQuery),
      searchUsers(searchQuery)
    ]);

    setLoading(false);
  };

  const searchArtworks = async (searchQuery) => {
    try {
      setArtworksLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/artworks/search?query=${encodeURIComponent(searchQuery)}&limit=20`
      );
      const data = await response.json();

      if (response.ok) {
        setArtworks(data.artworks);
      }
    } catch (err) {
      console.error('Artwork search error:', err);
    } finally {
      setArtworksLoading(false);
    }
  };

  const searchUsers = async (searchQuery) => {
    try {
      setUsersLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/users/search?query=${encodeURIComponent(searchQuery)}&limit=20`
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
        {(artworks.length > 0 || users.length > 0 || loading) ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="artworks" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Artworks ({artworks.length})
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Artists ({users.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="artworks" className="mt-6">
              {artworksLoading ? (
                <div className="flex justify-center items-center min-h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : artworks.length === 0 && query ? (
                <div className="text-center py-12">
                  <Palette className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No artworks found for "{query}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artworks.map((artwork) => (
                    <Card key={artwork._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <Link to={`/artwork/${artwork._id}`}>
                        <div className="aspect-square relative">
                          <img
                            src={`http://localhost:5000${artwork.imageUrl}`}
                            alt={artwork.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-black/50 text-white">
                              <Eye className="h-3 w-3 mr-1" />
                              {artwork.views}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                      
                      <CardContent className="p-4">
                        <Link 
                          to={`/artwork/${artwork._id}`}
                          className="font-medium hover:underline line-clamp-1 block mb-2"
                        >
                          {artwork.title}
                        </Link>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <Avatar className="h-6 w-6">
                            <img
                              src={artwork.artist.profileImage 
                                ? `http://localhost:5000${artwork.artist.profileImage}` 
                                : '/default-avatar.png'
                              }
                              alt={artwork.artist.username}
                            />
                          </Avatar>
                          <Link 
                            to={`/profile/${artwork.artist._id}`}
                            className="hover:underline"
                          >
                            {artwork.artist.username}
                          </Link>
                          <span>•</span>
                          <span>{formatTimeAgo(artwork.createdAt)}</span>
                        </div>

                        {artwork.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {artwork.description}
                          </p>
                        )}

                        {artwork.tags && artwork.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {artwork.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                            {artwork.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{artwork.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center">
                              <Heart className="h-4 w-4 mr-1" />
                              {artwork.likesCount}
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {artwork.commentsCount}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="users" className="mt-6">
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
                            <img
                              src={user.profileImage 
                                ? `http://localhost:5000${user.profileImage}` 
                                : '/default-avatar.png'
                              }
                              alt={user.username}
                            />
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
            </TabsContent>
          </Tabs>
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
            <p className="text-gray-500">Search for artworks, artists, or tags</p>
            <p className="text-gray-400 text-sm mt-2">
              Discover amazing digital art and connect with talented artists
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Search;