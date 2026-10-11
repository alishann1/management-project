
import express from "express";
import Employee from "../models/Employee.js";

const router = express.Router();

// GET /api/employees
router.get("/", async (req, res) => {
    try {
        const employees = await Employee.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: employees.length,
            data: employees,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch employees",
        });
    }
});

export default router;
