import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        // Extract token from cookies or Authorization header
        const token = req.cookies?.accessToken || 
            req.headers.authorization?.replace("Bearer ", "").trim();
        
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }
   
        // Verify token and get user
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id)
            .select("-password -refreshToken");
       
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
   
        // Attach user to request object
        req.user = user;
        next();
        
    } catch (error) {
        console.error("JWT Verification Error:", error);   
        throw new ApiError(401, "Invalid access token");
    }
});