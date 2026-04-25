const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({}, 'name email role');
    console.log('--- Current Users ---');
    users.forEach(u => console.log(`[${u.role.toUpperCase()}] ${u.name} (${u.email})`));
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

listUsers();
