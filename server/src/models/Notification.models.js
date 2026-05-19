import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'new_message',
      'group_invite',
      'friend_request',
      'mention',
      'reaction'
    ],
    required: true
  },
  reference: {
    type: mongoose.Schema.Types.ObjectId,   
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Message', 'Conversation']
  },
  message: {
    type: String            
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

notificationSchema.index({ recipient: 1, isRead: 1 })

export const Notification = mongoose.model('Notification', notificationSchema)