const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const checkProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/astrology');
        console.log('Connected to MongoDB');

        const products = await Product.find({});
        console.log(`Found ${products.length} products:`);

        products.forEach(p => {
            console.log(`- ${p.name}: imageUrl = ${p.imageUrl || 'MISSING'}`);
        });

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkProducts();
