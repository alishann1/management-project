import express from "express";
import Employee from "../models/Employee.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/employees — requires a valid login token
router.get("/", authenticateToken, async (req, res) => {
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
});

export default router;