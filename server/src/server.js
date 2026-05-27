import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRoutes from "../src/routes/user.routes.js"
import conversationRoutes from "../src/routes/conversation.routes.js"
import messageRoutes from "../src/routes/message.routes.js"
import notificationRoutes from "../src/routes/notification.routes.js"

const app=express();
app.use(cors())
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//Routes

app.use("/api/v1/users",userRoutes);
app.use("/api/v1/conversation",conversationRoutes);
app.use("/api/v1/message",messageRoutes);
app.use("/api/v1/notifications", notificationRoutes)



export { app };