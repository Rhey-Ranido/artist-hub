import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Clock, 
  User, 
  Eye, 
  Heart,
  Calendar,
  Tag
} from 'lucide-react';

const TutorialCard = ({ tutorial, onView, onEdit, onDelete, isAdmin = false }) => {
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

  const getCategoryColor = (category) => {
    switch (category) {
      case 'beginner':
        return 'bg-blue-100 text-blue-800';
      case 'intermediate':
        return 'bg-purple-100 text-purple-800';
      case 'advanced':
        return 'bg-orange-100 text-orange-800';
      case 'technique':
        return 'bg-indigo-100 text-indigo-800';
      case 'inspiration':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {tutorial.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {tutorial.description}
            </p>
          </div>
          {tutorial.thumbnail && (
            <div className="ml-4 w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                             <img 
                 src={`http://localhost:5000${tutorial.thumbnail}`}
                 alt={tutorial.title}
                 className="w-full h-full object-cover"
               />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <Badge className={getDifficultyColor(tutorial.difficulty)}>
            {tutorial.difficulty}
          </Badge>
          <Badge className={getCategoryColor(tutorial.category)}>
            {tutorial.category}
          </Badge>
          {!tutorial.isPublished && (
            <Badge variant="secondary">
              Draft
            </Badge>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{tutorial.estimatedTime} minutes</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{tutorial.author?.username || 'Unknown'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(tutorial.createdAt)}</span>
          </div>

          {tutorial.views > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{tutorial.views} views</span>
            </div>
          )}

          {tutorial.likes > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4" />
              <span>{tutorial.likes} likes</span>
            </div>
          )}
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

        <div className="mt-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(tutorial)}
            className="flex-1"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            View Tutorial
          </Button>
          
          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(tutorial)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(tutorial._id)}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TutorialCard;
