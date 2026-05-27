import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['direct', 'group'],
    required: true
  },

  name: {
    type: String,
    trim: true,
    maxlength:50           
  },
  groupAvatar: {
    type: String,        
    default: ''
  },
  description: {
    type: String,
    maxlength: 300,
    default: ''
  },
  admin: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastRead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null      
    },
    isMuted: {
      type: Boolean,
      default: false
    }
  }],

  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true })

conversationSchema.index({ 'members.user': 1 })

export const Conversation = mongoose.model('Conversation', conversationSchema)


conversationSchema.pre("save",function(next){
  if(this.type==="direct" && this.members.length>2){
    throw new Error("Direct message can only have 2 members");
  }
  if(this.type==="group" && this.members.length<2){
    throw new Error("Group message must have atleast 2 members");
    
  }
})