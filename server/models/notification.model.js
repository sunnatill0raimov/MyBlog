import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    preview: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    // Additional metadata
    type: {
        type: String,
        enum: ['message', 'system', 'alert', 'reminder'],
        default: 'message'
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    }
});

// Update the updatedAt field before saving
notificationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
