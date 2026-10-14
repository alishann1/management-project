import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";
import { getMyTasks } from "../services/api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

function EmployeeDashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userData = sessionStorage.getItem("smartmanager_user");
  let user = null;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch {
    user = null;
  }

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyTasks();
        setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Unable to load your tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const pendingTasks = tasks.filter((task) => task.status === "Pending").length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress",
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed",
  ).length;

  const overdueTasks = tasks.filter((task) => {
    if (task.status === "Completed" || !task.dueDate) return false;

    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return !Number.isNaN(dueDate.getTime()) && dueDate < today;
  }).length;

  const taskChartData = [
    { name: "Pending", value: pendingTasks, color: "#2563eb" },
    { name: "In Progress", value: inProgressTasks, color: "#d97706" },
    { name: "Completed", value: completedTasks, color: "#16a34a" },
  ];

  const summaryCards = [
    {
      title: "Pending Tasks",
      count: pendingTasks,
      description: "Waiting to be started",
      icon: ClipboardList,
      color: "text-blue-600",
      background: "bg-blue-50",
    },
    {
      title: "In Progress",
      count: inProgressTasks,
      description: "Currently being worked on",
      icon: Clock3,
      color: "text-amber-600",
      background: "bg-amber-50",
    },
    {
      title: "Completed",
      count: completedTasks,
      description: "Successfully finished",
      icon: CheckCircle2,
      color: "text-green-600",
      background: "bg-green-50",
    },
    {
      title: "Overdue Tasks",
      count: overdueTasks,
      description: "Past their due date",
      icon: AlertTriangle,
      color: "text-red-600",
      background: "bg-red-50",
    },
  ];

  const upcomingTasks = tasks
    .filter((task) => task.status !== "Completed" && task.dueDate)
    .filter((task) => {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return !Number.isNaN(dueDate.getTime()) && dueDate >= today;
    })
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )
    .slice(0, 5);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-blue-600">SMARTMANAGER</p>

        <h1 className="text-3xl font-bold text-slate-800">
          Employee Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Welcome back{user?.name ? `, ${user.name}` : ""}! Here's your work
          overview.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="shrink-0 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-slate-800">
                    {loading ? "—" : card.count}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.background}`}
                >
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>

              <p className="mt-3 text-sm text-slate-500">{card.description}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            Task Progress
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Distribution of your assigned tasks
          </p>

          {loading ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500">
              Loading chart...
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500">
              Your task chart will appear when tasks are assigned.
            </div>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {taskChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2">
            {taskChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-600">
                  {item.name}: {loading ? "—" : item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Upcoming Deadlines
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your next tasks that need attention
            </p>
          </div>

          <button
            onClick={() => navigate("/my-tasks")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View all tasks
            <ArrowRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-slate-500">
            <LoaderCircle size={20} className="animate-spin" />
            Loading your tasks...
          </div>
        ) : tasks.length === 0 && !error ? (
          <div className="p-10 text-center">
            <ClipboardList size={36} className="mx-auto mb-3 text-slate-300" />
            <h3 className="font-semibold text-slate-700">
              No tasks assigned yet
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Your assigned tasks and deadlines will appear here.
            </p>
          </div>
        ) : upcomingTasks.length === 0 && !error ? (
          <div className="p-8 text-center text-sm text-slate-500">
            You have no upcoming deadlines. Check My Tasks for overdue or other
            outstanding work.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {upcomingTasks.map((task) => (
              <div
                key={task._id || task.id || task.title}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <h3 className="font-medium text-slate-800">{task.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {task.project || "No project specified"}
                    {" · "}
                    Due {formatDate(task.dueDate)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      task.priority === "High"
                        ? "bg-red-50 text-red-700"
                        : task.priority === "Low"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {task.priority || "Medium"} Priority
                  </span>

                  <span className="text-xs font-medium text-slate-500">
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeDashboard;
