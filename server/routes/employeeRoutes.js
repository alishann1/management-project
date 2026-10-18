import express from "express";
import Employee from "../models/Employee.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// GET /api/employees — only authenticated Managers can view all employees
router.get(
    "/",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const employees = await Employee.find().sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                count: employees.length,
                data: employees,
            });
        } catch (error) {
            console.error("Failed to fetch employees:", error.message);

            res.status(500).json({
                success: false,
                message: "Failed to fetch employees",
            });
        }
    }
);


/* POST /api/employees — create an employee */
router.post(
    "/",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const { name, email, department, position, status, performance } =
                req.body;

            if (!name?.trim() || !department?.trim() || !position?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Name, department, and position are required.",
                });
            }

            const validStatuses = ["Active", "Inactive", "On Leave"];

            if (status && !validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid employee status.",
                });
            }

            if (
                performance !== undefined &&
                (Number(performance) < 0 || Number(performance) > 100)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Performance must be between 0 and 100.",
                });
            }

            const employee = await Employee.create({
                name: name.trim(),
                email: email?.trim() || "",
                department: department.trim(),
                role: position.trim(),
                status: status || "Active",
                performance:
                    performance === undefined ? 0 : Number(performance),
            });

            res.status(201).json({
                success: true,
                message: "Employee created successfully.",
                data: employee,
            });
        } catch (error) {
            console.error("Failed to create employee:", error.message);

            res.status(500).json({
                success: false,
                message: "Failed to create employee.",
            });
        }
    }
);



/* PUT /api/employees/:id — update an employee */
router.put(
    "/:id",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const { name, email, department, position, status, performance } =
                req.body;

            if (!name?.trim() || !department?.trim() || !position?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Name, department, and position are required.",
                });
            }

            const validStatuses = ["Active", "Inactive", "On Leave"];

            if (status && !validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid employee status.",
                });
            }

            if (
                performance !== undefined &&
                (!Number.isFinite(Number(performance)) ||
                    Number(performance) < 0 ||
                    Number(performance) > 100)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Performance must be a number between 0 and 100.",
                });
            }

            if (
                performance !== undefined &&
                String(performance).trim() === ""
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Performance must be a number between 0 and 100.",
                });
            }

            const employee = await Employee.findByIdAndUpdate(
                req.params.id,
                {
                    name: name.trim(),
                    email: email?.trim() || "",
                    department: department.trim(),
                    role: position.trim(),
                    status: status || "Active",
                    performance:
                        performance === undefined ? 0 : Number(performance),
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: "Employee not found.",
                });
            }

            res.status(200).json({
                success: true,
                message: "Employee updated successfully.",
                data: employee,
            });
        } catch (error) {
            console.error("Failed to update employee:", error.message);

            res.status(500).json({
                success: false,
                message: "Failed to update employee.",
            });
        }
    }
);


/* DELETE /api/employees/:id — delete an employee */
router.delete(
    "/:id",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const employee = await Employee.findByIdAndDelete(req.params.id);

            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: "Employee not found.",
                });
            }

            res.status(200).json({
                success: true,
                message: "Employee deleted successfully.",
                data: employee,
            });
        } catch (error) {
            console.error("Failed to delete employee:", error.message);

            if (error.name === "CastError") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid employee ID.",
                });
            }

            res.status(500).json({
                success: false,
                message: "Failed to delete employee.",
            });
        }
    }
);



export default router;