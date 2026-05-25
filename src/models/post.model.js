import mongoose, { Schema } from "mongoose"

const postSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        
        image: [{
            type: String,
            required: false, 
        }],

        description: {
            type: String,
            required: true,
            trim: true
        },

        visibility: {
            type: String,
            required: true,
            enum: ["public", "private"],
            default: "public"
        }
    },

    {
        timestamps: true
    }
)

export const Post = mongoose.model("Post", postSchema)