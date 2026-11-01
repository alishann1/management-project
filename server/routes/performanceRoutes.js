
import express from "express";
import mongoose from "mongoose";

import Performance from "../models/Performance.js";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// GET performance reviews for the logged-in employee
router.get(
    "/my-performance",
    authenticateToken,
    authorizeRole("Employee"),
    async (req, res) => {
        try {
            // Find the logged-in user's linked employee record
            const user = await User.findById(req.user.userId)
                .select("role employee");

            if (!user || user.role !== "Employee" || !user.employee) {
                return res.status(403).json({
                    success: false,
                    message: "Employee account or linked employee record not found.",
                });
            }

            // Fetch only this employee's performance reviews
            const reviews = await Performance.find({
                employee: user.employee,
            })
                .populate("employee", "name department role")
                .sort({ reviewDate: -1, createdAt: -1 });

            return res.status(200).json({
                success: true,
                data: reviews,
            });
        } catch (error) {
            console.error("Fetch employee performance error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch your performance reviews.",
            });
        }
    }
);

// GET all performance reviews
router.get(
    "/",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const reviews = await Performance.find()
                .populate("employee", "name department role")
                .sort({ reviewDate: -1, createdAt: -1 });

            return res.status(200).json({
                success: true,
                data: reviews,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch performance reviews.",
            });
        }
    }
);

// CREATE a performance review
router.post(
    "/",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const {
                employeeId,
                reviewPeriod,
                score,
                strengths,
                improvements,
                reviewDate,
            } = req.body;

            // Validate employee ID
            if (
                !employeeId ||
                !mongoose.Types.ObjectId.isValid(employeeId)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please select a valid employee.",
                });
            }

            // Validate required fields
            if (
                typeof reviewPeriod !== "string" ||
                !reviewPeriod.trim() ||
                score === undefined ||
                score === null ||
                score === "" ||
                typeof strengths !== "string" ||
                !strengths.trim() ||
                typeof improvements !== "string" ||
                !improvements.trim() ||
                !reviewDate
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Please provide all required performance review fields.",
                });
            }

            const numericScore = Number(score);

            if (
                !Number.isFinite(numericScore) ||
                numericScore < 0 ||
                numericScore > 100
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Performance score must be between 0 and 100.",
                });
            }

            const parsedDate = new Date(reviewDate);

            if (Number.isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid review date.",
                });
            }

            // Find employee using MongoDB ObjectId
            const employeeRecord = await Employee.findById(employeeId);

            if (!employeeRecord) {
                return res.status(404).json({
                    success: false,
                    message: "Selected employee was not found.",
                });
            }

            // Create review using the employee's actual department
            const review = await Performance.create({
                employee: employeeRecord._id,
                department: employeeRecord.department,
                reviewPeriod: reviewPeriod.trim(),
                score: numericScore,
                strengths: strengths.trim(),
                improvements: improvements.trim(),
                reviewDate: parsedDate,
            });

            const populatedReview = await Performance.findById(review._id)
                .populate("employee", "name department role");

            return res.status(201).json({
                success: true,
                message: "Performance review created successfully.",
                data: populatedReview,
            });
        } catch (error) {
            console.error("Create performance review error:", error);

            return res.status(500).json({
                success: false,
                message:
                    error.message || "Failed to create performance review.",
            });
        }
    }
);

// UPDATE a performance review
router.put(
    "/:id",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid performance review ID.",
                });
            }

            const {
                employeeId,
                reviewPeriod,
                score,
                strengths,
                improvements,
                reviewDate,
            } = req.body;

            if (
                !employeeId ||
                !mongoose.Types.ObjectId.isValid(employeeId) ||
                typeof reviewPeriod !== "string" ||
                !reviewPeriod.trim() ||
                score === undefined ||
                score === null ||
                score === "" ||
                typeof strengths !== "string" ||
                !strengths.trim() ||
                typeof improvements !== "string" ||
                !improvements.trim() ||
                !reviewDate
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Please provide all required performance review fields.",
                });
            }

            const numericScore = Number(score);

            if (
                !Number.isFinite(numericScore) ||
                numericScore < 0 ||
                numericScore > 100
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Performance score must be between 0 and 100.",
                });
            }

            const parsedDate = new Date(reviewDate);

            if (Number.isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid review date.",
                });
            }

            const employeeRecord = await Employee.findById(employeeId);

            if (!employeeRecord) {
                return res.status(404).json({
                    success: false,
                    message: "Selected employee was not found.",
                });
            }

            const review = await Performance.findById(id);

            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: "Performance review not found.",
                });
            }

            review.employee = employeeRecord._id;
            review.department = employeeRecord.department;
            review.reviewPeriod = reviewPeriod.trim();
            review.score = numericScore;
            review.strengths = strengths.trim();
            review.improvements = improvements.trim();
            review.reviewDate = parsedDate;

            await review.save();

            const populatedReview = await Performance.findById(review._id)
                .populate("employee", "name department role");

            return res.status(200).json({
                success: true,
                message: "Performance review updated successfully.",
                data: populatedReview,
            });
        } catch (error) {
            console.error("Update performance review error:", error);

            return res.status(500).json({
                success: false,
                message:
                    error.message || "Failed to update performance review.",
            });
        }
    }
);

// DELETE a performance review
router.delete(
    "/:id",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid performance review ID.",
                });
            }

            const review = await Performance.findByIdAndDelete(id);

            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: "Performance review not found.",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Performance review deleted successfully.",
            });
        } catch (error) {
            console.error("Delete performance review error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to delete performance review.",
            });
        }
    }
);

export default router;
