import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Users,
  CheckCircle2,
  XCircle,
  CalendarOff,
  TrendingUp,
  Search,
  ClipboardCheck,
} from "lucide-react";
import employees from "../data/employees";

const today = "2026-10-10";

const initialAttendance = [
  {
    id: 1,
    employeeId: 1,
    name: "Ali Khan",
    department: "IT",
    date: today,
    checkIn: "09:02 AM",
    checkOut: "05:05 PM",
    status: "Present",
  },
  {
    id: 2,
    employeeId: 2,
    name: "Sara Ahmed",
    department: "Human Resources",
    date: today,
    checkIn: "08:55 AM",
    checkOut: "05:00 PM",
    status: "Present",
  },
  {
    id: 3,
    employeeId: 3,
    name: "Ahmed Shah",
    department: "Finance",
    date: today,
    checkIn: "09:10 AM",
    checkOut: "05:12 PM",
    status: "Present",
  },
  {
    id: 4,
    employeeId: 4,
    name: "Fatima Ali",
    department: "Marketing",
    date: today,
    checkIn: "—",
    checkOut: "—",
    status: "On Leave",
  },
  {
    id: 5,
    employeeId: 5,
    name: "Usman Khan",
    department: "IT",
    date: today,
    checkIn: "09:00 AM",
    checkOut: "05:08 PM",
    status: "Present",
  },
  {
    id: 6,
    employeeId: 6,
    name: "Ayesha Malik",
    department: "Operations",
    date: today,
    checkIn: "08:50 AM",
    checkOut: "05:02 PM",
    status: "Present",
  },
  {
    id: 7,
    employeeId: 7,
    name: "Hassan Ali",
    department: "IT",
    date: today,
    checkIn: "—",
    checkOut: "—",
    status: "Absent",
  },
  {
    id: 8,
    employeeId: 8,
    name: "Maryam Shah",
    department: "Human Resources",
    date: today,
    checkIn: "—",
    checkOut: "—",
    status: "On Leave",
  },
];

function getStatusClasses(status) {
  if (status === "Present") {
    return "bg-green-50 text-green-700";
  }

  if (status === "Absent") {
    return "bg-red-50 text-red-700";
  }

  return "bg-amber-50 text-amber-700";
}

function Attendance() {
  const [attendance, setAttendance] = useState(initialAttendance);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDate, setSelectedDate] = useState(today);

  const departments = useMemo(
    () => [...new Set(employees.map((employee) => employee.department))].sort(),
    [],
  );

  const filteredAttendance = useMemo(() => {
    return attendance.filter((record) => {
      const matchesSearch = record.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesDepartment =
        selectedDepartment === "All" ||
        record.department === selectedDepartment;

      const matchesStatus =
        selectedStatus === "All" || record.status === selectedStatus;

      const matchesDate = record.date === selectedDate;

      return matchesSearch && matchesDepartment && matchesStatus && matchesDate;
    });
  }, [
    attendance,
    searchTerm,
    selectedDepartment,
    selectedStatus,
    selectedDate,
  ]);

  const presentCount = filteredAttendance.filter(
    (record) => record.status === "Present",
  ).length;

  const absentCount = filteredAttendance.filter(
    (record) => record.status === "Absent",
  ).length;

  const leaveCount = filteredAttendance.filter(
    (record) => record.status === "On Leave",
  ).length;

  const eligibleCount = presentCount + absentCount;

  const attendanceRate =
    eligibleCount > 0 ? Math.round((presentCount / eligibleCount) * 100) : 0;

  const updateAttendanceStatus = (recordId, newStatus) => {
    setAttendance((currentAttendance) =>
      currentAttendance.map((record) => {
        if (record.id !== recordId) {
          return record;
        }

        return {
          ...record,
          status: newStatus,
          checkIn:
            newStatus === "Present"
              ? record.checkIn === "—"
                ? "09:00 AM"
                : record.checkIn
              : "—",
          checkOut:
            newStatus === "Present"
              ? record.checkOut === "—"
                ? "05:00 PM"
                : record.checkOut
              : "—",
        };
      }),
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedDepartment("All");
    setSelectedStatus("All");
    setSelectedDate(today);
  };

  const summaryCards = [
    {
      title: "Present",
      value: presentCount,
      description: "Employees present",
      icon: CheckCircle2,
      iconStyle: "bg-green-50 text-green-600",
    },
    {
      title: "Absent",
      value: absentCount,
      description: "Employees absent",
      icon: XCircle,
      iconStyle: "bg-red-50 text-red-600",
    },
    {
      title: "On Leave",
      value: leaveCount,
      description: "Employees on leave",
      icon: CalendarOff,
      iconStyle: "bg-amber-50 text-amber-600",
    },
    {
      title: "Attendance Rate",
      value: `${attendanceRate}%`,
      description: "Present among present/absent",
      icon: TrendingUp,
      iconStyle: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Attendance Management
          </h1>
          <p className="mt-2 text-slate-500">
            Track daily employee attendance and monitor attendance records.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm">
          <ClipboardCheck size={18} className="text-blue-600" />
          Daily Attendance
        </div>
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

      {/* Attendance Records */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Attendance Records
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                View and update attendance for individual employees.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users size={18} />
              {filteredAttendance.length}{" "}
              {filteredAttendance.length === 1 ? "record" : "records"}
            </div>
          </div>

          {/* Search and Filters */}
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
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
            </select>

            <div className="relative">
              <CalendarDays
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                aria-label="Filter attendance by date"
              />
            </div>
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
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Employee
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Department
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Check In
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Check Out
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Update Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredAttendance.map((record) => (
                <tr key={record.id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">
                      {record.name}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {record.date}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {record.department}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock3 size={16} className="text-slate-400" />
                      {record.checkIn}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock3 size={16} className="text-slate-400" />
                      {record.checkOut}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(record.status)}`}
                    >
                      {record.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <select
                      value={record.status}
                      onChange={(event) =>
                        updateAttendanceStatus(record.id, event.target.value)
                      }
                      aria-label={`Update attendance status for ${record.name}`}
                      className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </td>
                </tr>
              ))}

              {filteredAttendance.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                      <CalendarDays size={26} className="text-slate-400" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-slate-800">
                      No attendance records found
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Try another date or adjust your search and filters.
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

        {/* Table Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <p className="text-sm text-slate-500">
            Showing {filteredAttendance.length} of{" "}
            {attendance.filter((record) => record.date === selectedDate).length}{" "}
            records for the selected date.
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Demonstration data only. Attendance changes are held in local page state
        and will reset when the page is refreshed.
      </p>
    </div>
  );
}

export default Attendance;
