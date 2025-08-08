import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Clock, 
  Heart,
  Calendar,
  Tag,
  Image,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const TutorialCard = ({ tutorial, onView, onEdit, onDelete, onToggleStatus, isAdmin = false }) => {
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [reactionsCount, setReactionsCount] = useState(tutorial.reactionsCount || 0);
  const [isReacted, setIsReacted] = useState(tutorial.isReacted || false);
  const [isReacting, setIsReacting] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleReaction = async () => {
    if (!user) {
      return;
    }

    if (isReacting) return;

    setIsReacting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await fetch(`http://localhost:5000/api/tutorials/${tutorial._id}/reaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: 'like' })
      });

      if (response.ok) {
        const data = await response.json();
        setReactionsCount(data.reactionsCount);
        setIsReacted(data.isReacted);
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData.message);
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
    } finally {
      setIsReacting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!isAdmin || isStatusUpdating) return;

    setIsStatusUpdating(true);
    try {
      if (onToggleStatus) {
        await onToggleStatus(tutorial._id, !tutorial.isPublished);
      }
    } catch (error) {
      console.error('Error toggling tutorial status:', error);
    } finally {
      setIsStatusUpdating(false);
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      {/* Photo Section */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
        {tutorial.thumbnail && !imageError ? (
          <img 
            src={`http://localhost:5000${tutorial.thumbnail}`}
            alt={tutorial.title}
            className={`w-full h-full object-cover transition-all duration-200 hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        ) : null}
        
        {/* Fallback placeholder */}
        <div className={`absolute inset-0 flex items-center justify-center ${
          tutorial.thumbnail && !imageError ? 'hidden' : 'flex'
        }`}>
          <div className="text-center">
            <Image className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground/70">No image available</p>
          </div>
        </div>

        {/* Loading overlay */}
        {tutorial.thumbnail && !imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Overlay for difficulty badge */}
        <div className="absolute top-3 left-3">
          <Badge className={getDifficultyColor(tutorial.difficulty)}>
            {tutorial.difficulty}
          </Badge>
        </div>
        
        {/* Right side badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          {/* Completion status indicator */}
          {tutorial.isCompleted && (
            <Badge className="bg-green-500 text-white">
              <Check className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
          
          {/* Draft badge if not published */}
          {!tutorial.isPublished && (
            <Badge variant="secondary">
              Draft
            </Badge>
          )}
        </div>
      </div>

      {/* Content Section */}
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold line-clamp-2">
          {tutorial.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {tutorial.description}
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <button 
            className="flex items-center gap-1 hover:text-primary transition-colors duration-200"
            onClick={() => console.log('Time clicked:', tutorial.estimatedTime)}
          >
            <Clock className="h-4 w-4" />
            <span>{tutorial.estimatedTime} min</span>
          </button>
          
          <button 
            className="flex items-center gap-1 hover:text-primary transition-colors duration-200"
            onClick={() => console.log('Date clicked:', formatDate(tutorial.createdAt))}
          >
            <Calendar className="h-4 w-4" />
            <span>{formatDate(tutorial.createdAt)}</span>
          </button>

          <button 
            className={`flex items-center gap-1 transition-colors duration-200 ${
              isReacted ? 'text-red-500' : user ? 'hover:text-red-500' : 'opacity-50 cursor-not-allowed'
            }`}
            onClick={handleReaction}
            disabled={!user || isReacting}
            title={!user ? 'Login to react' : isReacting ? 'Processing...' : ''}
          >
            <Heart className={`h-4 w-4 ${isReacted ? 'fill-current' : ''}`} />
            <span>{reactionsCount}</span>
          </button>
        </div>

        {tutorial.tags && tutorial.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1 mb-2">
              <Tag className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Tags:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {tutorial.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tutorial.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tutorial.tags.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onView(tutorial)}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            View Tutorial
          </Button>
          
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(tutorial)}
                className="flex-1 border-gray-700 text-gray-700 hover:bg-gray-100"
              >
                Edit
              </Button>
              <Button
                variant={tutorial.isPublished ? "outline" : "default"}
                size="sm"
                onClick={handleToggleStatus}
                disabled={isStatusUpdating}
                className={`flex-1 ${
                  tutorial.isPublished 
                    ? "border-orange-500 text-orange-600 hover:bg-orange-50" 
                    : "bg-orange-600 hover:bg-orange-700 text-white"
                }`}
                title={tutorial.isPublished ? "Make Private" : "Make Public"}
              >
                {isStatusUpdating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : tutorial.isPublished ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Private
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Public
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(tutorial._id)}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TutorialCard;
