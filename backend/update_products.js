const mongoose = require('mongoose');
require('dotenv').config();

const updateProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Product = require('./models/Product');
    
    // Set premium prices and better demo images
    const updates = [
      {
        title: 'Premium React SaaS Template',
        price: 499,
        images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000'],
        demoUrl: 'https://react.dev',
        category: 'templates'
      },
      {
        title: 'Ultimate Node.js Course',
        price: 299,
        images: ['https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=1000'],
        demoUrl: 'https://nodejs.org',
        category: 'courses'
      },
      {
        title: 'Mastering AI Models',
        price: 899,
        images: ['https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000'],
        demoUrl: 'https://openai.com',
        category: 'software'
      }
    ];

    for (const item of updates) {
      await Product.findOneAndUpdate(
        { title: item.title }, 
        { $set: { 
            price: item.price, 
            images: item.images, 
            demoUrl: item.demoUrl,
            category: item.category 
          } 
        }
      );
    }

    console.log('Premium products updated successfully.');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

updateProducts();
