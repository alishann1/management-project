import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Target,
  Building2,
  LoaderCircle,
  Save,
  CheckCircle2,
  Flag,
} from "lucide-react";

import { getMyGoals, updateMyGoalProgress } from "../services/api";

function MyGoals() {
  const [goalList, setGoalList] = useState([]);
  const [progressValues, setProgressValues] = useState({});
  const [savingGoals, setSavingGoals] = useState({});
  const [successMessages, setSuccessMessages] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Keep track of success-message timers.
  const successTimers = useRef({});

  useEffect(() => {
    const loadGoals = async () => {
      try {
        setLoading(true);
        setError("");

        const goals = await getMyGoals();
        setGoalList(goals);

        const initialProgress = {};

        goals.forEach((goal) => {
          initialProgress[goal.id] = goal.progress ?? 0;
        });

        setProgressValues(initialProgress);
      } catch (err) {
        setError(err.message || "Failed to load your goals.");
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, []);

  // Clear remaining timers when leaving the page.
  useEffect(() => {
    const timers = successTimers.current;

    return () => {
      Object.values(timers).forEach((timer) => {
        clearTimeout(timer);
      });
    };
  }, []);

  const getStatusStyle = (status) => {
    if (status === "Completed") {
      return "bg-green-50 text-green-700 ring-1 ring-green-200";
    }

    if (status === "In Progress") {
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
    }

    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  };

  const getCategoryStyle = (category) => {
    const styles = {
      Performance: "bg-blue-50 text-blue-700",
      Development: "bg-purple-50 text-purple-700",
      Recruitment: "bg-orange-50 text-orange-700",
      Financial: "bg-green-50 text-green-700",
      Marketing: "bg-pink-50 text-pink-700",
      Operations: "bg-indigo-50 text-indigo-700",
      Administration: "bg-slate-100 text-slate-600",
    };

    return styles[category] || "bg-slate-100 text-slate-600";
  };

  const handleProgressChange = (goalId, value) => {
    setProgressValues((previous) => ({
      ...previous,
      [goalId]: Number(value),
    }));

    setSuccessMessages((previous) => ({
      ...previous,
      [goalId]: "",
    }));

    if (successTimers.current[goalId]) {
      clearTimeout(successTimers.current[goalId]);
      delete successTimers.current[goalId];
    }
  };

  const handleSaveProgress = async (goalId) => {
    try {
      setSavingGoals((previous) => ({
        ...previous,
        [goalId]: true,
      }));

      setError("");

      const updatedGoal = await updateMyGoalProgress(
        goalId,
        progressValues[goalId],
      );

      setGoalList((previous) =>
        previous.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                progress: updatedGoal.progress,
                status: updatedGoal.status,
              }
            : goal,
        ),
      );

      setSuccessMessages((previous) => ({
        ...previous,
        [goalId]: "Progress saved successfully.",
      }));

      if (successTimers.current[goalId]) {
        clearTimeout(successTimers.current[goalId]);
      }

      // Remove the success message after 3 seconds.
      successTimers.current[goalId] = setTimeout(() => {
        setSuccessMessages((previous) => ({
          ...previous,
          [goalId]: "",
        }));

        delete successTimers.current[goalId];
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to update goal progress.");
    } finally {
      setSavingGoals((previous) => ({
        ...previous,
        [goalId]: false,
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Goals</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track your assigned goals and keep your progress updated.
        </p>
      </div>

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center">
          <LoaderCircle
            className="mx-auto mb-3 animate-spin text-blue-600"
            size={28}
          />
          <p className="text-sm text-slate-500">Loading your goals...</p>
        </div>
      )}

      {!loading && !error && goalList.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <Target className="mx-auto mb-3 text-slate-400" size={36} />
          <h2 className="font-semibold text-slate-700">
            No goals assigned yet
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your assigned goals will appear here.
          </p>
        </div>
      )}

      {!loading && !error && goalList.length > 0 && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {goalList.map((goal) => {
            const currentProgress = progressValues[goal.id] ?? 0;
            const isSaving = savingGoals[goal.id];
            const isCompleted = goal.status === "Completed";
            const hasChanges = currentProgress !== goal.progress;

            return (
              <div
                key={goal.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-slate-800">
                      {goal.title}
                    </h2>

                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getCategoryStyle(
                        goal.category,
                      )}`}
                    >
                      {goal.category}
                    </span>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                      goal.status,
                    )}`}
                  >
                    {goal.status}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-500">
                  {goal.description}
                </p>

                <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Building2 size={16} className="shrink-0 text-slate-400" />
                    <span className="truncate">{goal.department}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Flag size={16} className="shrink-0 text-slate-400" />
                    <span>Target: {goal.target}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
                    <CalendarDays
                      size={16}
                      className="shrink-0 text-slate-400"
                    />
                    <span>Deadline: {goal.deadline || "No deadline"}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-3 flex items-end justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Goal progress
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {isCompleted
                          ? "This goal has been completed."
                          : "Drag the slider to update your progress."}
                      </p>
                    </div>

                    <span className="text-2xl font-bold tabular-nums text-blue-600">
                      {currentProgress}%
                    </span>
                  </div>

                  <div className="relative flex h-7 items-center">
                    <div className="absolute h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-150"
                        style={{ width: `${currentProgress}%` }}
                      />
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={currentProgress}
                      disabled={isSaving || isCompleted}
                      onChange={(event) =>
                        handleProgressChange(goal.id, event.target.value)
                      }
                      aria-label={`Progress for ${goal.title}`}
                      className="absolute h-7 w-full cursor-pointer appearance-none bg-transparent accent-blue-600 disabled:cursor-not-allowed disabled:opacity-100 [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:opacity-100 [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-track]:h-2 [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:opacity-100 [&::-moz-range-thumb]:shadow-md"
                    />
                  </div>

                  <div className="mt-1 flex justify-between text-xs text-slate-400">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>

                  {!isCompleted && (
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => handleSaveProgress(goal.id)}
                        disabled={isSaving || !hasChanges}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
                      >
                        {isSaving ? (
                          <>
                            <LoaderCircle size={17} className="animate-spin" />
                            Saving changes...
                          </>
                        ) : (
                          <>
                            <Save size={17} />
                            {hasChanges
                              ? "Save Progress"
                              : "Progress Up to Date"}
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {successMessages[goal.id] && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-700">
                      <CheckCircle2 size={16} />
                      {successMessages[goal.id]}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyGoals;
