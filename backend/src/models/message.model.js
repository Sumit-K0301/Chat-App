import { text } from "express";
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
            required: true,
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
    }, {timestamps: true});

const Message = mongoose.model('Message', messageSchema);
export default Message;