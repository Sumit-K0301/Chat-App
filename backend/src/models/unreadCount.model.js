import mongoose, { Schema } from 'mongoose';

const unreadCountSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        partnerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        type: {
            type: String,
            enum: ['dm', 'group'],
            default: 'dm',
        },
        count: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

unreadCountSchema.index({ userId: 1, partnerId: 1 }, { unique: true });

const UnreadCount = mongoose.model('UnreadCount', unreadCountSchema);
export default UnreadCount;
