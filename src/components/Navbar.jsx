import { Bell, Search, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(
    sessionStorage.getItem("smartmanager_user") || "null",
  );

  const handleLogout = () => {
    sessionStorage.removeItem("smartmanager_token");
    sessionStorage.removeItem("smartmanager_user");
    navigate("/login", { replace: true });
  };

  const name = user?.name || "Admin Manager";
  const role = user?.role || "Manager";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
      {/* Search */}
      <div className="flex items-center w-80 bg-slate-100 rounded-lg px-4 py-2">
        <Search size={20} className="text-slate-400" />

        <input
          type="text"
          placeholder="Search..."
          className="ml-3 bg-transparent outline-none w-full text-sm"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        {/* Notification */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative text-slate-600 hover:text-slate-900"
        >
          <Bell size={22} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
            {initials || "AM"}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">{name}</p>
            <p className="text-xs text-slate-500">{role}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600 transition"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
