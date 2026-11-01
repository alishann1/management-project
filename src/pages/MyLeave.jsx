import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Pencil,
  Ban,
  LoaderCircle,
  AlertTriangle,
  X,
  FileText,
} from "lucide-react";

import {
  getLeaveRequests,
  createLeaveRequest,
  updateLeaveRequest,
  cancelLeaveRequest,
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

function formatDate(date) {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getLeaveDays(startDate, endDate) {
  if (!startDate || !endDate || endDate < startDate) return 0;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function MyLeave() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [editingRequest, setEditingRequest] = useState(null);
  const [cancellingRequest, setCancellingRequest] = useState(null);

  const initialForm = {
    leaveType: "Annual Leave",
    startDate: "",
    endDate: "",
    reason: "",
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    const loadLeaveRequests = async () => {
      try {
        setIsLoading(true);
        setPageError("");

        const requests = await getLeaveRequests();
        setLeaveRequests(requests);
      } catch (error) {
        setPageError(error.message || "Unable to load your leave requests.");
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaveRequests();
  }, []);

  const pendingCount = leaveRequests.filter(
    (request) => request.status === "Pending",
  ).length;

  const approvedCount = leaveRequests.filter(
    (request) => request.status === "Approved",
  ).length;

  const rejectedCount = leaveRequests.filter(
    (request) => request.status === "Rejected",
  ).length;

  const summaryCards = [
    {
      title: "Total Requests",
      value: leaveRequests.length,
      icon: CalendarDays,
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending",
      value: pendingCount,
      icon: Clock,
      iconStyle: "bg-amber-50 text-amber-600",
    },
    {
      title: "Approved",
      value: approvedCount,
      icon: CheckCircle2,
      iconStyle: "bg-green-50 text-green-600",
    },
    {
      title: "Rejected",
      value: rejectedCount,
      icon: XCircle,
      iconStyle: "bg-red-50 text-red-600",
    },
  ];

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPageError("");
    setSuccessMessage("");
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingRequest(null);
  };

  const handleEdit = (request) => {
    setEditingRequest(request);

    setFormData({
      leaveType: request.leaveType,
      startDate: request.startDate,
      endDate: request.endDate,
      reason: request.reason || "",
    });

    setPageError("");
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setPageError("");
      setSuccessMessage("");

      let savedRequest;

      if (editingRequest) {
        savedRequest = await updateLeaveRequest(editingRequest.id, formData);

        setLeaveRequests((previous) =>
          previous.map((request) =>
            request.id === savedRequest.id ? savedRequest : request,
          ),
        );

        setSuccessMessage("Leave request updated successfully.");
      } else {
        savedRequest = await createLeaveRequest(formData);

        setLeaveRequests((previous) => [savedRequest, ...previous]);

        setSuccessMessage("Leave request submitted successfully.");
      }

      resetForm();
    } catch (error) {
      setPageError(error.message || "Unable to save your leave request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!cancellingRequest) return;

    try {
      setProcessingId(cancellingRequest.id);
      setPageError("");
      setSuccessMessage("");

      await cancelLeaveRequest(cancellingRequest.id);

      setLeaveRequests((previous) =>
        previous.filter((request) => request.id !== cancellingRequest.id),
      );

      setCancellingRequest(null);
      setSuccessMessage("Leave request cancelled successfully.");

      if (editingRequest?.id === cancellingRequest.id) {
        resetForm();
      }
    } catch (error) {
      setPageError(error.message || "Unable to cancel the leave request.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Leave</h1>
        <p className="mt-1 text-sm text-slate-500">
          Submit leave requests and keep track of their approval status.
        </p>
      </div>

      {/* Notifications */}
      {pageError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>{pageError}</p>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 size={18} />
          {successMessage}
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="ml-auto"
            aria-label="Dismiss success message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center">
          <LoaderCircle
            className="mx-auto mb-3 animate-spin text-blue-600"
            size={28}
          />
          <p className="text-sm text-slate-500">
            Loading your leave information...
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {card.title}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-slate-800">
                        {card.value}
                      </p>
                    </div>

                    <div className={`rounded-xl p-3 ${card.iconStyle}`}>
                      <Icon size={22} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Leave Request Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                {editingRequest ? <Pencil size={21} /> : <Plus size={21} />}
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {editingRequest
                    ? "Edit Leave Request"
                    : "Submit a Leave Request"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Provide the details of your requested leave.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="leaveType"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Leave Type
                  </label>

                  <select
                    id="leaveType"
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="startDate"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Start Date
                  </label>

                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="endDate"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    End Date
                  </label>

                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    min={formData.startDate || undefined}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="reason"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Reason for Leave
                    <span className="ml-1 font-normal text-slate-400">
                      (Optional)
                    </span>
                  </label>

                  <textarea
                    id="reason"
                    name="reason"
                    rows={3}
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Briefly explain the reason for your leave..."
                    className="w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                {editingRequest && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isSubmitting}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel Editing
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingRequest ? (
                        <Pencil size={17} />
                      ) : (
                        <Plus size={17} />
                      )}
                      {editingRequest ? "Update Request" : "Submit Request"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Leave History */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800">
                My Leave History
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review your submitted leave requests and their status.
              </p>
            </div>

            {leaveRequests.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <FileText className="mx-auto mb-3 text-slate-400" size={36} />
                <h3 className="font-semibold text-slate-700">
                  No leave requests yet
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Your submitted requests will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Leave Type
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Leave Dates
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Days
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Applied Date
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {leaveRequests.map((request) => (
                      <tr
                        key={request.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                          {request.leaveType}
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-700">
                            {formatDate(request.startDate)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            to {formatDate(request.endDate)}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {getLeaveDays(request.startDate, request.endDate)}{" "}
                          days
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {formatDate(request.appliedDate)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                              request.status,
                            )}`}
                          >
                            {request.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {request.status === "Pending" ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                title="Edit request"
                                aria-label="Edit leave request"
                                onClick={() => handleEdit(request)}
                                disabled={isSubmitting || processingId !== null}
                                className="rounded-lg border border-slate-200 p-2 text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                title="Cancel request"
                                aria-label="Cancel leave request"
                                onClick={() => setCancellingRequest(request)}
                                disabled={isSubmitting || processingId !== null}
                                className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                              >
                                <Ban size={16} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">
                              No actions available
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
              <p className="text-sm text-slate-500">
                Showing {leaveRequests.length} leave{" "}
                {leaveRequests.length === 1 ? "request" : "requests"}.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Cancel Confirmation */}
      {cancellingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle size={24} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-800">
              Cancel Leave Request?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to cancel your{" "}
              <span className="font-semibold text-slate-700">
                {cancellingRequest.leaveType}
              </span>{" "}
              request from {formatDate(cancellingRequest.startDate)} to{" "}
              {formatDate(cancellingRequest.endDate)}?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancellingRequest(null)}
                disabled={processingId !== null}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Keep Request
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={processingId !== null}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processingId !== null ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Confirm Cancellation"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyLeave;
