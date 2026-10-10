import { CalendarDays, User, FolderKanban, Plus } from "lucide-react";
import { useState } from "react";
import tasks from "../data/tasks";

function Tasks() {
  const [taskList, setTaskList] = useState(tasks);
  const [viewingTask, setViewingTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    project: "",
    department: "",
    assignedTo: "",
    priority: "Medium",
    dueDate: "",
    progress: 0,
  });

  const getStatusFromProgress = (progress) => {
    const value = Number(progress);

    if (value === 0) {
      return "Pending";
    }

    if (value === 100) {
      return "Completed";
    }

    return "In Progress";
  };

  const handleAddTask = (e) => {
    e.preventDefault();

    const progress = Number(newTask.progress);

    const task = {
      id: Date.now(),
      ...newTask,
      progress,
      status: getStatusFromProgress(progress),
    };

    setTaskList([...taskList, task]);

    setNewTask({
      title: "",
      description: "",
      project: "",
      department: "",
      assignedTo: "",
      priority: "Medium",
      dueDate: "",
      progress: 0,
    });

    setShowAddTask(false);
  };

  const handleEditTask = (e) => {
    e.preventDefault();

    const progress = Number(editingTask.progress);

    const updatedTask = {
      ...editingTask,
      progress,
      status: getStatusFromProgress(progress),
    };

    setTaskList(
      taskList.map((task) => (task.id === editingTask.id ? updatedTask : task)),
    );

    setEditingTask(null);
  };

  const handleDeleteTask = () => {
    setTaskList(taskList.filter((task) => task.id !== deletingTask.id));

    setDeletingTask(null);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Task Management</h1>

          <p className="mt-1 text-sm text-slate-500">
            Assign, organize and monitor tasks across organizational projects.
          </p>
        </div>

        {/* Add Task Button */}
        <button
          type="button"
          onClick={() => setShowAddTask(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 cursor-pointer"
        >
          <Plus size={18} />
          Add Task
        </button>
      </div>

      {/* Task Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {taskList.map((task) => (
          <div
            key={task.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Task Title */}
            <div>
              <h2 className="text-xl font-bold text-slate-800">{task.title}</h2>

              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                {task.description}
              </p>
            </div>
            {/* Status and Priority */}
            <div className="mt-4 flex items-center gap-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  task.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : task.status === "In Progress"
                      ? "bg-blue-100 text-blue-700"
                      : task.status === "Pending"
                        ? "bg-slate-100 text-slate-600"
                        : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {task.status}
              </span>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  task.priority === "High"
                    ? "bg-red-100 text-red-700"
                    : task.priority === "Medium"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                }`}
              >
                {task.priority}
              </span>
            </div>
            {/* Task Information */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <FolderKanban size={17} className="text-slate-400" />
                <span>{task.project}</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-600">
                <User size={17} className="text-slate-400" />
                <span>{task.assignedTo}</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-600">
                <CalendarDays size={17} className="text-slate-400" />
                <span>Due: {task.dueDate}</span>
              </div>
            </div>
            {/* Progress */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Progress
                </span>

                <span className="text-sm font-semibold text-slate-800">
                  {task.progress}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>
            {/* Task Actions */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setViewingTask(task)}
                className="w-full rounded-lg bg-blue-600 px-3 py-2.5 text-center text-sm font-medium text-white transition hover:bg-blue-700 cursor-pointer"
              >
                View
              </button>

              <button
                type="button"
                onClick={() => setEditingTask({ ...task })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50 cursor-pointer"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => setDeletingTask(task)}
                className="w-full rounded-lg border border-red-200 bg-white px-3 py-2.5 text-center text-sm font-medium text-red-600 transition hover:bg-red-50 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Task Modal */}
      {viewingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {viewingTask.title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">Task Details</p>
              </div>

              <button
                type="button"
                onClick={() => setViewingTask(null)}
                className="text-2xl leading-none text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-700">
                Description
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {viewingTask.description}
              </p>
            </div>

            {/* Task Information */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-slate-400">Project</p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {viewingTask.project}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Assigned To
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {viewingTask.assignedTo}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">Department</p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {viewingTask.department}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">Due Date</p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {viewingTask.dueDate}
                </p>
              </div>
            </div>

            {/* Status and Priority */}
            <div className="mt-6 flex items-center gap-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  viewingTask.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : viewingTask.status === "In Progress"
                      ? "bg-blue-100 text-blue-700"
                      : viewingTask.status === "Pending"
                        ? "bg-slate-100 text-slate-600"
                        : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {viewingTask.status}
              </span>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  viewingTask.priority === "High"
                    ? "bg-red-100 text-red-700"
                    : viewingTask.priority === "Medium"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                }`}
              >
                {viewingTask.priority}
              </span>
            </div>

            {/* Progress */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Progress
                </span>

                <span className="text-sm font-semibold text-slate-800">
                  {viewingTask.progress}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${viewingTask.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingTask(null)}
                className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Add Task</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a new task and assign it to an employee.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddTask(false)}
                className="text-2xl leading-none text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Add Task Form */}
            <form onSubmit={handleAddTask} className="mt-6 space-y-5">
              {/* Task Title */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Task Title
                </label>

                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter task title"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  required
                  rows="3"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter task description"
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                ></textarea>
              </div>

              {/* Project and Department */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Project
                  </label>

                  <input
                    type="text"
                    required
                    value={newTask.project}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        project: e.target.value,
                      })
                    }
                    placeholder="Enter project name"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Department
                  </label>

                  <input
                    type="text"
                    required
                    value={newTask.department}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        department: e.target.value,
                      })
                    }
                    placeholder="Enter department"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Assigned To and Priority */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Assigned To
                  </label>

                  <input
                    type="text"
                    required
                    value={newTask.assignedTo}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        assignedTo: e.target.value,
                      })
                    }
                    placeholder="Enter employee name"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Priority
                  </label>

                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        priority: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Due Date and Progress */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Due Date
                  </label>

                  <input
                    type="date"
                    required
                    value={newTask.dueDate}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        dueDate: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Progress (%)
                  </label>

                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={newTask.progress}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        progress: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Edit Task</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update the task information and progress.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="text-2xl leading-none text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Edit Task Form */}
            <form onSubmit={handleEditTask} className="mt-6 space-y-5">
              {/* Task Title */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Task Title
                </label>

                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      title: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  required
                  rows="3"
                  value={editingTask.description}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      description: e.target.value,
                    })
                  }
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                ></textarea>
              </div>

              {/* Project and Department */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Project
                  </label>

                  <input
                    type="text"
                    required
                    value={editingTask.project}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        project: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Department
                  </label>

                  <input
                    type="text"
                    required
                    value={editingTask.department}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        department: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Assigned To and Priority */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Assigned To
                  </label>

                  <input
                    type="text"
                    required
                    value={editingTask.assignedTo}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        assignedTo: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Priority
                  </label>

                  <select
                    value={editingTask.priority}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        priority: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Due Date and Progress */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Due Date
                  </label>

                  <input
                    type="date"
                    required
                    value={editingTask.dueDate}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        dueDate: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Progress (%)
                  </label>

                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={editingTask.progress}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        progress: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Task Confirmation Modal */}
      {deletingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Delete Task
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Confirm task deletion
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDeletingTask(null)}
                className="text-2xl leading-none text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Confirmation Message */}
            <div className="mt-6">
              <p className="text-sm leading-6 text-slate-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-800">
                  {deletingTask.title}
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            {/* Confirmation Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingTask(null)}
                className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteTask}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 cursor-pointer"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
