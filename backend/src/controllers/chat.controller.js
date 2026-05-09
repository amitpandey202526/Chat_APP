const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const msg = await Message.create({
      userId: req.user.id,
      senderType: 'user',
      message: req.body.message
    });

    global.io.to('admins').emit('message:receive', msg);

    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      userId: req.user.id
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};