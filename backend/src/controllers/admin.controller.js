import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

// fetching all users (admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;        // its how many pages, default is 1, Backend uses page & limit for infinite scroll even if UI has no visible pages so the system doesnt melt when the user req GET and we give all 1k users at one time suddenly
  const limit = parseInt(req.query.limit) || 10;     // its how many users to show per page (default is 10 if not passed by frontend).
  const skip = (page - 1) * limit;                   //  Skips users from earlier pages so we only load the new other users 

  const users = await User.find()
    .select("-password -refreshToken")
    .skip(skip)
    .limit(limit);

  const totalUsers = await User.countDocuments();    // Counts total no. of users in the database.
  
  return res
    .status(200)
    .json(
      new ApiResponse(
        200, 
        {
          users,
          pagination: {
            total: totalUsers,
            page,
            limit,
            pages: Math.ceil(totalUsers / limit)
          }
        }, 
        "Fetched users successfully"
      )
    );
    
});

export {
getAllUsers
};