import { X } from "lucide-react";

export default function AssignmentModal({ courses, assignmentForm, editingAssignmentId, onInputChange, onSubmit, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {editingAssignmentId ? "Edit Assignment" : "New Assignment"}
            </h3>
            <p className="text-sm text-gray-500">Track a task, exam, or project with a due date.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        {courses.length === 0 ? (
          <p className="text-sm text-gray-600">Add a course first before creating assignments.</p>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  name="courseId"
                  value={assignmentForm.courseId}
                  onChange={onInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.course_code} — {course.course_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={assignmentForm.dueDate}
                  onChange={onInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                name="title"
                value={assignmentForm.title}
                onChange={onInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Midterm project"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={assignmentForm.description}
                onChange={onInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                rows="3"
                placeholder="Optional details, requirements, etc."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  name="priority"
                  value={assignmentForm.priority}
                  onChange={onInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={assignmentForm.status}
                  onChange={onInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="not_started">Not started</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={assignmentForm.type}
                  onChange={onInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
                  <option value="exam">Exam</option>
                  <option value="lab">Lab</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (%)</label>
                <input
                  type="number"
                  name="weight"
                  min="0"
                  max="100"
                  value={assignmentForm.weight}
                  onChange={onInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold">
                {editingAssignmentId ? "Save Changes" : "Add Assignment"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
