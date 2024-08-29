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
                default: Date.now,
                required: true
            },
            lastRevisedOn: {
                type: Date,
                default: null
            },
            revisionCount: {
                type: Number,
                default: 0,
                min: 0
            },
            additionalInfo: String,
        },
    ],
    token: {
        value: {
            type: String,
            nullable: true,
            default: null,
        },
        expiresIn: {
            type: Date,
            nullable: true,
            default: null,
        },
        attempts: {
            type: Number,
            default: 0,
            min: 0
        }
    },
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
    lockUntil: {
        type: Date,
        default: null,
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
    lastPasswordReset: Date,
    profilePic: {
        type: String,
        default: ''
    },
    dailyStudyCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    dailyReviseCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    resetToken: String,
    resetTokenExpiration: Date,
    verifyToken: String,
    verifyTokenExpiration: Date,
    purchaseData: {
        currentPlan: {
            type: String,
            required: true,
            enum: ['active', 'inactive',],
            default: 'inactive',
        },
        purchaseHistory: [
            {
                purchaseToken: {
                    value: {
                        type: String,
                        default: null,
                    },
                    expiresIn: {
                        type: Date,
                        default: null,
                    },
                },
                default: [],
            },
        ],
        default: {}
    }
},
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;