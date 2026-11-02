import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  getEmployees,
  getLeaveRequests,
  updateLeaveStatus,
  deleteLeaveRequest,
} from "../services/api";

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
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [pageError, setPageError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  const [viewingRequest, setViewingRequest] = useState(null);
  const [deletingRequest, setDeletingRequest] = useState(null);
  const [decisionRequest, setDecisionRequest] = useState(null);

  const departments = useMemo(
    () => [...new Set(employees.map((employee) => employee.department))].sort(),
    [employees],
  );

  useEffect(() => {
    const loadLeaveData = async () => {
      try {
        setIsLoading(true);
        setPageError("");

        const [requests, employeeList] = await Promise.all([
          getLeaveRequests(),
          getEmployees(),
        ]);

        setLeaveRequests(requests);
        setEmployees(employeeList);
      } catch (error) {
        setPageError(error.message || "Unable to load leave management data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaveData();
  }, []);

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

  const handleDecision = async () => {
    if (!decisionRequest) {
      return;
    }

    try {
      setIsProcessingAction(true);
      setPageError("");

      const updatedRequest = await updateLeaveStatus(
        decisionRequest.id,
        decisionRequest.status,
      );

      setLeaveRequests((current) =>
        current.map((request) =>
          request.id === updatedRequest.id ? updatedRequest : request,
        ),
      );

      if (viewingRequest?.id === updatedRequest.id) {
        setViewingRequest(updatedRequest);
      }

      setDecisionRequest(null);
    } catch (error) {
      setPageError(error.message || "Unable to update the leave request.");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRequest) {
      return;
    }

    try {
      setIsProcessingAction(true);
      setPageError("");

      await deleteLeaveRequest(deletingRequest.id);

      setLeaveRequests((current) =>
        current.filter((request) => request.id !== deletingRequest.id),
      );

      if (viewingRequest?.id === deletingRequest.id) {
        setViewingRequest(null);
      }

      setDeletingRequest(null);
    } catch (error) {
      setPageError(error.message || "Unable to delete the leave request.");
    } finally {
      setIsProcessingAction(false);
    }
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
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Leave Management</h1>
        <p className="mt-2 text-slate-500">
          Review employee leave requests and manage approval decisions.
        </p>
      </div>

      {pageError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>{pageError}</p>
        </div>
      )}

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
              {isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    Loading leave requests...
                  </td>
                </tr>
              )}

              {!isLoading &&
                filteredRequests.map((request) => (
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

              {!isLoading && filteredRequests.length === 0 && (
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
                disabled={isProcessingAction}
                className={`cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  decisionRequest.status === "Approved"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isProcessingAction
                  ? "Processing..."
                  : `Confirm ${decisionRequest.status === "Approved" ? "Approval" : "Rejection"}`}
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
                disabled={isProcessingAction}
                className="cursor-pointer rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isProcessingAction ? "Deleting..." : "Delete Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leave;
