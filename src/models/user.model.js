import mongoose, { Schema } from "mongoose"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
            minLength: 1,
            maxLength: 20,
            match: [/^[a-zA-Z]+$/, "Name can only contain letters"]
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
            minLength: 1,
            maxLength: 20,
            match: [/^[a-zA-Z]+$/, "Name can only contain letters"]
        },
        
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minLength: 1,
            maxLength: 20,
            lowercase: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        bio: {
            type: String,
            required: false,
            trim: true,
            maxLength: 500
        },

        profilePic: {
            type: String,
            default: null
        },

        password: {
            type: String,
            required: true,
            minLength: 8,
            maxLenght: 30
        },

        role: {
            type: String,
            enum: ["user", "moderator", "admin"], // allow only this two value to rep type of user
            default: "user" // set normal users as default until when admin user is specified
        },

        suspendedUntil: {
            type: Date,
            default: null
        }
    },

    {
        timestamps: true
    }
)

userSchema.pre("save", async function () {
    if(!this.isModified("password")){
        return
    }
    this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

export const User = mongoose.model("User", userSchema)