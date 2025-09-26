import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search
} from 'lucide-react';
import TutorialCategories from '@/components/TutorialCategories';
import { API_BASE_URL } from '@/config/api';

// Using centralized API base URL

const Tutorials = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTutorials: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Get current page and search from URL
  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentSearch = searchParams.get('search') || '';

  useEffect(() => {
    loadTutorials();
  }, [currentPage, currentSearch]);

  const loadTutorials = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      });

      // Add search parameter if exists
      if (currentSearch) {
        params.append('search', currentSearch);
      }

      // Add authentication headers if user is logged in
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Use accessible tutorials endpoint for level-based access
      const response = await fetch(`${API_BASE_URL}/tutorials/accessible?${params}`, {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        setTutorials(data.tutorials);
        setPagination(data.pagination);
        
        // Store user level and accessible levels for UI
        if (data.userLevel) {
          localStorage.setItem('userLevel', data.userLevel);
        }
        if (data.accessibleLevels) {
          localStorage.setItem('accessibleLevels', JSON.stringify(data.accessibleLevels));
        }
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
    newParams.set('page', '1');
    
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams();
    if (currentSearch) newParams.set('search', currentSearch);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const handleViewTutorial = (tutorial) => {
    navigate(`/tutorials/${tutorial._id}`);
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
          
          {/* Level Indicator */}
          {localStorage.getItem('userLevel') && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`capitalize ${
                      localStorage.getItem('userLevel') === 'beginner' 
                        ? 'bg-green-100 text-green-800' 
                        : localStorage.getItem('userLevel') === 'intermediate'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {localStorage.getItem('userLevel')} Level
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  You can access: {JSON.parse(localStorage.getItem('accessibleLevels') || '["beginner"]').join(', ')} tutorials
                </span>
              </div>
              {localStorage.getItem('userLevel') === 'advanced' ? (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                  <span className="inline-block w-4 h-4">🎨</span>
                  Congratulations! You've reached the Advanced level and have access to all tutorials.
                </p>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground mt-2">
                    Complete 3 tutorials of your current level to unlock the next level!
                  </p>
                  
                  {/* Progress Indicator */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress to next level:</span>
                      <span>{tutorials.filter(t => t.isCompleted && t.difficulty === localStorage.getItem('userLevel')).length}/3</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((tutorials.filter(t => t.isCompleted && t.difficulty === localStorage.getItem('userLevel')).length / 3) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Tutorials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Search tutorials by title, description, or content..."
                  defaultValue={currentSearch}
                  className="pl-10"
                />
              </div>
              <Button type="submit">
                Search
              </Button>
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
              `Showing ${tutorials.length} of ${pagination.totalTutorials} tutorials${currentSearch ? ` for "${currentSearch}"` : ''}`
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
            <div className="mb-8">
              <TutorialCategories
                tutorials={tutorials}
                userLevel={localStorage.getItem('userLevel') || 'beginner'}
                onViewTutorial={handleViewTutorial}
              />
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
                {currentSearch 
                  ? `No tutorials found for "${currentSearch}". Try adjusting your search terms.`
                  : "No tutorials are available at the moment."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Tutorials;
