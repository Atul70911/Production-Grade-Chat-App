import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,

        },
        profilePic: {
            type: String,
            default: ""
        },
        bio: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            enum: ["online", "offline"],
            default: "offline",
        },
        lastSeen: {
            type: Date,
            default: Date.now
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        blockedUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        refreshToken: {
            type: String,
            default: null
        }
    }, {
    timestamps: true
}
)

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}

export const User = mongoose.model('User', userSchema)