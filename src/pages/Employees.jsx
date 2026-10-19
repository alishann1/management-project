import {
  Search,
  UserPlus,
  X,
  Mail,
  Briefcase,
  Building2,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDepartments,
} from "../services/api";

// Keep department names consistent with employee records.
// The UI displays "Human Resources", but the stored value is "HR".
const normalizeDepartmentName = (name) => {
  const normalized = name?.trim() || "";

  return normalized.toLowerCase() === "human resources" ? "HR" : normalized;
};

const displayDepartmentName = (name) => {
  return normalizeDepartmentName(name) === "HR"
    ? "Human Resources"
    : normalizeDepartmentName(name);
};

function Employees() {
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeList, setEmployeeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departmentsError, setDepartmentsError] = useState("");

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("All Status");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [savingEmployee, setSavingEmployee] = useState(false);
  const [updatingEmployee, setUpdatingEmployee] = useState(false);
  const [deletingEmployeeLoading, setDeletingEmployeeLoading] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    department: "IT",
    position: "",
    status: "Active",
    performance: 0,
  });

  // Load employees from MongoDB.
  useEffect(() => {
    let isMounted = true;

    const loadEmployees = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getEmployees();

        if (isMounted) {
          setEmployeeList(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            "Could not load employees. Make sure the backend server is running.",
          );
        }

        console.error("Employee loading error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadEmployees();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load department options from MongoDB.
  useEffect(() => {
    let isMounted = true;

    const loadDepartments = async () => {
      try {
        setDepartmentsLoading(true);
        setDepartmentsError("");

        const data = await getDepartments();

        if (isMounted) {
          // Normalize names and remove duplicate options.
          const uniqueDepartments = Array.from(
            new Map(
              data
                .map((item) => {
                  const name = normalizeDepartmentName(item.name);

                  return [
                    name.toLowerCase(),
                    {
                      id: item.id,
                      name,
                      label: displayDepartmentName(name),
                    },
                  ];
                })
                .sort((a, b) => a[1].label.localeCompare(b[1].label)),
            ).values(),
          );

          setDepartmentOptions(uniqueDepartments);
        }
      } catch (err) {
        console.error("Department loading error:", err);

        if (isMounted) {
          setDepartmentsError(
            err.message || "Could not load departments. Please try again.",
          );
        }
      } finally {
        if (isMounted) {
          setDepartmentsLoading(false);
        }
      }
    };

    loadDepartments();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddEmployee = async (e) => {
    e.preventDefault();

    if (savingEmployee) return;

    try {
      setSavingEmployee(true);
      setError("");

      const employeeToAdd = {
        ...newEmployee,
        department: normalizeDepartmentName(newEmployee.department),
        performance: Number(newEmployee.performance) || 0,
      };

      const savedEmployee = await createEmployee(employeeToAdd);

      setEmployeeList((previousEmployees) => [
        savedEmployee,
        ...previousEmployees,
      ]);

      setShowAddModal(false);

      setNewEmployee({
        name: "",
        email: "",
        department: "IT",
        position: "",
        status: "Active",
        performance: 0,
      });
    } catch (err) {
      setError(err.message || "Failed to add employee.");
    } finally {
      setSavingEmployee(false);
    }
  };

  const filteredEmployees = employeeList.filter((employee) => {
    const matchesSearch =
      (employee.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (employee.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (employee.position || "").toLowerCase().includes(search.toLowerCase());

    const matchesDepartment =
      department === "All Departments" ||
      normalizeDepartmentName(employee.department).toLowerCase() ===
        normalizeDepartmentName(department).toLowerCase();

    const matchesStatus = status === "All Status" || employee.status === status;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleEditEmployee = async (e) => {
    e.preventDefault();

    if (!editingEmployee || updatingEmployee) return;

    try {
      setUpdatingEmployee(true);
      setError("");

      const updatedEmployee = await updateEmployee(editingEmployee.id, {
        ...editingEmployee,
        department: normalizeDepartmentName(editingEmployee.department),
        performance: Number(editingEmployee.performance) || 0,
      });

      setEmployeeList((previousEmployees) =>
        previousEmployees.map((employee) =>
          employee.id === updatedEmployee.id ? updatedEmployee : employee,
        ),
      );

      if (selectedEmployee?.id === updatedEmployee.id) {
        setSelectedEmployee(updatedEmployee);
      }

      setEditingEmployee(null);
    } catch (err) {
      setError(err.message || "Failed to update employee.");
    } finally {
      setUpdatingEmployee(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deletingEmployee || deletingEmployeeLoading) return;

    try {
      setDeletingEmployeeLoading(true);
      setError("");

      await deleteEmployee(deletingEmployee.id);

      setEmployeeList((previousEmployees) =>
        previousEmployees.filter(
          (employee) => employee.id !== deletingEmployee.id,
        ),
      );

      setDeletingEmployee(null);

      if (selectedEmployee?.id === deletingEmployee.id) {
        setSelectedEmployee(null);
      }
    } catch (err) {
      setError(err.message || "Failed to delete employee.");
    } finally {
      setDeletingEmployeeLoading(false);
    }
  };

  // Shared options for the filter, Add form, and Edit form.
  const renderDepartmentOptions = (currentDepartment) => {
    const normalizedCurrent = normalizeDepartmentName(currentDepartment);

    const currentExists = departmentOptions.some(
      (item) => item.name.toLowerCase() === normalizedCurrent.toLowerCase(),
    );

    return (
      <>
        {normalizedCurrent && !currentExists && (
          <option value={normalizedCurrent}>
            {displayDepartmentName(normalizedCurrent)}
          </option>
        )}

        {departmentOptions.map((item) => (
          <option key={item.id || item.name} value={item.name}>
            {item.label}
          </option>
        ))}
      </>
    );
  };

  const departmentSelectClass =
    "w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Employees</h1>
          <p className="text-slate-500 mt-1">
            Manage your organization's employees
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          disabled={
            savingEmployee || updatingEmployee || deletingEmployeeLoading
          }
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <UserPlus size={18} />
          Add Employee
        </button>
      </div>

      {/* General employee errors */}
      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-5 text-sm"
        >
          {error}
        </div>
      )}

      {/* Department loading errors */}
      {departmentsError && (
        <div
          role="alert"
          className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 mb-5 text-sm"
        >
          <p>{departmentsError}</p>
          <button
            type="button"
            onClick={async () => {
              try {
                setDepartmentsLoading(true);
                setDepartmentsError("");

                const data = await getDepartments();

                const uniqueDepartments = Array.from(
                  new Map(
                    data
                      .map((item) => {
                        const name = normalizeDepartmentName(item.name);

                        return [
                          name.toLowerCase(),
                          {
                            id: item.id,
                            name,
                            label: displayDepartmentName(name),
                          },
                        ];
                      })
                      .sort((a, b) => a[1].label.localeCompare(b[1].label)),
                  ).values(),
                );

                setDepartmentOptions(uniqueDepartments);
              } catch (err) {
                setDepartmentsError(
                  err.message || "Could not load departments.",
                );
              } finally {
                setDepartmentsLoading(false);
              }
            }}
            disabled={departmentsLoading}
            className="underline font-medium mt-1 cursor-pointer disabled:opacity-60"
          >
            {departmentsLoading ? "Loading..." : "Try again"}
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex items-center flex-1 bg-slate-100 rounded-lg px-4 py-2.5">
            <Search size={19} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ml-3 bg-transparent outline-none w-full text-sm"
            />
          </div>

          {/* Department filter */}
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            disabled={departmentsLoading || !!departmentsError}
            className="bg-slate-100 rounded-lg px-4 py-2.5 outline-none text-sm text-slate-600 disabled:opacity-60"
          >
            <option value="All Departments">
              {departmentsLoading
                ? "Loading departments..."
                : "All Departments"}
            </option>
            {renderDepartmentOptions(department)}
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-slate-100 rounded-lg px-4 py-2.5 outline-none text-sm text-slate-600"
          >
            <option value="All Status">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                Employee
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                Department
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                Position
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                Status
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                Performance
              </th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-slate-500"
                >
                  Loading employees...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-slate-500"
                >
                  No employees found.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-800">
                        {employee.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {employee.email}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {displayDepartmentName(employee.department)}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {employee.position}
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {employee.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-slate-700">
                    {employee.performance}%
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setSelectedEmployee(employee)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
                      >
                        View
                      </button>

                      <button
                        onClick={() => setEditingEmployee({ ...employee })}
                        className="text-slate-600 hover:text-slate-900 text-sm font-medium cursor-pointer"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => setDeletingEmployee(employee)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Employee Profile Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Employee Profile
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Employee details and performance overview
                </p>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold">
                  {selectedEmployee.name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    {selectedEmployee.name}
                  </h3>
                  <p className="text-slate-500">{selectedEmployee.position}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Mail size={17} />
                    Email
                  </div>
                  <p className="font-medium text-slate-800 mt-2">
                    {selectedEmployee.email}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Building2 size={17} />
                    Department
                  </div>
                  <p className="font-medium text-slate-800 mt-2">
                    {displayDepartmentName(selectedEmployee.department)}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Briefcase size={17} />
                    Position
                  </div>
                  <p className="font-medium text-slate-800 mt-2">
                    {selectedEmployee.position}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-500">Status</p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    {selectedEmployee.status}
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Overall Performance
                    </h3>
                    <p className="text-sm text-slate-500">
                      Current performance score
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {selectedEmployee.performance}%
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${selectedEmployee.performance}%` }}
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 mb-4">
                  Work Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle size={18} />
                      <span className="text-sm font-medium">
                        Completed Tasks
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 mt-2">18</p>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Clock size={18} />
                      <span className="text-sm font-medium">Current Tasks</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 mt-2">4</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Add Employee
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Add a new employee to your organization
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                disabled={savingEmployee}
                className="p-2 rounded-lg hover:bg-slate-100 cursor-pointer disabled:opacity-60"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmployee.name}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter full name"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmployee.email}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        email: e.target.value,
                      })
                    }
                    placeholder="Enter email"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Department from MongoDB */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Department
                  </label>
                  <select
                    required
                    value={normalizeDepartmentName(newEmployee.department)}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        department: e.target.value,
                      })
                    }
                    disabled={
                      departmentsLoading || !!departmentsError || savingEmployee
                    }
                    className={departmentSelectClass}
                  >
                    {departmentsLoading ? (
                      <option value="">Loading departments...</option>
                    ) : (
                      <>
                        <option value="" disabled>
                          Select a department
                        </option>
                        {renderDepartmentOptions(newEmployee.department)}
                      </>
                    )}
                  </select>
                  {departmentsError && (
                    <p className="text-xs text-red-600 mt-1">
                      Departments could not be loaded.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmployee.position}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        position: e.target.value,
                      })
                    }
                    placeholder="e.g. Software Developer"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newEmployee.status}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        status: e.target.value,
                      })
                    }
                    className={departmentSelectClass}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Performance (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newEmployee.performance}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        performance:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-7">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={savingEmployee}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    savingEmployee ||
                    departmentsLoading ||
                    !!departmentsError ||
                    departmentOptions.length === 0
                  }
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingEmployee ? "Adding..." : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Edit Employee
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Update employee information
                </p>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                disabled={updatingEmployee}
                className="p-2 rounded-lg hover:bg-slate-100 cursor-pointer disabled:opacity-60"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditEmployee} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.name}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        name: e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editingEmployee.email}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        email: e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Department from MongoDB */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Department
                  </label>
                  <select
                    required
                    value={normalizeDepartmentName(editingEmployee.department)}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        department: e.target.value,
                      })
                    }
                    disabled={
                      departmentsLoading ||
                      !!departmentsError ||
                      updatingEmployee
                    }
                    className={departmentSelectClass}
                  >
                    {departmentsLoading ? (
                      <option value="">Loading departments...</option>
                    ) : (
                      <>
                        <option value="" disabled>
                          Select a department
                        </option>
                        {renderDepartmentOptions(editingEmployee.department)}
                      </>
                    )}
                  </select>
                  {departmentsError && (
                    <p className="text-xs text-red-600 mt-1">
                      Departments could not be loaded.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.position}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        position: e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editingEmployee.status}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        status: e.target.value,
                      })
                    }
                    className={departmentSelectClass}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Performance (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingEmployee.performance}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        performance:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-7">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  disabled={updatingEmployee}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    updatingEmployee ||
                    departmentsLoading ||
                    !!departmentsError ||
                    departmentOptions.length === 0
                  }
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {updatingEmployee ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingEmployee && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <X size={24} className="text-red-600" />
              </div>

              <h2 className="text-xl font-bold text-slate-800">
                Delete Employee?
              </h2>
              <p className="text-slate-500 mt-2 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-700">
                  {deletingEmployee.name}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setDeletingEmployee(null)}
                  disabled={deletingEmployeeLoading}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteEmployee}
                  disabled={deletingEmployeeLoading}
                  className="px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deletingEmployeeLoading ? "Deleting..." : "Delete Employee"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;
