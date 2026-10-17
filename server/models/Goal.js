
import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        department: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            enum: [
                "Performance",
                "Development",
                "Recruitment",
                "Financial",
                "Marketing",
                "Operations",
                "Administration",
            ],
        },
        target: {
            type: Number,
            required: true,
            min: 1,
        },
        progress: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
            default: 0,
        },
        status: {
            type: String,
            enum: ["Pending", "In Progress", "Completed"],
            default: "Pending",
        },
        deadline: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

// Keep the goal status consistent with its progress.
goalSchema.pre("validate", function () {
    if (this.progress === 0) {
        this.status = "Pending";
    } else if (this.progress === 100) {
        this.status = "Completed";
    } else {
        this.status = "In Progress";
    }
});

const Goal = mongoose.model("Goal", goalSchema);

export default Goal;
