import mongoose from "mongoose";

// try catch method is always best cause DB can be in another continent anyday
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect
        (process.env.MONGODB_URI);
        console.log(`\nMongoDB connected yayyyy !! 
            ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("MONGODB connection FAILED", error);
        process.exit(1)
    }
}; 

export default connectDB;