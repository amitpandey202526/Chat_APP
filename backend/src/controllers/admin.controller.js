const Message = require('../models/Message');
const User = require('../models/User');

exports.getConversations = async (req, res) => {

  // Aggregate messages to get latest message and unread count for each user
  const users = await Message.aggregate([
    // Group messages by userId to get latest message and count of unread messages for admins
    {
      $group: {
        _id: '$userId',
        latestMessage: { $last: '$message' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$senderType', 'user'] },
                  { $eq: ['$isRead', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  res.json(users);
};

exports.getConversation = async (req, res) => {
  // Fetch all messages for the specified user
  const messages = await Message.find({
    userId: req.params.userId
  }).sort({ createdAt: 1 });

  res.json(messages);
};

exports.reply = async (req, res) => {
  // Create a new message from the admin to the user
  try {

    const msg = await Message.create({
      userId: req.params.userId,
      senderType: 'admin',
      message: req.body.message
    });
    console.log('Admin sent message to user:', `user:${String(req.params.userId)}`);
    global.io.to(`user:${String(req.params.userId)}`).emit('message:receive', msg); // admin to User room

    res.json(msg);
  } catch (err) {
    console.log('Error sending message:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  // Mark all messages from the user as read by the admin
  try {
    await Message.updateMany({
      userId: req.params.userId,
      senderType: 'user'
    }, {
      isRead: true
    });

    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};