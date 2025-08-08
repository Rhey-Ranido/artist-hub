import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Clock, Calendar, ArrowLeft, Heart, Tag, BookOpen, Palette } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api';

const TutorialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tutorial, setTutorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isReacting, setIsReacting] = useState(false);
  const [reactionsCount, setReactionsCount] = useState(0);
  const [isReacted, setIsReacted] = useState(false);

  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        setLoading(true);
        console.log('Fetching tutorial with ID:', id);
        const res = await fetch(`${API_BASE_URL}/tutorials/${id}`);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
          throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log('Tutorial data received:', data);
        setTutorial(data);
        setReactionsCount(data.reactionsCount || 0);
        setIsReacted(data.isReacted || false);
      } catch (err) {
        console.error('Error fetching tutorial:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTutorial();
  }, [id]);

  const handleReaction = async () => {
    if (!user) {
      // Redirect to login or show login modal
      navigate('/login');
      return;
    }

    if (isReacting) return;

    setIsReacting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tutorials/${id}/reaction`, {
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

  const handleCreateArtwork = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Navigate to create page with tutorial data
    navigate('/create', { 
      state: { 
        tutorialId: id,
        tutorialSteps: tutorial.steps,
        tutorialTitle: tutorial.title
      } 
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto p-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="outline" className="mb-6" onClick={() => navigate('/tutorials')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tutorials
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold mb-3">{tutorial.title}</CardTitle>
                <p className="text-muted-foreground text-lg mb-4">{tutorial.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{tutorial.estimatedTime} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(tutorial.createdAt)}</span>
                  </div>
                  <button 
                    className={`flex items-center gap-2 transition-colors duration-200 ${
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

                <div className="flex flex-wrap gap-2">
                  <Badge className={getDifficultyColor(tutorial.difficulty)}>
                    {tutorial.difficulty}
                  </Badge>
                  {tutorial.tags && tutorial.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {tutorial.thumbnail && (
                <div className="ml-6">
                  <img
                    src={`http://localhost:5000${tutorial.thumbnail}`}
                    alt={tutorial.title}
                    className="w-48 h-48 rounded-lg object-cover shadow-lg"
                  />
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Tutorial Content
              </h3>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap leading-7 text-base">{tutorial.content}</p>
              </div>
            </div>

            {Array.isArray(tutorial.materials) && tutorial.materials.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Materials Needed</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tutorial.materials.map((material, index) => (
                    <Badge key={index} variant="outline" className="text-sm py-2 px-3">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(tutorial.steps) && tutorial.steps.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-6">Step-by-Step Instructions</h3>
                <div className="space-y-8">
                  {tutorial.steps
                    .slice()
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((step, idx) => (
                      <div key={idx} className="border-l-4 border-primary pl-6">
                        <h4 className="text-lg font-semibold mb-3">
                          Step {step.order || idx + 1}: {step.title}
                        </h4>
                        {step.imageUrl && (
                          <div className="mb-4">
                            <img
                              src={`http://localhost:5000${step.imageUrl}`}
                              alt={`Step ${step.order || idx + 1}`}
                              className="w-full max-w-2xl rounded-lg shadow-md"
                            />
                          </div>
                        )}
                        <p className="whitespace-pre-wrap text-base leading-7 text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Create Artwork Button */}
            <div className="pt-8 border-t">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Ready to Create?</h3>
                <p className="text-muted-foreground mb-6">
                  Follow along with the tutorial steps while creating your artwork
                </p>
                <Button 
                  onClick={handleCreateArtwork}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3"
                >
                  <Palette className="h-5 w-5 mr-2" />
                  Create Artwork from This Tutorial
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TutorialDetail;
