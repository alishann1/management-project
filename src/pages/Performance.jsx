import { useMemo, useState } from "react";
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
import employees from "../data/employees";

const initialReviews = [
  {
    id: 1,
    employee: "Ali Khan",
    department: "IT",
    reviewPeriod: "Q3 2026",
    score: 92,
    rating: "Excellent",
    strengths: "Strong technical skills, problem-solving, and teamwork.",
    improvements: "Continue developing leadership and mentoring skills.",
    reviewDate: "2026-09-30",
  },
  {
    id: 2,
    employee: "Sara Ahmed",
    department: "Human Resources",
    reviewPeriod: "Q3 2026",
    score: 88,
    rating: "Very Good",
    strengths: "Effective communication, recruitment, and employee relations.",
    improvements: "Improve reporting efficiency and data analysis.",
    reviewDate: "2026-09-28",
  },
  {
    id: 3,
    employee: "Ahmed Shah",
    department: "Finance",
    reviewPeriod: "Q3 2026",
    score: 84,
    rating: "Very Good",
    strengths:
      "Accurate financial reporting and responsible budget management.",
    improvements: "Develop more advanced financial forecasting skills.",
    reviewDate: "2026-09-25",
  },
  {
    id: 4,
    employee: "Fatima Ali",
    department: "Marketing",
    reviewPeriod: "Q3 2026",
    score: 79,
    rating: "Good",
    strengths: "Creative campaign ideas and effective communication.",
    improvements: "Improve campaign analytics and deadline management.",
    reviewDate: "2026-09-22",
  },
  {
    id: 5,
    employee: "Usman Khan",
    department: "IT",
    reviewPeriod: "Q3 2026",
    score: 74,
    rating: "Good",
    strengths: "Good design sense and collaboration with the development team.",
    improvements: "Improve task estimation and consistency in delivery.",
    reviewDate: "2026-09-20",
  },
  {
    id: 6,
    employee: "Ayesha Malik",
    department: "Operations",
    reviewPeriod: "Q3 2026",
    score: 86,
    rating: "Very Good",
    strengths: "Organized operations, process coordination, and reliability.",
    improvements: "Document process improvements more consistently.",
    reviewDate: "2026-09-18",
  },
  {
    id: 7,
    employee: "Hassan Ali",
    department: "IT",
    reviewPeriod: "Q3 2026",
    score: 68,
    rating: "Needs Improvement",
    strengths: "Shows willingness to learn and support the team.",
    improvements: "Focus on meeting deadlines and improving code quality.",
    reviewDate: "2026-09-15",
  },
  {
    id: 8,
    employee: "Maryam Shah",
    department: "Human Resources",
    reviewPeriod: "Q3 2026",
    score: 81,
    rating: "Good",
    strengths: "Careful documentation and dependable administrative support.",
    improvements: "Develop confidence in handling complex HR tasks.",
    reviewDate: "2026-09-12",
  },
];

const emptyForm = {
  employee: "",
  reviewPeriod: "Q3 2026",
  score: "75",
  strengths: "",
  improvements: "",
  reviewDate: "2026-10-10",
};

function getRating(score) {
  const value = Number(score);

  if (value >= 90) return "Excellent";
  if (value >= 80) return "Very Good";
  if (value >= 70) return "Good";
  if (value >= 60) return "Satisfactory";
  return "Needs Improvement";
}

function getRatingClasses(rating) {
  if (rating === "Excellent") {
    return "bg-green-50 text-green-700";
  }

  if (rating === "Very Good") {
    return "bg-blue-50 text-blue-700";
  }

  if (rating === "Good") {
    return "bg-indigo-50 text-indigo-700";
  }

  if (rating === "Satisfactory") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-red-50 text-red-700";
}

