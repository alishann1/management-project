
import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        };

        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token. Please sign in again.",
        });
    }
}
