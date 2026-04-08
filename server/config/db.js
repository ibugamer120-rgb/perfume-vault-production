const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const uri = (process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/perfume-vault')
      .replace('mongodb://localhost', 'mongodb://127.0.0.1') // Force IPv4 on Windows
      .replace('mongodb.net/?appName', 'mongodb.net/perfume-vault?appName'); // inject DB name if missing

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      family: 4, // Force IPv4 — fixes Windows ECONNREFUSED ::1:27017
    });

    isConnected = true;
    console.log(`✅ MongoDB: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB Error: ${err.message}`);
    console.error('   → Local:  Make sure mongod is running');
    console.error('   → Atlas:  Check your MONGODB_URI in .env');
    process.exit(1);
  }
};

module.exports = connectDB;
