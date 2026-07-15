import { Plus, BookOpen, Edit, Trash2 } from "lucide-react";
import AddCourseForm from "../components/AddCourseForm.jsx";

const colorClasses = {
  purple: "from-purple-500 to-purple-600",
  blue: "from-blue-500 to-blue-600",
  pink: "from-pink-500 to-pink-600",
  green: "from-green-500 to-green-600",
  orange: "from-orange-500 to-orange-600",
};

export default function CoursesPage({
  courses,
  user,
  courseColorPalette,
  editingCourseId,
  courseFormRef,
  onCourseSaved,
  onCancelEdit,
  onDeleteCourse,
  handleEditCourse,
  handleAddCourse,
  openCourse,
}) {
  const editingCourse = courses.find((c) => c._id === editingCourseId) ?? null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">My Courses</h2>
          <p className="text-gray-600">Manage your course load for the semester</p>
        </div>
        <button
          onClick={handleAddCourse}
          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Course
        </button>
      </div>

      <div ref={courseFormRef} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {editingCourseId ? "Update Course" : "Add a Course"}
            </h3>
            <p className="text-sm text-gray-500">Enter the course details below to add it to your dashboard.</p>
          </div>
          {editingCourseId && (
            <button onClick={onCancelEdit} className="text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </button>
          )}
        </div>
        <AddCourseForm
          user={user}
          courseColorPalette={courseColorPalette}
          editingCourse={editingCourse}
          onSaved={onCourseSaved}
          onDelete={onDeleteCourse}
        />
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          No courses yet. Use the form above to add your first class.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className={`bg-gradient-to-br ${colorClasses[course.color]} p-6 text-white relative`}>
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={() => handleEditCourse(course)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDeleteCourse(course._id)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="text-2xl font-bold mb-2">{course.course_code}</h3>
                <div className="flex items-center text-sm opacity-90">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span>{course.credit} credits</span>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  <button
                    onClick={() => openCourse(course)}
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 text-blue-600 px-3 py-2 rounded-lg transition-colors"
                  >
                    {course.course_name}
                  </button>
                </h4>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="mr-1">👤</span>
                  {course.instructor}
                </div>
                <div className="text-sm text-gray-600 mb-3">{course.semester}</div>
                <p className="text-sm text-gray-500">{course.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
