
import express from "express";
import mongoose from "mongoose";

import Leave from "../models/Leave.js";
import Employee from "../models/Employee.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all leave routes.
router.use(authenticateToken);

const allowedLeaveTypes = [
    "Annual Leave",
    "Sick Leave",
    "Casual Leave",
];

const allowedStatuses = [
    "Pending",
    "Approved",
    "Rejected",
];

// Validate YYYY-MM-DD and ensure it is a real calendar date.
const isValidDate = (date) => {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    return (
        !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === date
    );
};

// Get all leave requests.
router.get("/", async (req, res) => {
    try {
        const leaveRequests = await Leave.find()
            .populate("employee", "name department")
            .sort({ appliedDate: -1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: leaveRequests,
        });
    } catch (error) {
        console.error("Get leave requests error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch leave requests.",
        });
    }
});

// Create a leave request.
router.post("/", async (req, res) => {
    try {
        const {
            employee,
            leaveType,
            startDate,
            endDate,
            reason,
        } = req.body;

        if (
            !employee ||
            !leaveType ||
            !startDate ||
            !endDate
        ) {
            return res.status(400).json({
                success: false,
                message: "Employee, leave type, start date, and end date are required.",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(employee)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID.",
            });
        }

        if (!allowedLeaveTypes.includes(leaveType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave type.",
            });
        }

        if (!isValidDate(startDate) || !isValidDate(endDate)) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid dates in YYYY-MM-DD format.",
            });
        }

        if (endDate < startDate) {
            return res.status(400).json({
                success: false,
                message: "End date cannot be earlier than start date.",
            });
        }

        const employeeExists = await Employee.findById(employee);

        if (!employeeExists) {
            return res.status(404).json({
                success: false,
                message: "Employee not found.",
            });
        }

        const leaveRequest = await Leave.create({
            employee,
            leaveType,
            startDate,
            endDate,
            reason: reason || "",
            status: "Pending",
            appliedDate: new Date().toISOString().slice(0, 10),
        });

        const populatedRequest = await Leave.findById(leaveRequest._id)
            .populate("employee", "name department");

        return res.status(201).json({
            success: true,
            message: "Leave request created successfully.",
            data: populatedRequest,
        });
    } catch (error) {
        console.error("Create leave request error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create leave request.",
        });
    }
});

// Update leave request details.
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            employee,
            leaveType,
            startDate,
            endDate,
            reason,
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave request ID.",
            });
        }

        if (
            !employee ||
            !leaveType ||
            !startDate ||
            !endDate
        ) {
            return res.status(400).json({
                success: false,
                message: "Employee, leave type, start date, and end date are required.",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(employee)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID.",
            });
        }

        if (!allowedLeaveTypes.includes(leaveType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave type.",
            });
        }

        if (!isValidDate(startDate) || !isValidDate(endDate)) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid dates in YYYY-MM-DD format.",
            });
        }

        if (endDate < startDate) {
            return res.status(400).json({
                success: false,
                message: "End date cannot be earlier than start date.",
            });
        }

        const employeeExists = await Employee.findById(employee);

        if (!employeeExists) {
            return res.status(404).json({
                success: false,
                message: "Employee not found.",
            });
        }

        const leaveRequest = await Leave.findByIdAndUpdate(
            id,
            {
                employee,
                leaveType,
                startDate,
                endDate,
                reason: reason || "",
            },
            {
                new: true,
                runValidators: true,
            }
        ).populate("employee", "name department");

        if (!leaveRequest) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Leave request updated successfully.",
            data: leaveRequest,
        });
    } catch (error) {
        console.error("Update leave request error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update leave request.",
        });
    }
});

// Approve or reject a leave request.
router.patch("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave request ID.",
            });
        }

        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be Approved or Rejected.",
            });
        }

        const existingRequest = await Leave.findById(id);

        if (!existingRequest) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found.",
            });
        }

        if (existingRequest.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending leave requests can be approved or rejected.",
            });
        }

        const leaveRequest = await Leave.findByIdAndUpdate(
            id,
            { status },
            {
                new: true,
                runValidators: true,
            }
        ).populate("employee", "name department");

        return res.status(200).json({
            success: true,
            message: `Leave request ${status.toLowerCase()} successfully.`,
            data: leaveRequest,
        });
    } catch (error) {
        console.error("Update leave status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update leave request status.",
        });
    }
});

// Delete a leave request.
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave request ID.",
            });
        }

        const leaveRequest = await Leave.findByIdAndDelete(id);

        if (!leaveRequest) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Leave request deleted successfully.",
        });
    } catch (error) {
        console.error("Delete leave request error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete leave request.",
        });
    }
});

export default router;
