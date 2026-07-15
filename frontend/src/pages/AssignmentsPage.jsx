import { useState } from "react";
import { Plus, Clock, CheckSquare, TrendingUp, Filter, BookOpen, Edit, Trash2 } from "lucide-react";

export default function AssignmentsPage({
  assignments,
  courses,
  upcomingAssignments,
  overdueAssignments,
  completedAssignments,
  completionRate,
  handleAddAssignment,
  onEditAssignment,
  onDeleteAssignment,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");

  const filteredAssignments = assignments.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (priorityFilter !== "all" && a.priority !== priorityFilter) return false;
    if (courseFilter !== "all" && a.courseId !== courseFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">Assignments & Deadlines</h2>
          <p className="text-gray-600">Track your tasks and stay on top of deadlines</p>
        </div>
        <button
          onClick={handleAddAssignment}
          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <Clock className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-sm font-medium opacity-90 mb-1">Upcoming</div>
          <div className="text-3xl font-bold">{upcomingAssignments}</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <Clock className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-sm font-medium opacity-90 mb-1">Overdue</div>
          <div className="text-3xl font-bold">{overdueAssignments}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <CheckSquare className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-sm font-medium opacity-90 mb-1">Completed</div>
          <div className="text-3xl font-bold">{completedAssignments}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-sm font-medium opacity-90 mb-1">Completion Rate</div>
          <div className="text-3xl font-bold">{completionRate}%</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-2 mb-6">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value="all">All Courses</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.course_code}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-blue-500" />
          Assignments ({filteredAssignments.length})
        </h3>
        {filteredAssignments.length === 0 ? (
          <p className="text-gray-500">No assignments match the selected filters.</p>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((a) => {
              const course = courses.find((c) => c._id === a.courseId);
              const isOverdue = a.status === "overdue";
              const statusBadge = {
                not_started: { label: "Not started", className: "bg-gray-100 text-gray-800" },
                in_progress: { label: "In progress", className: "bg-blue-100 text-blue-700" },
                completed: { label: "Completed", className: "bg-green-100 text-green-700" },
                overdue: { label: "Overdue", className: "bg-red-100 text-red-700" },
              }[a.status];
              const priorityStyles =
                {
                  high: "bg-red-100 text-red-700 border-red-200",
                  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
                  low: "bg-green-100 text-green-700 border-green-200",
                }[a.priority] ?? "bg-gray-100 text-gray-700 border-gray-200";
              const cardBorder =
                {
                  high: "border-red-200 bg-red-50",
                  medium: "border-yellow-200 bg-yellow-50",
                  low: "border-green-200 bg-green-50",
                }[a.priority] ?? "border-gray-200";
              return (
                <div
                  key={a.id}
                  className={`border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
                    isOverdue ? "border-red-200 bg-red-50" : cardBorder
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{a.title}</p>
                    <p className="text-sm text-gray-500 mb-2">{a.description || "No description provided."}</p>
                    <div className="flex flex-wrap gap-2 text-xs font-medium items-center">
                      <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">{course?.course_code}</span>
                      <span className="px-2 py-1 rounded bg-purple-100 text-purple-700">{a.type}</span>
                      <span className={`px-2 py-1 rounded border ${priorityStyles}`}>{a.priority} priority</span>
                      {statusBadge && <span className={`px-2 py-1 rounded ${statusBadge.className}`}>{statusBadge.label}</span>}
                      <span className="px-2 py-1 rounded bg-blue-50 text-blue-600">Due {a.dueDate}</span>
                      <span className="px-2 py-1 rounded bg-gray-50 text-gray-600">{a.weight}% of grade</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onEditAssignment(a)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-blue-500" />
                    </button>
                    <button onClick={() => onDeleteAssignment(a.id)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
