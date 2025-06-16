import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from './app.js';

dotenv.config({
  path: process.env.NODE_ENV === 'production' 
    ? '.env.production' 
    : '.env'
});

async function startServer() {
  try {
    await connectDB();

    app.on("error", (error) => {    
      console.log("ERROR", error);
      throw error;
    });

    app.listen(process.env.PORT || 4000, () => {   
      console.log(` Server is running at port :     
          ${process.env.PORT}`);                 
    });
  } catch (err) {
    console.log("MONGO db connection failed !!! ", err);
  }
}

startServer();

app.get('/', (req, res) => {
  res.send('Yo, backend is live! Welcome to the API.');
});

