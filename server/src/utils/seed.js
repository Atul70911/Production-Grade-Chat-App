import mongoose from "mongoose"
import dotenv from "dotenv"
import { User } from "../models/user.models.js"


import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Goes: utils → src → server → finds .env
dotenv.config({ path: path.resolve(__dirname, "../../.env") })
const users = [
    {
        name: "Atul Kumar",
        email: "atul@gmail.com",
        password: "atul1234",
        bio: "Hey I am Atul",
        profilePic: "https://res.cloudinary.com/dbcq8ifuz/image/upload/v1779434993/psoih5o8p40icx5jtevz.png"
    },
    {
        name: "Rahul Singh",
        email: "rahul@gmail.com",
        password: "rahul1234",
        bio: "Hey I am Rahul",
        profilePic: "https://res.cloudinary.com/dbcq8ifuz/image/upload/v1779434993/psoih5o8p40icx5jtevz.png"
    },
    {
        name: "Priya Sharma",
        email: "priya@gmail.com",
        password: "priya1234",
        bio: "Hey I am Priya",
        profilePic: "https://res.cloudinary.com/dbcq8ifuz/image/upload/v1779434993/psoih5o8p40icx5jtevz.png"
    },
    {
        name: "Amit Verma",
        email: "amit@gmail.com",
        password: "amit1234",
        bio: "Hey I am Amit",
        profilePic: "https://res.cloudinary.com/dbcq8ifuz/image/upload/v1779434993/psoih5o8p40icx5jtevz.png"
    },
    {
        name: "Sneha Gupta",
        email: "sneha@gmail.com",
        password: "sneha1234",
        bio: "Hey I am Sneha",
        profilePic: "https://res.cloudinary.com/dbcq8ifuz/image/upload/v1779434993/psoih5o8p40icx5jtevz.png"
    },
    {
        name: "Vikram Yadav",
        email: "vikram@gmail.com",
        password: "vikram1234",
        bio: "Hey I am Vikram",
        profilePic: "https://res.cloudinary.com/dbcq8ifuz/image/upload/v1779434993/psoih5o8p40icx5jtevz.png"
    },
    {
        name: "Neha Joshi",
        email: "neha@gmail.com",
        password: "neha1234",
        bio: "Hey I am Neha",
        profilePic: "https://res.cloudinary.com/dbcq8ifuz/image/upload/v1779434993/psoih5o8p40icx5jtevz.png"
    },
    {
        name: "Arjun Mehta",
        email: "arjun@gmail.com",
        password: "arjun1234",
        bio: "Hey I am Arjun",
        profilePic: "https://res.cloudinary.com/dbcq8ifuz/image/upload/v1779434993/psoih5o8p40icx5jtevz.png"
    },
    {
        name: "Pooja Patel",
        email: "pooja@gmail.com",
        password: "pooja1234",
        bio: "Hey I am Pooja",
        profilePic: "https://res.cloudinary.com/dbcq8ifuz/image/upload/v1779434993/psoih5o8p40icx5jtevz.png"
    },
    {
        name: "Rohit Tiwari",
        email: "rohit@gmail.com",
        password: "rohit1234",
        bio: "Hey I am Rohit",
        profilePic: "https://res.cloudinary.com/dbcq8ifuz/image/upload/v1779434993/psoih5o8p40icx5jtevz.png"
    },
    {
        name: "Divya Nair",
        email: "divya@gmail.com",
        password: "divya1234",
        bio: "Hey I am Divya",
        profilePic: "https://res.cloudinary.com/dbcq8ifuz/image/upload/v1779434993/psoih5o8p40icx5jtevz.png"
    },
    {
        name: "Karan Malhotra",
        email: "karan@gmail.com",
        password: "karan1234",
        bio: "Hey I am Karan",
        profilePic: "https://res.cloudinary.com/dbcq8ifuz/image/upload/v1779434993/psoih5o8p40icx5jtevz.png"
    },
    {
        name: "Ananya Reddy",
        email: "ananya@gmail.com",
        password: "ananya1234",
        bio: "Hey I am Ananya",
        profilePic: "https://res.cloudinary.com/dbcq8ifuz/image/upload/v1779434993/psoih5o8p40icx5jtevz.png"
    }
]

const seedUsers = async () => {
    try {
     
        await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`)
        console.log("MongoDB Connected")

       
        

        // Create users (triggers pre save hook → password hashing + userId generation)
        const createdUsers = []
        for (const userData of users) {
            const user = new User(userData)
            await user.save()
            createdUsers.push(user)
        }

        console.log(`✅ ${createdUsers.length} users seeded successfully\n`)

        // Show created users
        const created = await User.find().select("name email userId")
        console.table(created.map(u => ({
            name: u.name,
            email: u.email,
            userId: u.userId
        })))

        process.exit(0)

    } catch (error) {
        console.error("❌ Seeding failed:", error)
        process.exit(1)
    }
}

seedUsers()