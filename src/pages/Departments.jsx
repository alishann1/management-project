import { Building2, Users, FolderKanban } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getDepartments,
  getEmployees,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../services/api";

// Use HR as the canonical stored name.
const normalizeDepartmentName = (name) => {
  const normalized = name?.trim() || "";

  if (normalized.toLowerCase() === "human resources") {
    return "HR";
  }

  return normalized;
};

// Keep the familiar full name visible on department cards.
const displayDepartmentName = (name) => {
  return name?.toUpperCase() === "HR" ? "Human Resources" : name;
};

// Compare department names consistently.
const matchesDepartment = (employeeDepartment, departmentName) => {
  return (
    normalizeDepartmentName(employeeDepartment).toLowerCase() ===
    normalizeDepartmentName(departmentName).toLowerCase()
  );
};

// Check whether a manager's name exactly matches an existing employee.
const findMatchingEmployee = (employees, managerName) => {
  const normalizedName = managerName?.trim().toLowerCase();

  if (!normalizedName) return null;

  return (
    employees.find(
      (employee) => employee.name?.trim().toLowerCase() === normalizedName,
    ) || null
  );
};

// Searchable manager dropdown.
// Typing filters the employee list; only selecting a listed employee is valid.
function ManagerSelect({
  employees,
  value,
  onChange,
  disabled = false,
  loading = false,
  error = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value || "");

  const currentValue = value || "";

  const displayedSearch =
    search === "" && currentValue !== "" ? currentValue : search;

  const matchingEmployee = findMatchingEmployee(employees, displayedSearch);

  const filteredEmployees = employees.filter((employee) =>
    employee.name?.toLowerCase().includes(displayedSearch.trim().toLowerCase()),
  );

  const hasTypedName = displayedSearch.trim().length > 0;
  const isValidSelection =
    matchingEmployee !== null &&
    matchingEmployee.name.trim().toLowerCase() ===
      displayedSearch.trim().toLowerCase();

  const handleInputChange = (e) => {
    const typedValue = e.target.value;

    setSearch(typedValue);
    setIsOpen(true);

    // Typing alone does not constitute selecting a valid employee.
    onChange(typedValue);
  };

  const handleSelectEmployee = (employee) => {
    setSearch(employee.name);
    onChange(employee.name);
    setIsOpen(false);
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        Department Manager
      </label>

      <div className="relative">
        <input
          type="text"
          required
          autoComplete="off"
          disabled={disabled || loading || Boolean(error)}
          value={displayedSearch}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Delay closing so a clicked dropdown option can be selected.
            setTimeout(() => setIsOpen(false), 150);
          }}
          placeholder={
            loading
              ? "Loading employees..."
              : error
                ? "Employees could not be loaded"
                : "Type an employee name..."
          }
          aria-invalid={hasTypedName && !isValidSelection}
          aria-expanded={isOpen}
          className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 ${
            hasTypedName && !isValidSelection
              ? "border-amber-400 focus:border-amber-500 focus:ring-amber-100"
              : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
          }`}
        />

        {isOpen && !disabled && !loading && !error && (
          <div className="absolute z-30 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <button
                  key={employee.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectEmployee(employee)}
                  className={`block w-full px-3 py-2 text-left text-sm transition hover:bg-blue-50 ${
                    employee.name?.trim().toLowerCase() ===
                    value?.trim().toLowerCase()
                      ? "bg-blue-50 font-medium text-blue-700"
                      : "text-slate-700"
                  }`}
                >
                  {employee.name}
                  {employee.department ? (
                    <span className="ml-2 text-xs text-slate-400">
                      {displayDepartmentName(employee.department)}
                    </span>
                  ) : null}
                </button>
              ))
            ) : (
              <p className="px-3 py-3 text-sm text-slate-500">
                No matching employees found.
              </p>
            )}
          </div>
        )}
      </div>

      {loading && (
        <p className="mt-1 text-xs text-slate-500">
          Loading the employee list...
        </p>
      )}

      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && hasTypedName && !isValidSelection && (
        <p role="alert" className="mt-1 text-xs text-amber-700">
          Please select a manager from the existing employee list. Typing a name
          alone is not enough.
        </p>
      )}

      {!loading && !error && !hasTypedName && (
        <p className="mt-1 text-xs text-slate-500">
          Start typing to search, then select an employee from the list.
        </p>
      )}

      {!loading && !error && employees.length === 0 && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          No employees are available. Add an employee before assigning a
          department manager.
        </p>
      )}
    </div>
  );
}

function Departments() {
  const [departmentList, setDepartmentList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");

  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [deletingDepartment, setDeletingDepartment] = useState(null);

  const [newDepartment, setNewDepartment] = useState({
    name: "",
    description: "",
    manager: "",
    projects: 0,
  });

  // Load department and employee data from the backend.
  const loadPageData = async () => {
    try {
      setLoadError("");

      const [departmentData, employeeData] = await Promise.all([
        getDepartments(),
        getEmployees(),
      ]);

      setDepartmentList(departmentData);
      setEmployeeList(employeeData);
    } catch (error) {
      setLoadError(error.message || "Failed to load department data.");
      throw error;
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        setLoading(true);
        setLoadError("");

        const [departmentData, employeeData] = await Promise.all([
          getDepartments(),
          getEmployees(),
        ]);

        if (isMounted) {
          setDepartmentList(departmentData);
          setEmployeeList(employeeData);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error.message || "Failed to load department data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate current employee counts and average performance.
  const departmentsWithStats = departmentList.map((department) => {
    const departmentEmployees = employeeList.filter((employee) =>
      matchesDepartment(employee.department, department.name),
    );

    const employeeCount = departmentEmployees.length;

    const averagePerformance =
      employeeCount > 0
        ? Math.round(
            departmentEmployees.reduce(
              (total, employee) => total + (Number(employee.performance) || 0),
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

  // ADD
  const handleAddDepartment = async (e) => {
    e.preventDefault();

    if (adding) return;

    // Verify the manager matches an existing employee.
    const validManager = findMatchingEmployee(
      employeeList,
      newDepartment.manager,
    );

    if (!validManager) {
      setActionError(
        "Invalid manager. Please select an existing employee from the dropdown.",
      );
      return;
    }

    setAdding(true);
    setActionError("");

    try {
      await createDepartment({
        ...newDepartment,
        name: normalizeDepartmentName(newDepartment.name),
        description: newDepartment.description.trim(),
        manager: validManager.name,
        projects: Number(newDepartment.projects) || 0,
      });

      await loadPageData();

      setShowAddModal(false);
      setNewDepartment({
        name: "",
        description: "",
        manager: "",
        projects: 0,
      });
    } catch (error) {
      setActionError(error.message || "Failed to create department.");
    } finally {
      setAdding(false);
    }
  };

  // EDIT
  const handleEditDepartment = async (e) => {
    e.preventDefault();

    if (saving || !editingDepartment) return;

    // Verify the manager matches an existing employee.
    const validManager = findMatchingEmployee(
      employeeList,
      editingDepartment.manager,
    );

    if (!validManager) {
      setActionError(
        "Invalid manager. Please select an existing employee from the dropdown.",
      );
      return;
    }

    setSaving(true);
    setActionError("");

    try {
      await updateDepartment(editingDepartment.id, {
        name: normalizeDepartmentName(editingDepartment.name),
        description: editingDepartment.description.trim(),
        manager: validManager.name,
        projects: Number(editingDepartment.projects) || 0,
      });

      await loadPageData();

      setEditingDepartment(null);
      setSelectedDepartment(null);
    } catch (error) {
      setActionError(error.message || "Failed to update department.");
    } finally {
      setSaving(false);
    }
  };

  // DELETE
  const handleDeleteDepartment = async () => {
    if (deleting || !deletingDepartment) return;

    setDeleting(true);
    setActionError("");

    try {
      await deleteDepartment(deletingDepartment.id);

      await loadPageData();

      setDeletingDepartment(null);
      setSelectedDepartment(null);
      setEditingDepartment(null);
    } catch (error) {
      setActionError(error.message || "Failed to delete department.");
    } finally {
      setDeleting(false);
    }
  };

  const openAddModal = () => {
    setActionError("");
    setShowAddModal(true);
  };

  const openEditModal = (department) => {
    setActionError("");
    setEditingDepartment({ ...department });
  };

  const openDeleteModal = (department) => {
    setActionError("");
    setDeletingDepartment(department);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Departments</h1>
          <p className="mt-1 text-slate-500">
            Manage and monitor organizational departments
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          disabled={loading || adding || saving || deleting}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Building2 size={18} />
          Add Department
        </button>
      </div>

      {/* Loading and Error Messages */}
      {loading && (
        <p className="mb-4 text-sm text-slate-500">
          Loading departments and employees...
        </p>
      )}

      {!loading && loadError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{loadError}</p>

          <button
            type="button"
            onClick={async () => {
              setLoading(true);

              try {
                await loadPageData();
              } catch {
                // The error message is set by loadPageData.
              } finally {
                setLoading(false);
              }
            }}
            className="mt-2 text-sm font-medium text-red-700 underline"
          >
            Retry loading
          </button>
        </div>
      )}

      {/* Department Cards */}
      {!loading && !loadError && (
        <>
          {departmentsWithStats.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
              <Building2 size={36} className="mx-auto text-slate-400" />

              <h2 className="mt-3 font-semibold text-slate-800">
                No departments found
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add a department to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {departmentsWithStats.map((department) => (
                <div
                  key={department.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Card Header */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                      <Building2 size={24} className="text-blue-600" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold text-slate-800">
                        {displayDepartmentName(department.name)}
                      </h2>

                      <p className="mt-0.5 min-h-12 text-sm leading-6 text-slate-500">
                        {department.description}
                      </p>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Users size={16} />
                        <span className="text-xs font-medium">Employees</span>
                      </div>

                      <p className="mt-2 text-2xl font-bold text-slate-800">
                        {department.employees}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <FolderKanban size={16} />
                        <span className="text-xs font-medium">Projects</span>
                      </div>

                      <p className="mt-2 text-2xl font-bold text-slate-800">
                        {department.projects}
                      </p>
                    </div>
                  </div>

                  {/* Performance */}
                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Performance
                      </span>

                      <span className="text-sm font-bold text-blue-600">
                        {department.performance}%
                      </span>
                    </div>

                    <div className="h-2.5 w-full rounded-full bg-slate-200">
                      <div
                        className="h-2.5 rounded-full bg-blue-600"
                        style={{ width: `${department.performance}%` }}
                      />
                    </div>
                  </div>

                  {/* Manager */}
                  <div className="mt-6 border-t border-slate-200 pt-4">
                    <p className="text-xs font-medium text-slate-500">
                      Department Manager
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {department.manager || "Not assigned"}
                    </p>
                  </div>

                  {/* Department Actions */}
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedDepartment(department)}
                      disabled={adding || saving || deleting}
                      className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(department)}
                      disabled={adding || saving || deleting}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => openDeleteModal(department)}
                      disabled={adding || saving || deleting}
                      className="w-full rounded-lg border border-red-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* View Department Modal */}
      {selectedDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {displayDepartmentName(selectedDepartment.name)}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedDepartment.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDepartment(null)}
                className="cursor-pointer text-2xl text-slate-400 hover:text-slate-700"
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
                {selectedDepartment.manager || "Not assigned"}
              </p>
            </div>

            {/* Employees */}
            <div className="mt-6">
              <h3 className="mb-3 text-lg font-semibold text-slate-800">
                Employees in Department
              </h3>

              <div className="overflow-hidden rounded-lg border border-slate-200">
                {employeeList.filter((employee) =>
                  matchesDepartment(
                    employee.department,
                    selectedDepartment.name,
                  ),
                ).length > 0 ? (
                  employeeList
                    .filter((employee) =>
                      matchesDepartment(
                        employee.department,
                        selectedDepartment.name,
                      ),
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

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDepartment(null)}
                className="cursor-pointer rounded-lg bg-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
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
                disabled={adding}
                onClick={() => {
                  setShowAddModal(false);
                  setActionError("");
                }}
                className="cursor-pointer text-2xl text-slate-400 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {actionError && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {actionError}
              </p>
            )}

            <form onSubmit={handleAddDepartment} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Department Name
                </label>

                <input
                  type="text"
                  required
                  disabled={adding}
                  value={newDepartment.name}
                  onChange={(e) =>
                    setNewDepartment({
                      ...newDepartment,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. Research & Development"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  required
                  rows="3"
                  disabled={adding}
                  value={newDepartment.description}
                  onChange={(e) =>
                    setNewDepartment({
                      ...newDepartment,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the department's responsibilities"
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              <ManagerSelect
                employees={employeeList}
                value={newDepartment.manager}
                onChange={(manager) =>
                  setNewDepartment({ ...newDepartment, manager })
                }
                disabled={adding}
                loading={loading}
                error={loadError}
              />

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Active Projects
                </label>

                <input
                  type="number"
                  min="0"
                  required
                  disabled={adding}
                  value={newDepartment.projects}
                  onChange={(e) =>
                    setNewDepartment({
                      ...newDepartment,
                      projects:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  disabled={adding}
                  onClick={() => {
                    setShowAddModal(false);
                    setActionError("");
                  }}
                  className="cursor-pointer rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={adding || loading || Boolean(loadError)}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {adding ? "Adding..." : "Add Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {editingDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
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
                disabled={saving}
                onClick={() => {
                  setEditingDepartment(null);
                  setActionError("");
                }}
                className="cursor-pointer text-2xl text-slate-400 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {actionError && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {actionError}
              </p>
            )}

            <form onSubmit={handleEditDepartment} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Department Name
                </label>

                <input
                  type="text"
                  required
                  disabled={saving}
                  value={editingDepartment.name}
                  onChange={(e) =>
                    setEditingDepartment({
                      ...editingDepartment,
                      name: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  required
                  rows="3"
                  disabled={saving}
                  value={editingDepartment.description}
                  onChange={(e) =>
                    setEditingDepartment({
                      ...editingDepartment,
                      description: e.target.value,
                    })
                  }
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              <ManagerSelect
                employees={employeeList}
                value={editingDepartment.manager}
                onChange={(manager) =>
                  setEditingDepartment({ ...editingDepartment, manager })
                }
                disabled={saving}
                loading={loading}
                error={loadError}
              />

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Active Projects
                </label>

                <input
                  type="number"
                  min="0"
                  required
                  disabled={saving}
                  value={editingDepartment.projects}
                  onChange={(e) =>
                    setEditingDepartment({
                      ...editingDepartment,
                      projects:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setEditingDepartment(null);
                    setActionError("");
                  }}
                  className="cursor-pointer rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || loading || Boolean(loadError)}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Department Confirmation */}
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
                disabled={deleting}
                onClick={() => {
                  setDeletingDepartment(null);
                  setActionError("");
                }}
                className="cursor-pointer text-2xl text-slate-400 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {actionError && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {actionError}
              </p>
            )}

            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {displayDepartmentName(deletingDepartment.name)}
                </span>
                ?
              </p>

              <p className="mt-2 text-xs text-red-600">
                The department will be removed from the department list.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setDeletingDepartment(null);
                  setActionError("");
                }}
                className="cursor-pointer rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteDepartment}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Department"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Departments;
