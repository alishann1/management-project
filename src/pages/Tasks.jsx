import {
  CalendarDays,
  User,
  FolderKanban,
  Plus,
  LoaderCircle,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getProjects,
  getEmployees,
} from "../services/api";

const initialTask = {
  title: "",
  description: "",
  project: "",
  projectId: "",
  department: "",
  assignedTo: "",
  assignedToId: "",
  priority: "Medium",
  dueDate: "",
  progress: 0,
};

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const selectClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

function Tasks() {
  const [taskList, setTaskList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loadingTasks, setLoadingTasks] = useState(true);
  const [taskError, setTaskError] = useState("");

  const [viewingTask, setViewingTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  const [isAddingTask, setIsAddingTask] = useState(false);
  const isSubmittingTask = useRef(false);

  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const isSavingTask = useRef(false);

  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const isDeletingTaskRef = useRef(false);

  const [newTask, setNewTask] = useState(initialTask);

  // Load tasks, projects, and employees.
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingTasks(true);
        setTaskError("");

        const [taskData, projectData, employeeData] = await Promise.all([
          getTasks(),
          getProjects(),
          getEmployees(),
        ]);

        setTaskList(taskData);
        setProjects(projectData);
        setEmployees(employeeData);
      } catch (error) {
        setTaskError(error.message || "Failed to load task information.");
      } finally {
        setLoadingTasks(false);
      }
    };

    loadData();
  }, []);

  // Only Planning and In Progress projects can receive new tasks.
  const availableProjects = projects.filter((project) =>
    ["Planning", "In Progress"].includes(project.status),
  );

  // Get employees belonging to a particular department.
  const getDepartmentEmployees = (department, currentEmployeeId = "") => {
    if (!department) return [];

    return employees.filter(
      (employee) =>
        employee.department === department &&
        (employee.status === "Active" || employee.id === currentEmployeeId),
    );
  };

  // Update project selection in Add Task.
  const handleAddProjectChange = (projectId) => {
    const selectedProject = projects.find(
      (project) => project.id === projectId,
    );

    setNewTask((previous) => ({
      ...previous,
      projectId: selectedProject?.id || "",
      project: selectedProject?.name || "",
      department: selectedProject?.department || "",
      assignedTo: "",
      assignedToId: "",
    }));
  };

  // Update project selection in Edit Task.
  const handleEditProjectChange = (projectId) => {
    const selectedProject = projects.find(
      (project) => project.id === projectId,
    );

    setEditingTask((previous) => ({
      ...previous,
      projectId: selectedProject?.id || "",
      project: selectedProject?.name || "",
      department: selectedProject?.department || "",
      assignedTo: "",
      assignedToId: "",
    }));
  };

  // Open Edit modal with the correct project and employee IDs.
  const openEditTask = (task) => {
    const selectedProject = projects.find(
      (project) =>
        project.name === task.project && project.department === task.department,
    );

    setEditingTask({
      ...task,
      projectId: selectedProject?.id || "",
      assignedToId: task.assignedToId || "",
    });
  };

  // Create a new task.
  const handleAddTask = async (e) => {
    e.preventDefault();

    if (isSubmittingTask.current) return;

    if (!newTask.projectId || !newTask.department || !newTask.assignedToId) {
      alert("Please select a project and an employee.");
      return;
    }

    isSubmittingTask.current = true;
    setIsAddingTask(true);

    try {
      const progress = Number(newTask.progress);

      const taskData = {
        title: newTask.title,
        description: newTask.description,
        project: newTask.project,
        department: newTask.department,
        assignedTo: newTask.assignedTo,
        assignedToId: newTask.assignedToId,
        priority: newTask.priority,
        dueDate: newTask.dueDate,
        progress,
      };

      const createdTask = await createTask(taskData);

      const formattedTask = {
        id: createdTask._id,
        title: createdTask.title,
        description: createdTask.description,
        project: createdTask.project,
        department: createdTask.department,
        assignedToId: createdTask.assignedTo?._id || newTask.assignedToId,
        assignedTo: createdTask.assignedTo?.name || newTask.assignedTo,
        priority: createdTask.priority,
        status: createdTask.status,
        dueDate: createdTask.dueDate?.split("T")[0] || "",
        progress: createdTask.progress,
      };

      setTaskList((previousTasks) => [formattedTask, ...previousTasks]);

      setNewTask(initialTask);
      setShowAddTask(false);
    } catch (error) {
      alert(error.message || "Failed to create task.");
    } finally {
      isSubmittingTask.current = false;
      setIsAddingTask(false);
    }
  };

  // Update an existing task.
  const handleEditTask = async (e) => {
    e.preventDefault();

    if (isSavingTask.current || !editingTask) return;

    if (
      !editingTask.projectId ||
      !editingTask.department ||
      !editingTask.assignedToId
    ) {
      alert("Please select a valid project and employee.");
      return;
    }

    isSavingTask.current = true;
    setIsSavingChanges(true);

    try {
      const progress = Number(editingTask.progress);

      const taskData = {
        title: editingTask.title,
        description: editingTask.description,
        project: editingTask.project,
        department: editingTask.department,
        assignedTo: editingTask.assignedTo,
        assignedToId: editingTask.assignedToId,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate,
        progress,
      };

      const updatedTask = await updateTask(editingTask.id, taskData);

      const formattedTask = {
        id: updatedTask._id,
        title: updatedTask.title,
        description: updatedTask.description,
        project: updatedTask.project,
        department: updatedTask.department,
        assignedToId: updatedTask.assignedTo?._id || editingTask.assignedToId,
        assignedTo: updatedTask.assignedTo?.name || editingTask.assignedTo,
        priority: updatedTask.priority,
        status: updatedTask.status,
        dueDate: updatedTask.dueDate?.split("T")[0] || "",
        progress: updatedTask.progress,
      };

      setTaskList((previousTasks) =>
        previousTasks.map((task) =>
          task.id === editingTask.id ? formattedTask : task,
        ),
      );

      setEditingTask(null);
    } catch (error) {
      alert(error.message || "Failed to update task.");
    } finally {
      isSavingTask.current = false;
      setIsSavingChanges(false);
    }
  };

  // Delete a task.
  const handleDeleteTask = async () => {
    if (isDeletingTaskRef.current || !deletingTask) return;

    isDeletingTaskRef.current = true;
    setIsDeletingTask(true);

    try {
      await deleteTask(deletingTask.id);

      setTaskList((previousTasks) =>
        previousTasks.filter((task) => task.id !== deletingTask.id),
      );

      setDeletingTask(null);
    } catch (error) {
      alert(error.message || "Failed to delete task.");
    } finally {
      isDeletingTaskRef.current = false;
      setIsDeletingTask(false);
    }
  };

  const departmentEmployees = getDepartmentEmployees(newTask.department);

  const editingDepartmentEmployees = getDepartmentEmployees(
    editingTask?.department,
    editingTask?.assignedToId,
  );

  // Keep an existing completed project available while editing its task.
  const editingProjectOptions = projects.filter(
    (project) =>
      ["Planning", "In Progress"].includes(project.status) ||
      (project.name === editingTask?.project &&
        project.department === editingTask?.department),
  );

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

        <button
          type="button"
          onClick={() => {
            setNewTask(initialTask);
            setShowAddTask(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 cursor-pointer"
        >
          <Plus size={18} />
          Add Task
        </button>
      </div>

      {/* Task Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loadingTasks && (
          <p className="py-8 text-center text-sm text-slate-500">
            Loading tasks...
          </p>
        )}

        {!loadingTasks && taskError && (
          <p className="py-8 text-center text-sm text-red-600">{taskError}</p>
        )}

        {!loadingTasks && !taskError && taskList.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">
            No tasks found. Add a task to get started.
          </p>
        )}

        {taskList.map((task) => (
          <div
            key={task.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
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
                onClick={() => openEditTask(task)}
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

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-700">
                Description
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {viewingTask.description}
              </p>
            </div>

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
                  className={inputClass}
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
                  className={`${inputClass} resize-none`}
                ></textarea>
              </div>

              {/* Project and Department */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Project
                  </label>

                  <select
                    required
                    value={newTask.projectId}
                    onChange={(e) => handleAddProjectChange(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select a project</option>

                    {availableProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>

                  {availableProjects.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">
                      No available projects. Create a project first.
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Department
                  </label>

                  <input
                    type="text"
                    readOnly
                    required
                    value={newTask.department}
                    placeholder="Automatically selected"
                    className={`${inputClass} bg-slate-100 text-slate-600`}
                  />
                </div>
              </div>

              {/* Assigned To and Priority */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Assigned To
                  </label>

                  <select
                    required
                    disabled={!newTask.projectId || !newTask.department}
                    value={newTask.assignedToId}
                    onChange={(e) => {
                      const employee = departmentEmployees.find(
                        (item) => item.id === e.target.value,
                      );

                      setNewTask({
                        ...newTask,
                        assignedToId: employee?.id || "",
                        assignedTo: employee?.name || "",
                      });
                    }}
                    className={selectClass}
                  >
                    <option value="">
                      {!newTask.projectId
                        ? "Select a project first"
                        : departmentEmployees.length === 0
                          ? "No active employees available"
                          : "Select an employee"}
                    </option>

                    {departmentEmployees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>

                  {newTask.projectId && departmentEmployees.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">
                      No active employees found in this department.
                    </p>
                  )}
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
                    className={selectClass}
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
                    className={inputClass}
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
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isAddingTask}
                  onClick={() => setShowAddTask(false)}
                  className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isAddingTask || availableProjects.length === 0}
                  className="inline-flex min-w-32 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isAddingTask ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Adding Task...
                    </>
                  ) : (
                    "Add Task"
                  )}
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
                  className={inputClass}
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
                  className={`${inputClass} resize-none`}
                ></textarea>
              </div>

              {/* Project and Department */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Project
                  </label>

                  <select
                    required
                    value={editingTask.projectId}
                    onChange={(e) => handleEditProjectChange(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select a project</option>

                    {editingProjectOptions.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                        {project.status === "Completed"
                          ? " (Completed - Existing Task)"
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Department
                  </label>

                  <input
                    type="text"
                    readOnly
                    required
                    value={editingTask.department}
                    placeholder="Automatically selected"
                    className={`${inputClass} bg-slate-100 text-slate-600`}
                  />
                </div>
              </div>

              {/* Assigned To and Priority */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Assigned To
                  </label>

                  <select
                    required
                    disabled={!editingTask.projectId || !editingTask.department}
                    value={editingTask.assignedToId}
                    onChange={(e) => {
                      const employee = editingDepartmentEmployees.find(
                        (item) => item.id === e.target.value,
                      );

                      setEditingTask({
                        ...editingTask,
                        assignedToId: employee?.id || "",
                        assignedTo: employee?.name || "",
                      });
                    }}
                    className={selectClass}
                  >
                    <option value="">
                      {!editingTask.projectId
                        ? "Select a project first"
                        : editingDepartmentEmployees.length === 0
                          ? "No employees available"
                          : "Select an employee"}
                    </option>

                    {editingDepartmentEmployees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                        {employee.status !== "Active"
                          ? ` (${employee.status})`
                          : ""}
                      </option>
                    ))}
                  </select>

                  {editingTask.projectId &&
                    editingDepartmentEmployees.length === 0 && (
                      <p className="mt-1 text-xs text-amber-600">
                        No employees are available in this department.
                      </p>
                    )}
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
                    className={selectClass}
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
                    className={inputClass}
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
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSavingChanges}
                  onClick={() => setEditingTask(null)}
                  className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 cursor-pointer disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingChanges}
                  className="inline-flex min-w-36 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSavingChanges ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    "Save Changes"
                  )}
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

            <div className="mt-6">
              <p className="text-sm leading-6 text-slate-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-800">
                  {deletingTask.title}
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isDeletingTask}
                onClick={() => setDeletingTask(null)}
                className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteTask}
                disabled={isDeletingTask}
                className="inline-flex min-w-28 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDeletingTask ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Deleting Task...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
