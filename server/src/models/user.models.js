import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

       
        userId: {
            type: String,
            unique: true,
            trim: true,
            lowercase: true
            
        },

    
        friends: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            addedAt: {
                type: Date,
                default: Date.now
            }
        }],

        friendRequests: {
            sent: [{
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                sentAt: {
                    type: Date,
                    default: Date.now
                }
            }],
            received: [{
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                receivedAt: {
                    type: Date,
                    default: Date.now
                }
            }]
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
            default: null,
            select: false,
        }
    }, {
    timestamps: true
}
)

// Hash password before save
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);

    if(!this.userId){
        const tag=Math.floor(1000+Math.random()*9000);
        const base = this.name.toLowerCase().replace(/\s+/g, "")
        this.userId=`${base}@${tag}`;
    }
});

// Compare password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this.id,
            email:this.email,
            name:this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this.id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema)