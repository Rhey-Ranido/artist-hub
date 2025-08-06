import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  Share2,
  Download,
  Edit,
  Trash2,
  Send,
  Loader2,
  Calendar,
  Palette,
  Bookmark
} from 'lucide-react';

const ArtworkDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchArtwork();
      fetchComments();
    }
  }, [id]);

  const fetchArtwork = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/artworks/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch artwork');
      }

      setArtwork(data.artwork);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await fetch(`http://localhost:5000/api/comments/artwork/${id}`);
      const data = await response.json();

      if (response.ok) {
        setComments(data.comments);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/artworks/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'like' })
      });

      const data = await response.json();

      if (response.ok) {
        setArtwork(prev => ({
          ...prev,
          likesCount: data.likesCount,
          isLiked: data.isLiked
        }));
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newComment.trim(),
          artworkId: id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
        setArtwork(prev => ({
          ...prev,
          commentsCount: prev.commentsCount + 1
        }));
      }
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleSaveArtwork = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setSaveLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/artworks/${id}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setIsSaved(data.isSaved);
      }
    } catch (err) {
      console.error('Save artwork error:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDownload = () => {
    if (artwork?.imageUrl) {
      const link = document.createElement('a');
      link.href = `http://localhost:5000${artwork.imageUrl}`;
      link.download = `${artwork.title}.png`;
      link.click();
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !artwork) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center p-8">
          <p className="text-red-500">{error || 'Artwork not found'}</p>
        </div>
        <Footer />
      </div>
    );
  }

  const isOwner = currentUser && currentUser.id === artwork.artist._id;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Artwork Display */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={`http://localhost:5000${artwork.imageUrl}`}
                    alt={artwork.title}
                    className="w-full h-auto rounded-t-lg"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Badge variant="secondary" className="bg-black/50 text-white">
                      <Eye className="h-3 w-3 mr-1" />
                      {artwork.views}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">{artwork.title}</h1>
                    <div className="flex gap-2">
                      {!isOwner && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSaveArtwork}
                          disabled={saveLoading}
                        >
                          <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {isOwner && (
                        <>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {artwork.description && (
                    <p className="text-gray-600 mb-4">{artwork.description}</p>
                  )}

                  {artwork.tags && artwork.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {artwork.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        onClick={handleLike}
                        className={`${artwork.isLiked ? 'text-red-500' : ''}`}
                      >
                        <Heart 
                          className={`h-5 w-5 mr-2 ${artwork.isLiked ? 'fill-current' : ''}`} 
                        />
                        {artwork.likesCount}
                      </Button>
                      
                      <div className="flex items-center">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        {artwork.commentsCount}
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatTimeAgo(artwork.createdAt)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Artist Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Artist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <img
                      src={artwork.artist.profileImage 
                        ? `http://localhost:5000${artwork.artist.profileImage}` 
                        : '/default-avatar.png'
                      }
                      alt={artwork.artist.username}
                    />
                  </Avatar>
                  <div>
                    <Link 
                      to={`/profile/${artwork.artist._id}`}
                      className="font-medium hover:underline"
                    >
                      {artwork.artist.username}
                    </Link>
                    {artwork.artist.bio && (
                      <p className="text-sm text-gray-600 mt-1">
                        {artwork.artist.bio.slice(0, 100)}...
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle>Comments ({artwork.commentsCount})</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add Comment Form */}
                {currentUser ? (
                  <form onSubmit={handleAddComment} className="mb-6">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="mb-3"
                      rows={3}
                    />
                    <Button 
                      type="submit" 
                      disabled={commentLoading || !newComment.trim()}
                      size="sm"
                    >
                      {commentLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Send className="h-4 w-4 mr-2" />
                      Comment
                    </Button>
                  </form>
                ) : (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600 mb-2">Join the conversation</p>
                    <Link to="/login">
                      <Button size="sm">Sign In to Comment</Button>
                    </Link>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {commentsLoading ? (
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="text-gray-500 text-center">No comments yet</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment._id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <img
                              src={comment.author.profileImage 
                                ? `http://localhost:5000${comment.author.profileImage}` 
                                : '/default-avatar.png'
                              }
                              alt={comment.author.username}
                            />
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Link 
                                to={`/profile/${comment.author._id}`}
                                className="font-medium text-sm hover:underline"
                              >
                                {comment.author.username}
                              </Link>
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ArtworkDetails;