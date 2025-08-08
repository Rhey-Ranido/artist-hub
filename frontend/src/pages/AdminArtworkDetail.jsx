import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  Eye,
  Shield,
  Edit,
  Save,
  X,
  User,
  Calendar,
  Tag,
  Image,
  Loader2,
  Trash2
} from 'lucide-react';

const AdminArtworkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
           const [formData, setFormData] = useState({
           title: '',
           description: '',
           tags: '',
           isPublic: false,
           adminNote: ''
         });

  const API_BASE_URL = 'http://localhost:5000/api';

  // Check if user is admin and redirect if not
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (!token || !savedUser) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(savedUser);
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }

    loadArtworkDetails();
  }, [navigate, id]);

  const loadArtworkDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/artworks/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch artwork details');
      }

      const data = await response.json();
      setArtwork(data);
                   setFormData({
               title: data.title || '',
               description: data.description || '',
               tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
               isPublic: data.isPublic || false,
               adminNote: data.adminNote || ''
             });
    } catch (error) {
      console.error('Error loading artwork details:', error);
      setError('Failed to load artwork details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateArtwork = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/admin/artworks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update artwork');
      }

      const updatedArtwork = await response.json();
      setArtwork(updatedArtwork);
      setEditing(false);
    } catch (error) {
      console.error('Error updating artwork:', error);
      setError('Failed to update artwork');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/admin/artworks/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isPublic: newStatus === 'public',
          reason: formData.adminNote
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update artwork status');
      }

      const updatedArtwork = await response.json();
      setArtwork(prev => ({
        ...prev,
        isPublic: updatedArtwork.artwork.isPublic,
        adminNote: updatedArtwork.artwork.adminNote,
        statusUpdatedAt: updatedArtwork.artwork.statusUpdatedAt
      }));
      setFormData(prev => ({
        ...prev,
        isPublic: updatedArtwork.artwork.isPublic,
        adminNote: updatedArtwork.artwork.adminNote
      }));
    } catch (error) {
      console.error('Error updating artwork status:', error);
      setError('Failed to update artwork status');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this artwork? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/admin/artworks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete artwork');
      }

      navigate('/admin');
    } catch (error) {
      console.error('Error deleting artwork:', error);
      setError('Failed to delete artwork');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertDescription>Artwork not found</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Artwork Details</h1>
              <p className="text-muted-foreground">Manage artwork information and settings</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleUpdateArtwork}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                                             setFormData({
                           title: artwork.title || '',
                           description: artwork.description || '',
                           tags: Array.isArray(artwork.tags) ? artwork.tags.join(', ') : '',
                           isPublic: artwork.isPublic || false,
                           adminNote: artwork.adminNote || ''
                         });
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Artwork Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Artwork Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={`http://localhost:5000${artwork.imageUrl}`}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          </Card>

          {/* Artwork Information */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  <>
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Artwork title"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Artwork description"
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Tags (comma-separated)</label>
                      <Input
                        value={formData.tags}
                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Title</label>
                      <p className="text-lg font-semibold">{artwork.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Description</label>
                      <p className="text-sm">{artwork.description || 'No description provided'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tags</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {artwork.tags && artwork.tags.length > 0 ? (
                          artwork.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No tags</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Artist Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Artist Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                    {artwork.artist?.profileImage ? (
                      <img
                        src={`http://localhost:5000${artwork.artist.profileImage}`}
                        alt={artwork.artist.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted-foreground/20 flex items-center justify-center">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {artwork.artist?.firstName} {artwork.artist?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">@{artwork.artist?.username}</p>
                    <p className="text-sm text-muted-foreground">{artwork.artist?.email}</p>
                  </div>
                </div>
                {artwork.artist?.bio && (
                  <p className="text-sm text-muted-foreground">{artwork.artist.bio}</p>
                )}
                {artwork.artist?.location && (
                  <p className="text-sm text-muted-foreground mt-2">
                    📍 {artwork.artist.location}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Status and Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Visibility</p>
                    <p className="text-sm text-muted-foreground">
                      {artwork.isPublic ? 'Public' : 'Private'}
                    </p>
                  </div>
                  <Badge variant={artwork.isPublic ? "default" : "secondary"}>
                    {artwork.isPublic ? (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Public
                      </>
                    ) : (
                      <>
                        <Shield className="h-3 w-3 mr-1" />
                        Private
                      </>
                    )}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(artwork.createdAt)}
                    </p>
                  </div>
                </div>

                {artwork.statusUpdatedAt && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Last Status Update</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(artwork.statusUpdatedAt)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant={artwork.isPublic ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleStatusUpdate(artwork.isPublic ? 'private' : 'public')}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : artwork.isPublic ? (
                      <Shield className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    {artwork.isPublic ? 'Make Private' : 'Make Public'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Admin Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <Textarea
                    value={formData.adminNote}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminNote: e.target.value }))}
                    placeholder="Add admin notes about this artwork..."
                    rows={3}
                  />
                ) : (
                  <p className="text-sm">
                    {artwork.adminNote || 'No admin notes'}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminArtworkDetail;
