import { CalendarDays, User, Building2, Plus } from "lucide-react";
import { useState } from "react";
import projects from "../data/projects";

function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);

  const [deletingProject, setDeletingProject] = useState(null);

  const [projectList, setProjectList] = useState(projects);

  const [showAddModal, setShowAddModal] = useState(false);

  const [editingProject, setEditingProject] = useState(null);

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    department: "",
    manager: "",
    status: "Planning",
    startDate: "",
    dueDate: "",
    progress: 0,
  });

  const handleAddProject = (e) => {
    e.preventDefault();

    const projectProgress = Number(newProject.progress);

    const projectToAdd = {
      id: Date.now(),
      ...newProject,
      progress: projectProgress,
      status:
        projectProgress === 100
          ? "Completed"
          : projectProgress > 0
            ? "In Progress"
            : "Planning",
    };

    setProjectList([...projectList, projectToAdd]);

    setShowAddModal(false);

    setNewProject({
      name: "",
      description: "",
      department: "",
      manager: "",
      status: "Planning",
      startDate: "",
      dueDate: "",
      progress: 0,
    });
  };

  const handleEditProject = (e) => {
    e.preventDefault();

    const updatedProgress = Number(editingProject.progress);

    const updatedProject = {
      ...editingProject,
      progress: updatedProgress,
      status:
        updatedProgress === 100
          ? "Completed"
          : updatedProgress > 0
            ? "In Progress"
            : "Planning",
    };

    const handleDeleteProject = () => {
      setProjectList(
        projectList.filter((project) => project.id !== deletingProject.id),
      );

      setDeletingProject(null);
    };

    setProjectList(
      projectList.map((project) =>
        project.id === editingProject.id ? updatedProject : project,
      ),
    );

    setEditingProject(null);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Project Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Plan, organize and monitor organizational projects.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition cursor-pointer"
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      {/* Project Cards */}
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

              <button
                onClick={() => setSelectedProject(project)}
                className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition cursor-pointer text-center"
              >
                View Project
              </button>

              <button
                onClick={() => setEditingProject({ ...project })}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer text-center"
              >
                Edit Project
              </button>
              <button
                onClick={() => setDeletingProject(project)}
                className="mt-2 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 transition cursor-pointer text-center"
              >
                Delete Project
              </button>
            </div>
          </div>
        ))}
      </div>

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
                className="text-2xl text-slate-400 hover:text-slate-700 cursor-pointer"
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
                className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 cursor-pointer"
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
                onClick={() => setShowAddModal(false)}
                className="text-2xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ×
              </button>
            </div>

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
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        dueDate: e.target.value,
                      })
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    value={newProject.progress}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        progress: e.target.value,
                      })
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
                >
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
                onClick={() => setEditingProject(null)}
                className="text-2xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ×
              </button>
            </div>

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
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        startDate: e.target.value,
                      })
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        dueDate: e.target.value,
                      })
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    value={editingProject.progress}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        progress: e.target.value,
                      })
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
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
      {/* Delete Project Confirmation Modal */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-800">Delete Project</h2>

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
                onClick={() => setDeletingProject(null)}
                className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteProject}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 cursor-pointer"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
