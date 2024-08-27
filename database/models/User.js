const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    studies: [
        {
            topic: {
                type: String,
                required: true
            },
            subject: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                required: true
            },
            lastRevisedOn: {
                type: Date,
                required: true
            },
            revisionCount: {
                type: Number,
                default: 0,
                min: 0
            },
            additionalInfo: String
        },
    ],
    tokens: [
        {
            token: {
                type: String,
                required: true
            },
            expiresIn: {
                type: Date,
                required: true
            }
        }
    ],
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false,
    },
    studyPoints: {
        type: Number,
        default: 0,
        min: 0,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
    lastPasswordReset: Date,
    profilePic: String,
    resetToken: String,
    resetTokenExpiration: Date,
    verifyToken: String,
    verifyTokenExpiration: Date,
    lockUntil: Date,
},
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;