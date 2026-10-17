
import express from "express";
import Goal from "../models/Goal.js";
import Employee from "../models/Employee.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// GET /api/goals — Managers can view all goals.
router.get(
    "/",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const goals = await Goal.find()
                .populate("employee", "name department role")
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                count: goals.length,
                data: goals,
            });
        } catch (error) {
            console.error("Failed to fetch goals:", error.message);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch goals.",
            });
        }
    }
);

// POST /api/goals — Managers can create goals.
router.post(
    "/",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const {
                title,
                description,
                employee,
                department,
                category,
                target,
                progress,
                deadline,
            } = req.body;

            if (
                !title?.trim() ||
                !description?.trim() ||
                !employee?.trim() ||
                !department?.trim() ||
                !category ||
                target === undefined ||
                target === "" ||
                !deadline
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide all required goal fields.",
                });
            }

            const numericTarget = Number(target);
            const numericProgress = Number(progress ?? 0);

            if (
                !Number.isFinite(numericTarget) ||
                numericTarget < 1 ||
                !Number.isFinite(numericProgress) ||
                numericProgress < 0 ||
                numericProgress > 100
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Target must be at least 1 and progress must be between 0 and 100.",
                });
            }

            // Resolve the employee name from the existing form.
            const employeeRecord = await Employee.findOne({
                name: employee.trim(),
            });

            if (!employeeRecord) {
                return res.status(400).json({
                    success: false,
                    message: "The selected employee was not found.",
                });
            }

            if (employeeRecord.department !== department.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "The selected employee does not belong to that department.",
                });
            }

            const goal = await Goal.create({
                title: title.trim(),
                description: description.trim(),
                employee: employeeRecord._id,
                department: department.trim(),
                category,
                target: numericTarget,
                progress: numericProgress,
                deadline,
            });

            const populatedGoal = await Goal.findById(goal._id).populate(
                "employee",
                "name department role"
            );

            return res.status(201).json({
                success: true,
                message: "Goal created successfully.",
                data: populatedGoal,
            });
        } catch (error) {
            console.error("Failed to create goal:", error.message);

            if (
                error.name === "ValidationError" ||
                error.name === "CastError"
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid goal details. Please check the submitted values.",
                });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to create goal.",
            });
        }
    }
);

// PUT /api/goals/:id — Managers can update goals.
router.put(
    "/:id",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const {
                title,
                description,
                employee,
                department,
                category,
                target,
                progress,
                deadline,
            } = req.body;

            if (
                !title?.trim() ||
                !description?.trim() ||
                !employee?.trim() ||
                !department?.trim() ||
                !category ||
                target === undefined ||
                target === "" ||
                !deadline
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide all required goal fields.",
                });
            }

            const numericTarget = Number(target);
            const numericProgress = Number(progress ?? 0);

            if (
                !Number.isFinite(numericTarget) ||
                numericTarget < 1 ||
                !Number.isFinite(numericProgress) ||
                numericProgress < 0 ||
                numericProgress > 100
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Target must be at least 1 and progress must be between 0 and 100.",
                });
            }

            const employeeRecord = await Employee.findOne({
                name: employee.trim(),
            });

            if (!employeeRecord) {
                return res.status(400).json({
                    success: false,
                    message: "The selected employee was not found.",
                });
            }

            if (employeeRecord.department !== department.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "The selected employee does not belong to that department.",
                });
            }

            const goal = await Goal.findById(req.params.id);

            if (!goal) {
                return res.status(404).json({
                    success: false,
                    message: "Goal not found.",
                });
            }

            goal.title = title.trim();
            goal.description = description.trim();
            goal.employee = employeeRecord._id;
            goal.department = department.trim();
            goal.category = category;
            goal.target = numericTarget;
            goal.progress = numericProgress;
            goal.deadline = deadline;

            await goal.save();

            const updatedGoal = await Goal.findById(goal._id).populate(
                "employee",
                "name department role"
            );

            return res.status(200).json({
                success: true,
                message: "Goal updated successfully.",
                data: updatedGoal,
            });
        } catch (error) {
            console.error("Failed to update goal:", error.message);

            if (
                error.name === "ValidationError" ||
                error.name === "CastError"
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid goal details. Please check the submitted values.",
                });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to update goal.",
            });
        }
    }
);

// DELETE /api/goals/:id — Managers can delete goals.
router.delete(
    "/:id",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const goal = await Goal.findByIdAndDelete(req.params.id);

            if (!goal) {
                return res.status(404).json({
                    success: false,
                    message: "Goal not found.",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Goal deleted successfully.",
            });
        } catch (error) {
            console.error("Failed to delete goal:", error.message);

            if (error.name === "CastError") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid goal ID.",
                });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to delete goal.",
            });
        }
    }
);

export default router;
