
const API_BASE_URL = "http://localhost:5000";

export async function checkBackendHealth() {
    const response = await fetch(`${API_BASE_URL}/api/health`);

    if (!response.ok) {
        throw new Error(`Backend request failed: ${response.status}`);
    }

    return response.json();
}

export async function getEmployees() {
    const response = await fetch(`${API_BASE_URL}/api/employees`);

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
