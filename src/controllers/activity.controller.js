import { Activity } from "../models/user.activity.model.js";

const getActivityLogs = async (req, res) => {
    try {
        if(req.user.role !== "admin") return res.status(403).json({
            message: "Only Admins are allowed to visit this route"
        })
        const logs = await Activity.find()
                                .populate("targetUser", "firstName lastName username email role")
                                .populate("performedBy", "firstName lastName username email role")
                                .sort({ createdAt: -1 })
        
        res.status(200).json({
            message: "Activity logs retrieved",
            logs
        })
    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error ${error.message}`
        })
    }
}

const deleteEachActivityLog = async (req, res) => {
    try {
        if(req.user.role !== "admin") return res.status(403).json({
            message: "Only Admins can access this route"
        })

        const { ID } = req.query

        if(!ID) return res.status(400).json({
            message: "Activity Log ID is required"
        })

        const deleted = await Activity.findByIdAndDelete(ID)

        if(!deleted) return res.status(404).json({
            message: "Activity Log not found"
        })

        res.status(200).json({
            message: "Activity Log deleted"
        })
    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error ${error.message}`
        })
    }
}

const deleteAllActivityLogs = async (req, res) => {
    try {
        if(req.user.role !== "admin") return res.status(403).json({
            message: "Only Admins can access this route"
        })

        await Activity.deleteMany({})

        res.status(200).json({
            message: "All activity logs deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error ${error.message}`
        })
    }
}

export { getActivityLogs, deleteEachActivityLog, deleteAllActivityLogs }