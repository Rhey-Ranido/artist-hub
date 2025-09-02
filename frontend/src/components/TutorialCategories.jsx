import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import TutorialCard from './TutorialCard';

const TutorialCategories = ({ tutorials, userLevel, onViewTutorial }) => {
  const [expandedCategories, setExpandedCategories] = useState([userLevel]);

  // Group tutorials by difficulty level
  const groupedTutorials = tutorials.reduce((acc, tutorial) => {
    if (!acc[tutorial.difficulty]) {
      acc[tutorial.difficulty] = [];
    }
    acc[tutorial.difficulty].push(tutorial);
    return acc;
  }, {});

  const toggleCategory = (category) => {
    setExpandedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Sort categories to ensure proper order
  const sortedCategories = ['beginner', 'intermediate', 'advanced'].filter(
    category => groupedTutorials[category]?.length > 0
  );

  // Level-specific styles
  const getLevelStyles = (level) => {
    switch (level) {
      case 'beginner':
        return {
          gradient: 'from-green-50 to-emerald-50',
          border: 'border-green-200',
          badge: 'bg-green-100 text-green-800',
          hover: 'hover:bg-green-100/50',
          expanded: 'bg-green-50/50'
        };
      case 'intermediate':
        return {
          gradient: 'from-yellow-50 to-orange-50',
          border: 'border-yellow-200',
          badge: 'bg-yellow-100 text-yellow-800',
          hover: 'hover:bg-yellow-100/50',
          expanded: 'bg-yellow-50/50'
        };
      case 'advanced':
        return {
          gradient: 'from-red-50 to-rose-50',
          border: 'border-red-200',
          badge: 'bg-red-100 text-red-800',
          hover: 'hover:bg-red-100/50',
          expanded: 'bg-red-50/50'
        };
      default:
        return {
          gradient: 'from-gray-50 to-gray-100',
          border: 'border-gray-200',
          badge: 'bg-gray-100 text-gray-800',
          hover: 'hover:bg-gray-100/50',
          expanded: 'bg-gray-50/50'
        };
    }
  };

  // For beginner users, show only beginner tutorials
  if (userLevel === 'beginner') {
    const beginnerStyles = getLevelStyles('beginner');
    return (
      <div className="space-y-6">
        <Card className={`overflow-hidden border ${beginnerStyles.border} transition-all duration-300 transform hover:shadow-lg`}>
          <CardHeader className={`bg-gradient-to-r ${beginnerStyles.gradient}`}>
            <CardTitle className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${beginnerStyles.badge}`}>
                Beginner Tutorials
              </div>
              <span className="text-sm text-muted-foreground">
                {groupedTutorials['beginner']?.length || 0} Available
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className={`pt-6 ${beginnerStyles.expanded}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedTutorials['beginner']?.map((tutorial) => (
                <TutorialCard
                  key={tutorial._id}
                  tutorial={tutorial}
                  onView={() => onViewTutorial(tutorial)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For intermediate and advanced users, show categorized tutorials
  return (
    <div className="space-y-6">
      {sortedCategories.map((category) => {
        const isExpanded = expandedCategories.includes(category);
        const tutorials = groupedTutorials[category];

        return (
          <Card 
            key={category} 
            className={`overflow-hidden border ${getLevelStyles(category).border} transition-all duration-300 transform hover:shadow-lg`}
          >
            <CardHeader 
              className={`cursor-pointer bg-gradient-to-r ${getLevelStyles(category).gradient} ${getLevelStyles(category).hover} transition-all duration-300`}
              onClick={() => toggleCategory(category)}
            >
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelStyles(category).badge} transition-colors duration-300`}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </div>
                  <span className="text-sm text-muted-foreground font-normal">
                    {tutorials.length} {tutorials.length === 1 ? 'Tutorial' : 'Tutorials'}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-8 w-8 p-0 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
              <CardContent className={`pt-6 ${getLevelStyles(category).expanded}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tutorials.map((tutorial) => (
                    <TutorialCard
                      key={tutorial._id}
                      tutorial={tutorial}
                      onView={() => onViewTutorial(tutorial)}
                    />
                  ))}
                </div>
              </CardContent>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default TutorialCategories;
