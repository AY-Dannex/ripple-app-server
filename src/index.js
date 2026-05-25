import "dotenv/config"
import connectDB from "./config/database.js"
import app from "./app.js"


const startServer = async () => {
    try {
        await connectDB()

        app.on("error", (error) => {
            throw error
        })
        
        app.listen(process.env.PORT, () => {
            console.log(`server is running on port: ${process.env.PORT}`)
        })
    } catch (error) {
        console.log("MongoDB connection failed", error)
    }
}


startServer()