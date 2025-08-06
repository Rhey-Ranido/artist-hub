import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ArtworkFeed from '../components/ArtworkFeed';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Settings, 
  Palette, 
  Heart, 
  Eye, 
  Calendar,
  MapPin,
  Edit,
  Plus,
  MessageCircle
} from 'lucide-react';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api';

  // Check if this is the current user's profile
  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch user profile
      const userResponse = await fetch(`${API_BASE_URL}/users/${username}`);
      if (!userResponse.ok) {
        throw new Error('User not found');
      }
             const userData = await userResponse.json();
       console.log('Profile User Data:', userData.user);
       setProfileUser(userData.user);

      // Fetch user's artworks
      const artworksResponse = await fetch(`${API_BASE_URL}/artworks/user/${username}`);
      if (artworksResponse.ok) {
        const artworksData = await artworksResponse.json();
        setArtworks(artworksData.artworks || []);
      }

    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigate('/settings');
  };

  const handleCreateArtwork = () => {
    navigate('/create');
  };

  const handleMessageUser = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    navigate(`/messages?user=${profileUser._id}&username=${encodeURIComponent(profileUser.username)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">User Not Found</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="relative">
                                 {profileUser.profileImageUrl || profileUser.profileImage ? (
                   <img
                     src={profileUser.profileImageUrl || `http://localhost:5000/uploads/${profileUser.profileImage}`}
                     alt={`${profileUser.firstName} ${profileUser.lastName}`}
                     className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-lg"
                     onError={(e) => {
                       console.log('Profile image error:', e.target.src);
                       console.log('Profile user data:', profileUser);
                       e.target.style.display = 'none';
                       e.target.nextSibling.style.display = 'flex';
                     }}
                     onLoad={() => {
                       console.log('Profile image loaded successfully:', profileUser.profileImageUrl || profileUser.profileImage);
                     }}
                   />
                 ) : null}
                 <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-4 border-background shadow-lg" style={{ display: profileUser.profileImageUrl || profileUser.profileImage ? 'none' : 'flex' }}>
                   <User className="h-16 w-16 text-gray-400" />
                 </div>
                {isOwnProfile && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                    onClick={handleEditProfile}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {profileUser.firstName} {profileUser.lastName}
                  </h1>
                  <p className="text-muted-foreground">@{profileUser.username}</p>
                </div>
                
                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <>
                      <Button onClick={handleEditProfile} variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button onClick={handleCreateArtwork}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Artwork
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleMessageUser}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <span className="font-medium">{artworks.length}</span>
                  <span className="text-muted-foreground">artworks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="font-medium">{profileUser.likesReceived || 0}</span>
                  <span className="text-muted-foreground">likes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{profileUser.views || 0}</span>
                  <span className="text-muted-foreground">views</span>
                </div>
              </div>

              {/* Bio */}
              {profileUser.bio && (
                <p className="text-foreground">{profileUser.bio}</p>
              )}

              {/* Badges */}
              <div className="flex gap-2">
                <Badge variant={profileUser.isVerified ? 'default' : 'secondary'}>
                  {profileUser.isVerified ? 'Verified' : 'Unverified'}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {profileUser.role}
                </Badge>
                {profileUser.role === 'provider' && (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    Provider
                  </Badge>
                )}
              </div>

              {/* Join Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(profileUser.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Artworks Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Artworks</h2>
            {isOwnProfile && artworks.length === 0 && (
              <Button onClick={handleCreateArtwork}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Artwork
              </Button>
            )}
          </div>

          {artworks.length > 0 ? (
            <ArtworkFeed artworks={artworks} />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {isOwnProfile ? 'No Artworks Yet' : 'No Artworks'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {isOwnProfile 
                    ? "Start creating your first artwork to showcase your talent!"
                    : "This user hasn't posted any artworks yet."
                  }
                </p>
                {isOwnProfile && (
                  <Button onClick={handleCreateArtwork}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Artwork
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;