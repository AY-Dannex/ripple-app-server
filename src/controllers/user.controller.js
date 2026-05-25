import { User } from "../models/user.model.js"
import { Post } from "../models/post.model.js"
import { Activity } from "../models/user.activity.model.js"
import { uploadToCloudinary } from "../middleware/upload.middleware.js"
import cloudinary from "../config/cloudinary.js"
import jwt from "jsonwebtoken"

const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, username, email, password, otp } = req.body

        if(!firstName || !lastName || !username || !email || !password || !otp) return res.status(400).json({
            message: "All fields are required"
    })

    const existEmail = await User.findOne({ email: email.toLowerCase() })
    const existUsername = await User.findOne({ username: username.toLowerCase() })

    if(existEmail) return res.status(400).json({
        message: "User with current email already exists"
    })

    if(existUsername) return res.status(400).json({
        message: "Username already taken"
    })

    

    const user = await User.create({
        firstName,
        lastName,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password,
        bio: "",
        role: "user",
        loggedIn: false
    })

    res.status(201).json({
        message: "User created successfully",
        user: { id: user._id, firstName: user.firstName, lastName: user.lastName, username: user.username, email: user.email, role: user.role }
    })
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error", error
        })
    }
}

const loginUsers = async (req, res) => {
    try {
        const { email, password } = req.body

        if(!email || !password) return res.status(400).json({
            message: "All fields are required"
        })

        const user = await User.findOne({ email: email.toLowerCase() })

        if(!user) return res.status(404).json({
            message: "User with this credentials does not exist"
        })

        const passwordMatch = await user.comparePassword(password)

        if(!passwordMatch) return res.status(400).json({
            message: "Invalid credentials"
        })

        if (user.suspendedUntil && user.suspendedUntil > new Date()) return res.status(403).json({
            message: `Unable to login... You account has been suspended until ${user.suspendedUntil}`
        })

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET_TOKEN,
            {
                expiresIn: "1d"
            }
        )

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV,
            maxAge: 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                role: user.role,
                bio: user.bio,
                created: user.createdAt,
                profilePic: user.profilePic
            }
        })
    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error, ${error.message}`
        })
    }
}

const getProfile = async (req, res) => {
    try {
        const profile = req.user
        res.status(200).json({
            message: "Profile retreived successfully",
            profile: {
                id: profile._id,
                firstName: profile.firstName,
                lastName: profile.lastName,
                username: profile.username,
                email: profile.email,
                bio: profile.bio,
                role: profile.role,
                profilePic: profile.profilePic,
                created: profile.createdAt,
                updated: profile.updatedAt
            }
        })
    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error, ${error}`
        })
    }
}

const uploadProfilePic = async (req, res) => {
    try {
        const id = req.user._id
        let imageUrl = null

        if (req.user.profilePic) {
            const publicId = req.user.profilePic
                .split("/")
                .pop()
                .split(".")[0]
            
            await cloudinary.uploader.destroy(`ripple/${publicId}`)
        }

        if(req.file){
            const result = await uploadToCloudinary(req.file.buffer)
            imageUrl = result.secure_url
        }else{
            return res.status(400).json({
                message: "No file uploaded"
            })
        }

        const updatedUser = await User.findByIdAndUpdate(id, {profilePic: imageUrl}, { new: true })
        
        if (!updatedUser) return res.status(404).json({
                message: "User not found"
            })
        

        res.status(200).json({
            message: "Avatar updated successfully",
            profile: {
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                profilePic: updatedUser.profilePic,
                created: updatedUser.createdAt
            }
        })

    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error, ${error.message}`
        })
    }
}

const deleteProfilePic = async (req, res) => {
    try {
        const userID = req.user._id
        const user = await User.findById(userID)

        if(!user) return res.status(404).json({
            message: "User not found"
        })

        if (user.profilePic) {
            const publicId = user.profilePic
                .split("/")
                .pop()
                .split(".")[0]
            
            await cloudinary.uploader.destroy(`ripple/${publicId}`)
        }else{
            res.status(200).json({
            message: "No Avatar Uploaded"
        })
        }

        user.profilePic = null
        await user.save()

        res.status(200).json({
            message: "Avatar Deleted Successfully",
            profile: {
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                role: user.role,
                profilePic: user.profilePic,
                created: user.createdAt,
                bio: user.bio
            }
        })
    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error, ${error.message}`
        })
    }
}

const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, bio } = req.body
        let { email, username } = req.body

        const id = req.user._id

        if (!id) return res.status(400).json({
            message: "No ID found" 
        })

        const user = await User.findById(id)
        let userPic = ""
        if(user.profilePic) userPic = user.profilePic

        if (!firstName && !lastName && !username && !email && !bio) return res.status(400).json({
            message: "Minimum of 1 field must be updated"
        })
        
        const updateFields = {}

        if (email){
            email = email.toLowerCase()
            // console.log("Checking email:", email)

            const emailExists = await User.findOne({ email, _id: { $ne: id } })
            // console.log("Email exists:", emailExists)

            if(emailExists) return res.status(400).json({
                message: "User with the email already exists"
            })

            updateFields.email = email
        }

        if(username){
            username = username.toLowerCase()
            const usernameExists = await User.findOne({ username, _id: { $ne: id } })

            if(usernameExists) return res.status(400).json({
                message: "Username already taken"
            })

            updateFields.username = username
        }

        if(firstName) updateFields.firstName = firstName
        if(lastName) updateFields.lastName = lastName
        if(bio) updateFields.bio = bio


        const updatedUser = await User.findByIdAndUpdate(id, updateFields, { new: true })

        if (!updatedUser) return res.status(404).json({
            message: "User not found"
        })

        res.status(200).json({
            message: "Profile updated successfully",
            profile: {
                id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                username: updatedUser.username,
                email: updatedUser.email,
                bio: updatedUser.bio,
                role: updatedUser.role,
                profilePic: userPic
            }
        })
    } catch (error) {
        res.status(500).json({
            message: `Internal server error ${error.message}`
        })
    }
}

