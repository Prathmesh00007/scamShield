const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: "user",
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    aadharCard: {
        type: String,
        required: true,
        unique: true,
    },

    role: {
        type: String,
        enum: ['admin', 'authority', 'user'],
        default: "user",
    },
    profilePic: {
        type: String,
        required: false,
        default: null,
    },
    reportedEvents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Report',
        },
    ],
    notifications: [
        {
            text: {
                type: String,
            },
            incidentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Incident',
            }
        },
    ],
    // Leaderboard and reputation tracking
    reputation: {
        type: Number,
        default: 0,
    },
    contributions: {
        reports: {
            type: Number,
            default: 0,
        },
        posts: {
            type: Number,
            default: 0,
        },
        comments: {
            type: Number,
            default: 0,
        },
        badges: {
            type: Number,
            default: 0,
        },
    },
    streak: {
        current: {
            type: Number,
            default: 0,
        },
        lastActivity: {
            type: Date,
            default: Date.now,
        },
    },
    badges: [
        {
            name: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            earnedAt: {
                type: Date,
                default: Date.now,
            },
            icon: {
                type: String,
                default: '🏆',
            },
        },
    ],
});

module.exports = mongoose.model('User', userSchema);
