import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Eye, Palette } from 'lucide-react';
import { usePersistedLike } from '../hooks/usePersistedLike';

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

export default function ArtworkCard({
  artwork,
  className = '',
  showAuthor = true,
  showViews = true,
  showDate = true,
  onChange,
}) {
  const initialLikes = useMemo(() => artwork?.likesCount || 0, [artwork]);
  const initialIsLiked = useMemo(() => Boolean(artwork?.isLiked), [artwork]);
  
  // Use persistent like hook
  const { likesCount, isLiked, toggleLike, likeLoading } = usePersistedLike(
    artwork?._id,
    initialLikes,
    initialIsLiked
  );

  const imageSrc = artwork?.imageUrl ? `http://localhost:5000${artwork.imageUrl}` : artwork?.canvasData || '';
  const commentCount = artwork?.commentsCount || 0;
  const views = artwork?.views || 0;

  // Handle onChange callback when like state changes
  React.useEffect(() => {
    if (onChange) {
      onChange({ likesCount, isLiked });
    }
  }, [likesCount, isLiked, onChange]);

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      <Link to={`/artwork/${artwork._id}`}>
        <div className="aspect-square relative overflow-hidden">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={artwork.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                if (e.currentTarget) {
                  e.currentTarget.style.display = 'none';
                }
                if (e.currentTarget?.nextSibling) {
                  e.currentTarget.nextSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div
            className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
            style={{ display: imageSrc ? 'none' : 'flex' }}
          >
            <Palette className="h-12 w-12 text-gray-400" />
          </div>
          {!artwork.isPublic && (
            <Badge variant="secondary" className="absolute top-2 left-2">
              Private
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link
          to={`/artwork/${artwork._id}`}
          className="font-medium hover:underline line-clamp-1 block mb-2"
        >
          {artwork.title}
        </Link>

        {showAuthor && artwork?.artist && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <Avatar className="h-6 w-6">
              {artwork.artist?.profileImage ? (
                <img
                  src={`http://localhost:5000/uploads/${artwork.artist.profileImage}`}
                  alt={artwork.artist.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    if (e.currentTarget) {
                      e.currentTarget.style.display = 'none';
                    }
                    if (e.currentTarget?.nextSibling) {
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  {artwork.artist?.firstName && artwork.artist?.lastName
                    ? `${artwork.artist.firstName.charAt(0)}${artwork.artist.lastName.charAt(0)}`
                    : artwork.artist?.username?.substring(0, 2).toUpperCase() || 'U'}
                </div>
              )}
            </Avatar>
            <Link to={`/profile/${artwork.artist?._id}`} className="hover:underline">
              {artwork.artist?.username}
            </Link>
            {showDate && (
              <>
                <span>•</span>
                <span>{formatTimeAgo(artwork.createdAt)}</span>
              </>
            )}
          </div>
        )}

        {artwork?.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {artwork.description}
          </p>
        )}

        {Array.isArray(artwork?.tags) && artwork.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {artwork.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 text-xs rounded-full border bg-background">
                #{tag}
              </span>
            ))}
            {artwork.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs rounded-full border bg-background">+{artwork.tags.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleLike}
              disabled={likeLoading}
              className={`transition-colors duration-200 ${isLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'}`}
            >
              <Heart className={`h-4 w-4 mr-1 transition-all duration-200 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              {likesCount}
            </Button>
            {showViews && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{views}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>{commentCount}</span>
            </div>
          </div>
          {showDate && (
            <span className="text-muted-foreground">{new Date(artwork.createdAt).toLocaleDateString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


