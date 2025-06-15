import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"           

const userSchema = new Schema(
{
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        minlength: 1,
        maxlength: 15
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        maxlength: [32, 'Password cannot exceed 32 characters'],
        validate: {
            validator: function(v) {
                // At least one number, one special character, and one uppercase letter
                return /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$/.test(v);
            },
            message: 'Password must contain at least one number, one special character (!@#$%^&*), and one uppercase letter'
        }
    },
    fullName: {
      type: String,
      required: true,
      trim: true,           
      index: true,
      minlength: 1,
      maxlength: 15
    },
    refreshToken: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    firstRequestAt: {
    type: Date,
    default: Date.now,   // sets it automatically when the user is created
},
requestCount: {
  type: Number,
  default: 0,
  min: 0,
  max: 4
}

},

{
    timestamps: true
}
)

// using bcrypt for hashing passwords
userSchema.pre("save", async function (next) {        
  if (!this.isModified("password")) return next();    

  this.password = await bcrypt.hash(this.password, 10);
  next();
});




// this one it to check if the password is correct

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}

// for genrating tokens <3
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};


userSchema.index({ role: 1 });  
export const User = mongoose.model("User", userSchema)