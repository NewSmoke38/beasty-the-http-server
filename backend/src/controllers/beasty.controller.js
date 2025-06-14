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
        username: user.username,
        firstRequestAt: user.firstRequestAt,
        role: "admin"
      }, "Admin bypassed Beasty GET check")
    );
  }

  // If this is the first request, set firstRequestAt to now
  if (!user.firstRequestAt) {
    user.firstRequestAt = new Date();
  }

  // Initialize requestCount if it doesn't exist
  if (typeof user.requestCount !== 'number') {
    user.requestCount = 0;
  }

  // Check if user has exceeded their requests
  if (user.requestCount >= 4) {
    throw new ApiError(403, "You have used all your allowed Beasty requests.");
  }

  // Increment request count
  user.requestCount += 1;
  await user.save({ validateBeforeSave: false });
  
  return res.status(200).json(
    new ApiResponse(200, {
      userId: user._id,
      username: user.username,
      firstRequestAt: user.firstRequestAt,
      requestCount: user.requestCount,
      remainingRequests: 4 - user.requestCount
    }, "Access granted for Beasty GET")
  );
});

export {
  beastyCheckController
};