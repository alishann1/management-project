import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
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
        project: {
            type: String,
            required: true,
            trim: true,
        },
        department: {
            type: String,
            required: true,
            trim: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        priority: {
            type: String,
            enum: ["High", "Medium", "Low"],
            default: "Medium",
        },
        status: {
            type: String,
            enum: ["Pending", "In Progress", "Completed"],
            default: "Pending",
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

// Keep task status consistent with its progress.
taskSchema.pre("validate", function () {
    if (this.progress === 0) {
        this.status = "Pending";
    } else if (this.progress === 100) {
        this.status = "Completed";
    } else {
        this.status = "In Progress";
    }
});

const Task = mongoose.model("Task", taskSchema);

export default Task;
