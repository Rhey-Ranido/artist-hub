import Chat from "../models/Chat.js";
import User from "../models/User.js";
import Message from "../models/Message.js";

export const accessChat = async (req, res) => {
  const { userId, serviceId, initialMessage } = req.body;
  
  console.log('accessChat called with:', {
    userId,
    serviceId,
    initialMessage: initialMessage ? 'present' : 'not present',
    user: req.user ? { id: req.user._id, email: req.user.email } : 'no user'
  });
  
  if (!userId) {
    console.error('Missing userId in request body');
    return res.status(400).json({ message: "UserId is required" });
  }

  try {
    // Verify the other user exists
    console.log('Looking for user with ID:', userId);
    const otherUser = await User.findById(userId).select('-password');
    if (!otherUser) {
      console.error('User not found with ID:', userId);
      return res.status(404).json({ message: "User not found" });
    }
    console.log('Found user:', { id: otherUser._id, name: `${otherUser.firstName} ${otherUser.lastName}` });

    let chat = await Chat.findOne({
      users: { $all: [req.user._id, userId], $size: 2 },
    })
      .populate("users", "firstName lastName email profileImageUrl")
      .populate("latestMessage");

    if (chat) {
      console.log('Existing chat found:', chat._id);
      // If chat exists and there's an initial message, add it
      if (initialMessage) {
        console.log('Adding initial message to existing chat');
        const newMessage = await Message.create({
          sender: req.user._id,
          content: initialMessage,
          chat: chat._id,
        });

        // Populate the message with sender info
        const populatedMessage = await newMessage.populate("sender", "firstName lastName email profileImageUrl");
        
        // Update chat with latest message
        await Chat.findByIdAndUpdate(chat._id, { 
          latestMessage: newMessage._id,
          updatedAt: new Date()
        });

        // Return updated chat
        const updatedChat = await Chat.findById(chat._id)
          .populate("users", "firstName lastName email profileImageUrl")
          .populate("latestMessage");
        
        console.log('Chat updated with new message');
        return res.status(200).json(updatedChat);
      }
      
      return res.status(200).json(chat);
    }

    // Create new chat
    console.log('Creating new chat with serviceId:', serviceId);
    const newChat = await Chat.create({ 
      users: [req.user._id, userId],
      serviceId: serviceId || null // Store service ID if provided
    });
    
    const fullChat = await Chat.findById(newChat._id)
      .populate("users", "firstName lastName email profileImageUrl");
    
    // If there's an initial message, create it
    if (initialMessage) {
      console.log('Creating initial message for new chat');
      const newMessage = await Message.create({
        sender: req.user._id,
        content: initialMessage,
        chat: newChat._id,
      });

      // Populate the message with sender info
      const populatedMessage = await newMessage.populate("sender", "firstName lastName email profileImageUrl");
      
      // Update chat with latest message
      await Chat.findByIdAndUpdate(newChat._id, { 
        latestMessage: newMessage._id,
        updatedAt: new Date()
      });

      // Return updated chat
      const updatedChat = await Chat.findById(newChat._id)
        .populate("users", "firstName lastName email profileImageUrl")
        .populate("latestMessage");
      
      console.log('New chat created with initial message');
      return res.status(201).json(updatedChat);
    }
    
    console.log('New chat created without initial message');
    res.status(201).json(fullChat);
  } catch (err) {
    console.error("Error in accessChat:", err);
    res.status(500).json({ 
      message: "Failed to create or access chat",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

export const fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user._id })
      .populate("users", "firstName lastName email profileImageUrl")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "firstName lastName email profileImageUrl"
        }
      })
      .sort({ updatedAt: -1 });

    // If no chats found, return empty array with 200 status
    if (!chats || chats.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(chats);
  } catch (err) {
    console.error("Error in fetchChats:", err);
    res.status(500).json({ 
      message: "Failed to fetch chats",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Get potential users for starting conversations
export const getPotentialUsers = async (req, res) => {
  try {
    const currentUser = req.user;
    
    // Get users based on role
    let query = { _id: { $ne: currentUser._id } };
    
    if (currentUser.role === 'provider') {
      // Providers can chat with clients
      query.role = 'client';
    } else if (currentUser.role === 'client') {
      // Clients can chat with providers
      query.role = 'provider';
    }

    const users = await User.find(query)
      .select('firstName lastName email role profileImageUrl')
      .limit(20)
      .sort({ createdAt: -1 });

    // If no users found, return empty array with 200 status
    if (!users || users.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(users);
  } catch (err) {
    console.error("Error in getPotentialUsers:", err);
    res.status(500).json({ 
      message: "Failed to fetch users",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};
