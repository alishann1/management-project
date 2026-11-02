import { useEffect, useState } from "react";

import { Users, Building2, FolderKanban, ListTodo } from "lucide-react";

import StatCard from "../components/StatCard";
import TaskProgressChart from "../components/TaskProgressChart";
import EmployeePerformanceChart from "../components/EmployeePerformanceChart";
import AttendanceOverview from "../components/AttendanceOverview";
import RecentActivities from "../components/RecentActivities";

import {
  getEmployees,
  getDepartments,
  getProjects,
  getTasks,
  getPerformanceReviews,
  getAttendance,
  getGoals,
  getLeaveRequests,
} from "../services/api";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    employees: [],
    departments: [],
    projects: [],
    tasks: [],
    performanceReviews: [],
    attendance: [],
    goals: [],
    leaveRequests: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          employees,
          departments,
          projects,
          tasks,
          performanceReviews,
          attendance,
          goals,
          leaveRequests,
        ] = await Promise.all([
          getEmployees(),
          getDepartments(),
          getProjects(),
          getTasks(),
          getPerformanceReviews(),
          getAttendance(),
          getGoals(),
          getLeaveRequests(),
        ]);

        setDashboardData({
          employees,
          departments,
          projects,
          tasks,
          performanceReviews,
          attendance,
          goals,
          leaveRequests,
        });
      } catch (err) {
        console.error("Dashboard data error:", err);

        setError("Failed to load dashboard data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Count tasks dynamically using their actual backend statuses.
  const taskStatusData = Object.entries(
    dashboardData.tasks.reduce((counts, task) => {
      const status = task.status || "Unspecified";

      counts[status] = (counts[status] || 0) + 1;

      return counts;
    }, {}),
  ).map(([status, count]) => ({
    status,
    tasks: count,
  }));

  // Calculate the average performance score for each employee.
  const employeePerformanceData = Object.values(
    dashboardData.performanceReviews.reduce((employees, review) => {
      const employeeKey =
        review.employeeId ||
        (typeof review.employee === "object"
          ? review.employee?._id
          : review.employee) ||
        review.id;

      if (!employeeKey || typeof review.score !== "number") {
        return employees;
      }

      if (!employees[employeeKey]) {
        employees[employeeKey] = {
          employee:
            typeof review.employee === "object"
              ? review.employee?.name || "Unknown"
              : review.employee || "Unknown",
          totalScore: 0,
          reviewCount: 0,
        };
      }

      employees[employeeKey].totalScore += review.score;
      employees[employeeKey].reviewCount += 1;

      return employees;
    }, {}),
  ).map((employee) => ({
    employee: employee.employee,
    score: Math.round(employee.totalScore / employee.reviewCount),
  }));

  // Get today's date in the backend's YYYY-MM-DD format.
  const now = new Date();

  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  // Filter attendance records for today only.
  const todayAttendance = dashboardData.attendance.filter(
    (record) => record.date === today,
  );

  // Count today's attendance by status.
  const attendanceData = [
    {
      name: "Present",
      value: todayAttendance.filter((record) => record.status === "Present")
        .length,
      color: "#16a34a",
    },
    {
      name: "Absent",
      value: todayAttendance.filter((record) => record.status === "Absent")
        .length,
      color: "#dc2626",
    },
    {
      name: "On Leave",
      value: todayAttendance.filter((record) => record.status === "On Leave")
        .length,
      color: "#d97706",
    },
  ];

  // Convert recent database records into dashboard activities.
  const createActivity = (item, id, createdText, updatedText) => {
    const createdAt = item.createdAt ? new Date(item.createdAt) : null;
    const updatedAt = item.updatedAt ? new Date(item.updatedAt) : null;

    if (!createdAt || Number.isNaN(createdAt.getTime())) {
      return null;
    }

    const wasUpdated =
      updatedAt &&
      !Number.isNaN(updatedAt.getTime()) &&
      updatedAt.getTime() > createdAt.getTime() + 1000;

    return {
      id,
      text: wasUpdated ? updatedText : createdText,
      date: wasUpdated ? updatedAt : createdAt,
    };
  };

  // Combine tasks, projects, goals, and leave requests.
  const recentActivities = [
    ...dashboardData.tasks.map((task) =>
      createActivity(
        task,
        `task-${task.id}`,
        `Task "${task.title}" was created.`,
        `Task "${task.title}" was updated.`,
      ),
    ),

    ...dashboardData.projects.map((project) =>
      createActivity(
        project,
        `project-${project.id}`,
        `Project "${project.name}" was created.`,
        `Project "${project.name}" was updated.`,
      ),
    ),

    ...dashboardData.goals.map((goal) =>
      createActivity(
        goal,
        `goal-${goal.id}`,
        `Goal "${goal.title}" was created.`,
        `Goal "${goal.title}" was updated.`,
      ),
    ),

    ...dashboardData.leaveRequests.map((leave) =>
      createActivity(
        leave,
        `leave-${leave.id}`,
        `${leave.employee || "An employee"} submitted a leave request.`,
        `${leave.employee || "An employee"}'s leave request was updated.`,
      ),
    ),
  ]
    .filter(Boolean)
    .sort((a, b) => b.date - a.date)
    .slice(0, 5);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>

        <p className="text-slate-500 mt-1">
          Welcome back, Admin Manager. Here's what's happening today.
        </p>
      </div>

      {/* Loading and Error Messages */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Employees"
          value={loading ? "..." : dashboardData.employees.length}
          description="Total registered employees"
          icon={Users}
        />

        <StatCard
          title="Departments"
          value={loading ? "..." : dashboardData.departments.length}
          description="Total departments"
          icon={Building2}
        />

        <StatCard
          title="Projects"
          value={loading ? "..." : dashboardData.projects.length}
          description="Total organizational projects"
          icon={FolderKanban}
        />

        <StatCard
          title="Tasks"
          value={loading ? "..." : dashboardData.tasks.length}
          description="Total organizational tasks"
          icon={ListTodo}
        />
      </div>

      {/* Task Progress and Employee Performance */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TaskProgressChart data={taskStatusData} />

        <EmployeePerformanceChart data={employeePerformanceData} />
      </div>

      {/* Attendance and Recent Activities */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AttendanceOverview data={attendanceData} />

        <RecentActivities activities={recentActivities} />
      </div>
    </div>
  );
}

export default Dashboard;