const getOtherUserProfile = async (req, res) => {
    try {
        // console.log("Query param: ", req.query)
        const { ID } = req.query

        if(!ID) return res.status(400).json({
            message: "User ID is required"
        })

        // console.log("Looking for user with ID:", ID)
        const user = await User.findById(ID).select("firstName lastName username role email profilePic bio")
        // console.log(user)

        if(!user) return res.status(404).json({
            message: "User not found"
        })

        res.status(200).json({
            message: "User profile retrieved",
            user
        })
    } catch (error) {
        // console.log("Error:", error)  
        res.status(500).json({
            message: `Internal server error ${error.message}`
        })
    }
}

const logoutUsers = async (req, res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV === "production",
            expires: new Date(0) //Expire immediately
        })

        res.status(200).json({
            message: "Logged out successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error", error
        })
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("firstName lastName username email role profilePic _id")
        res.status(200).json({
            message: "All users rendered successfully",
            users
        })
    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error ${error.message}`
        })
        
    }
}

const getUser = async (req, res) => {
    try {
        if(req.user.role !== "admin") return res.status(403).json({
            message: "Access denied... You are not an admin"
        })

        const { email } = req.query

        if (!email) return res.status(400).json({
            message: "No email provided"
        })

        const user = await User.find({email: { $regex: `^${email}`, $options: "i" }}).select("firstName lastName username role email profilePic")

        if(!user) return res.status(404).json({
            message: "User with this email dosen't exist"
        })

        res.status(200).json({
            message: "User Found",
            user
        })

    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error ${error.message}`
        })
    }
}

const assignRole = async (req, res) => {
    try {
        const { email, newRole } = req.body

        if (!email || !newRole) return res.status(400).json({
            message: "All fields are required"
        })

        if (req.user.role !== "admin") return res.status(403).json({
            message: "Access Denied!! Only admin is allowed to assign roles"
        })

        const user = await User.findOne({email: email.toLowerCase()})
        
        if (!user) return res.status(404).json({
            message: "User not found"
        })

        const allowedRoles = ["user", "moderator"]

        if (!allowedRoles.includes(newRole)) return res.status(403).json({
            message: `${newRole} is an invalid role`
        })

        if (req.user.role === "admin" && user.role === "admin") return res.status(403).json({
            message: "admin cannot assign roles for other admins"
        })

        // console.log(user._id)

        await Activity.create({
            action: "role changed",
            targetUser: user._id,
            performedBy: req.user._id,
            details: `Role changed from ${user.role} to ${newRole}`
        })

        await User.findByIdAndUpdate(user._id, {role: newRole})

        res.status(200).json({
            message: "Role assigned successfully",
            user
        })
    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error, ${error.message}`
        })
    }
}

const suspendUser = async (req, res) => {
    try {
        if(req.user.role !== "admin") return res.status(403).json({
            message: "You are not authorized to suspend users"
        })

        const { email, suspendedUntil } = req.body
    
        if (!email || ! suspendedUntil) return res.status(400).json({
            message: "All fields are required"
        })

        if (req.user.role !== "admin") return res.status(403).json({
            message: "Only admins can suspend users account"
        })

        const user = await User.findOne({ email })

        if (!user) return res.status(404).json({
            message: "User not found"
        })

        if (user._id.toString() === req.user._id.toString()) return res.status(403).json({
            message: "You cannot suspend yourself as an admin"
        })

        if (user.role === "admin") return res.status(403).json({
            message: "Admins can't suspend other admins"
        })

        await Activity.create({
            action: "suspended",
            targetUser: user._id,
            performedBy: req.user._id,
            details: `Suspended till ${suspendedUntil}`
        })

        await User.findByIdAndUpdate(user._id, {suspendedUntil})

        res.status(200).json({
            message: "User suspended successfully"
        })
    } catch (error) {
         res.status(500).json({
            message: `Internal Server Error, ${error.message}`
        })
    }
}

const deleteUser = async (req, res) => {
    try {  
        if (req.user.role !== "admin"){
            return res.status(403).json({
                message: "You are not authorized to delete users"
            })
        }

        const { email } = req.query

        if (!email) return res.status(400).json({
            message: "Email field required"
        })

        const user = await User.findOne({ email }) 

        if (!user) return res.status(404).json({
            message: "User not found"
        })

        if (req.user.role === user.role) return res.status(403).json({
            message: "Admin can't delete other admins account"
        })

        // await Activity.create({
        //     action: "deleted",
        //     targetUser: user._id,
        //     performedBy: req.user._id,
        //     details: `User with this email (${user.email}) has been deleted`
        // })

        await Post.deleteMany({ user: user._id })

        await Activity.deleteMany({ targetUser: user._id })

        await User.findByIdAndDelete(user._id)

        res.status(200).json({
            message: "User deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error, ${error.message}`
        })
    }
}

export { registerUser, loginUsers, getProfile, uploadProfilePic, deleteProfilePic, updateProfile, getOtherUserProfile, logoutUsers, assignRole, suspendUser, deleteUser, getUser, getAllUsers }