import { useEffect, useState } from "react";
import { CalendarDays, FolderKanban, User, ListTodo } from "lucide-react";
import { getMyTasks } from "../services/api";

function MyTasks() {
  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError("");

        const tasks = await getMyTasks();
        setTaskList(tasks);
      } catch (err) {
        setError(err.message || "Failed to load your tasks.");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const getStatusStyle = (status) => {
    if (status === "Completed") {
      return "bg-green-100 text-green-700";
    }

    if (status === "In Progress") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-amber-100 text-amber-700";
  };

  const getPriorityStyle = (priority) => {
    if (priority === "High") {
      return "bg-red-100 text-red-700";
    }

    if (priority === "Medium") {
      return "bg-amber-100 text-amber-700";
    }

    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Tasks</h1>
        <p className="mt-1 text-sm text-slate-500">
          View your assigned tasks, deadlines, and progress.
        </p>
      </div>

      {loading && (
        <p className="py-10 text-center text-sm text-slate-500">
          Loading your tasks...
        </p>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && taskList.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <ListTodo className="mx-auto mb-3 text-slate-400" size={36} />
          <h2 className="font-semibold text-slate-700">
            No tasks assigned yet
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your assigned tasks will appear here.
          </p>
        </div>
      )}

      {!loading && !error && taskList.length > 0 && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {taskList.map((task) => (
            <div
              key={task.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold text-slate-800">{task.title}</h2>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                    task.status,
                  )}`}
                >
                  {task.status}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500">{task.description}</p>

              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <FolderKanban size={16} className="text-slate-400" />
                  <span>{task.project}</span>
                </div>

                <div className="flex items-center gap-2">
                  <User size={16} className="text-slate-400" />
                  <span>{task.department}</span>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-slate-400" />
                  <span>Due: {task.dueDate || "No due date"}</span>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Progress
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {task.progress}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{
                      width: `${task.progress}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getPriorityStyle(
                    task.priority,
                  )}`}
                >
                  {task.priority} Priority
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyTasks;
