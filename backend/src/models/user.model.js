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
        },
        profilePic: {
            type: String,
            default: null,
        },
    }, {timestamps: true});

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    
    //next();
})

const User = mongoose.model('User', userSchema);
export default User;