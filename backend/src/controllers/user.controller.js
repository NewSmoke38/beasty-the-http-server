import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const DEFAULT_ROLE = "user";


const generateAccessAndRefreshTokens = async (userId) => {
   try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()     
      const refreshToken = user.generateRefreshToken()   

      user.refreshToken = refreshToken
      user.save({ validateBeforeSave: false })

      return { accessToken, refreshToken }

   } catch (error) {
      throw new ApiError(500, "Something went wrong while generating refresh and access token")
   }
}

// register user
const registerUser = asyncHandler(async (req, res) => {

   // taking user detail
   const { fullName, email, username, password } = req.body
   console.log("email: ", email);


   // validation that its not coming empty or multiple things at a time
   if (
      [fullName, email, username, password].some((field) =>
         field?.trim() === "")            // if after trimming whitespace we get "" then show error for bieng empty
      ) {
      throw new ApiError(400, "All fields are required")
    }


   // check is user already exists
   // either get email or username matched from db
   const existedUser = await User.findOne({
      $or: [{ username }, { email }]        
   })

   if (existedUser) {
      throw new ApiError(409, "User with email or username already exists")
   }
   
   // enter user into db, make a user object there
   // when playing w db we often get errors, so async will handle it, so we must await kyunki bhai time to lagega hi
   const user = await User.create({
      fullName,
      email,
      password,          
      username: username.toLowerCase(),
      role: DEFAULT_ROLE
   });


   // check if user object created
   // and remove refresh token from response
   const createdUser = await User.findById(user._id).select(        
      "-password -refreshToken"  
   )

   if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user")
   }


   // return response
   return res
   .status(201)
   .json(
      new ApiResponse(201, createdUser, "User registered successfully!! ✨")
   )



})


// login
const loginUser = asyncHandler(async (req, res) => {

   // take username, pass
   const { email, username, password } = req.body;

   if (!(username || email)) {
      throw new ApiError(400, "username or password is required");
   }

   const user = await User.findOne({ $or: [{ username }, { email }] });

   if (!user) {
      throw new ApiError(404, "user does not exist");
   }

   const isPasswordValid = await user.isPasswordCorrect(password);

   if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials");
   }

   const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(
      user._id
   );

   const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
   );

   const options = {
      httpOnly: true,
      secure: true
   };

   return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
         new ApiResponse(
            200,
            { user: loggedInUser, accessToken, refreshToken },
            "User logged In Successfully"
         )
      );
});

// logout 
const logoutUser = asyncHandler(async (req, res) => {
   await User.findByIdAndUpdate(
      req.user._id,
      {
         $unset: {
            refreshToken: 1    
         }
      },
      {
         new: true
      }
   )

   const options = {
   httpOnly: true,      // optios help is making cookies only accessible through http route
   secure: true
};

   return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged out successfully"))

})




export {
   registerUser,
   loginUser,
   logoutUser,
};

