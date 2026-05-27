import dotenv from "dotenv"
dotenv.config({ path: "../env" });
import { app } from "./src/server.js";
import connectDB from "./src/db/index.js";
import { createServer } from 'node:http';
import { initSocket } from "./src/socket/index.js";

const PORT=process.env.PORT;

connectDB();

const server = createServer(app);
const io= initSocket(server);
app.set("io", io)
app.get('/',(req,res)=>{
    res.send("Hello Prod Grade");
})


server.listen(PORT,()=>{
      console.log(`Chat app listening on port ${process.env.PORT}`);
})