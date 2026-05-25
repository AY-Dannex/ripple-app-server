import cors from "cors"
import express from "express"
import userRouter from "./routes/users.route.js"
import postRouter from "./routes/post.route.js"
import activityRouter from "./routes/activity.route.js"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors({
    origin: process.env.NODE_ENV === "production" 
        ? false  // same origin in production, no CORS needed
        : "http://localhost:5173", // allow Vite dev server locally
    credentials: true // needed for cookies to work
}))

app.use(express.json())
app.use(cookieParser())
app.use("/api/user/", userRouter)
app.use("/api/post/", postRouter)
app.use("/api/activity-logs/", activityRouter)

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "dist")))
    app.get("/{*splat}", (req, res) => {
        res.sendFile(path.join(__dirname, "dist", "index.html"))
    })
}

export default app
