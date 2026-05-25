import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token 
        
        if(!token) return res.status(401).json({
            message: "You are not logged in"
        })
        
        const verifyUserToken = jwt.verify(token, process.env.JWT_SECRET_TOKEN)
        
        const user = await User.findById(verifyUserToken.id)
        
        if(!user) return res.status(404).json({
            message: "User no longer exists"
        })

        req.user = user

        
        if (user.suspendedUntil && user.suspendedUntil > new Date()) return res.status(403).json({
            message: `Your account has been suspended until ${user.suspendedUntil}`
        })
        
        next()
        
    } catch (error) {
        res.status(401).json({
            message: "Invalid Token"
        })
    }
}

export default protect