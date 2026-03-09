import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
    {
        senderID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiverID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null, // null for group messages
        },
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            default: null,
        },
        text: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: null,
        },
        image: {
            type: String,
            default: null,
        },
        file: {
            url: { type: String, default: null },
            name: { type: String, default: null },
            type: { type: String, default: null },
            size: { type: Number, default: null },
        },
        status: {
            type: String,
            enum: ['sent', 'delivered', 'read'],
            default: 'sent',
        },
        reactions: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                emoji: { type: String },
            }
        ],
        isDeleted: {
            type: Boolean,
            default: false,
        },
    }, { timestamps: true });

// Text index for message search (F5)
messageSchema.index({ text: 'text' });

const Message = mongoose.model('Message', messageSchema);
export default Message;