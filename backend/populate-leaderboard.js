const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scamshield', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const sampleUsers = [
    {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        mobile: '9876543210',
        password: 'password123',
        firstName: 'Priya',
        lastName: 'Sharma',
        address: 'Mumbai, Maharashtra',
        aadharCard: '123456789012',
        role: 'user',
        reputation: 2450,
        contributions: {
            reports: 18,
            posts: 12,
            comments: 25,
            badges: 4
        },
        streak: {
            current: 12,
            lastActivity: new Date()
        },
        badges: [
            { name: 'Community Hero', description: 'Reached 500 reputation points', icon: '🦸', earnedAt: new Date() },
            { name: 'Week Warrior', description: '7 day activity streak', icon: '🔥', earnedAt: new Date() },
            { name: 'Active Contributor', description: 'Created 5 or more posts', icon: '💬', earnedAt: new Date() },
            { name: 'Rising Star', description: 'Reached 100 reputation points', icon: '🌟', earnedAt: new Date() }
        ]
    },
    {
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        mobile: '9876543211',
        password: 'password123',
        firstName: 'Rajesh',
        lastName: 'Kumar',
        address: 'Delhi, NCR',
        aadharCard: '123456789013',
        role: 'user',
        reputation: 2180,
        contributions: {
            reports: 15,
            posts: 10,
            comments: 20,
            badges: 3
        },
        streak: {
            current: 8,
            lastActivity: new Date()
        },
        badges: [
            { name: 'Week Warrior', description: '7 day activity streak', icon: '🔥', earnedAt: new Date() },
            { name: 'Active Contributor', description: 'Created 5 or more posts', icon: '💬', earnedAt: new Date() },
            { name: 'Rising Star', description: 'Reached 100 reputation points', icon: '🌟', earnedAt: new Date() }
        ]
    },
    {
        name: 'Ananya Patel',
        email: 'ananya@example.com',
        mobile: '9876543212',
        password: 'password123',
        firstName: 'Ananya',
        lastName: 'Patel',
        address: 'Ahmedabad, Gujarat',
        aadharCard: '123456789014',
        role: 'user',
        reputation: 1950,
        contributions: {
            reports: 14,
            posts: 8,
            comments: 18,
            badges: 3
        },
        streak: {
            current: 10,
            lastActivity: new Date()
        },
        badges: [
            { name: 'Week Warrior', description: '7 day activity streak', icon: '🔥', earnedAt: new Date() },
            { name: 'Active Contributor', description: 'Created 5 or more posts', icon: '💬', earnedAt: new Date() },
            { name: 'Rising Star', description: 'Reached 100 reputation points', icon: '🌟', earnedAt: new Date() }
        ]
    },
    {
        name: 'Vikram Singh',
        email: 'vikram@example.com',
        mobile: '9876543213',
        password: 'password123',
        firstName: 'Vikram',
        lastName: 'Singh',
        address: 'Pune, Maharashtra',
        aadharCard: '123456789015',
        role: 'user',
        reputation: 1720,
        contributions: {
            reports: 12,
            posts: 6,
            comments: 15,
            badges: 2
        },
        streak: {
            current: 6,
            lastActivity: new Date()
        },
        badges: [
            { name: 'Active Contributor', description: 'Created 5 or more posts', icon: '💬', earnedAt: new Date() },
            { name: 'Rising Star', description: 'Reached 100 reputation points', icon: '🌟', earnedAt: new Date() }
        ]
    },
    {
        name: 'Neha Gupta',
        email: 'neha@example.com',
        mobile: '9876543214',
        password: 'password123',
        firstName: 'Neha',
        lastName: 'Gupta',
        address: 'Bangalore, Karnataka',
        aadharCard: '123456789016',
        role: 'user',
        reputation: 1580,
        contributions: {
            reports: 11,
            posts: 5,
            comments: 12,
            badges: 2
        },
        streak: {
            current: 5,
            lastActivity: new Date()
        },
        badges: [
            { name: 'Active Contributor', description: 'Created 5 or more posts', icon: '💬', earnedAt: new Date() },
            { name: 'Rising Star', description: 'Reached 100 reputation points', icon: '🌟', earnedAt: new Date() }
        ]
    }
];

async function populateLeaderboard() {
    try {
        console.log('Starting to populate leaderboard data...');

        // Clear existing sample users
        await User.deleteMany({ email: { $in: sampleUsers.map(u => u.email) } });
        console.log('Cleared existing sample users');

        // Create new sample users
        for (const userData of sampleUsers) {
            const user = new User(userData);
            await user.save();
            console.log(`Created user: ${userData.name}`);
        }

        console.log('✅ Leaderboard data populated successfully!');
        console.log('You can now test the leaderboard feature in the Community page.');

    } catch (error) {
        console.error('❌ Error populating leaderboard data:', error);
    } finally {
        mongoose.connection.close();
    }
}

populateLeaderboard();
