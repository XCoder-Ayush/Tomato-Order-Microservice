const mongoose = require('mongoose');
const ServerConfig = require('./server.config');

const connectToMongoInstance = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${ServerConfig.DB_URL}`);
    console.log(
      `\n MongoDB Connected !! DB Host : ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log('MongoDB Connection Failed ', error);
    process.exit(1);
  }
};

module.exports = connectToMongoInstance;
