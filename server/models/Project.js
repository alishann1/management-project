
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        department: {
            type: String,
            required: true,
            trim: true,
        },
        manager: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["Planning", "In Progress", "Completed"],
            default: "Planning",
        },
        startDate: {
            type: Date,
            required: true,
        },
        dueDate: {
            type: Date,
            required: true,
        },
        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
    },
    { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;