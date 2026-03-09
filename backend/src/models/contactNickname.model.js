import mongoose, { Schema } from 'mongoose';

const contactNicknameSchema = new Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        nickname: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
    },
    { timestamps: true }
);

contactNicknameSchema.index({ ownerId: 1, targetId: 1 }, { unique: true });

const ContactNickname = mongoose.model('ContactNickname', contactNicknameSchema);
export default ContactNickname;
