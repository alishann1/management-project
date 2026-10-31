
import express from "express";
import Project from "../models/Project.js";
import Employee from "../models/Employee.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// Check whether the selected manager belongs to the selected department.
const validateProjectManager = async (manager, department) => {
    const employee = await Employee.findOne({
        name: manager.trim(),
        department: department.trim(),
    });

    return employee;
};

// GET all projects
router.get(
    "/",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const projects = await Project.find().sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                data: projects,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch projects.",
            });
        }
    }
);

// CREATE a project
router.post(
    "/",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const {
                name,
                description,
                department,
                manager,
                status,
                startDate,
                dueDate,
                progress,
            } = req.body;

            if (
                !name?.trim() ||
                !description?.trim() ||
                !department?.trim() ||
                !manager?.trim() ||
                !startDate ||
                !dueDate
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide all required project fields.",
                });
            }

            if (
                Number.isNaN(new Date(startDate).getTime()) ||
                Number.isNaN(new Date(dueDate).getTime())
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide valid project dates.",
                });
            }

            if (new Date(dueDate) < new Date(startDate)) {
                return res.status(400).json({
                    success: false,
                    message: "Due date cannot be earlier than start date.",
                });
            }

            // Verify that the manager exists in the selected department.
            const employee = await validateProjectManager(
                manager,
                department
            );

            if (!employee) {
                return res.status(400).json({
                    success: false,
                    message:
                        "The selected project manager does not belong to the selected department.",
                });
            }

            const project = await Project.create({
                name: name.trim(),
                description: description.trim(),
                department: department.trim(),
                manager: employee.name,
                status,
                startDate,
                dueDate,
                progress,
            });

            return res.status(201).json({
                success: true,
                message: "Project created successfully.",
                data: project,
            });
        } catch (error) {
            if (error.name === "ValidationError") {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to create project.",
            });
        }
    }
);

// UPDATE a project
router.put(
    "/:id",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const {
                name,
                description,
                department,
                manager,
                status,
                startDate,
                dueDate,
                progress,
            } = req.body;

            if (
                !name?.trim() ||
                !description?.trim() ||
                !department?.trim() ||
                !manager?.trim() ||
                !startDate ||
                !dueDate
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide all required project fields.",
                });
            }

            if (
                Number.isNaN(new Date(startDate).getTime()) ||
                Number.isNaN(new Date(dueDate).getTime())
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide valid project dates.",
                });
            }

            if (new Date(dueDate) < new Date(startDate)) {
                return res.status(400).json({
                    success: false,
                    message: "Due date cannot be earlier than start date.",
                });
            }

            // Verify that the manager exists in the selected department.
            const employee = await validateProjectManager(
                manager,
                department
            );

            if (!employee) {
                return res.status(400).json({
                    success: false,
                    message:
                        "The selected project manager does not belong to the selected department.",
                });
            }

            const project = await Project.findByIdAndUpdate(
                req.params.id,
                {
                    name: name.trim(),
                    description: description.trim(),
                    department: department.trim(),
                    manager: employee.name,
                    status,
                    startDate,
                    dueDate,
                    progress,
                },
                { new: true, runValidators: true }
            );

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found.",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Project updated successfully.",
                data: project,
            });
        } catch (error) {
            if (error.name === "ValidationError") {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }

            if (error.name === "CastError") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid project ID.",
                });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to update project.",
            });
        }
    }
);

// DELETE a project
router.delete(
    "/:id",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const project = await Project.findByIdAndDelete(req.params.id);

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found.",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Project deleted successfully.",
                data: project,
            });
        } catch (error) {
            if (error.name === "CastError") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid project ID.",
                });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to delete project.",
            });
        }
    }
);

export default router;
