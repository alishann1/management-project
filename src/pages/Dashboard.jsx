import { Users, Building2, FolderKanban, ListTodo } from "lucide-react";

import StatCard from "../components/StatCard";
import TaskProgressChart from "../components/TaskProgressChart";
import EmployeePerformanceChart from "../components/EmployeePerformanceChart";
import AttendanceOverview from "../components/AttendanceOverview";
import RecentActivities from "../components/RecentActivities";

function Dashboard() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>

        <p className="text-slate-500 mt-1">
          Welcome back, Admin Manager. Here's what's happening today.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Employees"
          value="48"
          description="Active employees"
          icon={Users}
        />

        <StatCard
          title="Departments"
          value="6"
          description="Active departments"
          icon={Building2}
        />

        <StatCard
          title="Projects"
          value="12"
          description="8 currently active"
          icon={FolderKanban}
        />

        <StatCard
          title="Tasks"
          value="76"
          description="18 pending tasks"
          icon={ListTodo}
        />
      </div>

      {/* Task Progress */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskProgressChart />
        <EmployeePerformanceChart />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceOverview />
        <RecentActivities />
      </div>
    </div>
  );
}

export default Dashboard;
