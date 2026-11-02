import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function EmployeePerformanceChart({ data = [] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800">
          Employee Performance
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Average performance scores from employee reviews
        </p>
      </div>

      <div className="h-72">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="employee" />

              <YAxis domain={[0, 100]} allowDecimals={false} />

              <Tooltip
                formatter={(value) => [`${value}/100`, "Average Score"]}
              />

              <Bar dataKey="score" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No performance review data available
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeePerformanceChart;
