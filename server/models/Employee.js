
import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },
        department: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["Active", "Inactive", "On Leave"],
            default: "Active",
        },
        performance: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
    },
    { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
