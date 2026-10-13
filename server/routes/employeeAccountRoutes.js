import express from "express";
import crypto from "node:crypto";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import { createEmailVerificationToken } from "../utils/emailVerification.js";
import { sendVerificationEmail } from "../config/email.js";

const router = express.Router();

// POST /api/employee-accounts/invite
// Only authenticated Managers can create accounts for existing employees.
router.post(
    "/invite",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        let createdUserId;

        try {
            const { employeeId, email } = req.body;

            if (
                typeof employeeId !== "string" ||
                !mongooseIdIsValid(employeeId) ||
                typeof email !== "string" ||
                !email.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "A valid employee ID and email address are required.",
                });
            }

            const normalizedEmail = email.trim().toLowerCase();

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid email address.",
                });
            }

            const employee = await Employee.findById(employeeId);

            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: "The selected employee was not found.",
                });
            }

            const existingAccount = await User.findOne({
                $or: [
                    { email: normalizedEmail },
                    { employee: employee._id },
                ],
            });

            if (existingAccount) {
                return res.status(409).json({
                    success: false,
                    message: "This email address or employee already has an account.",
                });
            }

            // The employee will choose their own password using a secure link.
            const temporaryPassword = crypto.randomBytes(48).toString("hex");
            const verification = createEmailVerificationToken();

            const user = new User({
                name: employee.name,
                email: normalizedEmail,
                password: temporaryPassword,
                role: "Employee",
                employee: employee._id,
                isAuthorized: true,
                isEmailVerified: false,
                emailVerificationTokenHash: verification.tokenHash,
                emailVerificationExpires: verification.expiresAt,
            });

            await user.save();
            createdUserId = user._id;

            const baseUrl = process.env.FRONTEND_URL;

            if (!baseUrl) {
                await User.findByIdAndDelete(user._id);
                createdUserId = undefined;

                return res.status(500).json({
                    success: false,
                    message: "The frontend URL is not configured on the server.",
                });
            }

            const verificationUrl =
                `${baseUrl.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(verification.token)}`;

            const emailResult = await sendVerificationEmail({
                to: normalizedEmail,
                verificationUrl,
            });

            console.log(
                "Ethereal verification email preview:",
                emailResult.previewUrl,
            );

            return res.status(201).json({
                success: true,
                message: "Employee account created. Open the verification email preview shown in the server terminal.",
            });
        } catch (error) {
            console.error("Employee invitation failed:", error.message);

            // Avoid leaving an unusable account behind if email delivery fails.
            if (createdUserId) {
                try {
                    await User.findByIdAndDelete(createdUserId);
                } catch (cleanupError) {
                    console.error(
                        "Invitation cleanup failed:",
                        cleanupError.message,
                    );
                }
            }

            return res.status(500).json({
                success: false,
                message: "Unable to create the employee account right now.",
            });
        }
    },
);

function mongooseIdIsValid(value) {
    return /^[a-f\d]{24}$/i.test(value);
}

export default router;
