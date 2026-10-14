import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DashboardLayout() {
  const userData = sessionStorage.getItem("smartmanager_user");
  const user = userData ? JSON.parse(userData) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar role={user?.role} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
