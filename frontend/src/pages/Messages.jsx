import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, 
  Search, 
  Send, 
  Info,
  ArrowLeft,
  User,
  CheckCheck,
  Plus,
  Briefcase,
  Loader2,
  Image,
  X
} from 'lucide-react';

const Messages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const [socket, setSocket] = useState(null);
  const [typing, setTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const processedUrlParams = useRef(false);

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

  // Debug: Monitor messages state changes
  useEffect(() => {
    console.log('📊 Messages state updated. Count:', messages.length);
    console.log('📊 Latest message:', messages[messages.length - 1]?.content);
  }, [messages, forceUpdate]);

  const API_BASE_URL = 'http://localhost:5000/api';

  // Parse URL parameters
  const urlParams = new URLSearchParams(location.search);
  const chatIdFromUrl = urlParams.get('chat');
  const providerIdFromUrl = urlParams.get('provider');
  const userIdFromUrl = urlParams.get('user');
  const usernameFromUrl = urlParams.get('username');

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    setCurrentUser(user);
    
    // Initialize socket connection
    const socketInstance = io('http://localhost:5000');
    setSocket(socketInstance);
    
    socketInstance.emit('setup', user);
    socketInstance.on('connected', () => {
      console.log('✅ Socket connected');
    });
    
    socketInstance.on('connect', () => {
      console.log('✅ Socket connection established');
    });
    
    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });
    
            socketInstance.on('message_received', (newMessage) => {
          console.log('📨 Received message:', newMessage.content, 'for chat:', newMessage.chat._id);
          console.log('Current selectedChat:', selectedChat?._id);
          console.log('Message sender:', newMessage.sender._id, 'Current user:', currentUser?.id);
          console.log('Is own message:', newMessage.sender._id === currentUser?.id);
          
          // Check if this is for the currently selected chat or if we're creating a new conversation
          const isCurrentChat = selectedChat && newMessage.chat._id === selectedChat._id;
          const isOwnMessage = newMessage.sender._id === currentUser?.id;
          
          if (isCurrentChat || (isOwnMessage && !selectedChat)) {
            console.log('✅ Adding message to current chat');
            
            // Use a more explicit state update to ensure re-render
            setMessages(prevMessages => {
              console.log('Current messages count:', prevMessages.length);
              
              // Check if message already exists to prevent duplicates
              const messageExists = prevMessages.some(msg => msg._id === newMessage._id);
              if (messageExists) {
                console.log('⚠️ Message already exists, skipping');
                return prevMessages;
              }
              
              console.log('➕ Adding new message to chat. New count will be:', prevMessages.length + 1);
              const newMessages = [...prevMessages, newMessage];
              console.log('🔄 New messages array:', newMessages.map(m => m.content));
              
              // Force a re-render to ensure UI updates
              setTimeout(() => setForceUpdate(prev => prev + 1), 0);
              
              return newMessages;
            });
          } else {
            console.log('📬 Message for different chat, updating unread count');
            // Increment unread count for other chats
            setUnreadCounts(prev => ({
              ...prev,
              [newMessage.chat._id]: (prev[newMessage.chat._id] || 0) + 1
            }));
          }
          // Update chat list with new message
          setChats(prev => prev.map(chat => 
            chat._id === newMessage.chat._id 
              ? { ...chat, latestMessage: newMessage, updatedAt: newMessage.createdAt }
              : chat
          ));
        });
    
    socketInstance.on('typing', (userId) => {
      if (userId !== currentUser?.id) {
        setTypingUsers(prev => new Set([...prev, userId]));
        setTyping(true);
      }
    });
    socketInstance.on('stop_typing', (userId) => {
      if (userId !== currentUser?.id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
        // Only set typing to false if no other users are typing
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
    
    fetchChats();
    
    return () => {
      socketInstance.disconnect();
    };
  }, [navigate]);

  // Effect to handle URL parameters after chats are loaded
  useEffect(() => {
    // Prevent multiple processing of URL parameters
    if (processedUrlParams.current) {
      return;
    }
    
    if (chats.length > 0 && (chatIdFromUrl || providerIdFromUrl || userIdFromUrl)) {
      let targetChat = null;
      
      if (chatIdFromUrl) {
        targetChat = chats.find(chat => chat._id === chatIdFromUrl);
      } else if (providerIdFromUrl) {
        targetChat = chats.find(chat => 
          chat.users.some(user => user._id === providerIdFromUrl)
        );
      } else if (userIdFromUrl) {
        targetChat = chats.find(chat => 
          chat.users.some(user => user._id === userIdFromUrl)
        );
      }
      
      if (targetChat) {
        setSelectedChat(targetChat);
        fetchMessages(targetChat._id);
        processedUrlParams.current = true;
      } else if (userIdFromUrl) {
        // Create new conversation with the user
        startConversationWithUser(userIdFromUrl);
        processedUrlParams.current = true;
      }
    } else if (userIdFromUrl && chats.length === 0) {
      // If no chats exist yet, create new conversation
      startConversationWithUser(userIdFromUrl);
      processedUrlParams.current = true;
    }
  }, [chats, chatIdFromUrl, providerIdFromUrl, userIdFromUrl, usernameFromUrl]);

  // Effect to join chat room when selectedChat changes
  useEffect(() => {
    if (socket && selectedChat) {
      console.log('🔗 Joining chat room:', selectedChat._id);
      socket.emit('join_chat', selectedChat._id);
    }
    
    // Cleanup function to leave previous chat room
    return () => {
      if (socket && selectedChat) {
        console.log('🔗 Leaving chat room:', selectedChat._id);
        socket.emit('leave_chat', selectedChat._id);
      }
    };
  }, [socket, selectedChat]);

  useEffect(() => {
    console.log('🔄 selectedChat changed to:', selectedChat?._id);
    if (selectedChat) {
      fetchMessages(selectedChat._id);
      // Clear unread count for selected chat
      setUnreadCounts(prev => ({
        ...prev,
        [selectedChat._id]: 0
      }));
    }
  }, [selectedChat]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
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
        
        // If we have a provider ID from URL and no existing chat, create one
        if (providerIdFromUrl && data && data.length > 0) {
          const existingChat = data.find(chat => 
            chat.users.some(user => user._id === providerIdFromUrl)
          );
          
          if (!existingChat) {
            // Create a new chat with the provider
            await startConversationWithProvider(providerIdFromUrl);
          }
        }
      } else if (response.status === 404) {
        // No chats found - this is normal for new users
        setChats([]);
        
        // If we have a provider ID from URL, create a new chat
        if (providerIdFromUrl) {
          await startConversationWithProvider(providerIdFromUrl);
        }
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
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      // Validate that chatId is a valid MongoDB ObjectId
      if (!chatId || typeof chatId !== 'string' || chatId.length !== 24) {
        console.error('Invalid chatId:', chatId);
        setError('Invalid chat ID');
        return;
      }
      
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
    if (!newMessage.trim() && !selectedImage) {
      console.log('❌ No message content or image');
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
    if (!socket?.connected) {
      console.log('❌ Socket not connected');
      setError('Connection lost. Please refresh the page.');
      return;
    }

    try {
      setSending(true);
      setError(''); // Clear any previous errors
      const token = localStorage.getItem('token');
      
      let messageData = {
          chatId: selectedChat._id
        };
      
      // If there's an image, upload it first
      if (selectedImage) {
        const imageUrl = await uploadImage();
        if (!imageUrl) {
          setError('Failed to upload image');
          return;
        }
        messageData.imageUrl = imageUrl;
      }
      
      // If there's text content, add it
      if (newMessage.trim()) {
        messageData.content = newMessage.trim();
      }
      
      const response = await fetch(`${API_BASE_URL}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const newMsg = await response.json();
        console.log('📤 Message sent successfully:', newMsg.content || 'Image message');
        setNewMessage('');
        
        // Clear image selection if present
        if (selectedImage) {
          removeSelectedImage();
        }
        
        // Add message locally as fallback in case socket event doesn't arrive
        setMessages(prevMessages => {
          // Check if message already exists to prevent duplicates
          const messageExists = prevMessages.some(msg => msg._id === newMsg._id);
          if (messageExists) {
            return prevMessages;
          }
          return [...prevMessages, newMsg];
        });
        
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
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      setError(''); // Clear any previous errors
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (document.getElementById('imageInput')) {
      document.getElementById('imageInput').value = '';
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return null;
    
    try {
      setUploadLoading(true);
      setError(''); // Clear any previous errors
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', selectedImage);
      
      const response = await fetch(`${API_BASE_URL}/upload/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.imageUrl;
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image');
      return null;
    } finally {
      setUploadLoading(false);
    }
  };

  const sendImageMessage = async () => {
    if (!selectedImage || !selectedChat) return;
    
    try {
      setSending(true);
      setError(''); // Clear any previous errors
      const imageUrl = await uploadImage();
      
      if (!imageUrl) {
        setError('Failed to upload image');
        return;
      }
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
          chatId: selectedChat._id
        })
      });
      
      if (response.ok) {
        const newMsg = await response.json();
        console.log('📤 Image message sent successfully');
        
        // Add message locally
        setMessages(prevMessages => {
          const messageExists = prevMessages.some(msg => msg._id === newMsg._id);
          if (messageExists) {
            return prevMessages;
          }
          return [...prevMessages, newMsg];
        });
        
        // Update chat list with latest message
        setChats(prev => prev.map(chat => 
          chat._id === selectedChat._id 
            ? { ...chat, latestMessage: newMsg, updatedAt: newMsg.createdAt }
            : chat
        ));
        
        // Clear image selection
        removeSelectedImage();
      } else {
        throw new Error('Failed to send image message');
      }
    } catch (err) {
      console.error('Error sending image message:', err);
      setError('Failed to send image message');
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

  const startConversationWithProvider = async (providerId, serviceId = null, initialMessage = null) => {
    try {
      const token = localStorage.getItem('token');
      
      // Get service info from URL if available
      const serviceIdFromUrl = urlParams.get('serviceId');
      const serviceTitleFromUrl = urlParams.get('serviceTitle');
      
      const requestBody = {
        userId: providerId,
        serviceId: serviceId || serviceIdFromUrl,
        initialMessage: initialMessage || (serviceTitleFromUrl ? 
          `Hi! I'm interested in your "${serviceTitleFromUrl}" service. Can you tell me more about it?` : 
          null
        )
      };

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const newChat = await response.json();
        setChats(prev => [newChat, ...prev]);
        setSelectedChat(newChat);
        
        // Clear URL parameters after successful chat creation
        if (serviceIdFromUrl || serviceTitleFromUrl) {
          navigate('/messages', { replace: true });
        }
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError('Failed to start conversation');
    }
  };

  const startConversationWithUser = async (userId) => {
    // Prevent multiple calls
    if (creatingConversation) {
      return;
    }
    
    try {
      setCreatingConversation(true);
      const token = localStorage.getItem('token');
      
      // Check if conversation already exists
      const existingChat = chats.find(chat => 
        chat.users.some(user => user._id === userId)
      );
      
      if (existingChat) {
        setSelectedChat(existingChat);
        fetchMessages(existingChat._id);
        navigate('/messages', { replace: true });
        return;
      }
      
      const requestBody = {
        userId: userId
      };

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const newChat = await response.json();
        setChats(prev => [newChat, ...prev]);
        setSelectedChat(newChat);
        
        // Clear URL parameters after successful chat creation
        navigate('/messages', { replace: true });
      }
    } catch (err) {
      console.error('Error starting conversation with user:', err);
      setError('Failed to start conversation');
    } finally {
      setCreatingConversation(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (selectedImage) {
        sendImageMessage();
      } else {
        sendMessage();
      }
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



  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {!selectedChat ? (
            // Chat Boxes View
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
                  <h2 className="text-xl font-semibold text-gray-900">Your Conversations</h2>
                </div>
                
                <div className="flex items-center gap-2">
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
              </div>



              {/* Error Display */}
              {error && (
                <div className="col-span-full mb-6">
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
              )}

              {/* Chat Boxes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {loading ? (
                  // Loading state
                  <div className="col-span-full">
                    <div className="text-center py-12">
                      <div className="inline-flex items-center space-x-2 mb-4">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600">Loading conversations...</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {Array.from({ length: 8 }).map((_, index) => (
                          <Card key={index} className="p-4 animate-pulse">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : filteredChats.length === 0 ? (
                  // Empty state
                  <div className="col-span-full text-center py-12">
                    <div className="max-w-md mx-auto">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="h-10 w-10 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">No Conversations Yet</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        You haven't started any conversations yet. Connect with service providers to get help with your projects, ask questions, or discuss your requirements.
                      </p>
                      <div className="space-y-3">
                      </div>
                    </div>
                  </div>
                ) : (
                  // Chat boxes
                  filteredChats.map((chat) => {
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
                              {chat.latestMessage?.imageUrl ? (
                                <span className="flex items-center">
                                  <Image className="h-3 w-3 mr-1" />
                                  Image
                                </span>
                              ) : (
                                chat.latestMessage?.content || 'No messages yet'
                              )}
                            </p>
                            
                            {/* Status indicators */}
                            <div className="flex items-center justify-between">
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
                  })
                )}
              </div>
            </div>
          ) : (
            // Chat Window View
            <div className="h-[600px] sm:h-[600px] border rounded-lg overflow-hidden bg-white shadow-sm">
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
                          Start conversations with providers who are interested in your services
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
                              onClick={() => {
                            console.log('🎯 Selecting chat:', chat._id);
                            setSelectedChat(chat);
                          }}
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
                                    {chat.latestMessage?.imageUrl ? (
                                      <span className="flex items-center">
                                        <Image className="h-3 w-3 mr-1" />
                                        Image
                                      </span>
                                    ) : (
                                      chat.latestMessage?.content || 'No messages yet'
                                    )}
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
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                      </div>
                    </div>
                  </div>

                  {/* Messages - Scrollable area with bottom padding for input */}
                  <div 
                    key={`messages-${messages.length}-${forceUpdate}`}
                    className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 bg-gray-50 pb-20 sm:pb-4"
                  >
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
                              {message.imageUrl ? (
                                <div className="mb-2">
                                  <img 
                                    src={message.imageUrl} 
                                    alt="Chat image" 
                                    className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(message.imageUrl, '_blank')}
                                  />
                                </div>
                              ) : null}
                              {message.content && (
                                <p className="text-sm">{message.content}</p>
                              )}
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
                      <div className="space-y-3">
                        {/* Image Preview */}
                        {imagePreview && (
                          <div className="relative inline-block">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="max-h-20 rounded-lg border"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                              onClick={removeSelectedImage}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        
                        {/* Input Row */}
                        <div className="flex items-center space-x-2">
                          {/* Hidden file input */}
                          <input
                            id="imageInput"
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                          
                          {/* Image upload button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('imageInput').click()}
                            disabled={sending || uploadLoading}
                            className="flex-shrink-0"
                          >
                            <Image className="h-4 w-4" />
                          </Button>
                          
                          {/* Text input */}
                          <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={handleTyping}
                            onKeyPress={handleKeyPress}
                            className="flex-1"
                            disabled={sending}
                          />
                          
                          {/* Send button */}
                          <Button 
                            onClick={selectedImage ? sendImageMessage : sendMessage} 
                            disabled={(!newMessage.trim() && !selectedImage) || sending || uploadLoading}
                            size="sm"
                            className="min-w-[80px]"
                          >
                            {sending || uploadLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : selectedImage ? (
                              'Send Image'
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
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
        </div>
      </div>
    </div>
  );
};

export default Messages; 