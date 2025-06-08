import express from "express";
import cors from "cors";



const app = express();

// CORS Configuration
app.use(cors({
    origin: "http://localhost:3000",    /// here will come our vercel linkkkk
    credentials: true
}));

app.use(express.json({limit: "16kb"}))    // middleware is needed for JSON 

import userRouter from './routes/user.routes.js'

app.use("/api/v1/users", userRouter);







export default app;
