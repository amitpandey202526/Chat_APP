const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedUser = async () => {
  const defaultUsers = [
    {
      name: 'Abhishek',
      email: process.env.DEFAULT_USER_EMAIL || 'abhisehk@gmail.com',
      password: process.env.DEFAULT_USER_PASSWORD || 'Abhishek@123'
    }
  ];

  for (const userData of defaultUsers) {
    const existing = await User.findOne({ email: userData.email });

    if (!existing) {
      const hashed = await bcrypt.hash(userData.password, 10);

      await User.create({
        name: userData.name,
        email: userData.email,
        password: hashed
      });

      console.log(`Default user created: ${userData.email}`);
    }
  }
};

module.exports = seedUser;