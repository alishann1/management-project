import {
  CalendarDays,
  User,
  Target,
  X,
  Plus,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import goals from "../data/goals";
const emptyGoal = {
  title: "",
  description: "",
  employee: "",
  department: "",
  category: "",
  target: "",
  progress: 0,
  deadline: "",
};
function getStatusFromProgress(progress) {
  const value = Number(progress);
  if (value === 0) return "Pending";
  if (value === 100) return "Completed";
  return "In Progress";
}
function Goals() {
  const [goalList, setGoalList] = useState(goals);
  const [viewingGoal, setViewingGoal] = useState(null);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deletingGoal, setDeletingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({ ...emptyGoal });
  const handleAddGoal = (e) => {
    e.preventDefault();
    const progress = Number(newGoal.progress);
    const goalToAdd = {
      id: Date.now(),
      ...newGoal,
      target: Number(newGoal.target),
      progress,
      status: getStatusFromProgress(progress),
    };
    setGoalList((currentGoals) => [...currentGoals, goalToAdd]);
    setNewGoal({ ...emptyGoal });
    setShowAddGoal(false);
  };
  const handleEditGoal = (e) => {
    e.preventDefault();
    const progress = Number(editingGoal.progress);
    const updatedGoal = {
      ...editingGoal,
      target: Number(editingGoal.target),
      progress,
      status: getStatusFromProgress(progress),
    };
    setGoalList((currentGoals) =>
      currentGoals.map((goal) =>
        goal.id === updatedGoal.id ? updatedGoal : goal,
      ),
    );
    if (viewingGoal?.id === updatedGoal.id) {
      setViewingGoal(updatedGoal);
    }
    setEditingGoal(null);
  };
  const handleDeleteGoal = () => {
    setGoalList((currentGoals) =>
      currentGoals.filter((goal) => goal.id !== deletingGoal.id),
    );
    if (viewingGoal?.id === deletingGoal.id) {
      setViewingGoal(null);
    }
    setDeletingGoal(null);
  };
  const updateGoalField = (field, value) => {
    setEditingGoal((currentGoal) => ({ ...currentGoal, [field]: value }));
  };
  const updateNewGoalField = (field, value) => {
    setNewGoal((currentGoal) => ({ ...currentGoal, [field]: value }));
  };
  const renderGoalForm = (goal, updateField, onSubmit, submitLabel) => (
    <form onSubmit={onSubmit} className="mt-6 space-y-5">
      {" "}
      <div>
        {" "}
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {" "}
          Goal Title{" "}
        </label>{" "}
        <input
          type="text"
          required
          value={goal.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Enter goal title"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />{" "}
      </div>{" "}
      <div>
        {" "}
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {" "}
          Description{" "}
        </label>{" "}
        <textarea
          required
          rows="3"
          value={goal.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Describe the goal"
          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />{" "}
      </div>{" "}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {" "}
        <div>
          {" "}
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {" "}
            Employee{" "}
          </label>{" "}
          <input
            type="text"
            required
            value={goal.employee}
            onChange={(e) => updateField("employee", e.target.value)}
            placeholder="Enter employee name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />{" "}
        </div>{" "}
        <div>
          {" "}
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {" "}
            Department{" "}
          </label>{" "}
          <select
            required
            value={goal.department}
            onChange={(e) => updateField("department", e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {" "}
            <option value="">Select department</option>{" "}
            <option value="IT">IT</option>{" "}
            <option value="Human Resources">Human Resources</option>{" "}
            <option value="Finance">Finance</option>{" "}
            <option value="Marketing">Marketing</option>{" "}
            <option value="Operations">Operations</option>{" "}
            <option value="Administration">Administration</option>{" "}
          </select>{" "}
        </div>{" "}
        <div>
          {" "}
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {" "}
            Category{" "}
          </label>{" "}
          <select
            required
            value={goal.category}
            onChange={(e) => updateField("category", e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {" "}
            <option value="">Select category</option>{" "}
            <option value="Performance">Performance</option>{" "}
            <option value="Development">Development</option>{" "}
            <option value="Recruitment">Recruitment</option>{" "}
            <option value="Financial">Financial</option>{" "}
            <option value="Marketing">Marketing</option>{" "}
            <option value="Operations">Operations</option>{" "}
            <option value="Administration">Administration</option>{" "}
          </select>{" "}
        </div>{" "}
        <div>
          {" "}
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {" "}
            Deadline{" "}
          </label>{" "}
          <input
            type="date"
            required
            value={goal.deadline}
            onChange={(e) => updateField("deadline", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />{" "}
        </div>{" "}
        <div>
          {" "}
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {" "}
            Target{" "}
          </label>{" "}
          <input
            type="number"
            required
            min="1"
            value={goal.target}
            onChange={(e) => updateField("target", e.target.value)}
            placeholder="e.g. 100"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />{" "}
        </div>{" "}
        <div>
          {" "}
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {" "}
            Progress (%){" "}
          </label>{" "}
          <input
            type="number"
            required
            min="0"
            max="100"
            value={goal.progress}
            onChange={(e) => updateField("progress", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />{" "}
        </div>{" "}
      </div>{" "}
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
        {" "}
        <button
          type="button"
          onClick={() => {
            if (submitLabel === "Add Goal") {
              setShowAddGoal(false);
            } else {
              setEditingGoal(null);
            }
          }}
          className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          {" "}
          Cancel{" "}
        </button>{" "}
        <button
          type="submit"
          className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          {" "}
          {submitLabel}{" "}
        </button>{" "}
      </div>{" "}
    </form>
  );
  return (
    <div>
      {" "}
      {/* Page Header */}{" "}
      <div className="mb-8 flex items-start justify-between">
        {" "}
        <div>
          {" "}
          <h1 className="text-3xl font-bold text-slate-800">
            {" "}
            Goals Management{" "}
          </h1>{" "}
          <p className="mt-1 text-sm text-slate-500">
            {" "}
            Set, track and monitor organizational goals and employee
            objectives.{" "}
          </p>{" "}
        </div>{" "}
        {/* Add Goal Button */}{" "}
        <button
          type="button"
          onClick={() => {
            setNewGoal({ ...emptyGoal });
            setShowAddGoal(true);
          }}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          {" "}
          <Plus size={18} /> Add Goal{" "}
        </button>{" "}
      </div>{" "}
      {/* Goal Cards */}{" "}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {" "}
        {goalList.map((goal) => (
          <div
            key={goal.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            {" "}
            {/* Goal Title and Description — matches Task card */}{" "}
            <div>
              {" "}
              <h2 className="text-xl font-bold text-slate-800">
                {" "}
                {goal.title}{" "}
              </h2>{" "}
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                {" "}
                {goal.description}{" "}
              </p>{" "}
            </div>{" "}
            {/* Status and Category */}{" "}
            <div className="mt-4 flex items-center gap-2">
              {" "}
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${goal.status === "Completed" ? "bg-green-100 text-green-700" : goal.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}
              >
                {" "}
                {goal.status}{" "}
              </span>{" "}
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {" "}
                {goal.category}{" "}
              </span>{" "}
            </div>{" "}
            {/* Goal Information — matches Task card */}{" "}
            <div className="mt-5 space-y-3">
              {" "}
              <div className="flex items-center gap-3 text-sm text-slate-600">
                {" "}
                <User size={17} className="text-slate-400" />{" "}
                <span>{goal.employee}</span>{" "}
              </div>{" "}
              <div className="flex items-center gap-3 text-sm text-slate-600">
                {" "}
                <Target size={17} className="text-slate-400" />{" "}
                <span>{goal.department}</span>{" "}
              </div>{" "}
              <div className="flex items-center gap-3 text-sm text-slate-600">
                {" "}
                <CalendarDays size={17} className="text-slate-400" />{" "}
                <span>Deadline: {goal.deadline}</span>{" "}
              </div>{" "}
            </div>{" "}
            {/* Progress — matches Task card */}{" "}
            <div className="mt-6">
              {" "}
              <div className="mb-2 flex items-center justify-between">
                {" "}
                <span className="text-sm font-medium text-slate-700">
                  {" "}
                  Progress{" "}
                </span>{" "}
                <span className="text-sm font-semibold text-slate-800">
                  {" "}
                  {goal.progress}%{" "}
                </span>{" "}
              </div>{" "}
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                {" "}
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${goal.progress}%` }}
                ></div>{" "}
              </div>{" "}
            </div>{" "}
            {/* View Goal Button — same structure as Task card */}
            {/* Goal Actions */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setViewingGoal(goal)}
                className="w-full rounded-lg bg-blue-600 px-3 py-2.5 text-center text-sm font-medium text-white transition hover:bg-blue-700 cursor-pointer"
              >
                View
              </button>

              <button
                type="button"
                onClick={() =>
                  setEditingGoal({
                    ...goal,
                    target: String(goal.target),
                    progress: String(goal.progress),
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50 cursor-pointer"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => setDeletingGoal(goal)}
                className="w-full rounded-lg border border-red-200 bg-white px-3 py-2.5 text-center text-sm font-medium text-red-600 transition hover:bg-red-50 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}{" "}
      </div>{" "}
      {/* View Goal Modal */}{" "}
      {viewingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          {" "}
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            {" "}
            <div className="flex items-start justify-between">
              {" "}
              <div>
                {" "}
                <h2 className="text-2xl font-bold text-slate-800">
                  {" "}
                  {viewingGoal.title}{" "}
                </h2>{" "}
                <p className="mt-1 text-sm text-slate-500">Goal Details</p>{" "}
              </div>{" "}
              <button
                type="button"
                onClick={() => setViewingGoal(null)}
                className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                {" "}
                <X size={20} />{" "}
              </button>{" "}
            </div>{" "}
            <div className="mt-6 space-y-5">
              {" "}
              <div>
                {" "}
                <p className="text-sm font-medium text-slate-700">
                  {" "}
                  Description{" "}
                </p>{" "}
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {" "}
                  {viewingGoal.description}{" "}
                </p>{" "}
              </div>{" "}
              <div className="grid grid-cols-2 gap-4">
                {" "}
                {[
                  ["Employee", viewingGoal.employee],
                  ["Department", viewingGoal.department],
                  ["Category", viewingGoal.category],
                  ["Deadline", viewingGoal.deadline],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    {" "}
                    <p className="text-xs font-medium text-slate-400">
                      {" "}
                      {label}{" "}
                    </p>{" "}
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {" "}
                      {value}{" "}
                    </p>{" "}
                  </div>
                ))}{" "}
              </div>{" "}
              <div className="rounded-xl border border-slate-200 p-4">
                {" "}
                <div className="flex items-center justify-between">
                  {" "}
                  <p className="text-sm font-medium text-slate-700">
                    Target
                  </p>{" "}
                  <p className="text-sm font-semibold text-slate-800">
                    {" "}
                    {viewingGoal.target}{" "}
                  </p>{" "}
                </div>{" "}
                <div className="mt-4 flex items-center justify-between">
                  {" "}
                  <p className="text-sm font-medium text-slate-700">
                    {" "}
                    Current Progress{" "}
                  </p>{" "}
                  <p className="text-sm font-semibold text-slate-800">
                    {" "}
                    {viewingGoal.progress}%{" "}
                  </p>{" "}
                </div>{" "}
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  {" "}
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${viewingGoal.progress}%` }}
                  ></div>{" "}
                </div>{" "}
              </div>{" "}
              <div className="flex items-center justify-between">
                {" "}
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {" "}
                  {viewingGoal.status}{" "}
                </span>{" "}
                <button
                  type="button"
                  onClick={() => setViewingGoal(null)}
                  className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  {" "}
                  Close{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* Add Goal Modal */}{" "}
      {showAddGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          {" "}
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            {" "}
            <div className="flex items-start justify-between">
              {" "}
              <div>
                {" "}
                <h2 className="text-2xl font-bold text-slate-800">
                  Add Goal
                </h2>{" "}
                <p className="mt-1 text-sm text-slate-500">
                  {" "}
                  Create a new employee or organizational goal.{" "}
                </p>{" "}
              </div>{" "}
              <button
                type="button"
                onClick={() => setShowAddGoal(false)}
                className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                {" "}
                <X size={20} />{" "}
              </button>{" "}
            </div>{" "}
            {renderGoalForm(
              newGoal,
              updateNewGoalField,
              handleAddGoal,
              "Add Goal",
            )}{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* Edit Goal Modal */}{" "}
      {editingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          {" "}
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            {" "}
            <div className="flex items-start justify-between">
              {" "}
              <div>
                {" "}
                <h2 className="text-2xl font-bold text-slate-800">
                  Edit Goal
                </h2>{" "}
                <p className="mt-1 text-sm text-slate-500">
                  {" "}
                  Update the goal details and progress.{" "}
                </p>{" "}
              </div>{" "}
              <button
                type="button"
                onClick={() => setEditingGoal(null)}
                className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                {" "}
                <X size={20} />{" "}
              </button>{" "}
            </div>{" "}
            {renderGoalForm(
              editingGoal,
              updateGoalField,
              handleEditGoal,
              "Save Changes",
            )}{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* Delete Goal Confirmation Modal */}{" "}
      {deletingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          {" "}
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {" "}
            <div className="flex items-start gap-4">
              {" "}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
                {" "}
                <AlertTriangle size={24} className="text-red-600" />{" "}
              </div>{" "}
              <div>
                {" "}
                <h2 className="text-xl font-bold text-slate-800">
                  {" "}
                  Delete Goal{" "}
                </h2>{" "}
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {" "}
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-slate-700">
                    {" "}
                    {deletingGoal.title}{" "}
                  </span>{" "}
                  ? This action cannot be undone.{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            <div className="mt-6 flex justify-end gap-3">
              {" "}
              <button
                type="button"
                onClick={() => setDeletingGoal(null)}
                className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {" "}
                Cancel{" "}
              </button>{" "}
              <button
                type="button"
                onClick={handleDeleteGoal}
                className="cursor-pointer rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
              >
                {" "}
                Delete Goal{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
}
export default Goals;
