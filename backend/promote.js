const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const promote = async (email) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to MongoDB. Promoting ${email} to admin...`);

    const user = await User.findOneAndUpdate(
      { email: email },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log(`Success! ${user.name} is now an ADMIN.`);
    } else {
      console.log(`Error: User with email ${email} not found.`);
    }
    process.exit();
  } catch (error) {
    console.error('Promotion failed:', error);
    process.exit(1);
  }
};

const emailToPromote = process.argv[2] || 'seller@gmail.com';
promote(emailToPromote);
