
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import Employee from "./models/Employee.js";

dotenv.config();

const sampleEmployees = [
    {
        name: "Ali Khan",
        department: "IT",
        role: "Software Developer",
        status: "Active",
        performance: 92,
    },
    {
        name: "Sara Ahmed",
        department: "HR",
        role: "Manager",
        status: "Active",
        performance: 88,
    },
    {
        name: "Ahmed Shah",
        department: "Finance",
        role: "Accountant",
        status: "Active",
        performance: 84,
    },
];

async function seedEmployees() {
    try {
        await connectDB();

        const existingCount = await Employee.countDocuments();

        if (existingCount > 0) {
            console.log(
                `Seeding cancelled: ${existingCount} employee(s) already exist.`
            );
            return;
        }

        const insertedEmployees = await Employee.insertMany(sampleEmployees);

        console.log(`Successfully inserted ${insertedEmployees.length} employees.`);
        insertedEmployees.forEach((employee) => {
            console.log(`- ${employee.name} (${employee.department})`);
        });
    } catch (error) {
        console.error("Failed to seed employees:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seedEmployees();
