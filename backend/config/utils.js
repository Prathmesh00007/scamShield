const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.generateToken = (userId, res) => {
    // Generate JWT token
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: true,       // HTTPS only
        sameSite: 'none',   // cross-site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 day
    });

    return token;
};

// Reputation and contribution tracking utilities
exports.updateUserReputation = async (userId, points, activityType) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        // Update reputation
        user.reputation += points;

        // Update contributions based on activity type
        switch (activityType) {
            case 'post':
                user.contributions.posts += 1;
                break;
            case 'comment':
                user.contributions.comments += 1;
                break;
            case 'report':
                user.contributions.reports += 1;
                break;
            case 'badge':
                user.contributions.badges += 1;
                break;
        }

        // Update streak
        const today = new Date();
        const lastActivity = new Date(user.streak.lastActivity);
        const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
            // Consecutive day
            user.streak.current += 1;
        } else if (daysDiff > 1) {
            // Streak broken
            user.streak.current = 1;
        }
        // If daysDiff === 0, it's the same day, don't update streak

        user.streak.lastActivity = today;

        // Award badges based on achievements
        await awardBadges(user);

        await user.save();
    } catch (error) {
        console.error('Error updating user reputation:', error);
    }
};

const awardBadges = async (user) => {
    const badges = [];

    // First post badge
    if (user.contributions.posts === 1 && !user.badges.some(b => b.name === 'First Post')) {
        badges.push({
            name: 'First Post',
            description: 'Created your first community post',
            icon: '📝'
        });
    }

    // Active contributor badge
    if (user.contributions.posts >= 5 && !user.badges.some(b => b.name === 'Active Contributor')) {
        badges.push({
            name: 'Active Contributor',
            description: 'Created 5 or more posts',
            icon: '💬'
        });
    }

    // Streak badges
    if (user.streak.current >= 7 && !user.badges.some(b => b.name === 'Week Warrior')) {
        badges.push({
            name: 'Week Warrior',
            description: '7 day activity streak',
            icon: '🔥'
        });
    }

    if (user.streak.current >= 30 && !user.badges.some(b => b.name === 'Monthly Master')) {
        badges.push({
            name: 'Monthly Master',
            description: '30 day activity streak',
            icon: '⭐'
        });
    }

    // Reputation badges
    if (user.reputation >= 100 && !user.badges.some(b => b.name === 'Rising Star')) {
        badges.push({
            name: 'Rising Star',
            description: 'Reached 100 reputation points',
            icon: '🌟'
        });
    }

    if (user.reputation >= 500 && !user.badges.some(b => b.name === 'Community Hero')) {
        badges.push({
            name: 'Community Hero',
            description: 'Reached 500 reputation points',
            icon: '🦸'
        });
    }

    // Add new badges to user
    if (badges.length > 0) {
        user.badges.push(...badges);
        await user.save();
    }
};