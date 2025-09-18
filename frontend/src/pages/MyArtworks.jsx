import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Heart, Bookmark, Eye, MessageCircle, Trash2, Edit, Share } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const MyArtworks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posted');
  const [postedArtworks, setPostedArtworks] = useState([]);
  const [savedArtworks, setSavedArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchArtworks();
  }, [user, activeTab]);

  const fetchArtworks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      if (activeTab === 'posted') {
        // Get only public artworks for posted tab
        const response = await fetch('http://localhost:5000/api/artworks/posted/me?isPublic=true', {
          headers
        });
        const data = await response.json();
        if (data.success) {
          setPostedArtworks(data.artworks);
        } else {
          setError(data.message);
        }
      } else {
        // Get saved artworks + private artworks for saved tab
        const [savedResponse, privateResponse] = await Promise.all([
          fetch('http://localhost:5000/api/artworks/saved/me', { headers }),
          fetch('http://localhost:5000/api/artworks/posted/me?isPublic=false', { headers })
        ]);
        
        const savedData = await savedResponse.json();
        const privateData = await privateResponse.json();
        
        if (savedData.success && privateData.success) {
          // Combine saved artworks with private artworks
          const combinedArtworks = [
            ...savedData.artworks,
            ...privateData.artworks
          ];
          setSavedArtworks(combinedArtworks);
        } else {
          setError(savedData.message || privateData.message);
        }
      }
    } catch (err) {
      setError('Failed to fetch artworks');
      console.error('Error fetching artworks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublic = async (artworkId, currentPublicStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/artworks/${artworkId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isPublic: !currentPublicStatus
        })
      });
      const data = await response.json();
      if (data.success) {
        // Refresh the artworks list
        fetchArtworks();
      }
    } catch (err) {
      console.error('Error toggling public status:', err);
    }
  };

  const handleDeleteArtwork = async (artworkId) => {
    if (!window.confirm('Are you sure you want to delete this artwork?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/artworks/${artworkId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        // Refresh the artworks list
        fetchArtworks();
      }
    } catch (err) {
      console.error('Error deleting artwork:', err);
    }
  };

  const ArtworkCard = ({ artwork, isOwned = false }) => {
    const isPrivate = !artwork.isPublic;
    const isOwnedPrivate = isOwned && isPrivate;
    const isOwnedArtwork = isOwned || isOwnedPrivate;
    
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <div className="relative">
          {artwork.imageUrl ? (
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="w-full h-40 object-cover"
            />
          ) : (
            <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
          
          {/* Private badge */}
          {isPrivate && (
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                Private
              </span>
            </div>
          )}
          
          <div className="absolute top-2 right-2 flex gap-1">
            {/* Show action buttons for all artworks in saved tab, or owned artworks in posted tab */}
            {(isOwnedArtwork || activeTab === 'saved') && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate(`/artwork/${artwork._id}/edit`)}
                  className="bg-white/90 hover:bg-white h-7 w-7 p-0"
                  title="Edit"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleTogglePublic(artwork._id, artwork.isPublic)}
                  className="bg-white/90 hover:bg-white h-7 w-7 p-0"
                  title={artwork.isPublic ? "Make Private" : "Make Public"}
                >
                  {artwork.isPublic ? (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteArtwork(artwork._id)}
                  className="bg-red-500/90 hover:bg-red-500 h-7 w-7 p-0"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
        
        <CardContent className="p-3">
          <div className="mb-2">
            <h3 className="font-semibold text-base mb-1 line-clamp-1">{artwork.title}</h3>
            <p className="text-xs text-gray-600 mb-2">
              by {artwork.artist?.username || 'Unknown Artist'}
            </p>
          </div>
          
          {artwork.description && (
            <p className="text-xs text-gray-700 mb-2 line-clamp-2">
              {artwork.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                <span>{artwork.likesCount || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>{artwork.commentsCount || 0}</span>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/artwork/${artwork._id}`)}
              className="h-6 px-2 text-xs"
            >
              View
            </Button>
          </div>
          
          {artwork.tags && artwork.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {artwork.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
              {artwork.tags.length > 2 && (
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                  +{artwork.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Artworks</h1>
          <p className="text-gray-600">
            Manage your posted artworks and view your saved favorites
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="posted">Public Artworks</TabsTrigger>
            <TabsTrigger value="saved">Saved & Private</TabsTrigger>
          </TabsList>

          <TabsContent value="posted">
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">{error}</p>
                  <Button onClick={fetchArtworks} className="mt-4">
                    Try Again
                  </Button>
                </div>
              ) : postedArtworks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No artworks posted yet</h3>
                  <p className="text-gray-500 mb-4">Start creating and sharing your artwork with the community!</p>
                  <Button onClick={() => navigate('/create')}>
                    Create Your First Artwork
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {postedArtworks.map((artwork) => (
                    <ArtworkCard key={artwork._id} artwork={artwork} isOwned={true} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="saved">
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">{error}</p>
                  <Button onClick={fetchArtworks} className="mt-4">
                    Try Again
                  </Button>
                </div>
              ) : savedArtworks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Bookmark className="mx-auto h-12 w-12" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No saved artworks yet</h3>
                  <p className="text-gray-500 mb-4">Start exploring and save artworks you love!</p>
                  <Button onClick={() => navigate('/search')}>
                    Explore Artworks
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {savedArtworks.map((artwork) => (
                    <ArtworkCard key={artwork._id} artwork={artwork} isOwned={false} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default MyArtworks;
