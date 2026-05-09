const Message = require('../models/Message');
const User = require('../models/User');

exports.getConversations = async (req, res) => {
  const users = await Message.aggregate([
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
  const messages = await Message.find({
    userId: req.params.userId
  }).sort({ createdAt: 1 });

  res.json(messages);
};

exports.reply = async (req, res) => {
  try {
    const msg = await Message.create({
      userId: req.params.userId,
      senderType: 'admin',
      message: req.body.message
    });

    global.io.to(req.params.userId).emit('message:receive', msg);

    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
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