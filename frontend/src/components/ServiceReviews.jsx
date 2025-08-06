import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Star, User, Calendar, Edit, Trash2, Loader2 } from 'lucide-react';

const ServiceReviews = ({ serviceId, onReviewUpdate }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });

  const API_BASE_URL = 'http://localhost:3000/api';
  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchReviews();
  }, [serviceId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/reviewService/${serviceId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('Please log in to leave a review');
      return;
    }

    if (!formData.comment.trim()) {
      setError('Please provide a comment');
      return;
    }

    if (formData.comment.trim().length < 10) {
      setError('Comment must be at least 10 characters long');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const url = editingReview 
        ? `${API_BASE_URL}/reviewService/${editingReview._id}`
        : `${API_BASE_URL}/reviewService/${serviceId}`;
      
      const method = editingReview ? 'PUT' : 'POST';

      const requestBody = {
        rating: parseInt(formData.rating),
        comment: formData.comment.trim()
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to submit review');
      }

      const result = await response.json();
      
      if (editingReview) {
        setReviews(prev => prev.map(review => 
          review._id === editingReview._id ? result : review
        ));
        setSuccess('Review updated successfully');
      } else {
        setReviews(prev => [result, ...prev]);
        setSuccess('Review submitted successfully');
      }

      // Reset form
      setFormData({ rating: 5, comment: '' });
      setShowReviewForm(false);
      setEditingReview(null);

      // Notify parent component about review update
      if (onReviewUpdate) {
        onReviewUpdate();
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/reviewService/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      setReviews(prev => prev.filter(review => review._id !== reviewId));
      setSuccess('Review deleted successfully');

      if (onReviewUpdate) {
        onReviewUpdate();
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating,
      comment: review.comment
    });
    setShowReviewForm(true);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setFormData({ rating: 5, comment: '' });
    setShowReviewForm(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const userHasReviewed = reviews.some(review => 
    review.userId?._id === currentUser?._id || review.userId === currentUser?._id
  );

  const userReview = reviews.find(review => 
    review.userId?._id === currentUser?._id || review.userId === currentUser?._id
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading reviews...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Reviews ({reviews.length})</CardTitle>
          {token && !userHasReviewed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReviewForm(true)}
            >
              Write a Review
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Error/Success Messages */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <Card className="mb-6 border-2">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingReview ? 'Edit Review' : 'Write a Review'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, rating: index + 1 }))}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            index < formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Comment</label>
                  <Textarea
                    value={formData.comment}
                    onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Share your experience with this service (minimum 10 characters)..."
                    rows={4}
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.comment.length}/1000 characters (minimum 10 required)
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {editingReview ? 'Update Review' : 'Submit Review'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* User's Review (if exists) */}
        {userReview && (
          <Card className="mb-4 border-2 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Your Review</div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {formatDate(userReview.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {renderStars(userReview.rating)}
                </div>
              </div>
              <p className="text-gray-700">{userReview.comment}</p>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditReview(userReview)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteReview(userReview._id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Other Reviews */}
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No reviews yet</p>
            <p className="text-sm">Be the first to review this service!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews
              .filter(review => !userReview || review._id !== userReview._id)
              .map((review) => (
                <Card key={review._id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {review.userId?.name || 'Anonymous'}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {formatDate(review.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceReviews; 