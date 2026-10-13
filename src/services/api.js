const API_BASE_URL = "http://localhost:5000";
function getAuthHeaders() {
    const token = sessionStorage.getItem("smartmanager_token");

    return token
        ? { Authorization: `Bearer ${token}` }
        : {};
}

export async function checkBackendHealth() {
    const response = await fetch(`${API_BASE_URL}/api/health`);

    if (!response.ok) {
        throw new Error(`Backend request failed: ${response.status}`);
    }

    return response.json();
}

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

    // Adapt MongoDB fields to the fields used by the existing UI.
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
