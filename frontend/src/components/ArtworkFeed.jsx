import React from 'react';
import ArtworkCard from '@/components/ArtworkCard';

const ArtworkFeed = ({ artworks = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {artworks.map((artwork) => {
        return (
          <ArtworkCard key={artwork._id} artwork={artwork} />
        );
      })}
    </div>
  );
};

export default ArtworkFeed;