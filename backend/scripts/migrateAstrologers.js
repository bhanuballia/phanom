const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Astrologer = require('../models/Astrologer');

const migrate = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in env variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully!');

    // Find all users with role 'astrologer'
    const astrologers = await User.find({ role: 'astrologer' });
    console.log(`Found ${astrologers.length} astrologers in 'users' collection.`);

    let createdCount = 0;
    let updatedCount = 0;

    for (const user of astrologers) {
      // Check if Astrologer profile already exists
      let profile = await Astrologer.findOne({ userId: user._id });

      if (!profile) {
        // Create new profile using data from user document
        profile = new Astrologer({
          userId: user._id,
          phone: user.phone || '',
          specialization: user.specialization || [],
          experience: user.experience || 0,
          languages: user.languages || ['Hindi', 'English'],
          bio: user.bio || '',
          pricing: user.pricing || 100,
          rating: user.rating || 0,
          totalReviews: user.totalReviews || 0,
          isAvailable: user.isAvailable !== false
        });

        await profile.save();
        createdCount++;
        console.log(`Created new Astrologer profile for: ${user.name}`);
      } else {
        console.log(`Astrologer profile already exists for: ${user.name}`);
      }

      // Link User to the Astrologer profile
      if (!user.astrologerProfile || !user.astrologerProfile.equals(profile._id)) {
        user.astrologerProfile = profile._id;
        await user.save();
        updatedCount++;
        console.log(`Linked User record for ${user.name} to profile ID: ${profile._id}`);
      }
    }

    console.log(`Migration complete!`);
    console.log(`Created: ${createdCount} profiles`);
    console.log(`Linked: ${updatedCount} users`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

migrate();
