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
  {
    status: "Completed",
    tasks: 42,
  },
  {
    status: "In Progress",
    tasks: 18,
  },
  {
    status: "Pending",
    tasks: 11,
  },
  {
    status: "Overdue",
    tasks: 5,
  },
];

function TaskProgressChart() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Task Progress</h2>

        <p className="text-sm text-slate-500 mt-1">
          Current status of organizational tasks
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="status" />

            <YAxis allowDecimals={false} />

            <Tooltip />

            <Bar dataKey="tasks" fill="#2563eb" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TaskProgressChart;
