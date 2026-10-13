import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

export async function connectDB() {
    try {
        const connection = await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log(
            `\x1b[32mMongoDB connected successfully: ${connection.connection.host}\x1b[0m`
        );
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
}