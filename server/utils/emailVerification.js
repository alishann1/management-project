import crypto from "node:crypto";

export function createEmailVerificationToken() {
    const token = crypto.randomBytes(32).toString("hex");

    // Store only the hash in MongoDB, never the raw verification token.
    const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    return {
        token,
        tokenHash,
        expiresAt,
    };
}

export function hashEmailVerificationToken(token) {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}