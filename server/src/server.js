import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRoutes from "../src/routes/user.routes.js"
import conversationRoutes from "../src/routes/conversation.routes.js"
import messageRoutes from "../src/routes/message.routes.js"
import notificationRoutes from "../src/routes/notification.routes.js"
import helmet from "helmet"
import mongoSanatize from "express-mongo-sanitize"
import hpp from "hpp"
import rateLimit from "express-rate-limit"



const app=express();
app.use(cors())
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(helmet());
app.use(mongoSanatize());
app.use(hpp());

app.use((req, res, next) => {                            // ✅ updated
    if (req.body) {
        req.body = JSON.parse(xss(JSON.stringify(req.body)))
    }
    if (req.query) {
        req.query = JSON.parse(xss(JSON.stringify(req.query)))
    }
    if (req.params) {
        req.params = JSON.parse(xss(JSON.stringify(req.params)))
    }
    next()
})

// ── Rate limiting
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))
app.use("/api/v1/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }))

//Routes
app.use("/api/v1/users",userRoutes);
app.use("/api/v1/conversation",conversationRoutes);
app.use("/api/v1/message",messageRoutes);
app.use("/api/v1/notifications", notificationRoutes)



export { app };