import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import ArtworkCard from '@/components/ArtworkCard';

const ArtworkFeed = ({ artworks = [] }) => {
  const [savedArtworks, setSavedArtworks] = useState(new Set());
  const [saveLoading, setSaveLoading] = useState(new Set());

  // formatting helpers moved to shared components

  const handleSaveArtwork = async (artworkId, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login or show login modal
      return;
    }

    try {
      setSaveLoading(prev => new Set(prev).add(artworkId));
      const response = await fetch(`http://localhost:5000/api/artworks/${artworkId}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setSavedArtworks(prev => {
          const newSet = new Set(prev);
          if (data.isSaved) {
            newSet.add(artworkId);
          } else {
            newSet.delete(artworkId);
          }
          return newSet;
        });
      }
    } catch (err) {
      console.error('Save artwork error:', err);
    } finally {
      setSaveLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(artworkId);
        return newSet;
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {artworks.map((artwork) => {
        const isSaved = savedArtworks.has(artwork._id);
        const isLoading = saveLoading.has(artwork._id);
        return (
          <div key={artwork._id} className="relative">
            <ArtworkCard artwork={artwork} />
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2 bg-white/90 hover:bg-white"
              onClick={(e) => handleSaveArtwork(artwork._id, e)}
              disabled={isLoading}
              title={isSaved ? 'Unsave' : 'Save'}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
          </div>
        );
      })}
    </div>
  );
};

export default ArtworkFeed;