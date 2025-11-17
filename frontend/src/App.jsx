import React, { useState, useEffect } from "react";
import {
  Calendar,
  BookOpen,
  FileText,
  Clock,
  Settings,
  Plus,
  CheckSquare,
  FileEdit,
  CalendarDays,
  TrendingUp,
  Trash2,
  Edit,
  Download,
  Search,
  Filter,
  PlayCircle,
  PauseCircle,
  Upload,
  Sparkles,
  X,
  Menu,
} from "lucide-react";

import { Routes, Route, useLocation } from "react-router-dom";
import CourseLayout from "./layout/courselayout.jsx";
import Quiz from "./layout/quiz-layout.jsx";

/**
 * StudyHubApp (responsive + functional)
 * - No horizontal overflow (w-screen + overflow-x-hidden)
 * - Mobile drawer sidebar (toggle)
 * - Desktop sticky sidebar (md+)
 * - Buttons wired: navigate, add items, export .ics, save notes, timer start/stop
 */
const StudyHubApp = () => {
  const location = useLocation();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [user] = useState({
    name: "Sam Beamish",
    email: "sambeamish321@gmail.com",
  });

  // ----- DATA -----
  const [courses, setCourses] = useState([
    {
      id: "1",
      code: "MATH201",
      name: "Calculus II",
      instructor: "Prof. Michael Chen",
      credits: 4,
      color: "purple",
      semester: "Fall 2024",
      description: "Advanced integration techniques and series",
    },
    {
      id: "2",
      code: "CS101",
      name: "Introduction to Computer Science",
      instructor: "Dr. Sarah Johnson",
      credits: 4,
      color: "blue",
      semester: "Fall 2024",
      description: "Fundamentals of programming and computational thinking",
    },
    {
      id: "3",
      code: "PHYS150",
      name: "Physics for Engineers",
      instructor: "Dr. Emily Rodriguez",
      credits: 3,
      color: "pink",
      semester: "Fall 2024",
      description: "Classical mechanics and thermodynamics",
    },
  ]);

  const [assignments, setAssignments] = useState([
    {
      id: "1",
      courseId: "1",
      title: "Calculus Midterm Exam",
      description: "Chapters 1-5",
      dueDate: "2024-08-01",
      priority: "high",
      status: "overdue",
      type: "exam",
      weight: 30,
    },
    {
      id: "2",
      courseId: "2",
      title: "Programming Assignment 1",
      description: "Build a simple calculator application",
      dueDate: "2024-07-15",
      priority: "high",
      status: "overdue",
      type: "assignment",
      weight: 15,
    },
    {
      id: "3",
      courseId: "3",
      title: "Lab Report 3",
      description: "",
      dueDate: "2024-07-20",
      priority: "medium",
      status: "overdue",
      type: "lab",
      weight: 10,
    },
  ]);

  const [classes, setClasses] = useState([
    {
      id: "1",
      courseId: "1",
      type: "lecture",
      dayOfWeek: "Monday",
      startTime: "09:00",
      endTime: "10:30",
      location: "Room 301",
    },
    {
      id: "2",
      courseId: "1",
      type: "lecture",
      dayOfWeek: "Wednesday",
      startTime: "09:00",
      endTime: "10:30",
      location: "Room 301",
    },
    {
      id: "3",
      courseId: "2",
      type: "lecture",
      dayOfWeek: "Tuesday",
      startTime: "11:00",
      endTime: "12:30",
      location: "Room 205",
    },
    {
      id: "4",
      courseId: "1",
      type: "lecture",
      dayOfWeek: "Monday",
      startTime: "13:00",
      endTime: "14:30",
      location: "Science Building A",
    },
    {
      id: "5",
      courseId: "3",
      type: "lab",
      dayOfWeek: "Friday",
      startTime: "10:00",
      endTime: "12:00",
      location: "Physics Lab 2",
    },
    {
      id: "6",
      courseId: "2",
      type: "tutorial",
      dayOfWeek: "Thursday",
      startTime: "14:00",
      endTime: "15:00",
      location: "Room 108",
    },
  ]);

  const [notebooks, setNotebooks] = useState([
    {
      id: "1",
      name: "gfdgfd",
      color: "blue",
      courseId: null,
      pages: [
        {
          id: "1",
          title: "Page 1",
          content: "",
          createdDate: "2024-10-16T22:18:00",
        },
      ],
    },
  ]);

  const [studySessions, setStudySessions] = useState([
    {
      id: "1",
      courseId: "2",
      duration: 0,
      date: new Date().toISOString().split("T")[0],
    },
  ]);

  const [timerState, setTimerState] = useState({
    isRunning: false,
    seconds: 0,
    selectedCourse: null,
  });

  // Restore course layout when returning from quiz
  useEffect(() => {
    // Only check when we're on the home route
    if (location.pathname === "/") {
      const returnToCourseLayout = localStorage.getItem("returnToCourseLayout");
      if (returnToCourseLayout === "true") {
        const storedCourse = localStorage.getItem("selectedCourse");
        if (storedCourse) {
          try {
            const course = JSON.parse(storedCourse);
            // Use requestAnimationFrame to ensure state updates happen after navigation completes
            requestAnimationFrame(() => {
              setSelectedCourse(course);
              setCurrentPage("courseLayout");
              // Clear the flag
              localStorage.removeItem("returnToCourseLayout");
            });
          } catch (error) {
            console.error("Error parsing stored course:", error);
            localStorage.removeItem("returnToCourseLayout");
          }
        } else {
          // If no course stored, clear the flag anyway
          localStorage.removeItem("returnToCourseLayout");
        }
      }
    }
  }, [location.pathname]);

  // ----- DERIVED STATS -----
  const upcomingAssignments = assignments.filter(
    (a) => a.status === "not_started" || a.status === "in_progress"
  ).length;
  const overdueAssignments = assignments.filter((a) => a.status === "overdue").length;
  const completedAssignments = assignments.filter((a) => a.status === "completed").length;
  const totalStudyTime = studySessions.reduce((acc, s) => acc + s.duration, 0);
  const completionRate =
    assignments.length > 0
      ? Math.round((completedAssignments / assignments.length) * 100)
      : 0;

  // ----- ACTIONS -----
  const handleAddCourse = () => {
    const idx = courses.length + 1;
    const newCourse = {
      id: String(idx),
      code: `NEW${idx}`,
      name: `New Course ${idx}`,
      instructor: "TBD",
      credits: 3,
      color: ["purple", "blue", "pink", "green", "orange"][idx % 5],
      semester: "Fall 2025",
      description: "Newly added placeholder course.",
    };
    setCourses((c) => [newCourse, ...c]);
    setCurrentPage("courses");
  };

  const handleAddAssignment = () => {
    if (courses.length === 0) return alert("Add a course first.");
    const course = courses[0];
    const idx = assignments.length + 1;
    const newA = {
      id: String(idx),
      courseId: course.id,
      title: `New Assignment ${idx}`,
      description: "Quick-added from dashboard.",
      dueDate: new Date().toISOString().split("T")[0],
      priority: "medium",
      status: "not_started",
      type: "assignment",
      weight: 5,
    };
    setAssignments((a) => [newA, ...a]);
    setCurrentPage("assignments");
  };

  const handleAddClass = () => {
    if (courses.length === 0) return alert("Add a course first.");
    const course = courses[0];
    const idx = classes.length + 1;
    const newC = {
      id: String(idx),
      courseId: course.id,
      type: "lecture",
      dayOfWeek: "Monday",
      startTime: "10:00",
      endTime: "11:00",
      location: "Room 100",
    };
    setClasses((cl) => [newC, ...cl]);
    setCurrentPage("calendar");
  };

  const exportICS = () => {
    const pad = (n) => String(n).padStart(2, "0");
    const today = new Date();
    const y = today.getFullYear();
    const m = pad(today.getMonth() + 1);
    const d = pad(today.getDate());
    const dtstamp = `${y}${m}${d}T000000Z`;
    const dayMap = {
      Monday: "MO",
      Tuesday: "TU",
      Wednesday: "WE",
      Thursday: "TH",
      Friday: "FR",
      Saturday: "SA",
      Sunday: "SU",
    };

    const events = classes
      .map((c) => {
        const course = courses.find((x) => x.id === c.courseId);
        const [sh, sm] = c.startTime.split(":");
        const [eh, em] = c.endTime.split(":");
        const dtstart = `${y}${m}${d}T${sh}${sm}00`;
        const dtend = `${y}${m}${d}T${eh}${em}00`;
        const rrule = `RRULE:FREQ=WEEKLY;BYDAY=${dayMap[c.dayOfWeek]}`;
        return [
          "BEGIN:VEVENT",
          `DTSTAMP:${dtstamp}`,
          `SUMMARY:${course?.code} ${c.type}`,
          `DESCRIPTION:${course?.name} - ${c.location}`,
          `DTSTART:${dtstart}`,
          `DTEND:${dtend}`,
          rrule,
          "END:VEVENT",
        ].join("\r\n");
      })
      .join("\r\n");

    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-/StudyHub/EN
${events}
END:VCALENDAR`.replace(/\n/g, "\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "studyhub_schedule.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ----- PAGES -----
  const Dashboard = () => {
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
                    const course = courses.find((c) => c.id === a.courseId);
                    return (
                      <div key={a.id} className="border-l-4 border-red-500 bg-red-50 rounded-r-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{a.title}</h4>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs mr-2">{course?.code}</span>
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
                  const course = courses.find((x) => x.id === c.courseId);
                  return (
                    <div key={c.id} className="border-l-4 border-blue-500 bg-blue-50 rounded-r-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{course?.name}</h4>
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
  };

  const CoursesPage = () => {
    const colorClasses = {
      purple: "from-purple-500 to-purple-600",
      blue: "from-blue-500 to-blue-600",
      pink: "from-pink-500 to-pink-600",
      green: "from-green-500 to-green-600",
      orange: "from-orange-500 to-orange-600",
    };

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className={`bg-gradient-to-br ${colorClasses[course.color]} p-6 text-white relative`}>
                <button
                  onClick={() => setCourses((c) => c.filter((x) => x.id !== course.id))}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <h3 className="text-2xl font-bold mb-2">{course.code}</h3>
                <div className="flex items-center text-sm opacity-90">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span>{course.credits} credits</span>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  <button onClick={()=>{
                    setSelectedCourse(course)
                    setCurrentPage("courseLayout")
                    localStorage.setItem("selectedCourse", JSON.stringify(course));
                  }} 
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 text-blue-600 px-3 py-2 rounded-lg transition-colors">
                    {course.name}
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
      </div>
    );
  };

  const CalendarPage = () => {
    const timeSlots = ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM"];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    //states for holiday display//
    const [year, setYear] = useState(new Date().getFullYear());
    const [holidays, setHolidays] = useState([]);

    //load holiday from database//
    const dbHolidays = async () =>{
      const res = await fetch(`http://localhost:3000/api/holidays?year=${year}`);
      const data = await res.json();
      setHolidays(data.holidays || []);
    };

    //sync holiday data from Nager with DB holiday schema//
    const syncHolidays = async() =>{
      const res = await fetch("http://localhost:3000/api/holidays/sync",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({year,counteryCode:"CA"}),
      });
      const holiday_sync_data = await res.json();
    };

    //auto sync holiday//
    useEffect(() =>{
      const autoSync = async() =>{
        try{
          await syncHolidays();
          await dbHolidays();
        }catch(error){
          console.error("Holiday sync failed");
        }
      }
      autoSync();
    }, [year]);

    const changeDateToWeekDay = (dateString) =>{
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { weekday: "long" });
    };

    const getClassesForDay = (day) => classes.filter((c) => c.dayOfWeek === day);
    const to24h = (label) => {
      const map = {
        "8 AM": "08:00",
        "9 AM": "09:00",
        "10 AM": "10:00",
        "11 AM": "11:00",
        "12 PM": "12:00",
        "1 PM": "13:00",
        "2 PM": "14:00",
        "3 PM": "15:00",
        "4 PM": "16:00",
      };
      return map[label];
    };

    return (
      <div className="max-w-7xl mx-auto">
         <div className="mt-4 mb-6 flex gap-3 items-center">
      </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Weekly Timetable</h2>
            <p className="text-gray-600">Your class schedule at a glance</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={exportICS}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export .ics
            </button>
            <button
              onClick={handleAddClass}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Class
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Weekly Schedule</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-200 bg-gray-50 p-3 text-left font-semibold text-gray-700">Time</th>
                  {days.map((day) => {
                    const holidayToday = holidays.find((h) => getWeekdayName(h.date) === day);

                  return (
                    <th
                      key={day}
                      className="border border-gray-200 bg-gray-50 p-3 text-left font-semibold text-gray-700"
                    >
                      <div>{day}</div>
                        {holidayToday && (
                          <div className="text-red-600 text-xs font-semibold mt-1">
                            🎉 {holidayToday.local_name || holidayToday.name}
                          </div>
                        )}
                    </th>
                  );
                  })}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time}>
                    <td className="border border-gray-200 p-3 text-gray-600 font-medium">{time}</td>
                    {days.map((day) => {
                      const dayClasses = getClassesForDay(day).filter((c) => c.startTime === to24h(time));
                      return (
                        <td key={day} className="border border-gray-200 p-2 align-top">
                          {dayClasses.map((c) => {
                            const course = courses.find((x) => x.id === c.courseId);
                            const typeColors = {
                              lecture: "bg-blue-100 border-blue-500 text-blue-700",
                              lab: "bg-purple-100 border-purple-500 text-purple-700",
                              tutorial: "bg-green-100 border-green-500 text-green-700",
                            };
                            return (
                              <div key={c.id} className={`${typeColors[c.type]} border-l-4 rounded p-2 text-xs mb-2`}>
                                <div className="font-semibold mb-1">{course?.code}</div>
                                <div className="flex items-center mb-1">
                                  <span className="px-1.5 py-0.5 bg-white/50 rounded text-xs">{c.type}</span>
                                </div>
                                <div className="text-gray-600 flex items-center">
                                  <CalendarDays className="w-3 h-3 mr-1" />
                                  {c.location}
                                </div>
                                <div className="text-gray-600">
                                  {c.startTime} - {c.endTime}
                                </div>
                              </div>
                            );
                          })}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const AssignmentsPage = () => {
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [courseFilter, setCourseFilter] = useState("all");

    const filteredAssignments = assignments.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (priorityFilter !== "all" && a.priority !== priorityFilter) return false;
      if (courseFilter !== "all" && a.courseId !== courseFilter) return false;
      return true;
    });

    const overdueList = filteredAssignments.filter((a) => a.status === "overdue");

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
                  <option key={c.id} value={c.id}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {overdueList.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Overdue ({overdueList.length})
            </h3>
            <div className="space-y-4">
              {overdueList.map((a) => {
                const course = courses.find((c) => c.id === a.courseId);
                return (
                  <div key={a.id} className="border-l-4 border-red-500 bg-red-50 rounded-r-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <input type="checkbox" className="mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{a.title}</h4>
                          {a.description && <p className="text-sm text-gray-600 mb-2">{a.description}</p>}
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                              {a.priority} priority
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                              {a.type}
                            </span>
                            <span className="text-sm text-gray-600">{a.weight}% of grade</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 hover:bg-white rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => setAssignments((list) => list.filter((x) => x.id !== a.id))}
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const NotesPage = () => {
    const [selectedNotebook, setSelectedNotebook] = useState(notebooks[0]);
    const [selectedPage, setSelectedPage] = useState(notebooks[0]?.pages[0] ?? null);
    const [text, setText] = useState(selectedPage?.content ?? "");

    useEffect(() => {
      setText(selectedPage?.content ?? "");
    }, [selectedPage]);

    const saveNote = () => {
      if (!selectedNotebook || !selectedPage) return;
      setNotebooks((all) =>
        all.map((nb) =>
          nb.id !== selectedNotebook.id
            ? nb
            : {
                ...nb,
                pages: nb.pages.map((p) => (p.id === selectedPage.id ? { ...p, content: text } : p)),
              }
        )
      );
      alert("Saved!");
    };

    return (
      <div className="flex h-[calc(100vh-80px)]">
        {/* Notebooks Sidebar */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() =>
                setNotebooks((n) => [
                  ...n,
                  {
                    id: Date.now().toString(),
                    name: `Notebook ${n.length + 1}`,
                    color: "blue",
                    courseId: null,
                    pages: [
                      {
                        id: Date.now().toString() + "-p",
                        title: "Page 1",
                        content: "",
                        createdDate: new Date().toISOString(),
                      },
                    ],
                  },
                ])
              }
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Notebook
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {notebooks.map((nb) => (
              <button
                key={nb.id}
                onClick={() => {
                  setSelectedNotebook(nb);
                  setSelectedPage(nb.pages[0]);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg mb-2 transition-colors ${
                  selectedNotebook?.id === nb.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-900">{nb.name}</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pages Sidebar */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-500" />
              {selectedNotebook?.name}
            </h3>
            <button
              onClick={() => {
                if (!selectedNotebook) return;
                const newP = {
                  id: Date.now().toString(),
                  title: `Page ${selectedNotebook.pages.length + 1}`,
                  content: "",
                  createdDate: new Date().toISOString(),
                };
                setNotebooks((all) =>
                  all.map((nb) => (nb.id === selectedNotebook.id ? { ...nb, pages: [newP, ...nb.pages] } : nb))
                );
                setSelectedPage(newP);
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Page
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search pages..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            {selectedNotebook?.pages.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPage(p)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                  selectedPage?.id === p.id ? "bg-white shadow-sm border border-gray-200" : "hover:bg-white"
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900 text-sm">{p.title}</span>
                </div>
                <p className="text-xs text-gray-500">{new Date(p.createdDate).toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 bg-white flex flex-col">
          <div className="border-b border-gray-200 p-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{selectedPage?.title}</h2>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium">
                + Section
              </button>
              <button
                onClick={saveNote}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                Save
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <textarea
              className="w-full border border-gray-300 rounded-lg p-4 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Start typing your notes..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  };

  const StudyTimerPage = () => {
    useEffect(() => {
      let interval;
      if (timerState.isRunning) {
        interval = setInterval(() => setTimerState((p) => ({ ...p, seconds: p.seconds + 1 })), 1000);
      }
      return () => clearInterval(interval);
    }, [timerState.isRunning]);

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
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
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
                  const course = courses.find((c) => c.id === s.courseId);
                  return (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-semibold">
                          {course?.code.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{course?.code}</p>
                          <p className="text-sm text-gray-500">{course?.name}</p>
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
  };

  const AISyllabusParser = () => (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">AI Syllabus Parser</h2>
        </div>
        <p className="text-gray-600">Upload your syllabus and let AI extract all deadlines automatically</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">How it works</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Upload Syllabus</h4>
              <p className="text-sm text-gray-600">Upload your course syllabus PDF</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">AI Analysis</h4>
              <p className="text-sm text-gray-600">AI extracts dates, weights, and assignments</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Review & Save</h4>
              <p className="text-sm text-gray-600">Edit if needed, then auto-create assignments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12">
        <div className="text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Upload className="w-10 h-10 text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Your Syllabus</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Drop your course syllabus PDF here or click to browse.
          </p>
          <button className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center mx-auto">
            <Upload className="w-5 h-5 mr-2" />
            Select PDF File
          </button>
          <p className="text-sm text-gray-500 mt-4">Supported format: PDF only</p>
        </div>
      </div>
    </div>
  );

  // ----- NAV + LAYOUT -----
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "assignments", label: "Assignments", icon: CheckSquare },
    { id: "notes", label: "Notes", icon: FileText },
    { id: "timer", label: "Study Timer", icon: Clock },
    { id: "syllabus", label: "AI Syllabus Parser", icon: Settings },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "courses":
        return <CoursesPage />;
      case "calendar":
        return <CalendarPage />;
      case "assignments":
        return <AssignmentsPage />;
      case "notes":
        return <NotesPage />;
      case "timer":
        return <StudyTimerPage />;
      case "syllabus":
        return <AISyllabusParser />;
      case "courseLayout":
        return <CourseLayout course={selectedCourse} />; //pass the course obj to the component//
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gray-50">
      {/* Top bar (mobile) */}
      <div className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          aria-label="Open menu"
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold">StudyHub</span>
        </div>
        <div className="w-8" />
      </div>

      <div className="flex">
        {/* Sidebar (drawer on mobile, sticky on desktop) */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white border-r border-gray-200 transition-transform md:static md:translate-x-0 md:h-screen ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">StudyHub</h1>
                <p className="text-xs text-gray-500">Your Academic Companion</p>
              </div>
            </div>
            <button
              aria-label="Close menu"
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    active ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${active ? "text-blue-600" : "text-gray-500"}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 hidden md:block">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold">
                S
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 md:ml-64 w-full">
          <div className="px-4 sm:px-6 lg:px-8 py-6">{renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <Routes>
    <Route path="/" element={<StudyHubApp />} />
    <Route path="/quiz/:quizId" element={<Quiz />} />
  </Routes>
);

export default App;
