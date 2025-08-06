import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  User, 
  X, 
  MessageSquare,
  Mail,
  Star
} from 'lucide-react';

const NewConversationModal = ({ isOpen, onClose, onConversationCreated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:3000/api';

  useEffect(() => {
    if (isOpen) {
      fetchPotentialClients();
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = clients.filter(client => 
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.firstName && client.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.lastName && client.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  const fetchPotentialClients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/chat/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const users = await response.json();
        setClients(users);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load potential users');
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (clientId) => {
    try {
      setCreating(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: clientId })
      });

      if (response.ok) {
        const newChat = await response.json();
        onConversationCreated(newChat);
        onClose();
      } else {
        throw new Error('Failed to create conversation');
      }
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError('Failed to start conversation');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <Card className="relative w-full max-w-md shadow-2xl border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Start New Conversation
            </CardTitle>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Client List */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading clients...</p>
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No clients found</p>
                  <p className="text-xs text-gray-400">Clients will appear here after they interact with your services</p>
                </div>
              ) : (
                filteredClients.map((client) => (
                  <div
                    key={client._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {client.firstName && client.lastName 
                            ? `${client.firstName} ${client.lastName}`
                            : client.email
                          }
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {client.role} • {client.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => createConversation(client._id)}
                      disabled={creating}
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Chat
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Info */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 Tip: Clients who have inquired about your services or left reviews will appear here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewConversationModal; 