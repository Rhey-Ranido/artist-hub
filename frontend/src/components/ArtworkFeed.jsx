import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Eye, 
  MessageCircle, 
  Calendar,
  User,
  Palette
} from 'lucide-react';

const ArtworkFeed = ({ artworks = [] }) => {
  // Debug: Log the first artwork to see its structure
  if (artworks.length > 0) {
    console.log('ArtworkFeed - First artwork structure:', artworks[0]);
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {artworks.map((artwork) => {
        try {
          // Safely get like count
          const likeCount = artwork.likesCount || (artwork.likes && Array.isArray(artwork.likes) ? artwork.likes.length : 0);
          const commentCount = artwork.commentsCount || (artwork.comments && Array.isArray(artwork.comments) ? artwork.comments.length : 0);
          
          return (
        <Card key={artwork._id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <Link to={`/artwork/${artwork._id}`}>
            {/* Artwork Image */}
            <div className="relative aspect-square overflow-hidden">
                             {artwork.imageUrl || artwork.canvasData ? (
                 <img
                   src={artwork.imageUrl || artwork.canvasData}
                   alt={artwork.title}
                   className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                   onError={(e) => {
                     e.target.style.display = 'none';
                     e.target.nextSibling.style.display = 'flex';
                   }}
                 />
               ) : null}
               <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center" style={{ display: artwork.imageUrl || artwork.canvasData ? 'none' : 'flex' }}>
                 <Palette className="h-12 w-12 text-gray-400" />
               </div>
              {!artwork.isPublic && (
                <Badge variant="secondary" className="absolute top-2 left-2">
                  Private
                </Badge>
              )}
            </div>
          </Link>

          <CardHeader className="pb-3">
            <div className="space-y-2">
              {/* Title and Artist */}
              <div>
                <h3 className="font-semibold text-foreground line-clamp-1">
                  {artwork.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{artwork.artist?.firstName} {artwork.artist?.lastName}</span>
                </div>
              </div>

              {/* Description */}
              {artwork.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {truncateText(artwork.description)}
                </p>
              )}

              {/* Tags */}
              {artwork.tags && artwork.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {artwork.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {artwork.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{artwork.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{likeCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{artwork.views || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{commentCount}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(artwork.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        );
        } catch (error) {
          console.error('Error rendering artwork card:', error, artwork);
          return null; // Skip this artwork if there's an error
        }
      }).filter(Boolean)}
    </div>
  );
};

export default ArtworkFeed;