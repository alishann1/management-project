
import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        leaveType: {
            type: String,
            enum: ["Annual Leave", "Sick Leave", "Casual Leave"],
            required: true,
        },
        startDate: {
            type: String,
            required: true,
        },
        endDate: {
            type: String,
            required: true,
        },
        reason: {
            type: String,
            trim: true,
            default: "",
        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
        appliedDate: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;
