import { X, Edit, Trash2 } from "lucide-react";
import { WEEK_DAYS, SESSION_TYPES } from "../utils/calendar.js";

export default function ScheduleModal({
  courses,
  classes,
  classForm,
  editingClassId,
  onInputChange,
  onSubmit,
  onClose,
  onDeleteClass,
  onStartEditClass,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {editingClassId ? "Edit Class Session" : "Add Class Session"}
            </h3>
            <p className="text-sm text-gray-500">Customize the classes that appear on your weekly timetable.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {courses.length === 0 ? (
          <p className="text-sm text-gray-600">Add a course first to start building your timetable.</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  name="courseId"
                  value={classForm.courseId}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={classForm.type}
                  onChange={onInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 capitalize"
                >
                  {SESSION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <select
                  name="dayOfWeek"
                  value={classForm.dayOfWeek}
                  onChange={onInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  {WEEK_DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  name="location"
                  value={classForm.location}
                  onChange={onInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Room 101"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={classForm.startTime}
                  onChange={onInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={classForm.endTime}
                  onChange={onInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              {editingClassId && (
                <button
                  type="button"
                  onClick={() => onDeleteClass(editingClassId)}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
              )}
              <button type="submit" className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold">
                {editingClassId ? "Save Changes" : "Add Class"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Existing Sessions</h4>
          {classes.length === 0 ? (
            <p className="text-sm text-gray-500">No sessions yet. Use the form above to get started.</p>
          ) : (
            <div className="space-y-3">
              {classes.map((session) => {
                const course = courses.find((course) => course._id === session.courseId);
                return (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {course?.course_code} · {session.type} on {session.dayOfWeek}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.startTime} - {session.endTime} · {session.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onStartEditClass(session)} className="p-2 rounded-lg hover:bg-gray-100" type="button">
                        <Edit className="w-4 h-4 text-blue-500" />
                      </button>
                      <button onClick={() => onDeleteClass(session.id)} className="p-2 rounded-lg hover:bg-gray-100" type="button">
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
    </div>
  );
}
