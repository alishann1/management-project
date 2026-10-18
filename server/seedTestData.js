
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import Employee from "./models/Employee.js";
import Task from "./models/Task.js";
import Goal from "./models/Goal.js";

dotenv.config();

function dateFromToday(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
}

async function seedTestData() {
    try {
        await connectDB();

        const employees = await Employee.find().sort({ createdAt: 1 });

        if (employees.length === 0) {
            throw new Error(
                "No employees found. Create employees before seeding test data."
            );
        }

        // Use existing employees and their real department names.
        const employeeAt = (index) => employees[index % employees.length];

        const sampleTasks = [
            {
                title: "[TEST DATA] Prepare monthly report",
                description: "Compile departmental performance and progress.",
                project: "Management Dashboard",
                employeeIndex: 0,
                priority: "High",
                progress: 0,
                daysUntilDue: 7,
            },
            {
                title: "[TEST DATA] Update employee records",
                description: "Review and update employee information.",
                project: "HR Records",
                employeeIndex: 1,
                priority: "Medium",
                progress: 35,
                daysUntilDue: 10,
            },
            {
                title: "[TEST DATA] Review budget",
                description: "Check expenses against the approved budget.",
                project: "Budget Review",
                employeeIndex: 2,
                priority: "High",
                progress: 70,
                daysUntilDue: 3,
            },
            {
                title: "[TEST DATA] Design campaign",
                description: "Prepare draft materials for the next campaign.",
                project: "Marketing Campaign",
                employeeIndex: 3,
                priority: "Low",
                progress: 100,
                daysUntilDue: -2,
            },
            {
                title: "[TEST DATA] Review project requirements",
                description: "Document requirements and outstanding questions.",
                project: "Project Planning",
                employeeIndex: 0,
                priority: "Medium",
                progress: 10,
                daysUntilDue: 14,
            },
            {
                title: "[TEST DATA] Finalize documentation",
                description: "Complete and review project documentation.",
                project: "Documentation",
                employeeIndex: 1,
                priority: "Low",
                progress: 100,
                daysUntilDue: 5,
            },
        ];

        const sampleGoals = [
            {
                title: "[TEST DATA] Improve team performance",
                description: "Improve team performance through regular reviews.",
                employeeIndex: 0,
                category: "Performance",
                target: 10,
                progress: 0,
                daysUntilDue: 30,
            },
            {
                title: "[TEST DATA] Complete technical training",
                description: "Complete a planned professional development course.",
                employeeIndex: 0,
                category: "Development",
                target: 1,
                progress: 25,
                daysUntilDue: 45,
            },
            {
                title: "[TEST DATA] Complete recruitment plan",
                description: "Document recruitment needs and planned activities.",
                employeeIndex: 1,
                category: "Recruitment",
                target: 5,
                progress: 60,
                daysUntilDue: 20,
            },
            {
                title: "[TEST DATA] Review financial targets",
                description: "Review spending and progress against financial targets.",
                employeeIndex: 2,
                category: "Financial",
                target: 100,
                progress: 100,
                daysUntilDue: 15,
            },
            {
                title: "[TEST DATA] Plan operational improvements",
                description: "Identify improvements to routine operations.",
                employeeIndex: 3,
                category: "Operations",
                target: 4,
                progress: 50,
                daysUntilDue: 25,
            },
            {
                title: "[TEST DATA] Update administration procedures",
                description: "Review and document administrative procedures.",
                employeeIndex: 1,
                category: "Administration",
                target: 3,
                progress: 0,
                daysUntilDue: 40,
            },
        ];

        let tasksProcessed = 0;
        let goalsProcessed = 0;

        for (const item of sampleTasks) {
            const employee = employeeAt(item.employeeIndex);
            const status =
                item.progress === 0
                    ? "Pending"
                    : item.progress === 100
                        ? "Completed"
                        : "In Progress";

            await Task.updateOne(
                { title: item.title },
                {
                    $set: {
                        title: item.title,
                        description: item.description,
                        project: item.project,
                        department: employee.department,
                        assignedTo: employee._id,
                        priority: item.priority,
                        progress: item.progress,
                        status,
                        dueDate: dateFromToday(item.daysUntilDue),
                    },
                },
                { upsert: true, runValidators: true }
            );

            tasksProcessed++;
        }

        for (const item of sampleGoals) {
            const employee = employeeAt(item.employeeIndex);
            const status =
                item.progress === 0
                    ? "Pending"
                    : item.progress === 100
                        ? "Completed"
                        : "In Progress";

            await Goal.updateOne(
                { title: item.title },
                {
                    $set: {
                        title: item.title,
                        description: item.description,
                        employee: employee._id,
                        department: employee.department,
                        category: item.category,
                        target: item.target,
                        progress: item.progress,
                        status,
                        deadline: dateFromToday(item.daysUntilDue),
                    },
                },
                { upsert: true, runValidators: true }
            );

            goalsProcessed++;
        }

        console.log("Test data seeded successfully.");
        console.log(`Tasks processed: ${tasksProcessed}`);
        console.log(`Goals processed: ${goalsProcessed}`);
        console.log("Existing non-test records were not deleted.");
        console.log("Running the script again updates these same test records.");
    } catch (error) {
        console.error("Failed to seed test data:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seedTestData();
