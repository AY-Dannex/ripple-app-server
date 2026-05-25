import mongoose, { Schema } from "mongoose";

const OTPSchema = new Schema(
    {
        email: {
            type: String,
            required: true
        },

        otp: {
            type: String,
            required: true,
        },

        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 5 * 60 * 1000)
        }
    },
    {
        timestamps: true
    }
)

export const OTP = mongoose.model("OTP", OTPSchema) 