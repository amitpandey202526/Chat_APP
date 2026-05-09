const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const seedAdmin = async () => {
  const existing = await Admin.findOne({
    email: process.env.ADMIN_EMAIL
  });

  if (!existing) {
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    await Admin.create({
      email: process.env.ADMIN_EMAIL,
      password: hashed
    });

    console.log('Default admin created');
  }
};

module.exports = seedAdmin;