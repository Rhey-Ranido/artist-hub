import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ArtCanvas from '../components/ArtCanvas';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Create = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create New Artwork</h1>
          <p className="text-muted-foreground">
            Use our digital canvas to create your masterpiece and share it with the community.
          </p>
        </div>

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
    </div>
  );
};

export default Create;