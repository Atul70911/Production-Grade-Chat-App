import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRoutes from "../src/routes/user.routes.js"

const app=express();
app.use(cors())
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//Routes

app.use("/api/v1/users",userRoutes);


export { app };