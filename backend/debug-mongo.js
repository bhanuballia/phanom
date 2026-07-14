require('dotenv').config();
const mongoose = require('mongoose');

const SHARD_HOST = 'ac-ypk5xgd-shard-00-00.msfazvd.mongodb.net';
// Reconstructing the URI logic from previous step
const standardUri = `mongodb://${process.env.MONGODB_URI.split('//')[1].split('@')[0]}@${SHARD_HOST}:27017/astrology?ssl=true&authSource=admin`;

mongoose.connect(standardUri)
    .then(async () => {
        console.log('✅ Connected!');
        try {
            const admin = mongoose.connection.db.admin();
            const info = await admin.command({ isMaster: 1 });
            console.log('Replica Set Name:', info.setName);
            console.log('Hosts:', info.hosts);
            process.exit(0);
        } catch (e) {
            console.error('Error getting replica set info:', e);
            process.exit(1);
        }
    })
    .catch(err => {
        console.log('❌ Connection Failed:', err.message);
        process.exit(1);
    });
