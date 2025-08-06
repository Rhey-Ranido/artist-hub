import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import NewConversationModal from './NewConversationModal';
import { 
  MessageSquare, 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Info,
  ArrowLeft,
  User,
  Clock,
  CheckCheck,
  Check,
  Plus,
  Loader2,
  Paperclip,
  Smile,
  Image,
  File,
  Mic,
  Trash2,
  Edit,
  Reply,
  MoreHorizontal,
  Briefcase
} from 'lucide-react';

const MessageCenter = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [socket, setSocket] = useState(null);
  const [typing, setTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketError, setSocketError] = useState('');
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [providerSearchTerm, setProviderSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll when typing indicator appears/disappears
  useEffect(() => {
    scrollToBottom();
  }, [typing]);

  const API_BASE_URL = 'http://localhost:3000/api';

  useEffect(() => {
    // Get current user info and token
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      setError('Please log in to access messages');
      setLoading(false);
      return;
    }

    const initializeChat = async () => {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        
        // Initialize socket connection with error handling and reconnection
        const socketInstance = io('http://localhost:3000', {
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          auth: {
            token
          }
        });
        
        socketInstance.on('connect', () => {
          console.log('Socket connected successfully');
          setSocketConnected(true);
          setSocketError('');
          socketInstance.emit('setup', user);
        });

        socketInstance.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setSocketError('Unable to connect to chat server. Retrying...');
          setSocketConnected(false);
        });

        socketInstance.on('disconnect', () => {
          console.log('Socket disconnected');
          setSocketConnected(false);
        });
        
        socketInstance.on('connected', () => {
          if (selectedChat) {
            socketInstance.emit('join_chat', selectedChat._id);
          }
        });
        
        // Set up socket event handlers with proper user context
        socketInstance.on('message_received', (newMessage) => {
          console.log('📨 Received message:', newMessage.content, 'for chat:', newMessage.chat._id);
          console.log('Current selectedChat:', selectedChat?._id);
          console.log('Message sender:', newMessage.sender._id, 'Current user:', user.id);
          console.log('Available chats:', chats.map(c => ({ id: c._id, name: c.latestMessage?.content || 'No message' })));
          
          if (selectedChat && newMessage.chat._id === selectedChat._id) {
            console.log('✅ Adding message to current chat');
            setMessages(prev => {
              // Check if message already exists to prevent duplicates
              const messageExists = prev.some(msg => msg._id === newMessage._id);
              if (messageExists) {
                console.log('⚠️ Message already exists, skipping');
                return prev;
              }
              console.log('➕ Adding new message to chat');
              return [...prev, newMessage];
            });
          } else {
            // Check if this message is for a chat that the user has access to
            const targetChat = chats.find(chat => chat._id === newMessage.chat._id);
            if (targetChat) {
              console.log('🎯 Auto-selecting chat for incoming message');
              setSelectedChat(targetChat);
              // Add message to the newly selected chat
              setMessages([newMessage]);
            } else {
              console.log('📬 Message for different chat, updating unread count');
              // Increment unread count for other chats
              setUnreadCounts(prev => ({
                ...prev,
                [newMessage.chat._id]: (prev[newMessage.chat._id] || 0) + 1
              }));
            }
          }
          // Update chat list with new message
          setChats(prev => prev.map(chat => 
            chat._id === newMessage.chat._id 
              ? { ...chat, latestMessage: newMessage, updatedAt: newMessage.createdAt }
              : chat
          ));
        });
        
        socketInstance.on('typing', (userId) => {
          if (userId !== user.id) {
            setTypingUsers(prev => new Set([...prev, userId]));
            setTyping(true);
          }
        });
        socketInstance.on('stop_typing', (userId) => {
          if (userId !== user.id) {
            setTypingUsers(prev => {
              const newSet = new Set(prev);
              newSet.delete(userId);
              const hasOtherTyping = newSet.size > 0;
              if (!hasOtherTyping) {
                setTyping(false);
              }
              return newSet;
            });
          }
        });
        
        setSocket(socketInstance);
        
        // Fetch initial chats
        await fetchChats();
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError('Failed to initialize chat. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
      // Clear unread count for selected chat
      setUnreadCounts(prev => ({
        ...prev,
        [selectedChat._id]: 0
      }));
    }
  }, [selectedChat]);

  // Effect to join chat room when selectedChat changes
  useEffect(() => {
    if (socket && selectedChat) {
      socket.emit('join_chat', selectedChat._id);
    }
    
    // Cleanup function to leave previous chat room
    return () => {
      if (socket && selectedChat) {
        socket.emit('leave_chat', selectedChat._id);
      }
    };
  }, [socket, selectedChat]);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/chat`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setChats(data || []);
      } else if (response.status === 404) {
        // No chats found - this is normal for new users
        setChats([]);
      } else {
        throw new Error('Failed to fetch conversations');
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.');
      } else {
        setError('Failed to load conversations. Please try again.');
      }
      setChats([]); // Set empty array on error
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/message/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        throw new Error('Failed to fetch messages');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    console.log('🚀 Sending message. selectedChat:', selectedChat?._id, 'newMessage:', newMessage);
    if (!newMessage.trim()) {
      console.log('❌ No message content');
      return;
    }
    if (!selectedChat) {
      console.log('❌ No chat selected');
      setError('Please select a conversation first');
      return;
    }
    if (sending) {
      console.log('❌ Already sending');
      return;
    }
    
    // Check socket connection but don't block sending if it's just a warning
    if (!socketConnected) {
      console.warn('Socket not connected, but attempting to send message');
    }

    try {
      setSending(true);
      const token = localStorage.getItem('token');
      
      let response;
      if (editingMessage) {
        // Update existing message
        response = await fetch(`${API_BASE_URL}/message/${editingMessage._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: newMessage.trim()
          })
        });
      } else {
        // Send new message
        response = await fetch(`${API_BASE_URL}/message`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: newMessage.trim(),
            chatId: selectedChat._id,
            replyTo: replyToMessage?._id
          })
        });
      }

      if (response.ok) {
        const newMsg = await response.json();
        console.log('📤 Message sent successfully:', newMsg.content);
        
        if (editingMessage) {
          // Update existing message in the list
          setMessages(prev => prev.map(msg => 
            msg._id === editingMessage._id ? newMsg : msg
          ));
          setEditingMessage(null);
        } else {
          // Don't add message locally - let socket event handle it
          // This prevents duplicate messages when socket event is received
          setReplyToMessage(null);
        }
        
        setNewMessage('');
        
        // Update chat list with latest message
        setChats(prev => prev.map(chat => 
          chat._id === selectedChat._id 
            ? { ...chat, latestMessage: newMsg, updatedAt: newMsg.createdAt }
            : chat
        ));
        
        // Socket emission is now handled by the backend controller
      } else {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!selectedChat) return;
    
    if (!typingUsers.has(currentUser?.id)) {
      setTypingUsers(prev => new Set([...prev, currentUser?.id]));
      socket?.emit('typing', selectedChat._id);
    }
    
    const lastTypingTime = new Date().getTime();
    const timeLength = 3000;
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    const newTimeout = setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      
      if (timeDiff >= timeLength && typingUsers.has(currentUser?.id)) {
        socket?.emit('stop_typing', selectedChat._id);
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(currentUser?.id);
          return newSet;
        });
      }
    }, timeLength);
    
    setTypingTimeout(newTimeout);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const getOtherUser = (chat) => {
    return chat.users?.find(user => user._id !== currentUser?.id);
  };

  const handleNewConversation = (newChat) => {
    setChats(prev => [newChat, ...prev]);
    setSelectedChat(newChat);
  };

  const filteredChats = chats.filter(chat => {
    const otherUser = getOtherUser(chat);
    const searchLower = searchTerm.toLowerCase();
    return (
      otherUser?.firstName?.toLowerCase().includes(searchLower) ||
      otherUser?.lastName?.toLowerCase().includes(searchLower) ||
      otherUser?.email?.toLowerCase().includes(searchLower) ||
      chat.latestMessage?.content?.toLowerCase().includes(searchLower)
    );
  });

  const fetchProviders = async () => {
    try {
      setLoadingProviders(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/provider`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Map the provider data to match our component's expectations
        const formattedProviders = data.providers.map(provider => ({
          _id: provider.id,
          firstName: provider.name.split(' ')[0],
          lastName: provider.name.split(' ')[1] || '',
          services: provider.categories.map(category => ({ category }))
        }));
        setProviders(formattedProviders);
      } else {
        throw new Error('Failed to fetch providers');
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError('Failed to load providers. Please try again.');
    } finally {
      setLoadingProviders(false);
    }
  };

  const startConversationWithProvider = async (providerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: providerId })
      });

      if (response.ok) {
        const newChat = await response.json();
        setChats(prev => [newChat, ...prev]);
        setSelectedChat(newChat);
      } else {
        throw new Error('Failed to start conversation');
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError('Failed to start conversation. Please try again.');
    }
  };

  const filteredProviders = providers.filter(provider => {
    const searchLower = providerSearchTerm.toLowerCase();
    return (
      provider.firstName?.toLowerCase().includes(searchLower) ||
      provider.lastName?.toLowerCase().includes(searchLower) ||
      provider.email?.toLowerCase().includes(searchLower) ||
      provider.services?.some(service => 
        service.name.toLowerCase().includes(searchLower) ||
        service.category.toLowerCase().includes(searchLower)
      )
    );
  });

  // Update the return statement to handle loading and errors better
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error && !chats.length) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchChats}
              className="ml-4"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="relative">
      {socketError && (
        <div className="mb-4">
          <Alert variant="destructive">
            <AlertDescription>{socketError}</AlertDescription>
          </Alert>
        </div>
      )}
      
      {!selectedChat ? (
        <div className="space-y-6">
          {/* Header with New Chat Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Conversations</h2>
            </div>
            
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={fetchChats}
                  className="ml-4"
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Empty State with Provider Search */}
          {filteredChats.length === 0 && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Start Your First Conversation</h3>
                <p className="text-gray-600 mb-6">
                  Connect with service providers to discuss your needs or get expert advice.
                </p>
                
                {/* Provider Search Section */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search for providers by name or service..."
                      value={providerSearchTerm}
                      onChange={(e) => {
                        setProviderSearchTerm(e.target.value);
                        if (!providers.length) {
                          fetchProviders();
                        }
                      }}
                      className="pl-10"
                    />
                  </div>

                  {/* Provider List */}
                  <div className="border rounded-lg divide-y">
                    {loadingProviders ? (
                      <div className="p-4 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Loading providers...</p>
                      </div>
                    ) : providers.length === 0 ? (
                      <div className="p-6 text-center">
                        <Briefcase className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No providers found</p>
                      </div>
                    ) : (
                      filteredProviders.map((provider) => (
                        <div
                          key={provider._id}
                          className="p-4 flex items-center justify-between hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {provider.firstName} {provider.lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {provider.services?.map(s => s.category).join(', ')}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => startConversationWithProvider(provider._id)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Existing Chat List */}
          {filteredChats.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredChats.map((chat) => {
                const otherUser = getOtherUser(chat);
                const unreadCount = unreadCounts[chat._id] || 0;
                
                return (
                  <Card 
                    key={chat._id}
                    className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-primary-foreground" />
                        </div>
                        {unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900 truncate">
                            {otherUser?.firstName && otherUser?.lastName 
                              ? `${otherUser.firstName} ${otherUser.lastName}`
                              : otherUser?.email || 'Unknown User'
                            }
                          </h4>
                          <span className="text-xs text-gray-500">
                            {chat.latestMessage ? formatTime(chat.latestMessage.createdAt) : ''}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 truncate mb-2">
                          {chat.latestMessage?.content || 'No messages yet'}
                        </p>
                        
                        {/* Status indicators */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-gray-500">Online</span>
                          </div>
                          {chat.latestMessage && (
                            <div className="flex items-center space-x-1">
                              {chat.latestMessage.sender._id === currentUser?.id ? (
                                <CheckCheck className="h-3 w-3 text-blue-500" />
                              ) : (
                                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // Chat Window View
        <div className="h-[600px] sm:h-[600px] border rounded-lg overflow-hidden bg-white">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Chat List Sidebar - Hidden on mobile when chat is selected */}
            <div className={`flex flex-col w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-200 ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Conversations</h3>
                  <Button 
                    size="sm" 
                    onClick={() => setSelectedChat(null)}
                    variant="ghost"
                    className="lg:hidden"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto max-h-64 lg:max-h-none">
                {error && (
                  <Alert variant="destructive" className="m-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {filteredChats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h4>
                    <p className="text-gray-500 text-sm">
                      Start conversations with clients who are interested in your services
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredChats.map((chat) => {
                      const otherUser = getOtherUser(chat);
                      const isSelected = selectedChat?._id === chat._id;
                      
                      return (
                        <div
                          key={chat._id}
                          onClick={() => setSelectedChat(chat)}
                          className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                            isSelected ? 'bg-blue-50 lg:border-r-2 border-primary' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-primary-foreground" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {otherUser?.firstName && otherUser?.lastName 
                                    ? `${otherUser.firstName} ${otherUser.lastName}`
                                    : otherUser?.email || 'Unknown User'
                                  }
                                </p>
                                <p className="text-xs text-gray-500">
                                  {chat.latestMessage ? formatTime(chat.latestMessage.createdAt) : ''}
                                </p>
                              </div>
                              <p className="text-sm text-gray-500 truncate">
                                {chat.latestMessage?.content || 'No messages yet'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Messages - Full screen on mobile, normal on desktop */}
            <div className={`flex flex-col flex-1 h-full relative ${selectedChat ? 'flex' : 'hidden lg:flex'}`}>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button 
                      size="sm" 
                      onClick={() => setSelectedChat(null)}
                      variant="ghost"
                      className="lg:hidden"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getOtherUser(selectedChat)?.firstName && getOtherUser(selectedChat)?.lastName 
                          ? `${getOtherUser(selectedChat).firstName} ${getOtherUser(selectedChat).lastName}`
                          : getOtherUser(selectedChat)?.email || 'Unknown User'
                        }
                      </h3>
                      <p className="text-sm text-gray-500">Online</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="hidden sm:flex">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="hidden sm:flex">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages - Scrollable area with bottom padding for input */}
              <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 bg-gray-50 pb-20 sm:pb-4">
                {messages.map((message, index) => {
                  const isOwnMessage = message.sender._id === currentUser?.id;
                  const showDate = index === 0 || 
                    formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);
                  
                  return (
                    <div key={message._id}>
                      {showDate && (
                        <div className="flex justify-center mb-4">
                          <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                          isOwnMessage 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-white text-gray-900 border'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center justify-end mt-1 space-x-1 ${
                            isOwnMessage ? 'text-primary-foreground/70' : 'text-gray-500'
                          }`}>
                            <span className="text-xs">{formatTime(message.createdAt)}</span>
                            {isOwnMessage && (
                              <CheckCheck className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                                    {/* Typing Indicator */}
                    {typing && (
                      <div className="flex justify-start">
                        <div className="bg-white text-gray-900 px-4 py-2 rounded-lg border">
                          <div className="flex items-center space-x-1">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-xs text-gray-500 ml-2">typing...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Auto-scroll anchor */}
                    <div ref={messagesEndRef} />
                  </div>

              {/* Message Input - Fixed at bottom on mobile, normal on desktop */}
              <div className="p-2 sm:p-4 border-t border-gray-200 bg-white sm:flex-shrink-0 fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto sm:left-auto sm:right-auto">
                {selectedChat ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={handleTyping}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                      disabled={sending}
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={!newMessage.trim() || sending}
                      size="sm"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4 text-gray-500">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    <span className="text-sm">Select a conversation to start messaging</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onConversationCreated={handleNewConversation}
      />
    </div>
  );
};

export default MessageCenter; 