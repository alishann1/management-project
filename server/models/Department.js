
import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        manager: {
            type: String,
            trim: true,
            default: "",
        },
        projects: {
            type: Number,
            min: 0,
            default: 0,
        },
    },
    { timestamps: true }
);

const Department = mongoose.model("Department", departmentSchema);

export default Department;