function getScoreColor(score) {
  if (score >= 90) return "bg-green-500";
  if (score >= 80) return "bg-blue-500";
  if (score >= 70) return "bg-indigo-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Performance() {
  const [reviews, setReviews] = useState(initialReviews);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedRating, setSelectedRating] = useState("All");
  const [selectedPeriod, setSelectedPeriod] = useState("All");

  const [viewingReview, setViewingReview] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [deletingReview, setDeletingReview] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const departments = useMemo(
    () => [...new Set(employees.map((employee) => employee.department))].sort(),
    [],
  );

  const periods = useMemo(
    () => [...new Set(reviews.map((review) => review.reviewPeriod))].sort(),
    [reviews],
  );

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesSearch = review.employee
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesDepartment =
        selectedDepartment === "All" ||
        review.department === selectedDepartment;

      const matchesRating =
        selectedRating === "All" || review.rating === selectedRating;

      const matchesPeriod =
        selectedPeriod === "All" || review.reviewPeriod === selectedPeriod;

      return (
        matchesSearch && matchesDepartment && matchesRating && matchesPeriod
      );
    });
  }, [reviews, searchTerm, selectedDepartment, selectedRating, selectedPeriod]);

  const averageScore =
    filteredReviews.length > 0
      ? Math.round(
          filteredReviews.reduce((total, review) => total + review.score, 0) /
            filteredReviews.length,
        )
      : 0;

  const excellentCount = filteredReviews.filter(
    (review) => review.rating === "Excellent",
  ).length;

  const improvementCount = filteredReviews.filter(
    (review) => review.score < 70,
  ).length;

  const openAddModal = () => {
    setFormData(emptyForm);
    setFormError("");
    setIsAdding(true);
    setEditingReview(null);
  };

  const openEditModal = (review) => {
    setFormData({
      employee: review.employee,
      reviewPeriod: review.reviewPeriod,
      score: String(review.score),
      strengths: review.strengths,
      improvements: review.improvements,
      reviewDate: review.reviewDate,
    });

    setFormError("");
    setEditingReview(review);
    setIsAdding(false);
    setViewingReview(null);
  };

  const closeFormModal = () => {
    setIsAdding(false);
    setEditingReview(null);
    setFormData(emptyForm);
    setFormError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError("");

    const score = Number(formData.score);

    if (
      !formData.employee ||
      !formData.reviewPeriod.trim() ||
      !formData.reviewDate ||
      !formData.strengths.trim() ||
      !formData.improvements.trim() ||
      formData.score === ""
    ) {
      setFormError("Please complete all fields.");
      return;
    }

    if (!Number.isFinite(score) || score < 0 || score > 100) {
      setFormError("Score must be a number between 0 and 100.");
      return;
    }

    const selectedEmployee = employees.find(
      (employee) => employee.name === formData.employee,
    );

    if (!selectedEmployee) {
      setFormError("Please select a valid employee.");
      return;
    }

    const reviewData = {
      employee: selectedEmployee.name,
      department: selectedEmployee.department,
      reviewPeriod: formData.reviewPeriod.trim(),
      score,
      rating: getRating(score),
      strengths: formData.strengths.trim(),
      improvements: formData.improvements.trim(),
      reviewDate: formData.reviewDate,
    };

    if (isAdding) {
      setReviews((current) => [{ id: Date.now(), ...reviewData }, ...current]);
    } else if (editingReview) {
      setReviews((current) =>
        current.map((review) =>
          review.id === editingReview.id
            ? { ...review, ...reviewData }
            : review,
        ),
      );
    }

    closeFormModal();
  };

  const handleDelete = () => {
    if (!deletingReview) return;

    setReviews((current) =>
      current.filter((review) => review.id !== deletingReview.id),
    );

    if (viewingReview?.id === deletingReview.id) {
      setViewingReview(null);
    }

    setDeletingReview(null);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedDepartment("All");
    setSelectedRating("All");
    setSelectedPeriod("All");
  };

  const summaryCards = [
    {
      title: "Average Score",
      value: `${averageScore}%`,
      description: "Average of filtered reviews",
      icon: TrendingUp,
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Reviews",
      value: filteredReviews.length,
      description: "Employee performance reviews",
      icon: ClipboardCheck,
      iconStyle: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Excellent Ratings",
      value: excellentCount,
      description: "Scores of 90 or above",
      icon: Award,
      iconStyle: "bg-green-50 text-green-600",
    },
    {
      title: "Needs Attention",
      value: improvementCount,
      description: "Scores below 70",
      icon: Target,
      iconStyle: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Performance Management
          </h1>
          <p className="mt-2 text-slate-500">
            Review employee performance, track scores, and identify development
            opportunities.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex cursor-pointer items-center justify-center gap-2 self-start rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Performance Review
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {card.value}
                  </h2>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconStyle}`}
                >
                  <Icon size={24} />
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-500">{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* Performance Records */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Employee Performance
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review scores, ratings, and employee development records.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users size={18} />
              {filteredReviews.length}{" "}
              {filteredReviews.length === 1 ? "review" : "reviews"}
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search employee..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={selectedDepartment}
              onChange={(event) => setSelectedDepartment(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>

            <select
              value={selectedRating}
              onChange={(event) => setSelectedRating(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Ratings</option>
              <option value="Excellent">Excellent</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
              <option value="Satisfactory">Satisfactory</option>
              <option value="Needs Improvement">Needs Improvement</option>
            </select>

            <select
              value={selectedPeriod}
              onChange={(event) => setSelectedPeriod(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Review Periods</option>
              {periods.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={resetFilters}
              className="cursor-pointer text-sm font-medium text-blue-600 transition hover:text-blue-800"
            >
              Reset filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Employee
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Review Period
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Performance Score
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Rating
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Review Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredReviews.map((review) => (
                <tr key={review.id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">
                      {review.employee}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {review.department}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {review.reviewPeriod}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all ${getScoreColor(review.score)}`}
                          style={{ width: `${review.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {review.score}%
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRatingClasses(review.rating)}`}
                    >
                      {review.rating}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatDate(review.reviewDate)}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title="View review"
                        aria-label={`View performance review for ${review.employee}`}
                        onClick={() => setViewingReview(review)}
                        className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        title="Edit review"
                        aria-label={`Edit performance review for ${review.employee}`}
                        onClick={() => openEditModal(review)}
                        className="cursor-pointer rounded-lg border border-slate-200 p-2 text-blue-600 transition hover:bg-blue-50"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        title="Delete review"
                        aria-label={`Delete performance review for ${review.employee}`}
                        onClick={() => setDeletingReview(review)}
                        className="cursor-pointer rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredReviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                      <ClipboardCheck size={26} className="text-slate-400" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-slate-800">
                      No performance reviews found
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Try adjusting your search or filters.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-4 cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <p className="text-sm text-slate-500">
            Showing {filteredReviews.length} of {reviews.length} performance
            reviews.
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Demonstration data only. Changes are held in local page state and reset
        when the page is refreshed.
      </p>

      {/* Add / Edit Modal */}
      {(isAdding || editingReview) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {isAdding
                    ? "Add Performance Review"
                    : "Edit Performance Review"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the employee's review information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                aria-label="Close form"
                className="cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label
                  htmlFor="performanceEmployee"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Employee
                </label>
                <select
                  id="performanceEmployee"
                  value={formData.employee}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      employee: event.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.name}>
                      {employee.name} — {employee.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="reviewPeriod"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Review Period
                  </label>
                  <input
                    id="reviewPeriod"
                    type="text"
                    value={formData.reviewPeriod}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        reviewPeriod: event.target.value,
                      }))
                    }
                    placeholder="e.g. Q3 2026"
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="reviewDate"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Review Date
                  </label>
                  <input
                    id="reviewDate"
                    type="date"
                    value={formData.reviewDate}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        reviewDate: event.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="performanceScore"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Performance Score (0–100)
                </label>
                <input
                  id="performanceScore"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.score}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      score: event.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                {formData.score !== "" &&
                  Number(formData.score) >= 0 &&
                  Number(formData.score) <= 100 && (
                    <p className="mt-2 text-sm text-slate-500">
                      Rating:{" "}
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${getRatingClasses(getRating(formData.score))}`}
                      >
                        {getRating(formData.score)}
                      </span>
                    </p>
                  )}
              </div>

              <div>
                <label
                  htmlFor="performanceStrengths"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Strengths
                </label>
                <textarea
                  id="performanceStrengths"
                  rows={3}
                  value={formData.strengths}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      strengths: event.target.value,
                    }))
                  }
                  placeholder="Describe the employee's strengths..."
                  required
                  className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="performanceImprovements"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Areas for Improvement
                </label>
                <textarea
                  id="performanceImprovements"
                  rows={3}
                  value={formData.improvements}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      improvements: event.target.value,
                    }))
                  }
                  placeholder="Describe areas for development..."
                  required
                  className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {formError && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {isAdding ? "Add Review" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Review Modal */}
      {viewingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Performance Review Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Employee evaluation and development feedback.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingReview(null)}
                aria-label="Close details"
                className="cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {viewingReview.employee}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {viewingReview.department}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getRatingClasses(viewingReview.rating)}`}
                >
                  {viewingReview.rating}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Performance Score
                  </span>
                  <span className="text-2xl font-bold text-slate-800">
                    {viewingReview.score}%
                  </span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full ${getScoreColor(viewingReview.score)}`}
                    style={{ width: `${viewingReview.score}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Review Period
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {viewingReview.reviewPeriod}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Review Date
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatDate(viewingReview.reviewDate)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Strengths
                </p>
                <p className="mt-2 rounded-lg bg-green-50 p-4 text-sm leading-6 text-slate-600">
                  {viewingReview.strengths}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Areas for Improvement
                </p>
                <p className="mt-2 rounded-lg bg-amber-50 p-4 text-sm leading-6 text-slate-600">
                  {viewingReview.improvements}
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => openEditModal(viewingReview)}
                  className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Edit Review
                </button>
                <button
                  type="button"
                  onClick={() => setViewingReview(null)}
                  className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingReview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={24} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-800">
              Delete Performance Review?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete the performance review for{" "}
              <span className="font-semibold text-slate-700">
                {deletingReview.employee}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingReview(null)}
                className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="cursor-pointer rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Performance;
