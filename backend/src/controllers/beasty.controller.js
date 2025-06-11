import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// check if user has used Beasty GET request before
const beastyCheckController = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // allowing the admin to bypass the request limit
  if (user.role === "admin") {
    return res.status(200).json(
      new ApiResponse(200, {
        userId: user._id,
        firstRequestAt: user.firstRequestAt,
        role: "admin"
      }, "Admin bypassed Beasty GET check")
    );
  }
  // giving 3 reqs per userID
  // Initialize requestCount if it doesn't exist
  if (!user.requestCount) {
    user.requestCount = 0;
  }

  // Check if user has exceeded their 3 requests
  if (user.requestCount >= 3) {
    throw new ApiError(403, "You have used all 3 of your allowed Beasty requests.");
  }

  // Increment request count        // smarty
  user.requestCount += 1;
  await user.save({ validateBeforeSave: false });
  
  return res.status(200).json(
    new ApiResponse(200, {
      userId: user._id,
      firstRequestAt: user.firstRequestAt,
      requestCount: user.requestCount,
      remainingRequests: 3 - user.requestCount
    }, "Access granted for Beasty GET")
  );
});

export {
  beastyCheckController
};