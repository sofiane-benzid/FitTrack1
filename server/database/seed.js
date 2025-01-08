require('dotenv').config();
const mongoose = require('mongoose');
const { generateDummyData } = require('./seedData');

// Import models
const Activity = require('../models/Activity');
const Meal = require('../models/Meal');
const { Friendship } = require('../models/Social');
const { Points, Badge } = require('../models/Gamification');

const seedDatabase = async (userIds) => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Generate dummy data
        const data = generateDummyData(userIds);

        // Clear existing data
        await Promise.all([
            Activity.deleteMany({ user: { $in: userIds } }),
            Meal.deleteMany({ user: { $in: userIds } }),
            Friendship.deleteMany({
                $or: [
                    { requester: { $in: userIds } },
                    { recipient: { $in: userIds } }
                ]
            }),
            Points.deleteMany({ user: { $in: userIds } }),
            Badge.deleteMany({ user: { $in: userIds } })
        ]);

        // Insert new data
        await Promise.all([
            Activity.insertMany(data.activities),
            Meal.insertMany(data.meals),
            Friendship.insertMany(data.friendships),
            Points.insertMany(data.points),
            Badge.insertMany(data.badges)
        ]);

        console.log('Database seeded successfully!');
        console.log(`Created:
      - ${data.activities.length} activities
      - ${data.meals.length} meals
      - ${data.friendships.length} friendships
      - ${data.points.length} points records
      - ${data.badges.length} badges`);

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
    }
};

// Example usage:
// After creating your users, get their IDs and run:
// seedDatabase(['user1Id', 'user2Id', 'user3Id']);

module.exports = { seedDatabase };