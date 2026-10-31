
import express from "express";
import mongoose from "mongoose";

import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// Protect all attendance routes.
// Only Managers can access the current attendance management endpoints.
router.use(authenticateToken);
router.use(authorizeRole("Manager"));

// Initialize attendance for a selected date.
// Every active employee without an attendance record gets marked Absent.
router.post("/initialize", async (req, res) => {
    try {
        const { date } = req.body;

        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid date in YYYY-MM-DD format.",
            });
        }

        const activeEmployees = await Employee.find({
            status: "Active",
        });

        const existingRecords = await Attendance.find({ date });

        const recordedEmployeeIds = new Set(
            existingRecords.map((record) => record.employee.toString())
        );

        const newRecords = activeEmployees
            .filter(
                (employee) => !recordedEmployeeIds.has(employee._id.toString())
            )
            .map((employee) => ({
                employee: employee._id,
                date,
                checkIn: "—",
                checkOut: "—",
                status: "Absent",
            }));

        if (newRecords.length > 0) {
            await Attendance.insertMany(newRecords, { ordered: false });
        }

        const attendance = await Attendance.find({ date })
            .populate("employee", "name department")
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            message: "Attendance initialized successfully.",
            data: attendance,
        });
    } catch (error) {
        console.error("Initialize attendance error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to initialize attendance.",
        });
    }
});

// Get all attendance records.
router.get("/", async (req, res) => {
    try {
        const attendance = await Attendance.find()
            .populate("employee", "name department")
            .sort({ date: -1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: attendance,
        });
    } catch (error) {
        console.error("Get attendance error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch attendance records.",
        });
    }
});

// Create an attendance record.
router.post("/", async (req, res) => {
    try {
        const { employee, date, checkIn, checkOut, status } = req.body;

        if (!employee || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                success: false,
                message: "Employee and a valid date are required.",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(employee)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID.",
            });
        }

        const employeeExists = await Employee.findById(employee);

        if (!employeeExists) {
            return res.status(404).json({
                success: false,
                message: "Employee not found.",
            });
        }

        const existingRecord = await Attendance.findOne({
            employee,
            date,
        });

        if (existingRecord) {
            return res.status(409).json({
                success: false,
                message: "Attendance record already exists for this employee and date.",
            });
        }

        const attendance = await Attendance.create({
            employee,
            date,
            checkIn: checkIn || "—",
            checkOut: checkOut || "—",
            status: status || "Present",
        });

        const populatedAttendance = await Attendance.findById(attendance._id)
            .populate("employee", "name department");

        return res.status(201).json({
            success: true,
            message: "Attendance record created successfully.",
            data: populatedAttendance,
        });
    } catch (error) {
        console.error("Create attendance error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create attendance record.",
        });
    }
});

// Update an attendance record.
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status, checkIn, checkOut } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid attendance record ID.",
            });
        }

        const allowedStatuses = ["Present", "Absent", "On Leave"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid attendance status.",
            });
        }

        const updateData = {
            status,
            checkIn: status === "Present" ? (checkIn || "09:00 AM") : "—",
            checkOut: status === "Present" ? (checkOut || "05:00 PM") : "—",
        };

        const attendance = await Attendance.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        ).populate("employee", "name department");

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Attendance updated successfully.",
            data: attendance,
        });
    } catch (error) {
        console.error("Update attendance error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update attendance.",
        });
    }
});

// Delete an attendance record.
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid attendance record ID.",
            });
        }

        const attendance = await Attendance.findByIdAndDelete(id);

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Attendance record deleted successfully.",
        });
    } catch (error) {
        console.error("Delete attendance error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete attendance record.",
        });
    }
});

export default router;
