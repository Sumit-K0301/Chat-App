import mongoose, { Schema } from 'mongoose';

const groupSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 50,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 200,
            default: '',
        },
        groupPic: {
            type: String,
            default: null,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }
        ],
        admins: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    }, { timestamps: true });

const Group = mongoose.model('Group', groupSchema);
export default Group;
