import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        checkIn: {
            type: String,
            default: "—",
        },
        checkOut: {
            type: String,
            default: "—",
        },
        status: {
            type: String,
            enum: ["Present", "Absent", "On Leave"],
            default: "Present",
            required: true,
        },
    },
    { timestamps: true }
);

// An employee can have only one attendance record per day.
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;