import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TutorialCard from '../components/TutorialCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  TrendingUp,
  UserCheck,
  UserX,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  Palette,
  BookOpen,
  Plus,
  Image,
  FileText,
  Settings,
  Shield,
  Activity,
  Minus,
  Upload
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    providers: { total: 0, pending: 0, approved: 0, rejected: 0, suspended: 0 },
    users: { total: 0, clients: 0, providers: 0, admins: 0 },
    services: { total: 0, active: 0 },
    artworks: { total: 0, public: 0, private: 0 },
    tutorials: { total: 0, published: 0, draft: 0 },
    recentProviders: []
  });

  const [users, setUsers] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);



  // Tutorial management state
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [isEditingTutorial, setIsEditingTutorial] = useState(false);
  const [editingTutorialId, setEditingTutorialId] = useState(null);
  const [tutorialForm, setTutorialForm] = useState({
    title: '',
    description: '',
    content: '',
    category: 'beginner',
    difficulty: 'beginner',
    estimatedTime: 30,
    tags: '',
    materials: '',
    thumbnail: '',
    isPublished: false,
    steps: []
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

    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Load dashboard stats
      const statsResponse = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!statsResponse.ok) {
        throw new Error('Failed to load dashboard stats');
      }

      const statsData = await statsResponse.json();
      setStats(statsData);

              // Load data based on active tab
        if (activeTab === 'users') {
          await loadUsers();
        } else if (activeTab === 'artworks') {
          await loadArtworks();
        } else if (activeTab === 'tutorials') {
          await loadTutorials();
        }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { role: statusFilter })
      });

      const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadArtworks = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`${API_BASE_URL}/admin/artworks?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load artworks');
      }

      const data = await response.json();
      setArtworks(data.artworks);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadTutorials = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { isPublished: statusFilter })
      });

      const response = await fetch(`${API_BASE_URL}/admin/tutorials?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load tutorials');
      }

      const data = await response.json();
      setTutorials(data.tutorials);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err.message);
    }
  };

  const openCreateTutorialModal = () => {
    setIsEditingTutorial(false);
    setEditingTutorialId(null);
    setTutorialForm({
      title: '',
      description: '',
      content: '',
      category: 'beginner',
      difficulty: 'beginner',
      estimatedTime: 30,
      tags: '',
      materials: '',
      isPublished: false,
      steps: []
    });
    setShowTutorialModal(true);
  };

  const startEditTutorial = (tutorial) => {
    setIsEditingTutorial(true);
    setEditingTutorialId(tutorial._id);
    setTutorialForm({
      title: tutorial.title || '',
      description: tutorial.description || '',
      content: tutorial.content || '',
      category: tutorial.category || 'beginner',
      difficulty: tutorial.difficulty || 'beginner',
      estimatedTime: tutorial.estimatedTime || 30,
      tags: Array.isArray(tutorial.tags) ? tutorial.tags.join(', ') : (tutorial.tags || ''),
      materials: Array.isArray(tutorial.materials) ? tutorial.materials.join(', ') : (tutorial.materials || ''),
      thumbnail: tutorial.thumbnail || '',
      isPublished: !!tutorial.isPublished,
      steps: Array.isArray(tutorial.steps) ? tutorial.steps.map((s, idx) => ({
        id: `${Date.now()}-${idx}`,
        title: s.title || '',
        description: s.description || '',
        imageUrl: s.imageUrl || '',
        order: typeof s.order === 'number' ? s.order : (idx + 1)
      })) : []
    });
    setShowTutorialModal(true);
  };

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'artworks') {
      loadArtworks();
    } else if (activeTab === 'tutorials') {
      loadTutorials();
    }
  }, [currentPage, searchTerm, statusFilter, activeTab]);

  const handleStatusUpdate = async (itemId, newStatus, reason = '') => {
    try {
      setActionLoading(itemId);
      const token = localStorage.getItem('token');

      let endpoint = '';
      let body = {};

      if (activeTab === 'users') {
        endpoint = `${API_BASE_URL}/admin/users/${itemId}/status`;
        body = { isActive: newStatus === 'active', reason };
      } else if (activeTab === 'artworks') {
        endpoint = `${API_BASE_URL}/admin/artworks/${itemId}/status`;
        body = { isPublic: newStatus === 'public', reason };
      } else if (activeTab === 'tutorials') {
        endpoint = `${API_BASE_URL}/admin/tutorials/${itemId}/status`;
        body = { isPublished: newStatus === 'published' };
      }

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Reload data
      if (activeTab === 'users') {
        await loadUsers();
      } else if (activeTab === 'artworks') {
        await loadArtworks();
      } else if (activeTab === 'tutorials') {
        await loadTutorials();
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleTutorialStatusToggle = async (tutorialId, newStatus) => {
    try {
      setActionLoading(tutorialId);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/admin/tutorials/${tutorialId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update tutorial status');
      }

      // Reload tutorials
      await loadTutorials();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(itemId);
      const token = localStorage.getItem('token');

      let endpoint = '';
      if (activeTab === 'users') {
        endpoint = `${API_BASE_URL}/admin/users/${itemId}`;
      } else if (activeTab === 'artworks') {
        endpoint = `${API_BASE_URL}/admin/artworks/${itemId}`;
      } else if (activeTab === 'tutorials') {
        endpoint = `${API_BASE_URL}/admin/tutorials/${itemId}`;
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      // Reload data
      if (activeTab === 'users') {
        await loadUsers();
      } else if (activeTab === 'artworks') {
        await loadArtworks();
      } else if (activeTab === 'tutorials') {
        await loadTutorials();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };



  const handleCreateTutorial = async () => {
    try {
      setActionLoading('tutorial');
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/admin/tutorials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tutorialForm)
      });

      if (!response.ok) {
        throw new Error('Failed to create tutorial');
      }

      setShowTutorialModal(false);
      setTutorialForm({
        title: '',
        description: '',
        content: '',
        category: 'beginner',
        difficulty: 'beginner',
        estimatedTime: 30,
        tags: '',
        materials: '',
        thumbnail: '',
        isPublished: false,
        steps: []
      });
      await loadTutorials();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateTutorial = async () => {
    if (!editingTutorialId) return;
    try {
      setActionLoading('tutorial');
      const token = localStorage.getItem('token');

      const tagsArray = (tutorialForm.tags || '')
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      const materialsArray = (tutorialForm.materials || '')
        .split(',')
        .map(m => m.trim())
        .filter(Boolean);
      const stepsArray = (tutorialForm.steps || []).map((s, idx) => ({
        title: s.title || '',
        description: s.description || '',
        imageUrl: s.imageUrl || '',
        order: typeof s.order === 'number' ? s.order : (idx + 1)
      }));

      const payload = {
        title: tutorialForm.title,
        description: tutorialForm.description,
        content: tutorialForm.content,
        category: tutorialForm.category,
        difficulty: tutorialForm.difficulty,
        estimatedTime: tutorialForm.estimatedTime,
        isPublished: tutorialForm.isPublished,
        thumbnail: tutorialForm.thumbnail,
        tags: JSON.stringify(tagsArray),
        materials: JSON.stringify(materialsArray),
        steps: JSON.stringify(stepsArray)
      };

      const response = await fetch(`${API_BASE_URL}/admin/tutorials/${editingTutorialId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to update tutorial');
      }

      setShowTutorialModal(false);
      setIsEditingTutorial(false);
      setEditingTutorialId(null);
      await loadTutorials();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const addStep = () => {
    const newStep = {
      id: Date.now(),
      title: '',
      description: '',
      imageUrl: '',
      order: tutorialForm.steps.length + 1
    };
    setTutorialForm({
      ...tutorialForm,
      steps: [...tutorialForm.steps, newStep]
    });
  };

  const updateStep = (stepId, field, value) => {
    setTutorialForm({
      ...tutorialForm,
      steps: tutorialForm.steps.map(step => 
        step.id === stepId ? { ...step, [field]: value } : step
      )
    });
  };

  const removeStep = (stepId) => {
    setTutorialForm({
      ...tutorialForm,
      steps: tutorialForm.steps.filter(step => step.id !== stepId)
    });
  };

  const handleImageUpload = async (file, stepId) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/upload/tutorials/step`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      updateStep(stepId, 'imageUrl', data.imageUrl);
    } catch (err) {
      setError('Failed to upload image: ' + err.message);
    }
  };

  const handleTutorialThumbnailUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('thumbnail', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/upload/tutorials/thumbnail`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload thumbnail');
      }

      const data = await response.json();
      setTutorialForm({...tutorialForm, thumbnail: data.imageUrl});
    } catch (err) {
      setError('Failed to upload thumbnail: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      suspended: 'destructive',
      active: 'default',
      inactive: 'destructive',
      public: 'default',
      private: 'secondary',
      published: 'default',
      draft: 'secondary'
    };

    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
      suspended: AlertTriangle,
      active: UserCheck,
      inactive: UserX,
      public: Eye,
      private: Shield,
      published: CheckCircle,
      draft: FileText
    };

    const Icon = icons[status];
    const variant = variants[status];

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilterOptions = () => {
    switch (activeTab) {
      case 'providers':
        return [
          { value: 'all', label: 'All Status' },
          { value: 'pending', label: 'Pending' },
          { value: 'approved', label: 'Approved' },
          { value: 'rejected', label: 'Rejected' },
          { value: 'suspended', label: 'Suspended' }
        ];
      case 'users':
        return [
          { value: 'all', label: 'All Roles' },
          { value: 'user', label: 'Users' },
          { value: 'admin', label: 'Admins' }
        ];
      case 'artworks':
        return [
          { value: 'all', label: 'All Status' },
          { value: 'public', label: 'Public' },
          { value: 'private', label: 'Private' }
        ];
      case 'tutorials':
        return [
          { value: 'all', label: 'All Status' },
          { value: 'true', label: 'Published' },
          { value: 'false', label: 'Draft' }
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, artworks, and tutorials
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-8">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Overview
          </Button>

          <Button
            variant={activeTab === 'users' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('users')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Users
          </Button>
          <Button
            variant={activeTab === 'artworks' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('artworks')}
            className="flex items-center gap-2"
          >
            <Palette className="h-4 w-4" />
            Artworks
          </Button>
          <Button
            variant={activeTab === 'tutorials' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('tutorials')}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Tutorials
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users.total}</div>
                </CardContent>
              </Card>



              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Artworks</CardTitle>
                  <Palette className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.artworks?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.artworks?.public || 0} public, {stats.artworks?.private || 0} private
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tutorials</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.tutorials?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.tutorials?.published || 0} published, {stats.tutorials?.draft || 0} draft
                  </p>
                </CardContent>
              </Card>
            </div>

          </div>
        )}

        {/* Data Management Tabs */}
        {['users', 'artworks', 'tutorials'].includes(activeTab) && (
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={`Search ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-input rounded-md bg-background"
                    >
                      {getFilterOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {activeTab === 'tutorials' && (
                      <Button
                        onClick={openCreateTutorialModal}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Tutorial
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data List */}
            <Card>
              <CardHeader>
                                   <CardTitle>
                     {activeTab === 'users' && 'User Management'}
                     {activeTab === 'artworks' && 'Artwork Management'}
                     {activeTab === 'tutorials' && 'Tutorial Management'}
                   </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                                     {(() => {
                     const items = activeTab === 'users' ? users : 
                                  activeTab === 'artworks' ? artworks : tutorials;
                    
                    if (items.length === 0) {
                      return <p className="text-muted-foreground text-center py-8">No {activeTab} found</p>;
                    }

                                         if (activeTab === 'tutorials') {
                       return (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {items.map((tutorial) => (
                             <TutorialCard
                               key={tutorial._id}
                               tutorial={tutorial}
                               onView={(tutorial) => navigate(`/admin/tutorial/${tutorial._id}`)}
                                onEdit={(tutorial) => startEditTutorial(tutorial)}
                               onDelete={handleDelete}
                               onToggleStatus={handleTutorialStatusToggle}
                               isAdmin={true}
                             />
                           ))}
                         </div>
                       );
                     }

                     return items.map((item) => (
                       <div key={item.id || item._id} className="border rounded-lg p-4">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                               {activeTab === 'users' && <Users className="h-6 w-6 text-primary-foreground" />}
                               {activeTab === 'artworks' && <Palette className="h-6 w-6 text-primary-foreground" />}
                             </div>
                             <div>
                               <h4 className="font-medium">
                                 {activeTab === 'users' && `${item.firstName} ${item.lastName}`}
                                 {activeTab === 'artworks' && item.title}
                               </h4>
                               <p className="text-sm text-muted-foreground">
                                 {activeTab === 'users' && item.email}
                                 {activeTab === 'artworks' && item.artist?.username}
                               </p>
                               {activeTab === 'artworks' && <p className="text-sm text-muted-foreground">{item.description}</p>}
                             </div>
                           </div>
                           <div className="flex items-center gap-2">
                             {getStatusBadge(
                               activeTab === 'users' ? (item.isActive ? 'active' : 'inactive') :
                               (item.isPublic ? 'public' : 'private')
                             )}
                             <span className="text-sm text-muted-foreground">
                               {formatDate(item.createdAt)}
                             </span>
                           </div>
                         </div>

                         <div className="flex items-center gap-2 mt-4">
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => navigate(`/admin/${activeTab.slice(0, -1)}/${item.id || item._id}`)}
                             className="flex items-center gap-1"
                           >
                             <Eye className="h-4 w-4" />
                             View Details
                           </Button>



                           {activeTab === 'users' && (
                             <Button
                               variant={item.isActive ? "destructive" : "default"}
                               size="sm"
                               onClick={() => handleStatusUpdate(item._id, item.isActive ? 'inactive' : 'active')}
                               disabled={actionLoading === item._id}
                               className="flex items-center gap-1"
                             >
                               {actionLoading === item._id ? (
                                 <Loader2 className="h-4 w-4 animate-spin" />
                               ) : (
                                 item.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />
                               )}
                               {item.isActive ? 'Suspend' : 'Activate'}
                             </Button>
                           )}

                           {activeTab === 'artworks' && (
                             <Button
                               variant={item.isPublic ? "outline" : "default"}
                               size="sm"
                               onClick={() => handleStatusUpdate(item._id, item.isPublic ? 'private' : 'public')}
                               disabled={actionLoading === item._id}
                               className="flex items-center gap-1"
                             >
                               {actionLoading === item._id ? (
                                 <Loader2 className="h-4 w-4 animate-spin" />
                               ) : (
                                 item.isPublic ? <Shield className="h-4 w-4" /> : <Eye className="h-4 w-4" />
                               )}
                               {item.isPublic ? 'Make Private' : 'Make Public'}
                             </Button>
                           )}

                           <Button
                             variant="destructive"
                             size="sm"
                             onClick={() => handleDelete(item.id || item._id)}
                             disabled={actionLoading === (item.id || item._id)}
                             className="flex items-center gap-1"
                           >
                             {actionLoading === (item.id || item._id) ? (
                               <Loader2 className="h-4 w-4 animate-spin" />
                             ) : (
                               <Trash2 className="h-4 w-4" />
                             )}
                             Delete
                           </Button>
                         </div>
                       </div>
                     ));
                  })()}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}



        {/* Tutorial Creation Modal */}
        {showTutorialModal && (
          <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-card p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
              <h3 className="text-lg font-semibold mb-4">{isEditingTutorial ? 'Edit Tutorial' : 'Create New Tutorial'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={tutorialForm.title}
                    onChange={(e) => setTutorialForm({...tutorialForm, title: e.target.value})}
                    placeholder="Enter tutorial title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={tutorialForm.description}
                    onChange={(e) => setTutorialForm({...tutorialForm, description: e.target.value})}
                    placeholder="Enter tutorial description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    value={tutorialForm.content}
                    onChange={(e) => setTutorialForm({...tutorialForm, content: e.target.value})}
                    placeholder="Enter tutorial content"
                    rows={6}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <select
                      value={tutorialForm.category}
                      onChange={(e) => setTutorialForm({...tutorialForm, category: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="technique">Technique</option>
                      <option value="inspiration">Inspiration</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Difficulty</label>
                    <select
                      value={tutorialForm.difficulty}
                      onChange={(e) => setTutorialForm({...tutorialForm, difficulty: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Estimated Time (minutes)</label>
                    <Input
                      type="number"
                      value={tutorialForm.estimatedTime}
                      onChange={(e) => setTutorialForm({...tutorialForm, estimatedTime: parseInt(e.target.value)})}
                      placeholder="30"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={tutorialForm.isPublished}
                      onChange={(e) => setTutorialForm({...tutorialForm, isPublished: e.target.checked})}
                      className="rounded"
                    />
                    <label htmlFor="isPublished" className="text-sm font-medium">Publish immediately</label>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Tags (comma-separated)</label>
                  <Input
                    value={tutorialForm.tags}
                    onChange={(e) => setTutorialForm({...tutorialForm, tags: e.target.value})}
                    placeholder="digital art, painting, tutorial"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Materials (comma-separated)</label>
                  <Input
                    value={tutorialForm.materials}
                    onChange={(e) => setTutorialForm({...tutorialForm, materials: e.target.value})}
                    placeholder="canvas, brushes, paint"
                  />
                </div>

                {/* Thumbnail Upload */}
                <div>
                  <label className="text-sm font-medium">Tutorial Thumbnail</label>
                  <div className="space-y-2">
                    {tutorialForm.thumbnail ? (
                      <div className="relative">
                        <img 
                          src={tutorialForm.thumbnail.startsWith('http') ? tutorialForm.thumbnail : `http://localhost:5000${tutorialForm.thumbnail}`}
                          alt="Tutorial thumbnail"
                          className="w-full max-w-xs h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          onClick={() => setTutorialForm({...tutorialForm, thumbnail: ''})}
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handleTutorialThumbnailUpload(file);
                            }
                          }}
                          className="hidden"
                          id="tutorial-thumbnail"
                        />
                        <label 
                          htmlFor="tutorial-thumbnail"
                          className="text-sm text-gray-600 cursor-pointer hover:text-gray-800"
                        >
                          Click to upload thumbnail
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tutorial Steps */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium">Tutorial Steps</label>
                    <Button
                      type="button"
                      onClick={addStep}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Step
                    </Button>
                  </div>
                  
                  {tutorialForm.steps.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                      No steps added yet. Click "Add Step" to start building your tutorial.
                    </p>
                  )}

                  <div className="space-y-4">
                    {tutorialForm.steps.map((step) => (
                      <div key={step.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Step {step.order}</h4>
                          <Button
                            type="button"
                            onClick={() => removeStep(step.id)}
                            variant="destructive"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Minus className="h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium">Step Title</label>
                            <Input
                              value={step.title}
                              onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                              placeholder="e.g., Sketch the basic outline"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                              value={step.description}
                              onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                              placeholder="Describe how to complete this step..."
                              rows={3}
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Expected Output Image</label>
                            <div className="space-y-2">
                              {step.imageUrl ? (
                                <div className="relative">
                                  <img 
                                    src={`http://localhost:5000${step.imageUrl}`}
                                    alt={`Step ${step.order} output`}
                                    className="w-full max-w-xs h-32 object-cover rounded-lg"
                                  />
                                  <Button
                                    type="button"
                                    onClick={() => updateStep(step.id, 'imageUrl', '')}
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        handleImageUpload(file, step.id);
                                      }
                                    }}
                                    className="hidden"
                                    id={`step-image-${step.id}`}
                                  />
                                  <label 
                                    htmlFor={`step-image-${step.id}`}
                                    className="text-sm text-gray-600 cursor-pointer hover:text-gray-800"
                                  >
                                    Click to upload image
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button
                  onClick={isEditingTutorial ? handleUpdateTutorial : handleCreateTutorial}
                  disabled={actionLoading === 'tutorial'}
                  className="flex-1"
                >
                  {actionLoading === 'tutorial' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    isEditingTutorial ? 'Update Tutorial' : 'Create Tutorial'
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowTutorialModal(false);
                    setIsEditingTutorial(false);
                    setEditingTutorialId(null);
                    setTutorialForm({
                      title: '',
                      description: '',
                      content: '',
                      category: 'beginner',
                      difficulty: 'beginner',
                      estimatedTime: 30,
                      tags: '',
                      materials: '',
                      isPublished: false,
                      steps: []
                    });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 