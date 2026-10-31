import { CalendarDays, User, Building2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../services/api";

const emptyProject = {
  name: "",
  description: "",
  department: "",
  manager: "",
  status: "Planning",
  startDate: "",
  dueDate: "",
  progress: 0,
};

// Convert MongoDB project records into the format used by this page.
const mapProject = (project) => ({
  id: project._id || project.id,
  name: project.name,
  description: project.description,
  department: project.department,
  manager: project.manager,
  status: project.status,
  startDate: project.startDate ? String(project.startDate).split("T")[0] : "",
  dueDate: project.dueDate ? String(project.dueDate).split("T")[0] : "",
  progress: Number(project.progress ?? 0),
});

const getProjectStatus = (progress) =>
  progress === 100 ? "Completed" : progress > 0 ? "In Progress" : "Planning";

function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [projectList, setProjectList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProject, setNewProject] = useState({ ...emptyProject });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");

  // Load projects from the backend.
  const loadProjects = async () => {
    try {
      setLoading(true);
      setPageError("");

      const projects = await getProjects();
      setProjectList(projects);
    } catch (error) {
      setPageError(error.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Validate common project fields before sending them to the backend.
  const validateProject = (project) => {
    if (
      !project.name.trim() ||
      !project.description.trim() ||
      !project.department.trim() ||
      !project.manager.trim() ||
      !project.startDate ||
      !project.dueDate
    ) {
      return "Please complete all required project fields.";
    }

    if (project.dueDate < project.startDate) {
      return "Due date cannot be earlier than the start date.";
    }

    const progress = Number(project.progress);

    if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
      return "Progress must be a number between 0 and 100.";
    }

    return "";
  };

  const prepareProject = (project) => {
    const progress = Number(project.progress);

    return {
      name: project.name.trim(),
      description: project.description.trim(),
      department: project.department,
      manager: project.manager.trim(),
      startDate: project.startDate,
      dueDate: project.dueDate,
      progress,
      status: getProjectStatus(progress),
    };
  };

  // Create a project in MongoDB.
  const handleAddProject = async (e) => {
    e.preventDefault();

    if (saving) return;

    const validationError = validateProject(newProject);

    if (validationError) {
      setActionError(validationError);
      return;
    }

    try {
      setSaving(true);
      setActionError("");

      const projectData = prepareProject(newProject);
      const createdProject = await createProject(projectData);

      setProjectList((currentProjects) => [
        mapProject(createdProject),
        ...currentProjects,
      ]);

      setShowAddModal(false);
      setNewProject({ ...emptyProject });
    } catch (error) {
      setActionError(error.message || "Failed to create project.");
    } finally {
      setSaving(false);
    }
  };

  // Update an existing project in MongoDB.
  const handleEditProject = async (e) => {
    e.preventDefault();

    if (saving || !editingProject) return;

    const validationError = validateProject(editingProject);

    if (validationError) {
      setActionError(validationError);
      return;
    }

    try {
      setSaving(true);
      setActionError("");

      const projectData = prepareProject(editingProject);
      const updatedProject = await updateProject(
        editingProject.id,
        projectData,
      );

      const formattedProject = mapProject(updatedProject);

      setProjectList((currentProjects) =>
        currentProjects.map((project) =>
          project.id === editingProject.id ? formattedProject : project,
        ),
      );

      if (selectedProject?.id === editingProject.id) {
        setSelectedProject(formattedProject);
      }

      setEditingProject(null);
    } catch (error) {
      setActionError(error.message || "Failed to update project.");
    } finally {
      setSaving(false);
    }
  };

  // Delete a project from MongoDB.
  const handleDeleteProject = async () => {
    if (saving || !deletingProject) return;

    try {
      setSaving(true);
      setActionError("");

      await deleteProject(deletingProject.id);

      setProjectList((currentProjects) =>
        currentProjects.filter((project) => project.id !== deletingProject.id),
      );

      if (selectedProject?.id === deletingProject.id) {
        setSelectedProject(null);
      }

      setDeletingProject(null);
    } catch (error) {
      setActionError(error.message || "Failed to delete project.");
    } finally {
      setSaving(false);
    }
  };

  const openAddModal = () => {
    setActionError("");
    setNewProject({ ...emptyProject });
    setShowAddModal(true);
  };

  const openEditModal = (project) => {
    setActionError("");
    setEditingProject({ ...project });
  };

  const closeAddModal = () => {
    if (saving) return;
    setShowAddModal(false);
    setActionError("");
  };

  const closeEditModal = () => {
    if (saving) return;
    setEditingProject(null);
    setActionError("");
  };

  const closeDeleteModal = () => {
    if (saving) return;
    setDeletingProject(null);
    setActionError("");
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Project Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Plan, organize and monitor organizational projects.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          disabled={loading || saving}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      {/* Backend Error */}
      {pageError && (
        <div
          role="alert"
          className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span>{pageError}</span>

          <button
            type="button"
            onClick={loadProjects}
            disabled={loading}
            className="rounded-lg border border-red-300 px-4 py-2 font-medium hover:bg-red-100 disabled:opacity-60"
          >
            {loading ? "Loading..." : "Try Again"}
          </button>
        </div>
      )}

      {/* Action Error */}
      {actionError && !showAddModal && !editingProject && !deletingProject && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {actionError}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading projects...
        </div>
      )}

      {/* Project Cards */}
      {!loading && !pageError && (
        <>
          {projectList.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
              <h2 className="text-lg font-semibold text-slate-800">
                No projects yet
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Add a project to start managing your organizational work.
              </p>

              <button
                type="button"
                onClick={openAddModal}
                className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Add Your First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {projectList.map((project) => (
                <div
                  key={project.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Project Name */}
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      {project.name}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {project.description}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="mt-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        project.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : project.status === "In Progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  {/* Project Information */}
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Building2 size={17} className="text-slate-400" />
                      <span>{project.department}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <User size={17} className="text-slate-400" />
                      <span>{project.manager}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <CalendarDays size={17} className="text-slate-400" />
                      <span>
                        {project.startDate} → {project.dueDate}
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        Progress
                      </span>

                      <span className="text-sm font-semibold text-slate-800">
                        {project.progress}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>

                    {/* Project Actions */}
                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setActionError("");
                          setSelectedProject(project);
                        }}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-blue-700"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(project)}
                        disabled={saving}
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActionError("");
                          setDeletingProject(project);
                        }}
                        disabled={saving}
                        className="w-full rounded-lg border border-red-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* View Project Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {selectedProject.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">Project Details</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                aria-label="Close project details"
                className="cursor-pointer text-2xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {/* Description */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Description
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {selectedProject.description}
                </p>
              </div>

              {/* Department, Manager, Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Department
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {selectedProject.department}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Manager
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {selectedProject.manager}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Start Date
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {selectedProject.startDate}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Due Date
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {selectedProject.dueDate}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">Progress</p>

                  <p className="text-sm font-semibold text-slate-800">
                    {selectedProject.progress}%
                  </p>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${selectedProject.progress}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="cursor-pointer rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Add Project
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a new organizational project.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddModal}
                disabled={saving}
                aria-label="Close add project form"
                className="cursor-pointer text-2xl text-slate-400 hover:text-slate-700 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/* Add Project Error */}
            {actionError && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {actionError}
              </div>
            )}

            {/* Add Project Form */}
            <form onSubmit={handleAddProject} className="mt-6 space-y-5">
              {/* Project Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Project Name
                </label>

                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter project name"
                  required
                  disabled={saving}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter project description"
                  rows="3"
                  required
                  disabled={saving}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                />
              </div>

              {/* Department and Manager */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Department */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Department
                  </label>

                  <select
                    value={newProject.department}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        department: e.target.value,
                      })
                    }
                    required
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  >
                    <option value="">Select department</option>
                    <option value="IT">IT</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>

                {/* Manager */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Project Manager
                  </label>

                  <input
                    type="text"
                    value={newProject.manager}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        manager: e.target.value,
                      })
                    }
                    placeholder="Enter manager name"
                    required
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Start Date */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        startDate: e.target.value,
                      })
                    }
                    required
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Due Date
                  </label>

                  <input
                    type="date"
                    value={newProject.dueDate}
                    min={newProject.startDate || undefined}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        dueDate: e.target.value,
                      })
                    }
                    required
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* Status and Progress */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Status */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Status
                  </label>

                  <select
                    value={newProject.status}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        status: e.target.value,
                      })
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Progress */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Progress (%)
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={newProject.progress}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        progress: e.target.value,
                      })
                    }
                    required
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={saving}
                  className="cursor-pointer rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Adding..." : "Add Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Edit Project
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update the project information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={saving}
                aria-label="Close edit project form"
                className="cursor-pointer text-2xl text-slate-400 hover:text-slate-700 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/* Edit Project Error */}
            {actionError && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {actionError}
              </div>
            )}

            {/* Edit Project Form */}
            <form onSubmit={handleEditProject} className="mt-6 space-y-5">
              {/* Project Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Project Name
                </label>

                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      name: e.target.value,
                    })
                  }
                  required
                  disabled={saving}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  value={editingProject.description}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      description: e.target.value,
                    })
                  }
                  rows="3"
                  required
                  disabled={saving}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                />
              </div>

              {/* Department and Manager */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Department */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Department
                  </label>

                  <select
                    value={editingProject.department}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        department: e.target.value,
                      })
                    }
                    required
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  >
                    <option value="">Select department</option>
                    <option value="IT">IT</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>

                {/* Manager */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Project Manager
                  </label>

                  <input
                    type="text"
                    value={editingProject.manager}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        manager: e.target.value,
                      })
                    }
                    required
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Start Date */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={editingProject.startDate}
                    max={editingProject.dueDate || undefined}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        startDate: e.target.value,
                      })
                    }
                    required
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Due Date
                  </label>

                  <input
                    type="date"
                    value={editingProject.dueDate}
                    min={editingProject.startDate || undefined}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        dueDate: e.target.value,
                      })
                    }
                    required
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* Status and Progress */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Status */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Status
                  </label>

                  <select
                    value={editingProject.status}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        status: e.target.value,
                      })
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Progress */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Progress (%)
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={editingProject.progress}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        progress: e.target.value,
                      })
                    }
                    required
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  className="cursor-pointer rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Project Confirmation Modal */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-800">Delete Project</h2>

            {actionError && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {actionError}
              </div>
            )}

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-700">
                {deletingProject.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={saving}
                className="cursor-pointer rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteProject}
                disabled={saving}
                className="cursor-pointer rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Deleting..." : "Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
