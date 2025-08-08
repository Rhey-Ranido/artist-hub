import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  User, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import TutorialCard from '@/components/TutorialCard';

const API_BASE_URL = 'http://localhost:5000/api';

const Tutorials = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficulties, setDifficulties] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTutorials: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Get current filters from URL
  const currentSearch = searchParams.get('search') || '';
  const currentDifficulty = searchParams.get('difficulty') || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    loadDifficulties();
  }, []);

  useEffect(() => {
    loadTutorials();
  }, [currentSearch, currentDifficulty, currentPage]);

  const loadDifficulties = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tutorials/difficulties`);
      if (response.ok) {
        const data = await response.json();
        setDifficulties(data.difficulties);
      }
    } catch (error) {
      console.error('Error loading difficulties:', error);
    }
  };

  const loadTutorials = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(currentSearch && { search: currentSearch }),
        ...(currentDifficulty && currentDifficulty !== 'all' && { difficulty: currentDifficulty })
      });

      const response = await fetch(`${API_BASE_URL}/tutorials?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTutorials(data.tutorials);
        setPagination(data.pagination);
      } else {
        console.error('Failed to load tutorials');
      }
    } catch (error) {
      console.error('Error loading tutorials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const search = formData.get('search');
    
    const newParams = new URLSearchParams();
    if (search) newParams.set('search', search);
    if (currentDifficulty && currentDifficulty !== 'all') newParams.set('difficulty', currentDifficulty);
    newParams.set('page', '1');
    
    setSearchParams(newParams);
  };

  const handleFilterChange = (filterType, value) => {
    const newParams = new URLSearchParams();
    if (currentSearch) newParams.set('search', currentSearch);
    if (filterType === 'difficulty') {
      if (value && value !== 'all') newParams.set('difficulty', value);
    }
    newParams.set('page', '1');
    
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams();
    if (currentSearch) newParams.set('search', currentSearch);
    if (currentDifficulty && currentDifficulty !== 'all') newParams.set('difficulty', currentDifficulty);
    newParams.set('page', page.toString());
    
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({ page: '1' });
  };

  const hasActiveFilters = currentSearch || (currentDifficulty && currentDifficulty !== 'all');

  const handleViewTutorial = (tutorial) => {
    navigate(`/tutorial/${tutorial._id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Art Tutorials
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover step-by-step guides to improve your artistic skills
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter Tutorials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="search"
                    placeholder="Search tutorials..."
                    defaultValue={currentSearch}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">
                  Search
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                
                <Select value={currentDifficulty || 'all'} onValueChange={(value) => handleFilterChange('difficulty', value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Difficulties
                    </SelectItem>
                    {difficulties.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading tutorials...
              </span>
            ) : (
              `Showing ${tutorials.length} of ${pagination.totalTutorials} tutorials`
            )}
          </p>
        </div>

        {/* Tutorials Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tutorials.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {tutorials.map((tutorial) => (
                <TutorialCard
                  key={tutorial._id}
                  tutorial={tutorial}
                  onView={() => handleViewTutorial(tutorial)}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const page = i + 1;
                    const isCurrent = page === pagination.currentPage;
                    const isNearCurrent = Math.abs(page - pagination.currentPage) <= 1;
                    
                    if (isNearCurrent || page === 1 || page === pagination.totalPages) {
                      return (
                        <Button
                          key={page}
                          variant={isCurrent ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === 2 && pagination.currentPage > 3) {
                      return <span key={page} className="px-2">...</span>;
                    } else if (page === pagination.totalPages - 1 && pagination.currentPage < pagination.totalPages - 2) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tutorials found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your search or filters to find more tutorials."
                  : "No tutorials are available at the moment."
                }
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Tutorials;
