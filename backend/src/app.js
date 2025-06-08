import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"



const app = express();

// CORS Configuration
app.use(cors({
    origin: "http://localhost:3000",    /// here will come our vercel linkkkk
    credentials: true
}));

// setting a limit on json we are recieving
app.use(express.json({limit: "16kb"}))    // middleware is needed for JSON 






export default app;
