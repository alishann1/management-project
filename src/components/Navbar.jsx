import { Bell, Search } from "lucide-react";

function Navbar() {
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
        <button className="relative text-slate-600 hover:text-slate-900">
          <Bell size={22} />

          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
            AM
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Admin Manager
            </p>
            <p className="text-xs text-slate-500">Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
