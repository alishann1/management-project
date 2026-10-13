import express from "express";
import User from "../models/User.js";
import { hashEmailVerificationToken } from "../utils/emailVerification.js";

const router = express.Router();

// POST /api/password-setup
router.post("/", async (req, res) => {
    try {
        const { token, password } = req.body;

        if (
            typeof token !== "string" ||
            !token.trim() ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid setup token and password are required.",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters.",
            });
        }

        const tokenHash = hashEmailVerificationToken(token);

        const user = await User.findOne({
            passwordSetupTokenHash: tokenHash,
            passwordSetupExpires: { $gt: new Date() },
            isEmailVerified: true,
            isAuthorized: true,
            role: "Employee",
        }).select("+passwordSetupTokenHash +passwordSetupExpires");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "This password-setup link is invalid or has expired.",
            });
        }

        // Update the password and invalidate the setup link.
        user.password = password;
        user.passwordSetupTokenHash = undefined;
        user.passwordSetupExpires = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password set successfully. You can now sign in.",
        });
    } catch (error) {
        console.error("Password setup failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to set your password right now. Please try again.",
        });
    }
});

export default router;
