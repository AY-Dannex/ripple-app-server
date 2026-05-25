import { OTP } from "../models/otp.model.js";
import { User } from "../models/user.model.js";
import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY })

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

const sendOTPEmail = async (email, otp) => {
    try {
        await brevo.transactionalEmails.sendTransacEmail({
            subject: "Your OTP for Registration",
            to: [{ email }],
            sender: { name: "Ripple App", email: process.env.EMAIL_USER },
            htmlContent: `
                <div style="max-width: 400px; padding: 20px; border-radius: 5px; background-color: rgb(46, 46, 46);">
                    <div style="padding: 10px 20px 20px 20px; border-radius: 5px; background-color: black; color: white;">
                        <h2 style="color: #8200DB;">Email OTP Verification</h2>
                        <p style="text-align: justify;">
                            Below is your one time passcode that you 
                            need to use to complete your authentication.
                            The verification code would be valid for 5 minutes.
                            Please do not share this code with anyone.
                        </p>
                        <div style="width: 100%; border-radius: 5px; background-color: rgb(46, 46, 46);">
                            <p style="font-size: 20px; padding: 8px 0; font-weight: bold; text-align: center;">${otp}</p>
                        </div>
                        <p>
                            If you are having any issues with your account, 
                            please don't hesitate to contact us
                        </p>
                    </div>
                </div>`
        })
        console.log("OTP email sent successfully to:", email)
    } catch (error) {
        console.error("Error sending OTP email:", error.message)
        throw error
    }
}

export const requestOTP = async (req, res) => {
    try {
        const { email } = req.body

        if (!email) return res.status(400).json({
            message: "Email is required"
        })

        const user = await User.findOne({ email })

        if (user) return res.status(400).json({
            message: "User with this email already exists"
        })

        const otp = generateOTP()

        await OTP.deleteOne({ email })
        await OTP.create({ email, otp })
        await sendOTPEmail(email, otp)

        console.log("OTP process completed for:", email)

        res.status(200).json({
            message: "OTP sent to your email. Check your inbox or spam folder."
        })
    } catch (error) {
        console.error("requestOTP error:", error.message)
        res.status(500).json({
            message: `Internal Server Error ${error.message}`
        })
    }
}

export const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body

        if (!email || !otp) return res.status(400).json({
            message: "All fields are required"
        })

        const otpRecord = await OTP.findOne({ email })

        if (!otpRecord) return res.status(404).json({
            message: "OTP not found or expired"
        })

        if (otpRecord.otp !== otp) return res.status(400).json({
            message: "Invalid OTP"
        })

        if (new Date() > otpRecord.expiresAt){
            await OTP.deleteOne({ _id: otpRecord._id })
            return res.status(400).json({
                message: "OTP Already Expired"
            })
        }

        await OTP.deleteOne({ _id: otpRecord._id })
        next()
    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error ${error.message}`
        })
    }
}