
import "dotenv/config";
import { connectDB } from "./config/db.js";
import Department from "./models/Department.js";

const departments = [
    {
        name: "IT",
        description: "Technology and software development",
        projects: 4,
        manager: "Ali Khan",
    },
    {
        name: "Human Resources",
        description: "Employee relations and organizational development",
        projects: 2,
        manager: "Sara Ahmed",
    },
    {
        name: "Finance",
        description: "Financial planning and accounting",
        projects: 2,
        manager: "Ahmed Shah",
    },
    {
        name: "Marketing",
        description: "Marketing, branding and communications",
        projects: 2,
        manager: "Fatima Ali",
    },
    {
        name: "Operations",
        description: "Daily operations and business processes",
        projects: 1,
        manager: "Ayesha Malik",
    },
    {
        name: "Administration",
        description: "Administrative and support services",
        projects: 1,
        manager: "Hassan Ali",
    },
];

async function seedDepartments() {
    try {
        await connectDB();

        for (const department of departments) {
            await Department.updateOne(
                { name: department.name },
                { $setOnInsert: department },
                { upsert: true }
            );
        }

        console.log("Department seeding completed.");
        console.log("Checked all six departments without overwriting existing records.");
    } catch (error) {
        console.error("Department seeding failed:", error.message);
        process.exitCode = 1;
    } finally {
        process.exit();
    }
}

seedDepartments();
