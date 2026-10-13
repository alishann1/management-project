import express from "express";
import User from "../models/User.js";
import {
    hashEmailVerificationToken,
    createEmailVerificationToken,
} from "../utils/emailVerification.js";
import { sendPasswordSetupEmail } from "../config/email.js";

const router = express.Router();

// GET /api/email-verification/verify?token=...
router.get("/verify", async (req, res) => {
    try {
        const { token } = req.query;

        if (typeof token !== "string" || !token.trim()) {
            return res.status(400).json({
                success: false,
                message: "A verification token is required.",
            });
        }

        const tokenHash = hashEmailVerificationToken(token);

        const user = await User.findOne({
            emailVerificationTokenHash: tokenHash,
            emailVerificationExpires: { $gt: new Date() },
        }).select("+emailVerificationTokenHash +emailVerificationExpires");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "This verification link is invalid or has expired.",
            });
        }

        // Mark the email as verified and invalidate the verification token.
        user.isEmailVerified = true;
        user.emailVerificationTokenHash = undefined;
        user.emailVerificationExpires = undefined;

        // Generate a fresh password-setup token.
        const passwordSetup = createEmailVerificationToken();
        user.passwordSetupTokenHash = passwordSetup.tokenHash;
        user.passwordSetupExpires = passwordSetup.expiresAt;

        await user.save();

        const baseUrl = process.env.FRONTEND_URL;

        if (!baseUrl) {
            console.error("FRONTEND_URL is not configured.");
            return res.status(500).json({
                success: false,
                message: "Email verified, but password setup could not be prepared. Contact the Manager.",
            });
        }

        const passwordSetupUrl =
            `${baseUrl.replace(/\/$/, "")}/set-password?token=${encodeURIComponent(passwordSetup.token)}`;

        const emailResult = await sendPasswordSetupEmail({
            to: user.email,
            passwordSetupUrl,
        });

        console.log(
            "Ethereal password-setup email preview:",
            emailResult.previewUrl,
        );

        return res.status(200).json({
            success: true,
            message: "Email verified. Open the password-setup email preview to choose your password.",
        });
    } catch (error) {
        console.error("Email verification failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to verify email right now. Please try again.",
        });
    }
});

export default router;
