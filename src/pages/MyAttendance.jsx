import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  Coffee,
  ClipboardList,
  LoaderCircle,
  Filter,
} from "lucide-react";

import { getMyAttendance } from "../services/api";

function MyAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        setLoading(true);
        setError("");

        const records = await getMyAttendance();
        setAttendance(records);
      } catch (err) {
        setError(err.message || "Failed to load your attendance.");
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, []);

  const summary = useMemo(
    () => ({
      total: attendance.length,
      present: attendance.filter((record) => record.status === "Present")
        .length,
      absent: attendance.filter((record) => record.status === "Absent").length,
      onLeave: attendance.filter((record) => record.status === "On Leave")
        .length,
    }),
    [attendance],
  );

  const filteredAttendance = useMemo(() => {
    if (!selectedDate) return attendance;

    return attendance.filter((record) => record.date === selectedDate);
  }, [attendance, selectedDate]);

  const getStatusStyle = (status) => {
    if (status === "Present") {
      return "bg-green-50 text-green-700 ring-1 ring-green-200";
    }

    if (status === "Absent") {
      return "bg-red-50 text-red-700 ring-1 ring-red-200";
    }

    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  };

  const summaryCards = [
    {
      title: "Total Days",
      value: summary.total,
      icon: ClipboardList,
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      title: "Present",
      value: summary.present,
      icon: CheckCircle2,
      iconStyle: "bg-green-50 text-green-600",
    },
    {
      title: "Absent",
      value: summary.absent,
      icon: XCircle,
      iconStyle: "bg-red-50 text-red-600",
    },
    {
      title: "On Leave",
      value: summary.onLeave,
      icon: Coffee,
      iconStyle: "bg-amber-50 text-amber-600",
    },
  ];

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Attendance</h1>
        <p className="mt-1 text-sm text-slate-500">
          View your attendance history and daily attendance records.
        </p>
      </div>

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center">
          <LoaderCircle
            className="mx-auto mb-3 animate-spin text-blue-600"
            size={28}
          />
          <p className="text-sm text-slate-500">Loading your attendance...</p>
        </div>
      )}

      {!loading && !error && (
        <>
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
                      <p className="mt-2 text-2xl font-bold tabular-nums text-slate-800">
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

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Attendance History
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your recorded daily attendance.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Filter size={16} />
                  Filter by date
                </div>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                {selectedDate && (
                  <button
                    type="button"
                    onClick={() => setSelectedDate("")}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {filteredAttendance.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarDays
                  className="mx-auto mb-3 text-slate-400"
                  size={36}
                />
                <h3 className="font-semibold text-slate-700">
                  {attendance.length === 0
                    ? "No attendance records yet"
                    : "No records found for this date"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {attendance.length === 0
                    ? "Your attendance records will appear here."
                    : "Try selecting another date or clearing the filter."}
                </p>
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Check In</th>
                      <th className="px-4 py-3 font-semibold">Check Out</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredAttendance.map((record) => (
                      <tr
                        key={record.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-4 py-4 text-sm font-medium text-slate-700">
                          <div className="flex items-center gap-2">
                            <CalendarDays
                              size={16}
                              className="text-slate-400"
                            />
                            {formatDate(record.date)}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Clock size={15} className="text-slate-400" />
                            {record.checkIn || "—"}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Clock size={15} className="text-slate-400" />
                            {record.checkOut || "—"}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                              record.status,
                            )}`}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredAttendance.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-400">
                Showing {filteredAttendance.length} of {attendance.length}{" "}
                attendance records
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default MyAttendance;
