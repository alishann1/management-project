import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Present", value: 40, color: "#16a34a" },
  { name: "Absent", value: 5, color: "#dc2626" },
  { name: "On Leave", value: 3, color: "#d97706" },
];

function AttendanceOverview() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Attendance Overview
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Today's employee attendance
        </p>
      </div>

      {/* Attendance pie chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={85}
              label={({ value }) => value}
              labelLine
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip
              formatter={(value, name) => [`${value} employees`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Accessible attendance legend */}
      <div
        className="mt-2 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3"
        aria-label="Attendance chart legend"
      >
        {data.map((item) => (
          <div key={item.name} className="rounded-lg bg-slate-50 px-3 py-3">
            {/* Color marker aligned with category name */}
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 shrink-0 rounded-sm"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />

              <p className="text-sm font-medium text-slate-600">{item.name}</p>
            </div>

            {/* Employee count below the category */}
            <p className="mt-1 text-lg font-bold text-slate-800">
              {item.value}
              <span className="ml-1 text-xs font-normal text-slate-500">
                employees
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AttendanceOverview;
