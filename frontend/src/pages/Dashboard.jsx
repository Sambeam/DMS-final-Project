import {
  Calendar,
  BookOpen,
  CheckSquare,
  FileEdit,
  CalendarDays,
  TrendingUp,
  Clock,
  Plus,
} from "lucide-react";

export default function Dashboard({
  courses,
  assignments,
  classes,
  upcomingAssignments,
  overdueAssignments,
  totalStudyTime,
  setCurrentPage,
  handleAddCourse,
  handleAddAssignment,
  handleAddClass,
}) {
  const stats = [
    {
      label: "Active Courses",
      value: courses.length,
      subtitle: "This semester",
      color: "from-blue-500 to-blue-600",
      icon: BookOpen,
    },
    {
      label: "Due Soon",
      value: upcomingAssignments,
      subtitle: "Pending tasks",
      color: "from-purple-500 to-purple-600",
      icon: CheckSquare,
    },
    {
      label: "Study Streak",
      value: "1 days",
      subtitle: "Keep it going!",
      color: "from-orange-500 to-orange-600",
      icon: TrendingUp,
    },
    {
      label: "Today's Study Time",
      value: `${Math.floor(totalStudyTime / 60)}h ${totalStudyTime % 60}m`,
      subtitle: "Total time studied",
      color: "from-green-500 to-green-600",
      icon: Clock,
    },
  ];

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = days[new Date().getDay()];
  const todaySchedule = classes.filter((c) => c.dayOfWeek === todayName);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-1">Welcome back! 👋</h2>
        <p className="text-gray-600">Here's your academic overview for today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white shadow-lg`}>
              <div className="flex items-center mb-2">
                <Icon className="w-5 h-5 mr-2 opacity-80" />
                <span className="text-sm font-medium opacity-90">{stat.label}</span>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm opacity-80">{stat.subtitle}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
            </div>
            <button
              onClick={() => setCurrentPage("assignments")}
              className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center"
            >
              View All <span className="ml-1">→</span>
            </button>
          </div>

          {overdueAssignments === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-1">No upcoming deadlines</p>
              <p className="text-sm text-gray-400">You're all caught up! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments
                .filter((a) => a.status === "overdue")
                .slice(0, 3)
                .map((a) => {
                  const course = courses.find((c) => c._id === a.courseId);
                  return (
                    <div key={a.id} className="border-l-4 border-red-500 bg-red-50 rounded-r-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{a.title}</h4>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs mr-2">{course?.course_code}</span>
                        <span className="text-red-600">Overdue</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
          </div>
          {todaySchedule.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No classes today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedule.map((c) => {
                const course = courses.find((x) => x._id === c.courseId);
                return (
                  <div key={c.id} className="border-l-4 border-blue-500 bg-blue-50 rounded-r-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{course?.course_name}</h4>
                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">{c.type}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Clock className="w-4 h-4 mr-1" />
                      {c.startTime} - {c.endTime}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarDays className="w-4 h-4 mr-1" />
                      {c.location}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">Study Statistics</h3>
          </div>
          <div className="h-48 flex items-end justify-between space-x-4">
            {["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"].map((day) => (
              <div key={day} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-100 rounded-t-lg" style={{ height: "120px" }}>
                  <div className="w-full bg-blue-500 rounded-t-lg" style={{ height: "0%" }} />
                </div>
                <span className="text-xs text-gray-500 mt-2">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Plus className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddCourse}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white hover:shadow-lg transition text-left"
            >
              <BookOpen className="w-6 h-6 mb-2" />
              <p className="font-semibold text-sm mb-1">Add Course</p>
              <p className="text-xs opacity-80">Create a new course</p>
            </button>
            <button
              onClick={handleAddAssignment}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white hover:shadow-lg transition text-left"
            >
              <CheckSquare className="w-6 h-6 mb-2" />
              <p className="font-semibold text-sm mb-1">New Assignment</p>
              <p className="text-xs opacity-80">Track a deadline</p>
            </button>
            <button
              onClick={() => setCurrentPage("notes")}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white hover:shadow-lg transition text-left"
            >
              <FileEdit className="w-6 h-6 mb-2" />
              <p className="font-semibold text-sm mb-1">Take Notes</p>
              <p className="text-xs opacity-80">Start writing</p>
            </button>
            <button
              onClick={handleAddClass}
              className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white hover:shadow-lg transition text-left"
            >
              <CalendarDays className="w-6 h-6 mb-2" />
              <p className="font-semibold text-sm mb-1">Schedule Class</p>
              <p className="text-xs opacity-80">Add to calendar</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
