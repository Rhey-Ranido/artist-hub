import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation, useBeforeUnload, useBlocker } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ArtCanvas from '../components/ArtCanvas';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, BookOpen, Check, Loader2, AlertTriangle } from 'lucide-react';
import LevelUpModal from '../components/LevelUpModal';

const Create = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [isDirty, setIsDirty] = useState(false); // Start clean, set to dirty when canvas changes
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  
  // Get tutorial data from navigation state
  const tutorialData = location.state;
  const tutorialSteps = tutorialData?.tutorialSteps || [];
  const tutorialTitle = tutorialData?.tutorialTitle;
  const tutorialId = tutorialData?.tutorialId;

  const API_BASE_URL = 'http://localhost:5000/api';

  // Handle browser/tab close
  useBeforeUnload(
    useCallback(
      (event) => {
        if (isDirty) {
          event.preventDefault();
          return (event.returnValue = "You have unsaved changes. Are you sure you want to leave?");
        }
      },
      [isDirty]
    )
  );

  // Block internal navigation when dirty
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) => 
        isDirty && currentLocation.pathname !== nextLocation.pathname,
      [isDirty]
    )
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowLeaveConfirm(true);
    } else {
      setShowLeaveConfirm(false);
    }
  }, [blocker.state]);

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
      
      // Add tutorial ID if artwork is created from a tutorial
      if (tutorialId) {
        formData.append('tutorialId', tutorialId);
      }
      
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
        console.error('Artwork creation failed:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        throw new Error(data.message || `Failed to save artwork (${response.status})`);
      }

      setSuccess('Artwork saved successfully!');
      setError('');
      setIsDirty(false);

      // Handle tutorial completion and level up
      if (data.tutorialCompleted && data.levelUp) {
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
      }
      
      // Redirect to the artwork page after a short delay
      setTimeout(() => {
        navigate(`/artwork/${data.artwork._id}`);
      }, 2000);
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  const confirmLeave = useCallback(() => {
    setShowLeaveConfirm(false);
    setIsDirty(false);
    blocker.proceed?.();
  }, [blocker]);

  const stayOnPage = useCallback(() => {
    setShowLeaveConfirm(false);
    blocker.reset?.();
  }, [blocker]);

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



  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create New Artwork</h1>
          <p className="text-muted-foreground">
            Use our digital canvas to create your masterpiece and share it with the community.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Canvas Area */}
          <div className={`${tutorialSteps.length > 0 ? 'lg:w-2/3' : 'w-full max-w-5xl mx-auto'}`}>
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

            <ArtCanvas onSave={handleSave} onDirtyChange={setIsDirty} />
          </div>

          {/* Tutorial Section - Only shown when there are tutorial steps */}
          {tutorialSteps.length > 0 && (
            <div className="lg:w-1/3">
              {tutorialTitle && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Following Tutorial:</span>
                  </div>
                  <p className="text-blue-700">{tutorialTitle}</p>
                </div>
              )}
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Tutorial Step {currentStepIndex + 1} of {tutorialSteps.length}
                    </h3>
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
                          className="w-full rounded-lg shadow-md"
                        />
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={prevStep}
                        disabled={currentStepIndex === 0}
                        className="flex-1"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextStep}
                        disabled={currentStepIndex === tutorialSteps.length - 1}
                        className="flex-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    
                    {/* Step Indicators */}
                    <div className="flex justify-center gap-2 mt-4">
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
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Footer />
      
      <LevelUpModal
        isOpen={showLevelUpModal}
        onClose={() => setShowLevelUpModal(false)}
        levelUpData={levelUpData}
      />

      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-background border rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <h3 className="text-lg font-semibold text-foreground">Leave this page?</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              You have unsaved artwork. If you leave now, your changes will be lost.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={stayOnPage}>
                Stay on page
              </Button>
              <Button variant="destructive" onClick={confirmLeave}>
                Leave anyway
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Create;