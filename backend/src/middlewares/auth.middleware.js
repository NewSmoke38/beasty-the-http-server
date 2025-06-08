import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, _, 
    next) => {
try {
          const token = 
          req.cookies?.accessToken ||
          req.headers.authorization?.replace("Bearer ", " ").trim();   // token gonna come from cookies or the auth bearer   
          if (!token) {
             throw new ApiError(401, "Unauthorized request")
          }
   
    //get tokens
      // check if valid or not
      const decodedToken = jwt.verify(token, process.env
         .ACCESS_TOKEN_SECRET)   

      const user =  await User.findById(decodedToken?._id).select
         ("-password -refreshToken")
       
         if (!user) {
            throw new ApiError(401, "Invalid Access Token")
         }
   
   
       req.user = user;
       next()  
        
     } catch (error) {
       console.error(error);   
           throw new ApiError(401, "Invalid access thrown")
        }
})