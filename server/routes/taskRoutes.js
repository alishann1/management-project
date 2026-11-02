
import express from "express";
import Task from "../models/Task.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Employee from "../models/Employee.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();


// Shared validation for project, department, and employee assignment.
const validateTaskAssignment = async (projectName, departmentName, employeeName) => {
    const project = await Project.findOne({
        name: projectName.trim(),
        department: departmentName.trim(),
    });

    if (!project) {
        return {
            error: "The selected project does not exist or does not belong to the selected department.",
        };
    }

    const employee = await Employee.findOne({
        name: employeeName.trim(),
        department: project.department,
    });

    if (!employee) {
        return {
            error: "The assigned employee does not belong to the selected project's department.",
        };
    }

    return { employee };
};


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


// GET /api/tasks
// Only authenticated Managers can view all tasks.
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


// PATCH /api/tasks/my-tasks/:id
// Employees can update progress on their own assigned tasks.
router.patch(
    "/my-tasks/:id",
    authenticateToken,
    authorizeRole("Employee"),
    async (req, res) => {
        try {
            const { progress } = req.body;

            if (
                progress === undefined ||
                typeof progress !== "number" ||
                !Number.isInteger(progress) ||
                progress < 0 ||
                progress > 100
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Progress must be a whole number between 0 and 100.",
                });
            }

            const user = await User.findById(req.user.userId).select(
                "employee role"
            );

            if (!user || !user.employee || user.role !== "Employee") {
                return res.status(403).json({
                    success: false,
                    message: "Your employee account is not linked to an employee record.",
                });
            }

            const task = await Task.findOne({
                _id: req.params.id,
                assignedTo: user.employee,
            });

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: "Task not found or not assigned to you.",
                });
            }

            task.progress = progress;

            await task.save();

            return res.status(200).json({
                success: true,
                message: "Task progress updated successfully.",
                data: task,
            });
        } catch (error) {
            console.error("Failed to update employee task:", error.message);

            if (error.name === "CastError") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid task ID.",
                });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to update task progress.",
            });
        }
    }
);


// POST /api/tasks
// Managers can create tasks.
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
                !assignedTo?.trim() ||
                !dueDate
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide all required task fields.",
                });
            }

            // Verify project, department, and employee assignment.
            const assignment = await validateTaskAssignment(
                project,
                department,
                assignedTo
            );

            if (assignment.error) {
                return res.status(400).json({
                    success: false,
                    message: assignment.error,
                });
            }

            const task = await Task.create({
                title: title.trim(),
                description: description.trim(),
                project: project.trim(),
                department: department.trim(),
                assignedTo: assignment.employee._id,
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


// PUT /api/tasks/:id
// Managers can update existing tasks.
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
                !assignedTo?.trim() ||
                !dueDate
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide all required task fields.",
                });
            }

            // Verify project, department, and employee assignment.
            const assignment = await validateTaskAssignment(
                project,
                department,
                assignedTo
            );

            if (assignment.error) {
                return res.status(400).json({
                    success: false,
                    message: assignment.error,
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
            task.assignedTo = assignment.employee._id;
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


// DELETE /api/tasks/:id
// Managers can delete tasks.
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
