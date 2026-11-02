function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }

  const years = Math.floor(months / 12);

  return `${years} year${years === 1 ? "" : "s"} ago`;
}

function RecentActivities({ activities = [] }) {
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
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0"></div>

              <div>
                <p className="text-sm text-slate-700">{activity.text}</p>

                <p className="text-xs text-slate-400 mt-1">
                  {getTimeAgo(activity.date)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">
            No recent activities available.
          </p>
        )}
      </div>
    </div>
  );
}

export default RecentActivities;
