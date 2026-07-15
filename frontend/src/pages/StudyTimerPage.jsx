import { useEffect } from "react";
import { Clock, TrendingUp, PlayCircle, PauseCircle } from "lucide-react";

export default function StudyTimerPage({ courses, timerState, setTimerState, studySessions, setStudySessions }) {
  useEffect(() => {
    let interval;
    if (timerState.isRunning) {
      interval = setInterval(() => setTimerState((p) => ({ ...p, seconds: p.seconds + 1 })), 1000);
    }
    return () => clearInterval(interval);
  }, [timerState.isRunning, setTimerState]);

  const format = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  const toggle = () => {
    if (!timerState.isRunning && !timerState.selectedCourse) return alert("Please select a course first");
    if (timerState.isRunning) {
      const newSession = {
        id: Date.now().toString(),
        courseId: timerState.selectedCourse,
        duration: Math.floor(timerState.seconds / 60),
        date: new Date().toISOString().split("T")[0],
      };
      setStudySessions((s) => [newSession, ...s]);
      setTimerState({ isRunning: false, seconds: 0, selectedCourse: null });
    } else {
      setTimerState((p) => ({ ...p, isRunning: true }));
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const todaySessions = studySessions.filter((s) => s.date === today);
  const todayTotal = todaySessions.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-1">Study Timer</h2>
        <p className="text-gray-600">Track your study sessions and build consistency</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center space-x-2 mb-8">
            <Clock className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-semibold text-gray-900">Timer</h3>
          </div>

          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-gray-900 mb-4 font-mono">{format(timerState.seconds)}</div>
            <p className="text-gray-500">{timerState.isRunning ? "Timer running..." : "Ready to start"}</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              value={timerState.selectedCourse || ""}
              onChange={(e) => setTimerState((p) => ({ ...p, selectedCourse: e.target.value }))}
              disabled={timerState.isRunning}
            >
              <option value="">Choose a course...</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.course_code} - {c.course_name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={toggle}
            className={`w-full ${
              timerState.isRunning ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            } text-white px-6 py-4 rounded-lg font-semibold flex items-center justify-center text-lg`}
          >
            {timerState.isRunning ? (
              <>
                <PauseCircle className="w-6 h-6 mr-2" /> Stop
              </>
            ) : (
              <>
                <PlayCircle className="w-6 h-6 mr-2" /> Start
              </>
            )}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center space-x-2 mb-8">
            <TrendingUp className="w-6 h-6 text-purple-500" />
            <h3 className="text-xl font-semibold text-gray-900">Today's Sessions</h3>
          </div>

          <div className="text-center mb-8 bg-purple-50 rounded-lg p-6">
            <p className="text-gray-600 mb-2">Total Study Time Today</p>
            <p className="text-4xl font-bold text-purple-600">
              {Math.floor(todayTotal / 60)}h {todayTotal % 60}m
            </p>
          </div>

          <div className="space-y-3">
            {todaySessions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No study sessions yet today</p>
            ) : (
              todaySessions.map((s) => {
                const course = courses.find((c) => c._id === s.courseId);
                return (
                  <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-semibold">
                        {course?.course_code.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{course?.course_code}</p>
                        <p className="text-sm text-gray-500">{course?.course_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-purple-600">{s.duration} min</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
