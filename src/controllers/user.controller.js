import { user } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";



const registerUser = asyncHandler( async (req, res) => {
    //get user details from frontend
    //validation - not empty
    //check if user already exists: username, email
    //check for images, check for avatar
    //upload them to cloudinary, avatar check
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return response

    const {fullName, email, userName, password} = req.body
    console.log("email:" , email);
    // if (fullName === "") {
    //     throw new ApiError(400, "fullname is required")
    // }  

    // OR

    if (
        [fullName, email, userName, password].some( (field) => field?.trim() === "" )
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // user validation............
    const existedUser = await user.findOne({
        $or: [{ userName },{ email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exist")
    }

    //image handleing..............
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.
        coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar fille is required")
    }

   const avatar =  await uploadOnCloudinary(avatarLocalPath)
   const coverImage =  await uploadOnCloudinary(coverImageLocalPath)

   if (!avatar) {
    throw new ApiError(400, "Avatar fille is required")
   }

   const User = await user.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase()
   })

 const createdUser = await user.findById(User._id).select(
    "-password -refreshToken"
 )
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User register Successfully")
  )

})


export { registerUser };
