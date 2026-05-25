import mongoose, { Schema } from "mongoose"

const ActivityLog = new Schema(
    {
        action: {
            type: String,
            enum: ["role changed", "suspended", "deleted"],
            required: true
        },

        targetUser: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        performedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        details: {
            type: String
        }
    },

    {
        timestamps: true
    }
)

export const Activity =  mongoose.model("Activity", ActivityLog)