import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  UserPlus, 
  UserMinus,
  Settings,
  Loader2,
  Calendar,
  MapPin,
  Palette
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [artworksLoading, setArtworksLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchUserProfile();
      fetchUserArtworks();
    }
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/users/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user profile');
      }

      setUser(data.user);
      
      // Check if current user is following this user
      if (currentUser && data.user.followers) {
        setIsFollowing(data.user.followers.some(follower => follower._id === currentUser.id));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserArtworks = async () => {
    try {
      setArtworksLoading(true);
      const response = await fetch(`http://localhost:5000/api/artworks/user/${id}`);
      const data = await response.json();

      if (response.ok) {
        setArtworks(data.artworks);
      }
    } catch (err) {
      console.error('Failed to fetch artworks:', err);
    } finally {
      setArtworksLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      // Redirect to login
      return;
    }

    try {
      setFollowLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/users/${id}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setIsFollowing(data.isFollowing);
        setUser(prev => ({
          ...prev,
          followers: prev.followers || [],
          // Update followers count (this is a simplified approach)
        }));
      }
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        <p>Error loading profile: {error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p>User not found</p>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === user.id;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-32 w-32 mb-4">
                <img
                  src={user.profileImage 
                    ? `http://localhost:5000${user.profileImage}` 
                    : '/default-avatar.png'
                  }
                  alt={user.username}
                  className="object-cover"
                />
              </Avatar>
              
              {!isOwnProfile && currentUser && (
                <Button
                  onClick={handleFollow}
                  disabled={followLoading}
                  variant={isFollowing ? 'outline' : 'default'}
                  className="w-full md:w-auto"
                >
                  {followLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isFollowing ? (
                    <>
                      <UserMinus className="mr-2 h-4 w-4" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Follow
                    </>
                  )}
                </Button>
              )}

              {isOwnProfile && (
                <Link to="/settings">
                  <Button variant="outline" className="w-full md:w-auto">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
              )}
            </div>

            {/* Profile Details */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold">{user.username}</h1>
                  {(user.firstName || user.lastName) && (
                    <p className="text-gray-600">
                      {user.firstName} {user.lastName}
                    </p>
                  )}
                </div>
              </div>

              {user.bio && (
                <p className="text-gray-700 mb-4">{user.bio}</p>
              )}

              {/* Stats */}
              <div className="flex gap-6 mb-4">
                <div className="text-center">
                  <div className="font-bold text-lg">{user.artworksCount || 0}</div>
                  <div className="text-sm text-gray-600">Artworks</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{user.followers?.length || 0}</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{user.following?.length || 0}</div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{user.likesReceived || 0}</div>
                  <div className="text-sm text-gray-600">Likes</div>
                </div>
              </div>

              {/* Join Date */}
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Joined {formatDate(user.createdAt)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="artworks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="artworks">
            <Palette className="h-4 w-4 mr-2" />
            Artworks
          </TabsTrigger>
          <TabsTrigger value="liked">
            <Heart className="h-4 w-4 mr-2" />
            Liked
          </TabsTrigger>
        </TabsList>

        <TabsContent value="artworks" className="space-y-6">
          {artworksLoading ? (
            <div className="flex justify-center items-center min-h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : artworks.length === 0 ? (
            <div className="text-center py-12">
              <Palette className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No artworks yet</p>
              {isOwnProfile && (
                <Link to="/create">
                  <Button className="mt-4">Create Your First Artwork</Button>
                </Link>
              )}
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

                    {artwork.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {artwork.description}
                      </p>
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
                      <span className="text-gray-500">
                        {new Date(artwork.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="liked" className="space-y-6">
          <div className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Liked artworks feature coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;