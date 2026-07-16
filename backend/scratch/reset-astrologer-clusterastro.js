const mongoose = require('mongoose');
const User = require('../models/User');

const reset = async () => {
  const uris = [
    'mongodb+srv://singhdevesh2k:Bhanu361@clusterastro.msfazvd.mongodb.net/astrology',
    'mongodb+srv://singhdevesh2k:Bhanu361@clusterastro.msfazvd.mongodb.net/test',
    'mongodb+srv://singhdevesh2k:Bhanu361@clusterastro.msfazvd.mongodb.net/'
  ];

  for (const uri of uris) {
    try {
      console.log(`Connecting to: ${uri}`);
      await mongoose.connect(uri);
      console.log('Connected successfully!');

      const email = 'hony@astroconsult.com';
      const user = await User.findOne({ email });
      if (user) {
        console.log(`Found user in this database: ${user.email}`);
        user.password = 'password123';
        await user.save();
        console.log(`Password reset successfully to "password123"`);
        await mongoose.connection.close();
        break;
      } else {
        console.log(`User not found in this database.`);
      }
      await mongoose.connection.close();
    } catch (err) {
      console.error(`Failed for URI ${uri}:`, err.message);
    }
  }
};

reset();
