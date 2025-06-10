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

    // allowing the admin to bypass the one-time limit for dev purposes
  if (user.role === "admin") {
    return res.status(200).json(
      new ApiResponse(200, {
        userId: user._id,
        firstRequestAt: user.firstRequestAt
      }, "Admin bypassed one-time Beasty GET check")
    );
  }

  if (user.hasUsedBeasty) {
    throw new ApiError(403, "You have already used your one-time Beasty GET request.");
  }

  // Mark as used
  user.hasUsedBeasty = true;
  await user.save({ validateBeforeSave: false });     // permanently saved in db that this user used his GET req
  
  
  return res.status(200).json(
  new ApiResponse(200, {
    userId: user._id,
    firstRequestAt: user.firstRequestAt,
  }, "Access granted for Beasty GET")
);

});

export {
beastyCheckController
};