import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  Search, 
  Filter,
  Loader2,
  Star,
  ThumbsUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ArtworkFeed = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  const fetchArtworks = async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: pageNum,
        limit: 12,
        sortBy,
        sortOrder
      });

      if (searchQuery) {
        params.append('query', searchQuery);
      }

      const response = await fetch(`http://localhost:5000/api/artworks/feed?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch artworks');
      }

      if (reset || pageNum === 1) {
        setArtworks(data.artworks);
      } else {
        setArtworks(prev => [...prev, ...data.artworks]);
      }

      setHasMore(data.pagination.hasNext);
      setPage(pageNum);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchArtworks(1, true);
  }, [sortBy, sortOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArtworks(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchArtworks(page + 1);
    }
  };

  const handleLike = async (artworkId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Redirect to login or show login modal
        return;
      }

      const response = await fetch(`http://localhost:5000/api/artworks/${artworkId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'like' })
      });

      const data = await response.json();

      if (response.ok) {
        // Update the artwork in the list
        setArtworks(prev => prev.map(artwork => 
          artwork._id === artworkId 
            ? { ...artwork, likesCount: data.likesCount, isLiked: data.isLiked }
            : artwork
        ));
      }
    } catch (err) {
      console.error('Like error:', err);
    }
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
        <p>Error loading artworks: {error}</p>
        <Button onClick={() => fetchArtworks(1, true)} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                placeholder="Search artworks by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </form>

          {showFilters && (
            <div className="flex gap-4 mt-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium">Sort by:</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date</SelectItem>
                    <SelectItem value="likesCount">Likes</SelectItem>
                    <SelectItem value="views">Views</SelectItem>
                    <SelectItem value="commentsCount">Comments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Order:</label>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest</SelectItem>
                    <SelectItem value="asc">Oldest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Artworks Grid */}
      {artworks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No artworks found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((artwork) => (
            <Card key={artwork._id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
              
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Link 
                    to={`/artwork/${artwork._id}`}
                    className="font-medium hover:underline line-clamp-1"
                  >
                    {artwork.title}
                  </Link>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
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
              </CardHeader>

              <CardContent className="pt-0">
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(artwork._id)}
                      className={`p-1 h-auto ${artwork.isLiked ? 'text-red-500' : ''}`}
                    >
                      <Heart 
                        className={`h-4 w-4 mr-1 ${artwork.isLiked ? 'fill-current' : ''}`} 
                      />
                      {artwork.likesCount}
                    </Button>
                    
                    <Link to={`/artwork/${artwork._id}`}>
                      <Button variant="ghost" size="sm" className="p-1 h-auto">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {artwork.commentsCount}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button 
            onClick={loadMore} 
            disabled={loadingMore}
            variant="outline"
          >
            {loadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

export default ArtworkFeed;