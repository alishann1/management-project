import { useMemo, useState } from "react";
import {
  CalendarDays,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarClock,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import employees from "../data/employees";

const initialLeaveRequests = [
  {
    id: 1,
    employee: "Fatima Ali",
    department: "Marketing",
    leaveType: "Annual Leave",
    startDate: "2026-10-12",
    endDate: "2026-10-14",
    reason: "Family commitments and personal matters.",
    status: "Approved",
    appliedDate: "2026-10-05",
  },
  {
    id: 2,
    employee: "Ali Khan",
    department: "IT",
    leaveType: "Sick Leave",
    startDate: "2026-10-15",
    endDate: "2026-10-16",
    reason: "Medical appointment and recovery.",
    status: "Pending",
    appliedDate: "2026-10-09",
  },
  {
    id: 3,
    employee: "Sara Ahmed",
    department: "Human Resources",
    leaveType: "Casual Leave",
    startDate: "2026-10-20",
    endDate: "2026-10-20",
    reason: "Personal work that requires one day off.",
    status: "Pending",
    appliedDate: "2026-10-08",
  },
  {
    id: 4,
    employee: "Ahmed Shah",
    department: "Finance",
    leaveType: "Annual Leave",
    startDate: "2026-10-25",
    endDate: "2026-10-29",
    reason: "Planned family vacation.",
    status: "Approved",
    appliedDate: "2026-10-01",
  },
  {
    id: 5,
    employee: "Usman Khan",
    department: "IT",
    leaveType: "Casual Leave",
    startDate: "2026-10-18",
    endDate: "2026-10-18",
    reason: "Personal appointment.",
    status: "Rejected",
    appliedDate: "2026-10-07",
  },
  {
    id: 6,
    employee: "Ayesha Malik",
    department: "Operations",
    leaveType: "Sick Leave",
    startDate: "2026-10-11",
    endDate: "2026-10-12",
    reason: "Not feeling well and needs rest.",
    status: "Pending",
    appliedDate: "2026-10-10",
  },
  {
    id: 7,
    employee: "Maryam Shah",
    department: "Human Resources",
    leaveType: "Annual Leave",
    startDate: "2026-11-02",
    endDate: "2026-11-05",
    reason: "Visiting family.",
    status: "Approved",
    appliedDate: "2026-10-06",
  },
  {
    id: 8,
    employee: "Hassan Ali",
    department: "IT",
    leaveType: "Casual Leave",
    startDate: "2026-10-22",
    endDate: "2026-10-22",
    reason: "Personal matters.",
    status: "Pending",
    appliedDate: "2026-10-10",
  },
];

const emptyForm = {
  employee: "",
  leaveType: "Annual Leave",
  startDate: "",
  endDate: "",
  reason: "",
};

function getStatusClasses(status) {
  if (status === "Approved") {
    return "bg-green-50 text-green-700";
  }

  if (status === "Rejected") {
    return "bg-red-50 text-red-700";
  }

  return "bg-amber-50 text-amber-700";
}

function getLeaveDays(startDate, endDate) {
  if (!startDate || !endDate || endDate < startDate) {
    return 0;
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function formatDate(date) {
  if (!date) {
    return "—";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Leave() {
  const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  const [viewingRequest, setViewingRequest] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);
  const [deletingRequest, setDeletingRequest] = useState(null);
  const [decisionRequest, setDecisionRequest] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const departments = useMemo(
    () => [...new Set(employees.map((employee) => employee.department))].sort(),
    [],
  );

  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((request) => {
      const matchesSearch = request.employee
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesDepartment =
        selectedDepartment === "All" ||
        request.department === selectedDepartment;

      const matchesStatus =
        selectedStatus === "All" || request.status === selectedStatus;

      const matchesType =
        selectedType === "All" || request.leaveType === selectedType;

      return matchesSearch && matchesDepartment && matchesStatus && matchesType;
    });
  }, [
    leaveRequests,
    searchTerm,
    selectedDepartment,
    selectedStatus,
    selectedType,
  ]);

  const pendingCount = leaveRequests.filter(
    (request) => request.status === "Pending",
  ).length;

  const approvedCount = leaveRequests.filter(
    (request) => request.status === "Approved",
  ).length;

  const rejectedCount = leaveRequests.filter(
    (request) => request.status === "Rejected",
  ).length;

  const openAddModal = () => {
    setFormData(emptyForm);
    setFormError("");
    setIsAdding(true);
    setEditingRequest(null);
  };

  const openEditModal = (request) => {
    setFormData({
      employee: request.employee,
      leaveType: request.leaveType,
      startDate: request.startDate,
      endDate: request.endDate,
      reason: request.reason,
    });
    setFormError("");
    setEditingRequest(request);
    setIsAdding(false);
    setViewingRequest(null);
  };

  const closeFormModal = () => {
    setIsAdding(false);
    setEditingRequest(null);
    setFormData(emptyForm);
    setFormError("");
  };

  const handleEmployeeChange = (employeeName) => {
    setFormData((current) => ({
      ...current,
      employee: employeeName,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError("");

    if (
      !formData.employee ||
      !formData.leaveType ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.reason.trim()
    ) {
      setFormError("Please complete all fields.");
      return;
    }

    if (formData.endDate < formData.startDate) {
      setFormError("End date cannot be earlier than start date.");
      return;
    }

    const selectedEmployee = employees.find(
      (employee) => employee.name === formData.employee,
    );

    if (!selectedEmployee) {
      setFormError("Please select a valid employee.");
      return;
    }

    if (isAdding) {
      const newRequest = {
        id: Date.now(),
        employee: selectedEmployee.name,
        department: selectedEmployee.department,
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason.trim(),
        status: "Pending",
        appliedDate: new Date().toLocaleDateString("en-CA"),
      };

      setLeaveRequests((current) => [newRequest, ...current]);
    } else if (editingRequest) {
      setLeaveRequests((current) =>
        current.map((request) =>
          request.id === editingRequest.id
            ? {
                ...request,
                employee: selectedEmployee.name,
                department: selectedEmployee.department,
                leaveType: formData.leaveType,
                startDate: formData.startDate,
                endDate: formData.endDate,
                reason: formData.reason.trim(),
              }
            : request,
        ),
      );
    }

    closeFormModal();
  };

  const handleDecision = () => {
    if (!decisionRequest) {
      return;
    }

    setLeaveRequests((current) =>
      current.map((request) =>
        request.id === decisionRequest.id
          ? { ...request, status: decisionRequest.status }
          : request,
      ),
    );

    if (viewingRequest?.id === decisionRequest.id) {
      setViewingRequest({
        ...viewingRequest,
        status: decisionRequest.status,
      });
    }

    setDecisionRequest(null);
  };

  const handleDelete = () => {
    if (!deletingRequest) {
      return;
    }

    setLeaveRequests((current) =>
      current.filter((request) => request.id !== deletingRequest.id),
    );

    if (viewingRequest?.id === deletingRequest.id) {
      setViewingRequest(null);
    }

    setDeletingRequest(null);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedDepartment("All");
    setSelectedStatus("All");
    setSelectedType("All");
  };

  const summaryCards = [
    {
      title: "Total Requests",
      value: leaveRequests.length,
      description: "All submitted requests",
      icon: CalendarDays,
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending",
      value: pendingCount,
      description: "Awaiting a decision",
      icon: Clock,
      iconStyle: "bg-amber-50 text-amber-600",
    },
    {
      title: "Approved",
      value: approvedCount,
      description: "Approved leave requests",
      icon: CheckCircle2,
      iconStyle: "bg-green-50 text-green-600",
    },
    {
      title: "Rejected",
      value: rejectedCount,
      description: "Rejected leave requests",
      icon: XCircle,
      iconStyle: "bg-red-50 text-red-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Leave Management
          </h1>
          <p className="mt-2 text-slate-500">
            Manage employee leave requests and review approval decisions.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex cursor-pointer items-center justify-center gap-2 self-start rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Leave Request
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {card.value}
                  </h2>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconStyle}`}
                >
                  <Icon size={24} />
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-500">{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* Leave Requests Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Leave Requests
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review requests and manage their status.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users size={18} />
              {filteredRequests.length}{" "}
              {filteredRequests.length === 1 ? "request" : "requests"}
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search employee..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={selectedDepartment}
              onChange={(event) => setSelectedDepartment(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Leave Types</option>
              <option value="Annual Leave">Annual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
            </select>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={resetFilters}
              className="cursor-pointer text-sm font-medium text-blue-600 transition hover:text-blue-800"
            >
              Reset filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Employee
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Leave Type
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Leave Dates
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Days
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">
                      {request.employee}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {request.department}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {request.leaveType}
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">
                      {formatDate(request.startDate)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      to {formatDate(request.endDate)}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-slate-700">
                    {getLeaveDays(request.startDate, request.endDate)}{" "}
                    {getLeaveDays(request.startDate, request.endDate) === 1
                      ? "day"
                      : "days"}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(request.status)}`}
                    >
                      {request.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title="View request"
                        aria-label={`View leave request for ${request.employee}`}
                        onClick={() => setViewingRequest(request)}
                        className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        title="Edit request"
                        aria-label={`Edit leave request for ${request.employee}`}
                        onClick={() => openEditModal(request)}
                        className="cursor-pointer rounded-lg border border-slate-200 p-2 text-blue-600 transition hover:bg-blue-50"
                      >
                        <Pencil size={16} />
                      </button>

                      {request.status === "Pending" && (
                        <>
                          <button
                            type="button"
                            title="Approve request"
                            aria-label={`Approve leave request for ${request.employee}`}
                            onClick={() =>
                              setDecisionRequest({
                                ...request,
                                status: "Approved",
                              })
                            }
                            className="cursor-pointer rounded-lg border border-green-200 p-2 text-green-600 transition hover:bg-green-50"
                          >
                            <CheckCircle2 size={16} />
                          </button>

                          <button
                            type="button"
                            title="Reject request"
                            aria-label={`Reject leave request for ${request.employee}`}
                            onClick={() =>
                              setDecisionRequest({
                                ...request,
                                status: "Rejected",
                              })
                            }
                            className="cursor-pointer rounded-lg border border-amber-200 p-2 text-amber-600 transition hover:bg-amber-50"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        title="Delete request"
                        aria-label={`Delete leave request for ${request.employee}`}
                        onClick={() => setDeletingRequest(request)}
                        className="cursor-pointer rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                      <CalendarDays size={26} className="text-slate-400" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-slate-800">
                      No leave requests found
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Try adjusting your search or filters.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-4 cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <p className="text-sm text-slate-500">
            Showing {filteredRequests.length} of {leaveRequests.length} leave
            requests.
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Demonstration data only. Changes are held in local page state and reset
        when the page is refreshed.
      </p>

      {/* Add / Edit Modal */}
      {(isAdding || editingRequest) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {isAdding ? "Add Leave Request" : "Edit Leave Request"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the employee's leave details below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                aria-label="Close form"
                className="cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label
                  htmlFor="leaveEmployee"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Employee
                </label>
                <select
                  id="leaveEmployee"
                  value={formData.employee}
                  onChange={(event) => handleEmployeeChange(event.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.name}>
                      {employee.name} — {employee.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="leaveType"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Leave Type
                </label>
                <select
                  id="leaveType"
                  value={formData.leaveType}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      leaveType: event.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="leaveStartDate"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Start Date
                  </label>
                  <input
                    id="leaveStartDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        startDate: event.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="leaveEndDate"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    End Date
                  </label>
                  <input
                    id="leaveEndDate"
                    type="date"
                    min={formData.startDate || undefined}
                    value={formData.endDate}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        endDate: event.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {formData.startDate && formData.endDate && (
                <p className="text-sm text-slate-500">
                  Duration:{" "}
                  <span className="font-semibold text-slate-700">
                    {getLeaveDays(formData.startDate, formData.endDate)}{" "}
                    {getLeaveDays(formData.startDate, formData.endDate) === 1
                      ? "day"
                      : "days"}
                  </span>
                </p>
              )}

              <div>
                <label
                  htmlFor="leaveReason"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Reason for Leave
                </label>
                <textarea
                  id="leaveReason"
                  rows={3}
                  value={formData.reason}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      reason: event.target.value,
                    }))
                  }
                  placeholder="Enter the reason for this leave request..."
                  required
                  className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {formError && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {isAdding ? "Submit Request" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Request Modal */}
      {viewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Leave Request Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review the submitted leave information.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingRequest(null)}
                aria-label="Close details"
                className="cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-slate-800">
                    {viewingRequest.employee}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {viewingRequest.department}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(viewingRequest.status)}`}
                >
                  {viewingRequest.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Leave Type
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {viewingRequest.leaveType}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">Duration</p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {getLeaveDays(
                      viewingRequest.startDate,
                      viewingRequest.endDate,
                    )}{" "}
                    days
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Start Date
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {formatDate(viewingRequest.startDate)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">End Date</p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {formatDate(viewingRequest.endDate)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Reason for Leave
                </p>
                <p className="mt-2 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  {viewingRequest.reason}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Applied Date
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDate(viewingRequest.appliedDate)}
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
                {viewingRequest.status === "Pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setDecisionRequest({
                          ...viewingRequest,
                          status: "Rejected",
                        })
                      }
                      className="cursor-pointer rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDecisionRequest({
                          ...viewingRequest,
                          status: "Approved",
                        })
                      }
                      className="cursor-pointer rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                      Approve
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setViewingRequest(null)}
                  className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval / Rejection Confirmation */}
      {decisionRequest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <AlertTriangle size={24} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-800">
              {decisionRequest.status === "Approved"
                ? "Approve Leave Request?"
                : "Reject Leave Request?"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to{" "}
              {decisionRequest.status === "Approved" ? "approve" : "reject"} the
              leave request from{" "}
              <span className="font-semibold text-slate-700">
                {decisionRequest.employee}
              </span>
              ?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDecisionRequest(null)}
                className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDecision}
                className={`cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition ${
                  decisionRequest.status === "Approved"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Confirm{" "}
                {decisionRequest.status === "Approved"
                  ? "Approval"
                  : "Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingRequest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={24} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-800">
              Delete Leave Request?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete the leave request from{" "}
              <span className="font-semibold text-slate-700">
                {deletingRequest.employee}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingRequest(null)}
                className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="cursor-pointer rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Delete Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leave;
