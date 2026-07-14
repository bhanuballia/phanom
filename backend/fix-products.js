const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const fixProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/astrology');
        console.log('Connected to MongoDB');

        // Mappings based on presumed upload order
        const mappings = [
            { name: 'Manikya', imageUrl: '/uploads/product-1770285782635-343095272.jpg' },
            { name: 'Pukhraj', imageUrl: '/uploads/product-1770286009652-289369615.jpg' }
        ];

        for (const mapping of mappings) {
            const result = await Product.updateOne(
                { name: mapping.name },
                { $set: { imageUrl: mapping.imageUrl } }
            );
            console.log(`Updated ${mapping.name}: ${result.modifiedCount} document(s) changed`);
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixProducts();
