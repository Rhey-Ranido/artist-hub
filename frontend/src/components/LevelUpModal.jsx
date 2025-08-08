import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Star, 
  X,
  Sparkles
} from 'lucide-react';

const LevelUpModal = ({ isOpen, onClose, levelUpData }) => {
  if (!isOpen || !levelUpData) return null;

  const { newLevel, levelUpMessage } = levelUpData;

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'beginner':
        return '🌱';
      case 'intermediate':
        return '🚀';
      case 'advanced':
        return '🏆';
      default:
        return '⭐';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <Card className="relative w-full max-w-md shadow-2xl border-0 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between">
            <div></div>
            <CardTitle className="text-2xl font-bold text-center flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              Level Up!
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          {/* Level Badge */}
          <div className="flex justify-center">
            <Badge 
              className={`text-lg px-6 py-3 border-2 ${getLevelColor(newLevel)}`}
            >
              <span className="mr-2 text-2xl">{getLevelIcon(newLevel)}</span>
              {newLevel.charAt(0).toUpperCase() + newLevel.slice(1)} Level
            </Badge>
          </div>

          {/* Congratulations Message */}
          <div className="space-y-2">
            <div className="flex justify-center">
              <Trophy className="h-12 w-12 text-yellow-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              Congratulations!
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {levelUpMessage}
            </p>
          </div>

          {/* What's Next */}
          <div className="bg-white/50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Star className="h-4 w-4 text-blue-500" />
              What's Next?
            </h4>
            <p className="text-sm text-gray-600">
              You can now access {newLevel} tutorials and continue your artistic journey!
            </p>
          </div>

          {/* Action Button */}
          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
          >
            Continue Learning
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LevelUpModal;
