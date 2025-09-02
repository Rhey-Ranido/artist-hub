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

  // For beginner users, show only beginner tutorials
  if (userLevel === 'beginner') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupedTutorials['beginner']?.map((tutorial) => (
          <TutorialCard
            key={tutorial._id}
            tutorial={tutorial}
            onView={() => onViewTutorial(tutorial)}
          />
        ))}
      </div>
    );
  }

  // For intermediate and advanced users, show categorized tutorials
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedCategories.map((category) => {
        const isExpanded = expandedCategories.includes(category);
        const tutorials = groupedTutorials[category];
        
        // Calculate how many grid columns this card should span
        const gridSpan = isExpanded ? {
          'col-span-1': tutorials.length <= 2,
          'md:col-span-2 lg:col-span-2': tutorials.length > 2 && tutorials.length <= 4,
          'md:col-span-2 lg:col-span-3': tutorials.length > 4
        } : {
          'col-span-1': true
        };

        return (
          <Card 
            key={category} 
            className={`${Object.entries(gridSpan)
              .filter(([_, value]) => value)
              .map(([className]) => className)
              .join(' ')}`}
          >
            <CardHeader 
              className="cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
              onClick={() => toggleCategory(category)}
            >
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <span className="capitalize">{category}</span>
                  <span className="text-sm text-muted-foreground">
                    ({tutorials.length})
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            {isExpanded && (
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tutorials.map((tutorial) => (
                    <TutorialCard
                      key={tutorial._id}
                      tutorial={tutorial}
                      onView={() => onViewTutorial(tutorial)}
                    />
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default TutorialCategories;
