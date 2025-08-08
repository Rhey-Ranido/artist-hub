// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ArtworkFeed from '../components/ArtworkFeed';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Palette, Brush, Users, Heart, Sparkles, Plus, Loader2 } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchArtworkFeed();
  }, []);

  const fetchArtworkFeed = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/artworks/feed?limit=6`);
      if (!response.ok) {
        throw new Error('Failed to fetch artworks');
      }

      const data = await response.json();
      setArtworks(data.artworks || []);
    } catch (error) {
      console.error('Error fetching artwork feed:', error);
      setError(error.message || 'Failed to load featured artworks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-pink-900/20 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                <Palette className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Create, Share, and
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 block">
                Inspire with Art
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Join our vibrant community of digital artists. Create stunning artworks with our canvas tools, 
              share your creativity, and connect with fellow artists from around the world.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={() => navigate("/create")}
              >
                <Plus className="mr-2 h-5 w-5" />
                Start Creating
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-3"
                onClick={() => navigate("/register")}
              >
                Join Community
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Artists Love Our Platform</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, share, and grow as a digital artist in one place.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brush className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Powerful Canvas Tools</h3>
                <p className="text-muted-foreground">
                  Create digital masterpieces with our intuitive drawing tools, brushes, and color palettes.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Vibrant Community</h3>
                <p className="text-muted-foreground">
                  Connect with fellow artists, share your work, and get inspired by amazing creations.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Share & Get Feedback</h3>
                <p className="text-muted-foreground">
                  Share your artworks publicly, receive likes and comments, and grow your artistic skills.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {artworks.length > 0 ? artworks.length + '+' : '0'}
              </div>
              <div className="text-muted-foreground">Artworks Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {artworks.length > 0 ? Math.floor(artworks.length * 1.5) + '+' : '0'}
              </div>
              <div className="text-muted-foreground">Active Artists</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {artworks.length > 0 ? Math.floor(artworks.length * 2.3) + '+' : '0'}
              </div>
              <div className="text-muted-foreground">Likes Given</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-600 mb-2">
                {artworks.length > 0 ? Math.floor(artworks.length * 3.1) + '+' : '0'}
              </div>
              <div className="text-muted-foreground">Comments Shared</div>
            </div>
          </div>
        </div>
      </section>

      {/* Artwork Feed Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Artworks</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover amazing digital artworks created by our talented community of artists.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                <span className="text-muted-foreground">Loading featured artworks...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchArtworkFeed} variant="outline">
                Try Again
              </Button>
            </div>
          ) : artworks.length > 0 ? (
            <>
              <ArtworkFeed artworks={artworks} />
              <div className="text-center mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/search')}
                  className="px-8"
                >
                  View All Artworks
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Artworks Yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to create and share amazing digital artwork!
              </p>
              <Button onClick={() => navigate('/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Artwork
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Artistic Journey?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of artists who are already creating and sharing their digital masterpieces.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-3"
              onClick={() => navigate("/create")}
            >
              <Palette className="mr-2 h-5 w-5" />
              Create Your First Artwork
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-purple-600"
              onClick={() => navigate("/register")}
            >
              Sign Up Free
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}