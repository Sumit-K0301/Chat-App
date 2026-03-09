import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema(
    {
        fullname: {
            type: String,
            trim: true,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            unique: true,
            lowercase: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        profilePic: {
            type: String,
            default: null,
        },
        bio: {
            type: String,
            trim: true,
            maxlength: 200,
            default: '',
        },
        theme: {
            type: String,
            enum: ['dark', 'light'],
            default: 'dark',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationToken: {
            type: String,
            default: null,
        },
        verificationTokenExpiry: {
            type: Date,
            default: null,
        },
        resetPasswordToken: {
            type: String,
            default: null,
        },
        resetPasswordTokenExpiry: {
            type: Date,
            default: null,
        },
        pushSubscription: {
            type: Object,
            default: null,
        },
    }, { timestamps: true });

userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

// Exclude password from JSON responses
userSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.verificationToken;
        delete ret.resetPasswordToken;
        return ret;
    }
});

const User = mongoose.model('User', userSchema);
export default User;