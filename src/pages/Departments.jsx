import { Building2, Users, FolderKanban } from "lucide-react";
import departments from "../data/departments";
import employees from "../data/employees";
import { useState } from "react";

function Departments() {
  const [deletingDepartment, setDeletingDepartment] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const handleAddDepartment = (e) => {
    e.preventDefault();

    const departmentToAdd = {
      id: Date.now(),
      ...newDepartment,
    };

    setDepartmentList([...departmentList, departmentToAdd]);

    setShowAddModal(false);

    setNewDepartment({
      name: "",
      description: "",
      manager: "",
      projects: 0,
    });
  };

  const handleDeleteDepartment = () => {
    setDepartmentList(
      departmentList.filter(
        (department) => department.id !== deletingDepartment.id,
      ),
    );

    setDeletingDepartment(null);
  };

  const handleEditDepartment = (e) => {
    e.preventDefault();

    setDepartmentList(
      departmentList.map((department) =>
        department.id === editingDepartment.id ? editingDepartment : department,
      ),
    );

    setEditingDepartment(null);
  };
  const [departmentList, setDepartmentList] = useState(departments);

  const [showAddModal, setShowAddModal] = useState(false);

  const [newDepartment, setNewDepartment] = useState({
    name: "",
    description: "",
    manager: "",
    projects: 0,
  });
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const departmentsWithStats = departmentList.map((department) => {
    const departmentEmployees = employees.filter(
      (employee) => employee.department === department.name,
    );

    const employeeCount = departmentEmployees.length;

    const averagePerformance =
      employeeCount > 0
        ? Math.round(
            departmentEmployees.reduce(
              (total, employee) => total + employee.performance,
              0,
            ) / employeeCount,
          )
        : 0;

    return {
      ...department,
      employees: employeeCount,
      performance: averagePerformance,
    };
  });

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Departments</h1>

          <p className="text-slate-500 mt-1">
            Manage and monitor organizational departments
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          <Building2 size={18} />
          Add Department
        </button>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {departmentsWithStats.map((department) => (
          <div
            key={department.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Card Header */}
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center">
                <Building2 size={24} className="text-blue-600" />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-slate-800">
                  {department.name}
                </h2>

                <p className="mt-0.5 min-h-12 text-sm leading-6 text-slate-500">
                  {department.description}
                </p>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Users size={16} />

                  <span className="text-xs font-medium">Employees</span>
                </div>

                <p className="text-2xl font-bold text-slate-800 mt-2">
                  {department.employees}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <FolderKanban size={16} />

                  <span className="text-xs font-medium">Projects</span>
                </div>

                <p className="text-2xl font-bold text-slate-800 mt-2">
                  {department.projects}
                </p>
              </div>
            </div>

            {/* Performance */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">
                  Performance
                </span>

                <span className="text-sm font-bold text-blue-600">
                  {department.performance}%
                </span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{
                    width: `${department.performance}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Manager */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <p className="text-xs font-medium text-slate-500">
                Department Manager
              </p>

              <p className="text-sm font-semibold text-slate-800 mt-1">
                {department.manager}
              </p>
            </div>

            {/* View Department Button */}
            {/* Department Actions */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedDepartment(department)}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white text-center hover:bg-blue-700 transition cursor-pointer"
              >
                View
              </button>

              <button
                onClick={() => setEditingDepartment({ ...department })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 text-center hover:bg-slate-50 transition cursor-pointer"
              >
                Edit
              </button>

              <button
                onClick={() => setDeletingDepartment(department)}
                className="w-full rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition cursor-pointer text-center"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {selectedDepartment.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedDepartment.description}
                </p>
              </div>

              <button
                onClick={() => setSelectedDepartment(null)}
                className="text-2xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Department Summary */}
            <div className="mt-5 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-500">Employees</p>
                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {selectedDepartment.employees}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-500">Projects</p>
                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {selectedDepartment.projects}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-500">Performance</p>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  {selectedDepartment.performance}%
                </p>
              </div>
            </div>

            {/* Manager */}
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-slate-700">
                Department Manager
              </h3>

              <p className="mt-1 text-slate-600">
                {selectedDepartment.manager}
              </p>
            </div>

            {/* Employees */}
            <div className="mt-6">
              <h3 className="mb-3 text-lg font-semibold text-slate-800">
                Employees in Department
              </h3>

              <div className="overflow-hidden rounded-lg border border-slate-200">
                {employees.filter(
                  (employee) => employee.department === selectedDepartment.name,
                ).length > 0 ? (
                  employees
                    .filter(
                      (employee) =>
                        employee.department === selectedDepartment.name,
                    )
                    .map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center justify-between border-b border-slate-200 px-4 py-3 last:border-b-0"
                      >
                        <div>
                          <p className="font-medium text-slate-800">
                            {employee.name}
                          </p>

                          <p className="text-sm text-slate-500">
                            {employee.position}
                          </p>
                        </div>

                        <span className="font-semibold text-blue-600">
                          {employee.performance}%
                        </span>
                      </div>
                    ))
                ) : (
                  <p className="p-4 text-sm text-slate-500">
                    No employees assigned to this department.
                  </p>
                )}
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedDepartment(null)}
                className="rounded-lg bg-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Add Department
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a new organizational department
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

            {/* Form */}
            <form onSubmit={handleAddDepartment} className="mt-5 space-y-4">
              {/* Department Name */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Department Name
                </label>

                <input
                  type="text"
                  required
                  value={newDepartment.name}
                  onChange={(e) =>
                    setNewDepartment({
                      ...newDepartment,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. Research & Development"
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
                  value={newDepartment.description}
                  onChange={(e) =>
                    setNewDepartment({
                      ...newDepartment,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the department's responsibilities"
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                ></textarea>
              </div>

              {/* Manager */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Department Manager
                </label>

                <input
                  type="text"
                  required
                  value={newDepartment.manager}
                  onChange={(e) =>
                    setNewDepartment({
                      ...newDepartment,
                      manager: e.target.value,
                    })
                  }
                  placeholder="e.g. John Smith"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Projects */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Active Projects
                </label>

                <input
                  type="number"
                  min="0"
                  value={newDepartment.projects}
                  onChange={(e) =>
                    setNewDepartment({
                      ...newDepartment,
                      projects: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-3">
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
                  Add Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Edit Department
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update department information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingDepartment(null)}
                className="text-2xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditDepartment} className="mt-5 space-y-4">
              {/* Department Name */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Department Name
                </label>

                <input
                  type="text"
                  required
                  value={editingDepartment.name}
                  onChange={(e) =>
                    setEditingDepartment({
                      ...editingDepartment,
                      name: e.target.value,
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
                  value={editingDepartment.description}
                  onChange={(e) =>
                    setEditingDepartment({
                      ...editingDepartment,
                      description: e.target.value,
                    })
                  }
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                ></textarea>
              </div>

              {/* Manager */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Department Manager
                </label>

                <input
                  type="text"
                  required
                  value={editingDepartment.manager}
                  onChange={(e) =>
                    setEditingDepartment({
                      ...editingDepartment,
                      manager: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Projects */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Active Projects
                </label>

                <input
                  type="number"
                  min="0"
                  value={editingDepartment.projects}
                  onChange={(e) =>
                    setEditingDepartment({
                      ...editingDepartment,
                      projects: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingDepartment(null)}
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

      {deletingDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Delete Department
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDeletingDepartment(null)}
                className="text-2xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deletingDepartment.name}</span>
                ?
              </p>

              <p className="mt-2 text-xs text-red-600">
                The department will be removed from the department list.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingDepartment(null)}
                className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteDepartment}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 cursor-pointer"
              >
                Delete Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Departments;
