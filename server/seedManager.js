import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

const name = process.env.MANAGER_NAME?.trim();
const email = process.env.MANAGER_EMAIL?.trim().toLowerCase();
const password = process.env.MANAGER_PASSWORD;

async function seedManager() {
    try {
        if (!name || !email || !password) {
            throw new Error(
                "Set MANAGER_NAME, MANAGER_EMAIL, and MANAGER_PASSWORD before running this script.",
            );
        }

        if (password.length < 8) {
            throw new Error("The Manager password must contain at least 8 characters.");
        }

        await connectDB();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            if (existingUser.role !== "Manager") {
                throw new Error(
                    "The configured Manager email belongs to a non-Manager account.",
                );
            }

            existingUser.isAuthorized = true;
            existingUser.isEmailVerified = true;
            await existingUser.save();

            console.log(
                `\x1b[32mExisting Manager account authorized and verified: ${existingUser.email}\x1b[0m`,
            );
            return;
        }

        const manager = await User.create({
            name,
            email,
            password,
            role: "Manager",
            isAuthorized: true,
            isEmailVerified: true,
        });

        console.log(
            `\x1b[32mManager account created and verified: ${manager.email}\x1b[0m`,
        );
    } catch (error) {
        console.error("Manager setup failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seedManager();