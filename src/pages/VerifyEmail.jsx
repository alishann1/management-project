import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("The verification link is missing its token.");
      return;
    }

    let cancelled = false;

    async function verifyEmail() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/email-verification/verify?token=${encodeURIComponent(token)}`,
        );

        const result = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          setStatus("error");
          setMessage(result.message || "Email verification failed.");
          return;
        }

        setStatus("success");
        setMessage(result.message);
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Unable to contact the server. Please try again later.");
        }
      }
    }

    verifyEmail();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <h1 className="text-2xl font-bold text-slate-900">SmartManager</h1>

        <h2 className="mt-4 text-lg font-semibold text-slate-800">
          Email verification
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>

        {status === "loading" && (
          <p className="mt-4 text-sm text-blue-600">Please wait...</p>
        )}

        {status === "success" && (
          <p className="mt-5 text-sm text-slate-600">
            Open the password-setup email preview shown in the backend terminal
            to choose your password.
          </p>
        )}

        {status === "error" && (
          <p className="mt-5 text-sm text-slate-600">
            Ask your Manager for help if the link has expired.
          </p>
        )}

        <Link
          to="/login"
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Go to login
        </Link>
      </section>
    </main>
  );
}

export default VerifyEmail;
