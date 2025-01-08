// runSeed.js
require('dotenv').config();
const mongoose = require('mongoose');
const { seedDatabase } = require('./seed');

const userIds = [
    '677e87c0aa6d6b6fb9913d1a',
    '677e89775f10f95688806cf0',
    '677e89a05f10f95688806cfb',
    '677bd4bc88aff69d5ba60a5b',
    '677bd9aa76581c9e90201a05',
    '677bdc30e0a843132571295b'
];

// Convert string IDs to MongoDB ObjectIds
const objectIds = userIds.map(id => new mongoose.Types.ObjectId(id));

// Run the seed
seedDatabase(objectIds)
    .then(() => {
        console.log('Seeding completed successfully!');
        process.exit(0);
    })
    .catch(error => {
        console.error('Error seeding database:', error);
        process.exit(1);
    });