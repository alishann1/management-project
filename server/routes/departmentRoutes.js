
import express from "express";
import Department from "../models/Department.js";
import Employee from "../models/Employee.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// Find an existing employee by name, ignoring capitalization and extra spaces.
const findExistingManager = async (managerName) => {
    if (typeof managerName !== "string" || !managerName.trim()) {
        return null;
    }

    const normalizedName = managerName.trim().replace(/\s+/g, " ");

    return Employee.findOne({
        name: {
            $regex: `^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            $options: "i",
        },
    });
};

// GET all departments
router.get(
    "/",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const departments = await Department.find().sort({ name: 1 });

            return res.status(200).json({
                success: true,
                data: departments,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch departments.",
            });
        }
    }
);

// CREATE a department
router.post(
    "/",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const { name, description, manager, projects } = req.body;

            if (!name?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Department name is required.",
                });
            }

            const existingManager = await findExistingManager(manager);

            if (!existingManager) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid department manager. Please select an existing employee.",
                });
            }

            const department = await Department.create({
                name: name.trim(),
                description,
                manager: existingManager.name,
                projects,
            });

            return res.status(201).json({
                success: true,
                message: "Department created successfully.",
                data: department,
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "A department with this name already exists.",
                });
            }

            if (error.name === "ValidationError") {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to create department.",
            });
        }
    }
);

// UPDATE a department
router.put(
    "/:id",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const { name, description, manager, projects } = req.body;

            if (!name?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Department name is required.",
                });
            }

            const existingManager = await findExistingManager(manager);

            if (!existingManager) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid department manager. Please select an existing employee.",
                });
            }

            const department = await Department.findByIdAndUpdate(
                req.params.id,
                {
                    name: name.trim(),
                    description,
                    manager: existingManager.name,
                    projects,
                },
                { new: true, runValidators: true }
            );

            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found.",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Department updated successfully.",
                data: department,
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "A department with this name already exists.",
                });
            }

            if (error.name === "ValidationError") {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }

            if (error.name === "CastError") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid department ID.",
                });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to update department.",
            });
        }
    }
);

// DELETE a department
router.delete(
    "/:id",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const department = await Department.findByIdAndDelete(
                req.params.id
            );

            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found.",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Department deleted successfully.",
                data: department,
            });
        } catch (error) {
            if (error.name === "CastError") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid department ID.",
                });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to delete department.",
            });
        }
    }
);

export default router;
