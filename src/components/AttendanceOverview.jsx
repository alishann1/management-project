import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Present", value: 40 },
  { name: "Absent", value: 5 },
  { name: "On Leave", value: 3 },
];

function AttendanceOverview() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Attendance Overview
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Today's employee attendance
        </p>
      </div>

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
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 text-center mt-2">
        <div>
          <p className="text-xl font-bold text-slate-800">40</p>
          <p className="text-xs text-slate-500">Present</p>
        </div>

        <div>
          <p className="text-xl font-bold text-slate-800">5</p>
          <p className="text-xs text-slate-500">Absent</p>
        </div>

        <div>
          <p className="text-xl font-bold text-slate-800">3</p>
          <p className="text-xs text-slate-500">On Leave</p>
        </div>
      </div>
    </div>
  );
}

export default AttendanceOverview;
