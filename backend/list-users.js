require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const users = await User.find({}, 'name email role');
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- ${u.name} (${u.email}) [${u.role}]`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
    }
};

listUsers();
