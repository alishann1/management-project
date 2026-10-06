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
import { useState } from "react";
import employees from "../data/employees";

function Employees() {
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeList, setEmployeeList] = useState(employees);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("All Status");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    department: "IT",
    position: "",
    status: "Active",
    performance: 0,
  });

  const handleAddEmployee = (e) => {
    e.preventDefault();

    const employeeToAdd = {
      id: Date.now(),
      ...newEmployee,
    };

    setEmployeeList([...employeeList, employeeToAdd]);

    setShowAddModal(false);

    setNewEmployee({
      name: "",
      email: "",
      department: "IT",
      position: "",
      status: "Active",
      performance: 0,
    });
  };

  const filteredEmployees = employeeList.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(search.toLowerCase()) ||
      employee.email.toLowerCase().includes(search.toLowerCase()) ||
      employee.position.toLowerCase().includes(search.toLowerCase());

    const matchesDepartment =
      department === "All Departments" || employee.department === department;

    const matchesStatus = status === "All Status" || employee.status === status;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleEditEmployee = (e) => {
    e.preventDefault();

    setEmployeeList(
      employeeList.map((employee) =>
        employee.id === editingEmployee.id ? editingEmployee : employee,
      ),
    );

    setEditingEmployee(null);
  };

  const handleDeleteEmployee = () => {
    setEmployeeList(
      employeeList.filter((employee) => employee.id !== deletingEmployee.id),
    );

    setDeletingEmployee(null);
  };

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
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          <UserPlus size={18} />
          Add Employee
        </button>
      </div>

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

          {/* Department */}
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="bg-slate-100 rounded-lg px-4 py-2.5 outline-none text-sm text-slate-600"
          >
            <option>All Departments</option>
            <option>IT</option>
            <option>Human Resources</option>
            <option>Finance</option>
            <option>Marketing</option>
            <option>Operations</option>
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-slate-100 rounded-lg px-4 py-2.5 outline-none text-sm text-slate-600"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>On Leave</option>
          </select>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
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
            {filteredEmployees.map((employee) => (
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
                  {employee.department}
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
            ))}
          </tbody>
        </table>
      </div>
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
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

            {/* Profile */}
            <div className="p-6">
              {/* Employee Identity */}
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

              {/* Basic Information */}
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
                    {selectedEmployee.department}
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

              {/* Performance */}
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
                  ></div>
                </div>
              </div>

              {/* Activity Summary */}
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl">
            {/* Header */}
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
                className="p-2 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddEmployee} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
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

                {/* Email */}
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

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Department
                  </label>

                  <select
                    value={newEmployee.department}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        department: e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>IT</option>
                    <option>Human Resources</option>
                    <option>Finance</option>
                    <option>Marketing</option>
                    <option>Operations</option>
                  </select>
                </div>

                {/* Position */}
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

                {/* Status */}
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
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>On Leave</option>
                  </select>
                </div>

                {/* Performance */}
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
                        performance: Number(e.target.value),
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-7">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingEmployee && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl">
            {/* Header */}
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
                className="p-2 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditEmployee} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
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

                {/* Email */}
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

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Department
                  </label>

                  <select
                    value={editingEmployee.department}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        department: e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>IT</option>
                    <option>Human Resources</option>
                    <option>Finance</option>
                    <option>Marketing</option>
                    <option>Operations</option>
                  </select>
                </div>

                {/* Position */}
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

                {/* Status */}
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
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>On Leave</option>
                  </select>
                </div>

                {/* Performance */}
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
                        performance: Number(e.target.value),
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-7">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deletingEmployee && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              {/* Icon */}
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

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setDeletingEmployee(null)}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteEmployee}
                  className="px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                >
                  Delete Employee
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
