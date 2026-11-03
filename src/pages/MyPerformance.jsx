import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  ClipboardCheck,
  Award,
  Eye,
  X,
  AlertTriangle,
} from "lucide-react";

import { getMyPerformance } from "../services/api";

// Format date without UTC timezone shifting.
const formatDate = (dateString) => {
  if (!dateString) return "—";

  const date = new Date(`${dateString.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Rating badge styles.
const getRatingClasses = (rating) => {
  switch (rating) {
    case "Excellent":
      return "bg-green-100 text-green-700";
    case "Very Good":
      return "bg-blue-100 text-blue-700";
    case "Good":
      return "bg-indigo-100 text-indigo-700";
    case "Satisfactory":
      return "bg-yellow-100 text-yellow-700";
    case "Needs Improvement":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

// Score text colors.
const getScoreColor = (score) => {
  if (score >= 90) return "text-green-600";
  if (score >= 80) return "text-blue-600";
  if (score >= 70) return "text-indigo-600";
  if (score >= 60) return "text-yellow-600";

  return "text-red-600";
};

function MyPerformance() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [viewingReview, setViewingReview] = useState(null);

  // Load the logged-in employee's performance reviews.
  useEffect(() => {
    let isMounted = true;

    const loadPerformance = async () => {
      try {
        setIsLoading(true);
        setPageError("");

        const data = await getMyPerformance();

        if (isMounted) {
          setReviews(data);
        }
      } catch (error) {
        if (isMounted) {
          setPageError(
            error.message || "Failed to load your performance reviews.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPerformance();

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate average score.
  const averageScore = useMemo(() => {
    if (reviews.length === 0) return 0;

    const total = reviews.reduce(
      (sum, review) => sum + Number(review.score || 0),
      0,
    );

    return Math.round(total / reviews.length);
  }, [reviews]);

  // Reviews are already sorted newest first by the backend.
  const latestReview = reviews[0] || null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Performance</h1>
        <p className="mt-1 text-sm text-gray-500">
          View your performance evaluations, scores, and manager feedback.
        </p>
      </div>

      {/* Page Error */}
      {pageError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle size={19} className="mt-0.5 shrink-0" />
          <span>{pageError}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Score</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-800">
                {isLoading ? "—" : `${averageScore}%`}
              </h2>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <TrendingUp size={23} />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Average across your reviews
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Reviews</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-800">
                {isLoading ? "—" : reviews.length}
              </h2>
            </div>
            <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
              <ClipboardCheck size={23} />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Your recorded evaluations
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Latest Rating</p>
              <h2 className="mt-2 text-xl font-bold text-gray-800">
                {isLoading ? "—" : latestReview?.rating || "Not Available"}
              </h2>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-green-600">
              <Award size={23} />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            {latestReview
              ? `Latest review: ${formatDate(latestReview.reviewDate)}`
              : "Your latest performance rating"}
          </p>
        </div>
      </div>

      {/* Performance History */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-800">Performance History</h2>
          <p className="mt-1 text-xs text-gray-500">
            Your performance reviews and evaluation records
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Review Period</th>
                <th className="px-5 py-4 font-semibold">Score</th>
                <th className="px-5 py-4 font-semibold">Rating</th>
                <th className="px-5 py-4 font-semibold">Review Date</th>
                <th className="px-5 py-4 text-center font-semibold">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    Loading your performance reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    No performance reviews have been recorded yet.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="transition hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {review.reviewPeriod}
                    </td>

                    <td
                      className={`px-5 py-4 font-semibold ${getScoreColor(
                        review.score,
                      )}`}
                    >
                      {review.score}%
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getRatingClasses(
                          review.rating,
                        )}`}
                      >
                        {review.rating}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {formatDate(review.reviewDate)}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => setViewingReview(review)}
                        title="View review details"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-blue-600 transition hover:bg-blue-50"
                      >
                        <Eye size={17} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Details Modal */}
      {viewingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Performance Review Details
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Your evaluation and manager feedback
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewingReview(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Review Period</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {viewingReview.reviewPeriod}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Review Date</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {formatDate(viewingReview.reviewDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {viewingReview.department || "—"}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">
                    Performance Score
                  </p>
                  <p
                    className={`text-2xl font-bold ${getScoreColor(
                      viewingReview.score,
                    )}`}
                  >
                    {viewingReview.score}%
                  </p>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, Number(viewingReview.score)),
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getRatingClasses(
                      viewingReview.rating,
                    )}`}
                  >
                    {viewingReview.rating}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Strengths
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                  {viewingReview.strengths || "No strengths recorded."}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Areas for Improvement
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                  {viewingReview.improvements ||
                    "No improvement areas recorded."}
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setViewingReview(null)}
                className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-gray-400">
        Your performance records are provided for viewing only.
      </p>
    </div>
  );
}

export default MyPerformance;
