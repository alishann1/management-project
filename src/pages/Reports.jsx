import { useMemo, useState } from "react";
import {
  Users,
  FolderKanban,
  ClipboardList,
  Target,
  TrendingUp,
  Printer,
  BarChart3,
  Award,
  CheckCircle2,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import employees from "../data/employees";
import departments from "../data/departments";
import projects from "../data/projects";
import tasks from "../data/tasks";
import goals from "../data/goals";

const TASK_COLORS = ["#2563eb", "#f59e0b", "#16a34a", "#64748b"];
const PIE_COLORS = ["#2563eb", "#f59e0b", "#16a34a", "#64748b"];

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold text-slate-800">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {children}
    </section>
  );
}

function EmptyChart({ message = "No data available for this department." }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

function Reports() {
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const filteredEmployees = useMemo(
    () =>
      employees.filter(
        (employee) =>
          selectedDepartment === "All" ||
          employee.department === selectedDepartment,
      ),
    [selectedDepartment],
  );

  const filteredProjects = useMemo(
    () =>
      projects.filter(
        (project) =>
          selectedDepartment === "All" ||
          project.department === selectedDepartment,
      ),
    [selectedDepartment],
  );

  const filteredTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          selectedDepartment === "All" ||
          task.department === selectedDepartment,
      ),
    [selectedDepartment],
  );

  const filteredGoals = useMemo(
    () =>
      goals.filter(
        (goal) =>
          selectedDepartment === "All" ||
          goal.department === selectedDepartment,
      ),
    [selectedDepartment],
  );

  const averagePerformance = filteredEmployees.length
    ? Math.round(
        filteredEmployees.reduce(
          (total, employee) => total + Number(employee.performance || 0),
          0,
        ) / filteredEmployees.length,
      )
    : 0;

  const completedProjects = filteredProjects.filter(
    (project) => project.status === "Completed",
  ).length;

  const completedTasks = filteredTasks.filter(
    (task) => task.status === "Completed",
  ).length;

  const completedGoals = filteredGoals.filter(
    (goal) => goal.status === "Completed" || Number(goal.progress) >= 100,
  ).length;

  const projectProgress = filteredProjects.length
    ? Math.round(
        filteredProjects.reduce(
          (total, project) => total + Number(project.progress || 0),
          0,
        ) / filteredProjects.length,
      )
    : 0;

  const taskStatusData = useMemo(() => {
    const statuses = ["In Progress", "Pending", "Completed", "Planning"];

    return statuses
      .map((status) => ({
        name: status,
        value: filteredTasks.filter((task) => task.status === status).length,
      }))
      .filter((item) => item.value > 0);
  }, [filteredTasks]);

  const departmentPerformanceData = useMemo(
    () =>
      departments
        .filter(
          (department) =>
            selectedDepartment === "All" ||
            department.name === selectedDepartment,
        )
        .map((department) => {
          const departmentEmployees = employees.filter(
            (employee) => employee.department === department.name,
          );

          const average = departmentEmployees.length
            ? Math.round(
                departmentEmployees.reduce(
                  (total, employee) =>
                    total + Number(employee.performance || 0),
                  0,
                ) / departmentEmployees.length,
              )
            : 0;

          return {
            name: department.name,
            performance: average,
            employees: departmentEmployees.length,
          };
        }),
    [selectedDepartment],
  );

  const projectProgressData = filteredProjects.map((project) => ({
    name:
      project.name.length > 20 ? `${project.name.slice(0, 20)}…` : project.name,
    progress: Number(project.progress || 0),
  }));

  const employeePerformanceData = [...filteredEmployees]
    .sort((a, b) => Number(b.performance || 0) - Number(a.performance || 0))
    .map((employee) => ({
      name: employee.name,
      performance: Number(employee.performance || 0),
    }));

  const topPerformer = [...filteredEmployees].sort(
    (a, b) => Number(b.performance || 0) - Number(a.performance || 0),
  )[0];

  const taskCompletionRate = filteredTasks.length
    ? Math.round((completedTasks / filteredTasks.length) * 100)
    : 0;

  const goalCompletionRate = filteredGoals.length
    ? Math.round((completedGoals / filteredGoals.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Reports & Analytics
          </h1>
          <p className="mt-2 text-slate-500">
            Analyze organizational performance, projects, tasks, and goals.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="print:hidden inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          <Printer size={18} />
          Print Report
        </button>
      </div>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">Report Filters</h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a department to update the report statistics and charts.
            </p>
          </div>

          <select
            value={selectedDepartment}
            onChange={(event) => setSelectedDepartment(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
          >
            <option value="All">All Departments</option>
            {departments.map((department) => (
              <option key={department.id} value={department.name}>
                {department.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Employees"
          value={filteredEmployees.length}
          subtitle="Employees in selection"
          icon={Users}
          color="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Projects"
          value={filteredProjects.length}
          subtitle={`${completedProjects} completed`}
          icon={FolderKanban}
          color="bg-violet-50 text-violet-600"
        />

        <StatCard
          title="Tasks"
          value={filteredTasks.length}
          subtitle={`${completedTasks} completed`}
          icon={ClipboardList}
          color="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Goals"
          value={filteredGoals.length}
          subtitle={`${completedGoals} completed`}
          icon={Target}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Performance indicators */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-sm text-slate-500">
                Average Employee Performance
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {averagePerformance}%
              </p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${averagePerformance}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Task Completion Rate</p>
              <p className="text-2xl font-bold text-slate-800">
                {taskCompletionRate}%
              </p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{ width: `${taskCompletionRate}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <Award size={22} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Goal Completion Rate</p>
              <p className="text-2xl font-bold text-slate-800">
                {goalCompletionRate}%
              </p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-amber-500"
              style={{ width: `${goalCompletionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Department performance and task distribution */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard
          title="Department Performance"
          description="Average employee performance score by department."
        >
          {departmentPerformanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={departmentPerformanceData}
                margin={{ top: 5, right: 10, left: -15, bottom: 35 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 11 }}
                  height={65}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value}%`, "Performance"]} />
                <Bar
                  dataKey="performance"
                  name="Performance"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        <ChartCard
          title="Task Status Distribution"
          description="A breakdown of tasks by their current status."
        >
          {taskStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={95}
                  innerRadius={55}
                  paddingAngle={3}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={TASK_COLORS[index % TASK_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No tasks available for this department." />
          )}
        </ChartCard>
      </div>

      {/* Project progress */}
      <ChartCard
        title="Project Progress"
        description="Current completion percentage for each project."
      >
        {projectProgressData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={projectProgressData}
              margin={{ top: 10, right: 15, left: -10, bottom: 35 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                angle={-20}
                textAnchor="end"
                interval={0}
                tick={{ fontSize: 11 }}
                height={65}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip formatter={(value) => [`${value}%`, "Progress"]} />
              <Bar
                dataKey="progress"
                name="Progress"
                fill="#7c3aed"
                radius={[6, 6, 0, 0]}
                maxBarSize={55}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart message="No projects available for this department." />
        )}
      </ChartCard>

      {/* Employee performance */}
      <ChartCard
        title="Employee Performance"
        description="Employee performance scores, ordered from highest to lowest."
      >
        {employeePerformanceData.length > 0 ? (
          <ResponsiveContainer
            width="100%"
            height={Math.max(280, employeePerformanceData.length * 48)}
          >
            <BarChart
              data={employeePerformanceData}
              layout="vertical"
              margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value) => [`${value}%`, "Performance"]} />
              <Bar
                dataKey="performance"
                name="Performance"
                fill="#0891b2"
                radius={[0, 6, 6, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart message="No employees available for this department." />
        )}
      </ChartCard>

      {/* Key insights */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <BarChart3 size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Key Insights</h2>
            <p className="text-sm text-slate-500">
              A quick summary of the selected report.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Top Performer</p>
            {topPerformer ? (
              <>
                <p className="mt-1 font-semibold text-slate-800">
                  {topPerformer.name}
                </p>
                <p className="mt-1 text-sm text-emerald-600">
                  {topPerformer.performance}% performance
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-slate-600">
                No employee data available.
              </p>
            )}
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Project Progress</p>
            <p className="mt-1 font-semibold text-slate-800">
              {projectProgress}% average completion
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Across {filteredProjects.length} project
              {filteredProjects.length === 1 ? "" : "s"}.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Completed Tasks</p>
            <p className="mt-1 font-semibold text-slate-800">
              {completedTasks} of {filteredTasks.length} tasks
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {taskCompletionRate}% of tasks are marked completed.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Completed Goals</p>
            <p className="mt-1 font-semibold text-slate-800">
              {completedGoals} of {filteredGoals.length} goals
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {goalCompletionRate}% of goals are marked completed.
            </p>
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-slate-400 print:hidden">
        SmartManager · Organizational Management & Performance Dashboard
      </p>

      <style>{`
        @media print {
          body {
            background: white !important;
          }

          aside,
          nav {
            display: none !important;
          }

          main {
            padding: 12px !important;
          }

          section,
          .rounded-2xl {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}

export default Reports;
