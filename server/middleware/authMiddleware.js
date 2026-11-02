
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authentication required. Please sign in.",
        });
    }

    const token = authHeader.slice(7);

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            success: false,
            message: "Authentication is not configured on the server.",
        });
    }

    try {
        // Verify the JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check whether the account still exists in MongoDB
        const user = await User.findById(decoded.userId).select("role");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Your account no longer exists. Please sign in again.",
            });
        }

        // Use the current role stored in the database
        req.user = {
            userId: user._id.toString(),
            role: user.role,
        };

        return next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token. Please sign in again.",
            });
        }

        console.error("Authentication error:", error);

        return res.status(500).json({
            success: false,
            message: "Authentication failed. Please try again.",
        });
    }
}
