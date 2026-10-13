import express from "express";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import Employee from "../models/Employee.js";


const router = express.Router();

// GET /api/tasks/my-tasks
// Employees can only view tasks assigned to their linked Employee record.
router.get(
    "/my-tasks",
    authenticateToken,
    authorizeRole("Employee"),
    async (req, res) => {
        try {
            const user = await User.findById(req.user.userId).select(
                "employee role"
            );

            if (!user || !user.employee || user.role !== "Employee") {
                return res.status(403).json({
                    success: false,
                    message: "Your employee account is not linked to an employee record.",
                });
            }

            const tasks = await Task.find({
                assignedTo: user.employee,
            }).sort({ dueDate: 1 });

            return res.status(200).json({
                success: true,
                count: tasks.length,
                data: tasks,
            });
        } catch (error) {
            console.error("Failed to fetch employee tasks:", error.message);

            return res.status(500).json({
                success: false,
                message: "Unable to fetch your tasks right now.",
            });
        }
    }
);



// GET /api/tasks — only authenticated Managers can view all tasks
router.get(
    "/",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const tasks = await Task.find()
                .populate("assignedTo", "name department role")
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                count: tasks.length,
                data: tasks,
            });
        } catch (error) {
            console.error("Failed to fetch tasks:", error.message);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch tasks",
            });
        }
    }
);



// POST /api/tasks — Managers can create tasks
router.post(
    "/",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const {
                title,
                description,
                project,
                department,
                assignedTo,
                priority,
                dueDate,
                progress,
            } = req.body;

            if (
                !title?.trim() ||
                !description?.trim() ||
                !project?.trim() ||
                !department?.trim() ||
                !assignedTo ||
                !dueDate
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide all required task fields.",
                });
            }

            // Find the employee by their name from the existing form.
            const employee = await Employee.findOne({
                name: assignedTo.trim(),
            });

            if (!employee) {
                return res.status(400).json({
                    success: false,
                    message: "The assigned employee was not found.",
                });
            }

            const task = await Task.create({
                title: title.trim(),
                description: description.trim(),
                project: project.trim(),
                department: department.trim(),
                assignedTo: employee._id,
                priority,
                dueDate,
                progress: progress ?? 0,
            });

            const populatedTask = await Task.findById(task._id).populate(
                "assignedTo",
                "name department role"
            );

            return res.status(201).json({
                success: true,
                message: "Task created successfully.",
                data: populatedTask,
            });
        } catch (error) {
            console.error("Failed to create task:", error.message);

            if (error.name === "ValidationError" || error.name === "CastError") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid task details. Please check the submitted values.",
                });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to create task.",
            });
        }
    }
);



// PUT /api/tasks/:id — Managers can update existing tasks
router.put(
    "/:id",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const {
                title,
                description,
                project,
                department,
                assignedTo,
                priority,
                dueDate,
                progress,
            } = req.body;

            if (
                !title?.trim() ||
                !description?.trim() ||
                !project?.trim() ||
                !department?.trim() ||
                !assignedTo ||
                !dueDate
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide all required task fields.",
                });
            }

            const employee = await Employee.findOne({
                name: assignedTo.trim(),
            });

            if (!employee) {
                return res.status(400).json({
                    success: false,
                    message: "The assigned employee was not found.",
                });
            }

            const task = await Task.findById(req.params.id);

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: "Task not found.",
                });
            }

            task.title = title.trim();
            task.description = description.trim();
            task.project = project.trim();
            task.department = department.trim();
            task.assignedTo = employee._id;
            task.priority = priority;
            task.dueDate = dueDate;
            task.progress = progress ?? 0;

            await task.save();

            const updatedTask = await Task.findById(task._id).populate(
                "assignedTo",
                "name department role"
            );

            return res.status(200).json({
                success: true,
                message: "Task updated successfully.",
                data: updatedTask,
            });
        } catch (error) {
            console.error("Failed to update task:", error.message);

            if (error.name === "ValidationError" || error.name === "CastError") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid task details. Please check the submitted values.",
                });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to update task.",
            });
        }
    }
);



// DELETE /api/tasks/:id — Managers can delete tasks
router.delete(
    "/:id",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const task = await Task.findByIdAndDelete(req.params.id);

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: "Task not found.",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Task deleted successfully.",
            });
        } catch (error) {
            console.error("Failed to delete task:", error.message);

            if (error.name === "CastError") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid task ID.",
                });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to delete task.",
            });
        }
    }
);


export default router;