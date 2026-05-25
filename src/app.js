import cors from "cors"
import express from "express"
import userRouter from "./routes/users.route.js"
import postRouter from "./routes/post.route.js"
import activityRouter from "./routes/activity.route.js"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"

const app = express()

const allowedOrigins = [process.env.LOCAL_FRONTEND_URL, process.env.LIVE_FRONTEND_URL]

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())
app.use("/api/user/", userRouter)
app.use("/api/post/", postRouter)
app.use("/api/activity-logs/", activityRouter)

export default app
