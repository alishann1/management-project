import { ClipboardList, Target, CalendarCheck, TrendingUp } from "lucide-react";

function EmployeeDashboard() {
  const userData = sessionStorage.getItem("smartmanager_user");
  const user = userData ? JSON.parse(userData) : null;

  const cards = [
    {
      title: "My Tasks",
      description: "View and manage your assigned tasks.",
      icon: ClipboardList,
      color: "text-blue-600",
      background: "bg-blue-50",
    },
    {
      title: "My Goals",
      description: "Track your goals and progress.",
      icon: Target,
      color: "text-purple-600",
      background: "bg-purple-50",
    },
    {
      title: "Attendance",
      description: "Review your attendance records.",
      icon: CalendarCheck,
      color: "text-green-600",
      background: "bg-green-50",
    },
    {
      title: "Performance",
      description: "Review your performance information.",
      icon: TrendingUp,
      color: "text-orange-600",
      background: "bg-orange-50",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-600">SMARTMANAGER</p>

          <h1 className="text-3xl font-bold text-slate-800">
            Employee Dashboard
          </h1>

          <p className="mt-2 text-slate-500">
            Welcome back{user?.name ? `, ${user.name}` : ""}! Here's your
            personal workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${card.background}`}
                >
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>

                <h2 className="text-lg font-semibold text-slate-800">
                  {card.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Getting Started
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your personal dashboard is ready. As task, goal, attendance, and
            performance features are connected to the backend, your information
            will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
