
import express from "express";
import crypto from "node:crypto";

import Employee from "../models/Employee.js";
import User from "../models/User.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

import { createEmailVerificationToken } from "../utils/emailVerification.js";

import {
    sendVerificationEmail,
    sendPasswordSetupEmail,
} from "../config/email.js";

const router = express.Router();

// Validate MongoDB ObjectId format.
function mongooseIdIsValid(value) {
    return /^[a-f\d]{24}$/i.test(value);
}

// =====================================================
// INVITE EMPLOYEE
// POST /api/employee-accounts/invite
// Manager only
// =====================================================

router.post(
    "/invite",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        let createdUser = null;

        try {
            const { employeeId } = req.body;

            if (!mongooseIdIsValid(employeeId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid employee ID.",
                });
            }

            const employee = await Employee.findById(employeeId);

            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: "Employee not found.",
                });
            }

            if (
                !employee.email ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "The employee does not have a valid email address.",
                });
            }

            // Prevent duplicate accounts by email or employee reference.
            const existingUser = await User.findOne({
                $or: [
                    { email: employee.email },
                    { employee: employee._id },
                ],
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "An account already exists for this employee or email address.",
                });
            }

            const baseUrl = process.env.FRONTEND_URL;

            if (!baseUrl) {
                return res.status(500).json({
                    success: false,
                    message: "The frontend URL is not configured.",
                });
            }

            // Generate a temporary random password.
            // The employee will create their own password later.
            const temporaryPassword = crypto
                .randomBytes(48)
                .toString("hex");

            // Generate a secure email-verification token.
            const verification = createEmailVerificationToken();

            const user = new User({
                name: employee.name,
                email: employee.email,
                password: temporaryPassword,
                role: "Employee",
                employee: employee._id,
                isAuthorized: true,
                isEmailVerified: false,
                emailVerificationTokenHash: verification.tokenHash,
                emailVerificationExpires: verification.expiresAt,
            });

            await user.save();

            createdUser = user;

            const verificationUrl =
                `${baseUrl.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(verification.token)}`;

            const emailResult = await sendVerificationEmail({
                to: user.email,
                verificationUrl,
            });

            console.log(
                "Ethereal verification email preview:",
                emailResult.previewUrl
            );

            return res.status(201).json({
                success: true,
                message: "Employee account created. Verification email sent successfully.",
            });
        } catch (error) {
            console.error(
                "Employee invitation failed:",
                error.message
            );

            // Remove the newly created account if invitation fails.
            if (createdUser) {
                try {
                    await User.findByIdAndDelete(createdUser._id);
                } catch (deleteError) {
                    console.error(
                        "Failed to remove incomplete employee account:",
                        deleteError.message
                    );
                }
            }

            return res.status(500).json({
                success: false,
                message: "Unable to create the employee account or send the verification email.",
            });
        }
    }
);

// =====================================================
// GET EMPLOYEE ACCOUNT STATUSES
// GET /api/employee-accounts/status
// Manager only
// =====================================================

router.get(
    "/status",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const employees = await Employee.find()
                .select("_id")
                .lean();

            const employeeIds = employees.map(
                (employee) => employee._id
            );

            const users = await User.find({
                role: "Employee",
                employee: { $in: employeeIds },
            })
                .select(
                    "+emailVerificationTokenHash " +
                    "+emailVerificationExpires " +
                    "+passwordSetupTokenHash " +
                    "+passwordSetupExpires"
                )
                .lean();

            const accountMap = new Map(
                users.map((user) => [
                    String(user.employee),
                    user,
                ])
            );

            const now = new Date();

            const data = employees.map((employee) => {
                const account = accountMap.get(
                    String(employee._id)
                );

                let status = "No Account";

                if (account) {
                    if (!account.isAuthorized) {
                        status = "Access Disabled";
                    } else if (!account.isEmailVerified) {
                        status =
                            account.emailVerificationTokenHash &&
                                account.emailVerificationExpires &&
                                account.emailVerificationExpires > now
                                ? "Verification Pending"
                                : "Verification Expired";
                    } else {
                        const hasPasswordSetupToken =
                            Boolean(account.passwordSetupTokenHash) ||
                            Boolean(account.passwordSetupExpires);

                        if (!hasPasswordSetupToken) {
                            status = "Active";
                        } else if (
                            account.passwordSetupTokenHash &&
                            account.passwordSetupExpires &&
                            account.passwordSetupExpires > now
                        ) {
                            status = "Password Setup Pending";
                        } else {
                            status = "Password Setup Expired";
                        }
                    }
                }

                return {
                    employeeId: String(employee._id),
                    status,
                };
            });

            return res.status(200).json({
                success: true,
                data,
            });
        } catch (error) {
            console.error(
                "Fetching employee account statuses failed:",
                error.message
            );

            return res.status(500).json({
                success: false,
                message: "Unable to fetch employee account statuses.",
            });
        }
    }
);

