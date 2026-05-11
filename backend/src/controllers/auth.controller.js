const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { generateToken } = require('../utils/jwt');


//user register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({
        message: 'Email already exists'
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed
    });

    const token = generateToken({
      id: user._id,
      role: 'user'
    });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

    const token = generateToken({
      id: user._id,
      role: 'user'
    });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

    const valid = await bcrypt.compare(password, admin.password);

    if (!valid) {
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

    const token = generateToken({
      id: admin._id,
      role: 'admin'
    });

    res.json({ token, admin });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};