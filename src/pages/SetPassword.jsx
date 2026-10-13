import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api";

function SetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!token) {
      setStatus("error");
      setMessage("The password-setup link is missing its token.");
      return;
    }

    if (password.length < 8) {
      setStatus("error");
      setMessage("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("The passwords do not match.");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch(`${API_BASE_URL}/password-setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(result.message || "Unable to set your password.");
        return;
      }

      setStatus("success");
      setMessage(result.message || "Your password has been set successfully.");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setStatus("error");
      setMessage("Unable to contact the server. Please try again later.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-slate-900">
          SmartManager
        </h1>

        <h2 className="mt-4 text-center text-lg font-semibold text-slate-800">
          Set your password
        </h2>

        <p className="mt-2 text-center text-sm text-slate-500">
          Choose a password with at least 8 characters.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {message && (
            <p
              role="status"
              className={`text-sm ${
                status === "success" ? "text-green-700" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Saving password..." : "Set password"}
          </button>
        </form>

        {status === "success" && (
          <Link
            to="/login"
            className="mt-5 block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Continue to login
          </Link>
        )}
      </section>
    </main>
  );
}

export default SetPassword;
