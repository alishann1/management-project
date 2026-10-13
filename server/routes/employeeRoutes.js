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

export default router;