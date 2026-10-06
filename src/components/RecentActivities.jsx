const activities = [
  {
    text: "Ali completed the Website Design task",
    time: "10 minutes ago",
  },
  {
    text: "Sara submitted a leave request",
    time: "35 minutes ago",
  },
  {
    text: "Ahmed was assigned a new project task",
    time: "1 hour ago",
  },
  {
    text: "Fatima completed her monthly goal",
    time: "2 hours ago",
  },
  {
    text: "Usman updated project progress",
    time: "3 hours ago",
  },
];

function RecentActivities() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800">
          Recent Activities
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Latest organizational activities
        </p>
      </div>

      <div className="space-y-5">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>

            <div>
              <p className="text-sm text-slate-700">{activity.text}</p>

              <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentActivities;
