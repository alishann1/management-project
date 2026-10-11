import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import employeeRoutes from "./routes/employeeRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/employees", employeeRoutes);

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
            console.log(`SmartManager server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start SmartManager:", error.message);
        process.exit(1);
    }
};

startServer();