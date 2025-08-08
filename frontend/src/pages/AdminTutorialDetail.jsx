import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Clock, User, Calendar, ArrowLeft } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const AdminTutorialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutorial, setTutorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/admin/tutorials/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load tutorial');
        const data = await res.json();
        setTutorial(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTutorial();
  }, [id]);

  const getBadge = (label, variant = 'outline') => (
    <Badge variant={variant} className="mr-2 mb-2">{label}</Badge>
  );

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
          <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
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
        <Button variant="outline" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tutorials
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">{tutorial.title}</CardTitle>
                <p className="text-muted-foreground mt-2">{tutorial.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {getBadge(tutorial.category)}
                  {getBadge(tutorial.difficulty)}
                  {!tutorial.isPublished && getBadge('Draft', 'secondary')}
                </div>
              </div>
              {tutorial.thumbnail && (
                <img
                  src={`http://localhost:5000${tutorial.thumbnail}`}
                  alt={tutorial.title}
                  className="w-28 h-28 rounded-lg object-cover"
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {tutorial.estimatedTime} minutes</div>
              <div className="flex items-center gap-2"><User className="h-4 w-4" /> {tutorial.author?.username || 'Unknown'}</div>
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {new Date(tutorial.createdAt).toLocaleDateString()}</div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Content</h3>
              <p className="whitespace-pre-wrap leading-7">{tutorial.content}</p>
            </div>

            {Array.isArray(tutorial.materials) && tutorial.materials.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Materials</h3>
                <div className="flex flex-wrap">
                  {tutorial.materials.map((m, i) => (
                    <span key={`${m}-${i}`}>{getBadge(m)}</span>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(tutorial.steps) && tutorial.steps.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-6">Steps</h3>
                <div className="space-y-10">
                  {tutorial.steps
                    .slice()
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((step, idx) => (
                      <div key={idx}>
                        <h3 className="text-2xl font-bold mb-3">
                          Step {step.order || idx + 1}: {step.title}
                        </h3>
                        {step.imageUrl && (
                          <img
                            src={`http://localhost:5000${step.imageUrl}`}
                            alt={`Step ${step.order || idx + 1}`}
                            className="w-full max-w-3xl rounded-lg mb-4"
                          />
                        )}
                        <p className="whitespace-pre-wrap text-base leading-7">{step.description}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {Array.isArray(tutorial.tags) && tutorial.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap">
                  {tutorial.tags.map((t, i) => (
                    <span key={`${t}-${i}`}>{getBadge(t)}</span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTutorialDetail;


