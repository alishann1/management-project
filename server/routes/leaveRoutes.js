
import express from "express";
import mongoose from "mongoose";

import Leave from "../models/Leave.js";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all leave routes.
router.use(authenticateToken);

// Verify the authenticated user using the database.
router.use(async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.user?.userId)) {
            return res.status(401).json({
                success: false,
                message: "Invalid user account. Please sign in again.",
            });
        }

        const user = await User.findById(req.user.userId)
            .select("role employee");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User account not found. Please sign in again.",
            });
        }

        // Reject tokens containing an outdated role.
        if (user.role !== req.user.role) {
            return res.status(401).json({
                success: false,
                message: "Your account permissions have changed. Please sign in again.",
            });
        }

        req.authUser = user;

        // Verify that an Employee account has a valid employee record.
        if (user.role === "Employee") {
            if (!user.employee) {
                return res.status(403).json({
                    success: false,
                    message: "Your account is not linked to an employee record.",
                });
            }

            const employeeExists = await Employee.findById(user.employee);

            if (!employeeExists) {
                return res.status(403).json({
                    success: false,
                    message: "Your employee record could not be found.",
                });
            }

            req.employeeId = employeeExists._id;
        }

        next();
    } catch (error) {
        console.error("Leave authentication error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to verify account permissions.",
        });
    }
});

const allowedLeaveTypes = [
    "Annual Leave",
    "Sick Leave",
    "Casual Leave",
];

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

const validateLeaveDetails = (data) => {
    const {
        leaveType,
        startDate,
        endDate,
    } = data;

    if (!leaveType || !startDate || !endDate) {
        return "Leave type, start date, and end date are required.";
    }

    if (!allowedLeaveTypes.includes(leaveType)) {
        return "Invalid leave type.";
    }

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
        return "Please provide valid dates in YYYY-MM-DD format.";
    }

    if (endDate < startDate) {
        return "End date cannot be earlier than start date.";
    }

    return null;
};

const requireManager = (req, res, next) => {
    if (req.authUser.role !== "Manager") {
        return res.status(403).json({
            success: false,
            message: "Only managers can perform this action.",
        });
    }

    next();
};

const requireEmployee = (req, res, next) => {
    if (req.authUser.role !== "Employee") {
        return res.status(403).json({
            success: false,
            message: "Only employees can perform this action.",
        });
    }

    next();
};

// GET leave requests.
// Manager: all requests.
// Employee: their own requests only.
router.get("/", async (req, res) => {
    try {
        const filter =
            req.authUser.role === "Manager"
                ? {}
                : { employee: req.employeeId };

        const leaveRequests = await Leave.find(filter)
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

// POST a leave request.
// Employees can submit requests only for themselves.
router.post("/", requireEmployee, async (req, res) => {
    try {
        const validationError = validateLeaveDetails(req.body);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        const leaveRequest = await Leave.create({
            employee: req.employeeId,
            leaveType: req.body.leaveType,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            reason: req.body.reason || "",
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

// PUT a leave request.
// Employees can edit only their own pending requests.
router.put("/:id", requireEmployee, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave request ID.",
            });
        }

        const validationError = validateLeaveDetails(req.body);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        const existingRequest = await Leave.findOne({
            _id: id,
            employee: req.employeeId,
        });

        if (!existingRequest) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found.",
            });
        }

        if (existingRequest.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending leave requests can be edited.",
            });
        }

        const leaveRequest = await Leave.findByIdAndUpdate(
            id,
            {
                leaveType: req.body.leaveType,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                reason: req.body.reason || "",
            },
            {
                new: true,
                runValidators: true,
            }
        ).populate("employee", "name department");

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

// PATCH leave status.
// Only managers can approve or reject requests.
router.patch("/:id/status", requireManager, async (req, res) => {
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

// DELETE a leave request.
// Only managers can delete requests.
router.delete("/:id", requireManager, async (req, res) => {
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
