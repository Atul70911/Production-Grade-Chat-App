import dotenv from "dotenv"
dotenv.config({ path: "../env" });
import { app } from "./src/server.js";
import connectDB from "./src/db/index.js";

const PORT=process.env.PORT;

connectDB();

app.get('/',(req,res)=>{
    res.send("Hello Prod Grade");
})

app.listen(PORT,()=>{
      console.log(`Chat app listening on port ${process.env.PORT}`);
})