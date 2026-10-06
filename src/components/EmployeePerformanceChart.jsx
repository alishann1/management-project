import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { employee: "Ali", score: 92 },
  { employee: "Sara", score: 88 },
  { employee: "Ahmed", score: 84 },
  { employee: "Fatima", score: 79 },
  { employee: "Usman", score: 74 },
];

function EmployeePerformanceChart() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800">
          Employee Performance
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Overall performance scores
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="employee" />

            <YAxis domain={[0, 100]} allowDecimals={false} />

            <Tooltip />

            <Bar dataKey="score" fill="#16a34a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default EmployeePerformanceChart;
