import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js"
import emailVerificationRoutes from "./routes/emailVerificationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import passwordSetupRoutes from "./routes/passwordSetupRoutes.js";
import employeeAccountRoutes from "./routes/employeeAccountRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/employees", employeeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/email-verification", emailVerificationRoutes);
app.use("/api/password-setup", passwordSetupRoutes);
app.use("/api/employee-accounts", employeeAccountRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "SmartManager backend is running!",
    });
});

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(
                `\x1b[32mSmartManager server running on port ${PORT}\x1b[0m`
            );
        });
    } catch (error) {
        console.error("Failed to start SmartManager:", error.message);
        process.exit(1);
    }
};

startServer();