import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ArtCanvas from '../components/ArtCanvas';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, BookOpen, Check, Loader2 } from 'lucide-react';
import LevelUpModal from '../components/LevelUpModal';

const Create = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  
  // Get tutorial data from navigation state
  const tutorialData = location.state;
  const tutorialSteps = tutorialData?.tutorialSteps || [];
  const tutorialTitle = tutorialData?.tutorialTitle;
  const tutorialId = tutorialData?.tutorialId;

  const API_BASE_URL = 'http://localhost:5000/api';

  const handleSave = async (artworkData, imageBlob) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('title', artworkData.title);
      formData.append('description', artworkData.description);
      formData.append('canvasData', artworkData.canvasData);
      formData.append('tags', JSON.stringify(artworkData.tags));
      formData.append('isPublic', artworkData.isPublic);
      formData.append('dimensions', JSON.stringify(artworkData.dimensions));
      formData.append('tools', JSON.stringify(artworkData.tools));
      formData.append('colors', JSON.stringify(artworkData.colors));
      
      if (imageBlob) {
        formData.append('image', imageBlob, 'artwork.png');
      }

      const response = await fetch('http://localhost:5000/api/artworks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save artwork');
      }

      setSuccess('Artwork saved successfully!');
      setError('');
      
      // Redirect to the artwork page after a short delay
      setTimeout(() => {
        navigate(`/artwork/${data.artwork._id}`);
      }, 2000);

    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  const nextStep = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const sortedSteps = tutorialSteps
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleCompleteTutorial = async () => {
    if (!tutorialId) {
      setError('No tutorial ID found');
      return;
    }

    if (isCompleting || isCompleted) return;

    setIsCompleting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tutorials/${tutorialId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsCompleted(true);
        
        // Show success message
        if (data.levelUp) {
          setLevelUpData({
            newLevel: data.newLevel,
            levelUpMessage: data.levelUpMessage
          });
          setShowLevelUpModal(true);
          
          // Update user level in localStorage
          localStorage.setItem('userLevel', data.newLevel);
          
          // Update accessible levels based on new level
          const levelAccess = {
            'beginner': ['beginner'],
            'intermediate': ['beginner', 'intermediate'],
            'advanced': ['beginner', 'intermediate', 'advanced']
          };
          localStorage.setItem('accessibleLevels', JSON.stringify(levelAccess[data.newLevel] || ['beginner']));
        } else {
          setSuccess('✅ Tutorial completed successfully!');
        }
        
        console.log('Tutorial completed successfully!', data);
      } else {
        const errorData = await response.json();
        if (errorData.isCompleted) {
          setIsCompleted(true);
          setSuccess('This tutorial has already been completed!');
        } else {
          setError(errorData.message || 'Failed to complete tutorial');
        }
        console.error('Server error:', errorData.message);
      }
    } catch (error) {
      console.error('Error completing tutorial:', error);
      setError('Failed to complete tutorial. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create New Artwork</h1>
          <p className="text-muted-foreground">
            Use our digital canvas to create your masterpiece and share it with the community.
          </p>
          {tutorialTitle && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Following Tutorial:</span>
              </div>
              <p className="text-blue-700">{tutorialTitle}</p>
            </div>
          )}
        </div>

        {/* Tutorial Steps Slider */}
        {tutorialSteps.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Tutorial Step {currentStepIndex + 1} of {tutorialSteps.length}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevStep}
                    disabled={currentStepIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextStep}
                    disabled={currentStepIndex === tutorialSteps.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                  {tutorialId && (
                    <Button
                      onClick={handleCompleteTutorial}
                      disabled={isCompleted || isCompleting}
                      variant={isCompleted ? "outline" : "default"}
                      size="sm"
                      className={`${
                        isCompleted 
                          ? 'border-green-500 text-green-700 bg-green-50 hover:bg-green-100 cursor-not-allowed opacity-75' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                      title={isCompleted ? 'Tutorial already completed' : 'Mark this tutorial as completed'}
                    >
                      {isCompleting ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : isCompleted ? (
                        <Check className="h-4 w-4 mr-1" />
                      ) : (
                        <Check className="h-4 w-4 mr-1" />
                      )}
                      {isCompleted ? 'Completed' : isCompleting ? 'Completing...' : 'Complete Tutorial'}
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">
                    Step {sortedSteps[currentStepIndex]?.order || currentStepIndex + 1}: {sortedSteps[currentStepIndex]?.title}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {sortedSteps[currentStepIndex]?.description}
                  </p>
                </div>
                
                {sortedSteps[currentStepIndex]?.imageUrl && (
                  <div className="mt-4">
                    <img
                      src={`http://localhost:5000${sortedSteps[currentStepIndex].imageUrl}`}
                      alt={`Step ${sortedSteps[currentStepIndex]?.order || currentStepIndex + 1}`}
                      className="w-full max-w-md rounded-lg shadow-md mx-auto"
                    />
                  </div>
                )}
              </div>
              
              {/* Step Indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {tutorialSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStepIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentStepIndex 
                        ? 'bg-blue-600' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <ArtCanvas onSave={handleSave} />
      </div>

      <Footer />
      
      <LevelUpModal
        isOpen={showLevelUpModal}
        onClose={() => setShowLevelUpModal(false)}
        levelUpData={levelUpData}
      />
    </div>
  );
};

export default Create;