// =====================================================
// RESEND EMAIL VERIFICATION
// POST /api/employee-accounts/:employeeId/resend-verification
// Manager only
// =====================================================

router.post(
    "/:employeeId/resend-verification",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const { employeeId } = req.params;

            if (!mongooseIdIsValid(employeeId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid employee ID.",
                });
            }

            const user = await User.findOne({
                employee: employeeId,
                role: "Employee",
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "No employee account was found.",
                });
            }

            if (!user.isAuthorized) {
                return res.status(403).json({
                    success: false,
                    message: "This employee account is not authorized.",
                });
            }

            if (user.isEmailVerified) {
                return res.status(409).json({
                    success: false,
                    message: "This email address is already verified. Use password setup instead.",
                });
            }

            const baseUrl = process.env.FRONTEND_URL;

            if (!baseUrl) {
                return res.status(500).json({
                    success: false,
                    message: "The frontend URL is not configured.",
                });
            }

            // Generate a fresh verification token.
            const verification = createEmailVerificationToken();

            user.emailVerificationTokenHash =
                verification.tokenHash;

            user.emailVerificationExpires =
                verification.expiresAt;

            await user.save();

            const verificationUrl =
                `${baseUrl.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(verification.token)}`;

            const emailResult = await sendVerificationEmail({
                to: user.email,
                verificationUrl,
            });

            console.log(
                "Ethereal verification email preview:",
                emailResult.previewUrl
            );

            return res.status(200).json({
                success: true,
                message: "Verification email sent successfully.",
            });
        } catch (error) {
            console.error(
                "Resending verification email failed:",
                error.message
            );

            return res.status(500).json({
                success: false,
                message: "Unable to resend the verification email.",
            });
        }
    }
);

// =====================================================
// RESEND PASSWORD SETUP EMAIL
// POST /api/employee-accounts/:employeeId/resend-password-setup
// Manager only
// =====================================================

router.post(
    "/:employeeId/resend-password-setup",
    authenticateToken,
    authorizeRole("Manager"),
    async (req, res) => {
        try {
            const { employeeId } = req.params;

            if (!mongooseIdIsValid(employeeId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid employee ID.",
                });
            }

            const user = await User.findOne({
                employee: employeeId,
                role: "Employee",
            }).select(
                "+passwordSetupTokenHash +passwordSetupExpires"
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "No employee account was found.",
                });
            }

            if (!user.isAuthorized) {
                return res.status(403).json({
                    success: false,
                    message: "This employee account is not authorized.",
                });
            }

            if (!user.isEmailVerified) {
                return res.status(409).json({
                    success: false,
                    message: "The employee must verify their email first.",
                });
            }

            const hasPasswordSetupToken =
                Boolean(user.passwordSetupTokenHash) ||
                Boolean(user.passwordSetupExpires);

            if (!hasPasswordSetupToken) {
                return res.status(409).json({
                    success: false,
                    message: "This employee has already completed password setup.",
                });
            }

            const baseUrl = process.env.FRONTEND_URL;

            if (!baseUrl) {
                return res.status(500).json({
                    success: false,
                    message: "The frontend URL is not configured.",
                });
            }

            // Generate a fresh password-setup token.
            const passwordSetup = createEmailVerificationToken();

            user.passwordSetupTokenHash =
                passwordSetup.tokenHash;

            user.passwordSetupExpires =
                passwordSetup.expiresAt;

            await user.save();

            const passwordSetupUrl =
                `${baseUrl.replace(/\/$/, "")}/set-password?token=${encodeURIComponent(passwordSetup.token)}`;

            const emailResult = await sendPasswordSetupEmail({
                to: user.email,
                passwordSetupUrl,
            });

            console.log(
                "Ethereal password-setup email preview:",
                emailResult.previewUrl
            );

            return res.status(200).json({
                success: true,
                message: "Password-setup email sent successfully.",
            });
        } catch (error) {
            console.error(
                "Resending password-setup email failed:",
                error.message
            );

            return res.status(500).json({
                success: false,
                message: "Unable to resend the password-setup email.",
            });
        }
    }
);

export default router;
