
const API_BASE_URL = "http://localhost:5000";

function getAuthHeaders() {
    const token = sessionStorage.getItem("smartmanager_token");

    return token
        ? { Authorization: `Bearer ${token}` }
        : {};
}

// ===============================
// BACKEND HEALTH
// ===============================

export async function checkBackendHealth() {
    const response = await fetch(`${API_BASE_URL}/api/health`);

    if (!response.ok) {
        throw new Error(`Backend request failed: ${response.status}`);
    }

    return response.json();
}

// ===============================
// EMPLOYEE API
// ===============================

export async function getEmployees() {
    const response = await fetch(`${API_BASE_URL}/api/employees`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch employees: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.message || "Failed to fetch employees");
    }

    return result.data.map((employee) => ({
        id: employee._id,
        name: employee.name,
        email: employee.email || "",
        department: employee.department,
        position: employee.role,
        status: employee.status,
        performance: employee.performance,
    }));
}

export async function createEmployee(employeeData) {
    const response = await fetch(`${API_BASE_URL}/api/employees`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(employeeData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create employee.");
    }

    const employee = result.data;

    return {
        id: employee._id,
        name: employee.name,
        email: employee.email || "",
        department: employee.department,
        position: employee.role,
        status: employee.status,
        performance: employee.performance,
    };
}

export async function updateEmployee(employeeId, employeeData) {
    const response = await fetch(
        `${API_BASE_URL}/api/employees/${employeeId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(employeeData),
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update employee.");
    }

    const employee = result.data;

    return {
        id: employee._id,
        name: employee.name,
        email: employee.email || "",
        department: employee.department,
        position: employee.role,
        status: employee.status,
        performance: employee.performance,
    };
}

export async function deleteEmployee(employeeId) {
    const response = await fetch(
        `${API_BASE_URL}/api/employees/${employeeId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders(),
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete employee.");
    }

    return result;
}

// ===============================
// TASK API
// ===============================

export async function getMyTasks() {
    const response = await fetch(`${API_BASE_URL}/api/tasks/my-tasks`, {
        headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch your tasks");
    }

    return result.data.map((task) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        project: task.project,
        department: task.department,
        assignedTo: task.assignedTo,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate?.split("T")[0] || "",
        progress: task.progress,
    }));
}

// Update progress of an employee's own assigned task.
export async function updateMyTaskProgress(taskId, progress) {
    const response = await fetch(
        `${API_BASE_URL}/api/tasks/my-tasks/${taskId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify({ progress }),
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update task progress.");
    }

    return {
        id: result.data._id,
        status: result.data.status,
        progress: result.data.progress,
    };
}

export async function getTasks() {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch tasks");
    }

    return result.data.map((task) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        project: task.project,
        department: task.department,
        assignedTo: task.assignedTo?.name || "",
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate?.split("T")[0] || "",
        progress: task.progress,
    }));
}

export async function createTask(taskData) {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: "POST",
        headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create task");
    }

    return result.data;
}

export async function updateTask(taskId, taskData) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update task");
    }

    return result.data;
}

export async function deleteTask(taskId) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete task");
    }

    return result;
}

// ===============================
// GOALS API
// ===============================

export async function getGoals() {
    const response = await fetch(`${API_BASE_URL}/api/goals`, {
        headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch goals.");
    }

    return result.data.map((goal) => ({
        id: goal._id,
        title: goal.title,
        description: goal.description,
        employee: goal.employee?.name || "",
        department: goal.department,
        category: goal.category,
        target: goal.target,
        progress: goal.progress,
        status: goal.status,
        deadline: goal.deadline
            ? goal.deadline.split("T")[0]
            : "",
    }));
}


// Fetch goals assigned to the logged-in employee.
export async function getMyGoals() {
    const response = await fetch(`${API_BASE_URL}/api/goals/my-goals`, {
        headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch your goals.");
    }

    return result.data.map((goal) => ({
        id: goal._id,
        title: goal.title,
        description: goal.description,
        department: goal.department,
        category: goal.category,
        target: goal.target,
        progress: goal.progress,
        status: goal.status,
        deadline: goal.deadline
            ? goal.deadline.split("T")[0]
            : "",
    }));
}

// Update progress of an employee's own assigned goal.
export async function updateMyGoalProgress(goalId, progress) {
    const response = await fetch(
        `${API_BASE_URL}/api/goals/my-goals/${goalId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify({ progress }),
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update goal progress.");
    }

    return {
        id: result.data._id,
        status: result.data.status,
        progress: result.data.progress,
    };
}

export async function createGoal(goalData) {
    const response = await fetch(`${API_BASE_URL}/api/goals`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(goalData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create goal.");
    }

    return result.data;
}

export async function updateGoal(goalId, goalData) {
    const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(goalData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update goal.");
    }

    return result.data;
}

export async function deleteGoal(goalId) {
    const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete goal.");
    }

    return result;
}

// ===============================
// AUTHENTICATION API
// ===============================

export async function loginUser(email, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Login failed. Please try again.");
    }

    return result;
}

// ===============================
// DEPARTMENT API
// ===============================

export async function getDepartments() {
    const response = await fetch(`${API_BASE_URL}/api/departments`, {
        headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch departments.");
    }

    return result.data.map((department) => ({
        id: department._id,
        name: department.name,
        description: department.description || "",
        manager: department.manager || "",
        projects: department.projects ?? 0,
    }));
}

export async function createDepartment(departmentData) {
    const response = await fetch(`${API_BASE_URL}/api/departments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(departmentData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create department.");
    }

    return result.data;
}

export async function updateDepartment(departmentId, departmentData) {
    const response = await fetch(
        `${API_BASE_URL}/api/departments/${departmentId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(departmentData),
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update department.");
    }

    return result.data;
}

export async function deleteDepartment(departmentId) {
    const response = await fetch(
        `${API_BASE_URL}/api/departments/${departmentId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders(),
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete department.");
    }

    return result;
}

// ===============================
// PROJECT API
// ===============================

export async function getProjects() {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
        headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch projects.");
    }

    return result.data.map((project) => ({
        id: project._id,
        name: project.name,
        description: project.description,
        department: project.department,
        manager: project.manager,
        status: project.status,
        startDate: project.startDate
            ? project.startDate.split("T")[0]
            : "",
        dueDate: project.dueDate
            ? project.dueDate.split("T")[0]
            : "",
        progress: project.progress,
    }));
}

export async function createProject(projectData) {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(projectData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create project.");
    }

    return result.data;
}

export async function updateProject(projectId, projectData) {
    const response = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(projectData),
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update project.");
    }

    return result.data;
}

export async function deleteProject(projectId) {
    const response = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders(),
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete project.");
    }

    return result;
}

// ===============================
// ATTENDANCE API
// ===============================

export async function getAttendance() {
    const response = await fetch(`${API_BASE_URL}/api/attendance`, {
        headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch attendance.");
    }

    return result.data;
}

// Fetch attendance records for the logged-in employee.
export async function getMyAttendance() {
    const response = await fetch(
        `${API_BASE_URL}/api/attendance/my-attendance`,
        {
            headers: getAuthHeaders(),
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Failed to fetch your attendance records."
        );
    }

    return result.data.map((record) => ({
        id: record._id,
        date: record.date,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        status: record.status,
    }));
}

export async function createAttendance(attendanceData) {
    const response = await fetch(`${API_BASE_URL}/api/attendance`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(attendanceData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create attendance.");
    }

    return result.data;
}

export async function updateAttendance(id, attendanceData) {
    const response = await fetch(`${API_BASE_URL}/api/attendance/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(attendanceData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update attendance.");
    }

    return result.data;
}

export async function deleteAttendance(id) {
    const response = await fetch(`${API_BASE_URL}/api/attendance/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete attendance.");
    }

    return result;
}

export async function initializeAttendance(date) {
    const response = await fetch(`${API_BASE_URL}/api/attendance/initialize`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ date }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to initialize attendance.");
    }

    return result.data;
}

// ===============================
// LEAVE API
// ===============================

// Convert MongoDB leave request into the format used by Leave.jsx.
function mapLeaveRequest(leave) {
    return {
        id: leave._id,
        employeeId: leave.employee?._id || leave.employee,
        employee: leave.employee?.name || "",
        department: leave.employee?.department || "",
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason || "",
        status: leave.status,
        appliedDate: leave.appliedDate,
    };
}

// Get all leave requests.
export async function getLeaveRequests() {
    const response = await fetch(`${API_BASE_URL}/api/leave`, {
        headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch leave requests.");
    }

    return result.data.map(mapLeaveRequest);
}

// Create a leave request.
export async function createLeaveRequest(leaveData) {
    const response = await fetch(`${API_BASE_URL}/api/leave`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({
            leaveType: leaveData.leaveType,
            startDate: leaveData.startDate,
            endDate: leaveData.endDate,
            reason: leaveData.reason || "",
        }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create leave request.");
    }

    return mapLeaveRequest(result.data);
}

// Update leave request details.
export async function updateLeaveRequest(leaveId, leaveData) {
    const response = await fetch(`${API_BASE_URL}/api/leave/${leaveId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({
            leaveType: leaveData.leaveType,
            startDate: leaveData.startDate,
            endDate: leaveData.endDate,
            reason: leaveData.reason || "",
        }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update leave request.");
    }

    return mapLeaveRequest(result.data);
}

// Approve or reject a leave request.
export async function updateLeaveStatus(leaveId, status) {
    const response = await fetch(
        `${API_BASE_URL}/api/leave/${leaveId}/status`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify({ status }),
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update leave status.");
    }

    return mapLeaveRequest(result.data);
}

// Delete a leave request.
export async function deleteLeaveRequest(leaveId) {
    const response = await fetch(`${API_BASE_URL}/api/leave/${leaveId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete leave request.");
    }

    return result;
}

// Cancel an employee's own pending leave request.
export async function cancelLeaveRequest(leaveId) {
    const response = await fetch(
        `${API_BASE_URL}/api/leave/${leaveId}/cancel`,
        {
            method: "PATCH",
            headers: getAuthHeaders(),
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to cancel leave request.");
    }

    return result;
}

// ===============================
// PERFORMANCE API
// ===============================

// Convert a MongoDB performance review into the format used by Performance.jsx.
function mapPerformanceReview(review) {
    return {
        id: review._id,
        employeeId: review.employee?._id || "",
        employee: review.employee?.name || "",
        department: review.employee?.department || review.department || "",
        reviewPeriod: review.reviewPeriod,
        score: review.score,
        rating: review.rating,
        strengths: review.strengths,
        improvements: review.improvements,
        reviewDate: review.reviewDate
            ? review.reviewDate.split("T")[0]
            : "",
    };
}


// Get all performance reviews.
export async function getPerformanceReviews() {
    const response = await fetch(`${API_BASE_URL}/api/performance`, {
        headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch performance reviews.");
    }

    return result.data.map(mapPerformanceReview);
}

// Fetch performance reviews for the logged-in employee
export async function getMyPerformance() {
    const response = await fetch(
        `${API_BASE_URL}/api/performance/my-performance`,
        {
            headers: getAuthHeaders(),
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Failed to fetch your performance reviews."
        );
    }

    return result.data.map(mapPerformanceReview);
}

// Create a performance review using the employee's MongoDB ID.
export async function createPerformanceReview(reviewData) {
    const response = await fetch(`${API_BASE_URL}/api/performance`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({
            employeeId: reviewData.employeeId,
            reviewPeriod: reviewData.reviewPeriod,
            score: reviewData.score,
            strengths: reviewData.strengths,
            improvements: reviewData.improvements,
            reviewDate: reviewData.reviewDate,
        }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create performance review.");
    }

    return mapPerformanceReview(result.data);
}

// Update a performance review using the employee's MongoDB ID.
export async function updatePerformanceReview(reviewId, reviewData) {
    const response = await fetch(`${API_BASE_URL}/api/performance/${reviewId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({
            employeeId: reviewData.employeeId,
            reviewPeriod: reviewData.reviewPeriod,
            score: reviewData.score,
            strengths: reviewData.strengths,
            improvements: reviewData.improvements,
            reviewDate: reviewData.reviewDate,
        }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update performance review.");
    }

    return mapPerformanceReview(result.data);
}

// Delete a performance review.
export async function deletePerformanceReview(reviewId) {
    const response = await fetch(`${API_BASE_URL}/api/performance/${reviewId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete performance review.");
    }

    return result;
}
