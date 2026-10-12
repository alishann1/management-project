import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Departments from "./pages/Departments";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Goals from "./pages/Goals";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Performance from "./pages/Performance";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login stays outside the protected dashboard */}
        <Route path="/login" element={<Login />} />

        {/* Protected application pages */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/leave" element={<Leave />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
