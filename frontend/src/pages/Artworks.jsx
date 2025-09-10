import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ArtworkFeed from '../components/ArtworkFeed';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search as SearchIcon, 
  Loader2,
  Palette,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';

const Artworks = () => {
  const API_BASE_URL = 'http://localhost:5000/api';
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  useEffect(() => {
    fetchArtworks();
  }, [currentPage, sortBy, sortOrder]);

  const fetchArtworks = async (query = '') => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        sortBy,
        sortOrder
      });

      if (query) {
        params.append('query', query);
      }

      console.log('Fetching artworks from:', `${API_BASE_URL}/artworks/search?${params}`);
      const response = await fetch(`${API_BASE_URL}/artworks/search?${params}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch artworks');
      }

      const data = await response.json();
      console.log('Received artworks:', data);
      
      setArtworks(data.artworks || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setHasNext(data.pagination?.hasNext || false);
      setHasPrev(data.pagination?.hasPrev || false);
    } catch (error) {
      console.error('Error fetching artworks:', error);
      setError(error.message || 'Failed to load artworks');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchArtworks(searchQuery);
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">All Artworks</h1>
          <p className="text-muted-foreground">
            Discover amazing digital artworks created by our talented community of artists.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search artworks by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading}>
              Search
            </Button>
          </form>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={sortBy === 'createdAt' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('createdAt')}
            >
              {sortBy === 'createdAt' && sortOrder === 'desc' ? <SortDesc className="h-4 w-4 mr-1" /> : <SortAsc className="h-4 w-4 mr-1" />}
              Date
            </Button>
            <Button
              variant={sortBy === 'likesCount' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('likesCount')}
            >
              {sortBy === 'likesCount' && sortOrder === 'desc' ? <SortDesc className="h-4 w-4 mr-1" /> : <SortAsc className="h-4 w-4 mr-1" />}
              Likes
            </Button>
            <Button
              variant={sortBy === 'views' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('views')}
            >
              {sortBy === 'views' && sortOrder === 'desc' ? <SortDesc className="h-4 w-4 mr-1" /> : <SortAsc className="h-4 w-4 mr-1" />}
              Views
            </Button>
          </div>
        </div>

        {/* Artworks Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              <span className="text-muted-foreground">Loading artworks...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchArtworks(searchQuery)} variant="outline">
              Try Again
            </Button>
          </div>
        ) : artworks.length > 0 ? (
          <>
            <ArtworkFeed artworks={artworks} />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrev}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNext}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Artworks Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? `No artworks found for "${searchQuery}"` : 'No artworks available yet.'}
            </p>
            {searchQuery && (
              <Button onClick={() => {
                setSearchQuery('');
                fetchArtworks('');
              }} variant="outline">
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Artworks;


