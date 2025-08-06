import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import User from "../models/User.js";

export const allMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    
    // Validate chat exists and user is a member
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    if (!chat.users.includes(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to access this chat" });
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "firstName lastName email profileImageUrl")
      .populate({
        path: "chat",
        populate: {
          path: "users",
          select: "firstName lastName email profileImageUrl"
        }
      })
      .sort({ createdAt: 1 }); // Sort messages by creation time

    res.status(200).json(messages);
  } catch (err) {
    console.error("Error in allMessages:", err);
    res.status(500).json({ 
      message: "Fetching messages failed",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

export const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).json({ 
      message: "Invalid data",
      errors: {
        content: !content ? "Message content is required" : null,
        chatId: !chatId ? "Chat ID is required" : null
      }
    });
  }

  try {
    // Validate chat exists and user is a member
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    if (!chat.users.includes(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to send messages in this chat" });
    }

    let message = await Message.create({
      sender: req.user._id,
      content: content.trim(),
      chat: chatId,
    });

    message = await message.populate([
      {
        path: "sender",
        select: "firstName lastName email profileImageUrl"
      },
      {
        path: "chat",
        populate: {
          path: "users",
          select: "firstName lastName email profileImageUrl"
        }
      }
    ]);

    await Chat.findByIdAndUpdate(chatId, { 
      latestMessage: message._id,
      updatedAt: new Date()
    });

    // Emit socket event for real-time messaging
    if (req.io) {
      console.log(`📤 Broadcasting message to chat ${chatId}:`, message.content);
      console.log(`📤 Message sender: ${message.sender._id}, Message ID: ${message._id}`);
      
      // Get the room and emit to all users in the chat
      const room = req.io.sockets.adapter.rooms.get(chatId);
      console.log(`📤 Users in room ${chatId}:`, room ? room.size : 0);
      
      req.io.to(chatId).emit("message_received", message);
    } else {
      console.log("❌ req.io is not available for broadcasting");
    }

    res.status(201).json(message);
  } catch (err) {
    console.error("Error in sendMessage:", err);
    res.status(500).json({ 
      message: "Sending message failed",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};
