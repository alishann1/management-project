import { useEffect, useMemo, useState } from "react";
import {
  Users,
  TrendingUp,
  Award,
  ClipboardCheck,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  CalendarDays,
  Target,
} from "lucide-react";

import {
  getEmployees,
  getPerformanceReviews,
  createPerformanceReview,
  updatePerformanceReview,
  deletePerformanceReview,
} from "../services/api";

// Get today's date in YYYY-MM-DD format using local time.
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Empty form defaults.
const getEmptyForm = () => ({
  employeeId: "",
  reviewPeriod: "",
  score: "",
  strengths: "",
  improvements: "",
  reviewDate: getTodayDate(),
});

// Calculate rating from score.
const getRating = (score) => {
  const value = Number(score);

  if (value >= 90) return "Excellent";
  if (value >= 80) return "Very Good";
  if (value >= 70) return "Good";
  if (value >= 60) return "Satisfactory";

  return "Needs Improvement";
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

function Performance() {
  // Database data.
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Loading and API errors.
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters.
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [periodFilter, setPeriodFilter] = useState("All");

  // Modal states.
  const [isAdding, setIsAdding] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [viewingReview, setViewingReview] = useState(null);
  const [deletingReview, setDeletingReview] = useState(null);

  // Form state.
  const [formData, setFormData] = useState(getEmptyForm);
  const [formError, setFormError] = useState("");

  // Load employees and performance reviews from MongoDB.
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setPageError("");

        const [employeeData, reviewData] = await Promise.all([
          getEmployees(),
          getPerformanceReviews(),
        ]);

        if (isMounted) {
          setEmployees(employeeData);
          setReviews(reviewData);
        }
      } catch (error) {
        if (isMounted) {
          setPageError(error.message || "Failed to load performance data.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Get departments from database employees.
  const departments = useMemo(() => {
    return [
      ...new Set(
        employees.map((employee) => employee.department).filter(Boolean),
      ),
    ].sort();
  }, [employees]);

  // Get review periods from database reviews.
  const reviewPeriods = useMemo(() => {
    return [
      ...new Set(reviews.map((review) => review.reviewPeriod).filter(Boolean)),
    ].sort();
  }, [reviews]);

  // Filter reviews.
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const employeeName = review.employee || "";

      const matchesSearch = employeeName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesDepartment =
        departmentFilter === "All" || review.department === departmentFilter;

      const matchesRating =
        ratingFilter === "All" || review.rating === ratingFilter;

      const matchesPeriod =
        periodFilter === "All" || review.reviewPeriod === periodFilter;

      return (
        matchesSearch && matchesDepartment && matchesRating && matchesPeriod
      );
    });
  }, [reviews, searchTerm, departmentFilter, ratingFilter, periodFilter]);

  // Summary statistics.
  const averageScore = useMemo(() => {
    if (reviews.length === 0) return 0;

    const total = reviews.reduce(
      (sum, review) => sum + Number(review.score || 0),
      0,
    );

    return Math.round(total / reviews.length);
  }, [reviews]);

  const excellentRatings = reviews.filter(
    (review) => review.rating === "Excellent",
  ).length;

  const needsAttention = reviews.filter(
    (review) =>
      review.rating === "Needs Improvement" || Number(review.score) < 60,
  ).length;

  // Reset form and open Add Review modal.
  const handleAddReview = () => {
    setFormData(getEmptyForm());
    setFormError("");
    setEditingReview(null);
    setIsAdding(true);
  };

  // Open Edit Review modal.
  const handleEditReview = (review) => {
    setFormData({
      employeeId: review.employeeId || "",
      reviewPeriod: review.reviewPeriod || "",
      score:
        review.score === null || review.score === undefined
          ? ""
          : String(review.score),
      strengths: review.strengths || "",
      improvements: review.improvements || "",
      reviewDate: review.reviewDate
        ? review.reviewDate.slice(0, 10)
        : getTodayDate(),
    });

    setFormError("");
    setEditingReview(review);
    setIsAdding(false);
  };

  // Validate form fields.
  const validateForm = () => {
    if (!formData.employeeId) {
      return "Please select an employee.";
    }

    if (
      formData.score === "" ||
      formData.score === null ||
      formData.score === undefined
    ) {
      return "Please enter a performance score.";
    }

    const score = Number(formData.score);

    if (!Number.isFinite(score) || score < 0 || score > 100) {
      return "Performance score must be between 0 and 100.";
    }

    if (!formData.reviewPeriod.trim()) {
      return "Please enter a review period.";
    }

    if (!formData.strengths.trim()) {
      return "Please enter employee strengths.";
    }

    if (!formData.improvements.trim()) {
      return "Please enter areas for improvement.";
    }

    if (!formData.reviewDate) {
      return "Please select a review date.";
    }

    return "";
  };

  // Save a new or updated performance review.
  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const reviewData = {
      employeeId: formData.employeeId,
      reviewPeriod: formData.reviewPeriod.trim(),
      score: Number(formData.score),
      strengths: formData.strengths.trim(),
      improvements: formData.improvements.trim(),
      reviewDate: formData.reviewDate,
    };

    try {
      setIsSaving(true);
      setFormError("");

      if (editingReview) {
        const updatedReview = await updatePerformanceReview(
          editingReview.id,
          reviewData,
        );

        setReviews((previousReviews) =>
          previousReviews.map((review) =>
            review.id === editingReview.id ? updatedReview : review,
          ),
        );
      } else {
        const newReview = await createPerformanceReview(reviewData);

        setReviews((previousReviews) => [newReview, ...previousReviews]);
      }

      setIsAdding(false);
      setEditingReview(null);
      setFormData(getEmptyForm());
    } catch (error) {
      setFormError(error.message || "Unable to save the performance review.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a performance review.
  const handleDeleteReview = async () => {
    if (!deletingReview) return;

    try {
      setIsDeleting(true);
      setPageError("");

      await deletePerformanceReview(deletingReview.id);

      setReviews((previousReviews) =>
        previousReviews.filter((review) => review.id !== deletingReview.id),
      );

      setDeletingReview(null);
    } catch (error) {
      setPageError(error.message || "Unable to delete the performance review.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Close add/edit modal.
  const closeFormModal = () => {
    if (isSaving) return;

    setIsAdding(false);
    setEditingReview(null);
    setFormData(getEmptyForm());
    setFormError("");
  };

  // Shared form modal.
  const showFormModal = isAdding || Boolean(editingReview);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Performance Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review, evaluate, and monitor employee performance.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddReview}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={18} />
          Add Performance Review
        </button>
      </div>

      {/* Page Error */}
      {pageError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle size={19} className="mt-0.5 shrink-0" />
          <span>{pageError}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            Average across all reviews
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
            Recorded performance reviews
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Excellent Ratings</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-800">
                {isLoading ? "—" : excellentRatings}
              </h2>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-green-600">
              <Award size={23} />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Reviews scoring 90 or above
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Needs Attention</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-800">
                {isLoading ? "—" : needsAttention}
              </h2>
            </div>
            <div className="rounded-lg bg-red-50 p-3 text-red-600">
              <Target size={23} />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">Reviews scoring below 60</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Search size={18} className="text-gray-500" />
          <h2 className="font-semibold text-gray-800">
            Search and Filter Reviews
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search employee..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <select
            value={ratingFilter}
            onChange={(event) => setRatingFilter(event.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Ratings</option>
            <option value="Excellent">Excellent</option>
            <option value="Very Good">Very Good</option>
            <option value="Good">Good</option>
            <option value="Satisfactory">Satisfactory</option>
            <option value="Needs Improvement">Needs Improvement</option>
          </select>

          <select
            value={periodFilter}
            onChange={(event) => setPeriodFilter(event.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Review Periods</option>
            {reviewPeriods.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Performance Reviews Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">
              Employee Performance Reviews
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {filteredReviews.length} review(s) found
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Employee</th>
                <th className="px-5 py-4 font-semibold">Department</th>
                <th className="px-5 py-4 font-semibold">Review Period</th>
                <th className="px-5 py-4 font-semibold">Score</th>
                <th className="px-5 py-4 font-semibold">Rating</th>
                <th className="px-5 py-4 font-semibold">Review Date</th>
                <th className="px-5 py-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    Loading performance reviews...
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    No performance reviews found.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review.id} className="transition hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {review.employee}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {review.department || "—"}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
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

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingReview(review)}
                          title="View review"
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditReview(review)}
                          title="Edit review"
                          className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingReview(review)}
                          title="Delete review"
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Review Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {editingReview
                    ? "Edit Performance Review"
                    : "Add Performance Review"}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Enter the employee's review information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                disabled={isSaving}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
                {formError && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Employee and Review Period */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Employee <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={formData.employeeId}
                      onChange={(event) =>
                        setFormData((previous) => ({
                          ...previous,
                          employeeId: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select Employee</option>

                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Review Period <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={formData.reviewPeriod}
                      onChange={(event) =>
                        setFormData((previous) => ({
                          ...previous,
                          reviewPeriod: event.target.value,
                        }))
                      }
                      placeholder="e.g. Q4 2026"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Score and Review Date */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Performance Score (0–100){" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formData.score}
                      onChange={(event) =>
                        setFormData((previous) => ({
                          ...previous,
                          score: event.target.value,
                        }))
                      }
                      placeholder="Enter score"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    {formData.score !== "" &&
                      Number.isFinite(Number(formData.score)) &&
                      Number(formData.score) >= 0 &&
                      Number(formData.score) <= 100 && (
                        <p className="mt-2 text-xs text-gray-500">
                          Rating:{" "}
                          <span className="font-medium text-blue-600">
                            {getRating(formData.score)}
                          </span>
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Review Date <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={17}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="date"
                        value={formData.reviewDate}
                        onChange={(event) =>
                          setFormData((previous) => ({
                            ...previous,
                            reviewDate: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Strengths */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Strengths <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    rows="3"
                    value={formData.strengths}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        strengths: event.target.value,
                      }))
                    }
                    placeholder="Describe the employee's strengths and achievements..."
                    className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Improvements */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Areas for Improvement{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    rows="3"
                    value={formData.improvements}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        improvements: event.target.value,
                      }))
                    }
                    placeholder="Describe areas where the employee can improve..."
                    className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={isSaving}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving
                    ? "Saving..."
                    : editingReview
                      ? "Update Review"
                      : "Save Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Review Modal */}
      {viewingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Performance Review Details
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Employee evaluation information
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
                  <p className="text-xs text-gray-500">Employee</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {viewingReview.employee}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {viewingReview.department || "—"}
                  </p>
                </div>

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
                  {viewingReview.strengths}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Areas for Improvement
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                  {viewingReview.improvements}
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

      {/* Delete Confirmation Modal */}
      {deletingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-50 p-3 text-red-600">
                <AlertTriangle size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-gray-800">
                  Delete Performance Review
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-gray-600">
              Are you sure you want to delete the performance review for{" "}
              <span className="font-semibold text-gray-800">
                {deletingReview.employee}
              </span>
              ?
            </p>

            {pageError && (
              <p className="mt-3 text-sm text-red-600">{pageError}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingReview(null)}
                disabled={isDeleting}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteReview}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Performance;
