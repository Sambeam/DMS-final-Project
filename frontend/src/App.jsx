import React, { useState, useEffect, useRef } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Routes, Route, useLocation } from "react-router-dom";
import CourseLayout from "./layout/courselayout.jsx";
import Quiz from "./layout/quiz-layout.jsx";

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SESSION_TYPES = ["lecture", "lab", "tutorial"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAY_TO_INDEX = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};
const INDEX_TO_WEEKDAY = Object.fromEntries(Object.entries(WEEKDAY_TO_INDEX).map(([day, idx]) => [idx, day]));

const parseISODate = (iso) => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const clampYear = (value) => Math.min(2100, Math.max(2000, value));

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
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState("");
  const [googleReady, setGoogleReady] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const googleButtonRef = useRef(null);
  const isGoogleConfigured = Boolean(googleClientId);
  const displayUser =
    user ??
    {
      name: "Guest Student",
      email: isGoogleConfigured ? "Sign in to personalize StudyHub" : "Set VITE_GOOGLE_CLIENT_ID to enable Google login",
    };
  const avatarInitial = (displayUser.name?.[0] ?? "S").toUpperCase();
  const [authScreen, setAuthScreen] = useState("landing"); // landing | login | signup
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuthInput = (e) => {
    const { name, value } = e.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleManualAuth = (e) => {
    e.preventDefault();
    setAuthError("");
    if (!authForm.email || !authForm.password || (authScreen === "signup" && !authForm.name)) {
      setAuthError("Please fill in all required fields.");
      return;
    }
    setAuthLoading(true);
    setTimeout(() => {
      setUser({
        name: authScreen === "signup" ? authForm.name : authForm.email.split("@")[0],
        email: authForm.email,
      });
      setAuthForm({ name: "", email: "", password: "" });
      setAuthLoading(false);
      setAuthScreen("landing");
    }, 800);
  };

  const decodeCredential = (credential) => {
    try {
      const payload = credential.split(".")[1];
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const decoded =
        typeof window === "undefined"
          ? Buffer.from(base64, "base64").toString("binary")
          : window.atob(base64);
      return JSON.parse(decodeURIComponent(decoded.split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")));
    } catch {
      return null;
    }
  };

  const handleCredentialResponse = (response) => {
    setAuthError("");
    const profile = decodeCredential(response.credential);
    if (!profile) {
      setAuthError("Unable to read Google profile. Please try again.");
      return;
    }
    setUser({
      name: profile.name,
      email: profile.email,
      picture: profile.picture,
    });
    if (typeof window !== "undefined") {
      window.google?.accounts.id?.disableAutoSelect?.();
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setAuthError("");
    if (typeof window !== "undefined") {
      window.google?.accounts.id?.disableAutoSelect?.();
    }
  };

  useEffect(() => {
    if (!googleClientId) return;
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      setGoogleReady(true);
      return;
    }
    if (typeof document === "undefined") return;
    setIsGoogleLoading(true);
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsGoogleLoading(false);
      setGoogleReady(true);
    };
    script.onerror = () => {
      setIsGoogleLoading(false);
      setAuthError("Failed to load Google sign-in. Check your network and client ID.");
    };
    document.head.appendChild(script);
    return () => {
      script.onload = null;
      script.onerror = null;
      if (typeof document !== "undefined" && document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [googleClientId]);

  useEffect(() => {
    if (!googleReady || !googleClientId || user) return;
    if (typeof window === "undefined") return;
    const google = window.google;
    if (!google?.accounts?.id) return;
    google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleCredentialResponse,
      auto_select: false,
      ux_mode: "popup",
    });
    if (googleButtonRef.current) {
      googleButtonRef.current.innerHTML = "";
      google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        type: "standard",
        width: 260,
      });
    }
  }, [googleReady, googleClientId, user, authScreen]);

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

  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const courseColorPalette = ["purple", "blue", "pink", "green", "orange"];
  const [courseForm, setCourseForm] = useState({
    code: "",
    name: "",
    instructor: "",
    credits: "3",
    semester: "Fall 2024",
    description: "",
    color: courseColorPalette[0],
  });
  const [editingCourseId, setEditingCourseId] = useState(null);
  const courseFormRef = useRef(null);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState(null);
  const [classForm, setClassForm] = useState({
    courseId: courses[0]?.id ?? "",
    type: "lecture",
    dayOfWeek: "Monday",
    startTime: "09:00",
    endTime: "10:00",
    location: "",
  });

  const [holidays, setHolidays] = useState([]);
  const [holidayError, setHolidayError] = useState("");
  const [holidaysLoading, setHolidaysLoading] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const buildAssignmentForm = () => ({
    courseId: courses[0]?.id ?? "",
    title: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "medium",
    status: "not_started",
    type: "assignment",
    weight: 5,
  });
  const [assignmentForm, setAssignmentForm] = useState(buildAssignmentForm);

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


  useEffect(() => {
    if (courses.length === 0) {
      setClassForm((prev) => ({ ...prev, courseId: "" }));
      setAssignmentForm((prev) => ({ ...prev, courseId: "" }));
      return;
    }
    setClassForm((prev) => {
      if (prev.courseId && courses.some((course) => course.id === prev.courseId)) {
        return prev;
      }
      return { ...prev, courseId: courses[0].id };
    });
    setAssignmentForm((prev) => {
      if (prev.courseId && courses.some((course) => course.id === prev.courseId)) {
        return prev;
      }
      return { ...prev, courseId: courses[0].id };
    });
  }, [courses]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchHolidays = async () => {
      try {
        setHolidaysLoading(true);
        setHolidayError("");
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${calendarYear}/NG`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to fetch holidays");
        }
        const data = await response.json();
        setHolidays(data);
      } catch (error) {
        if (error.name === "AbortError") return;
        setHolidayError("Unable to load Nigerian public holidays right now.");
        setHolidays([]);
      } finally {
        setHolidaysLoading(false);
      }
    };

    fetchHolidays();

    return () => controller.abort();
  }, [calendarYear]);

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
  const resetCourseForm = () => {
    setCourseForm({
      code: "",
      name: "",
      instructor: "",
      credits: "3",
      semester: "Fall 2024",
      description: "",
      color: courseColorPalette[courses.length % courseColorPalette.length] ?? courseColorPalette[0],
    });
    setEditingCourseId(null);
  };

  const handleCourseInputChange = (e) => {
    const { name, value } = e.target;
    setCourseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCourseSubmit = (e) => {
    e.preventDefault();
    if (!courseForm.code.trim() || !courseForm.name.trim()) {
      alert("Course code and name are required.");
      return;
    }
    const payload = {
      id: editingCourseId ?? Date.now().toString(),
      code: courseForm.code.trim(),
      name: courseForm.name.trim(),
      instructor: courseForm.instructor.trim() || "TBD",
      credits: Number(courseForm.credits) || 0,
      semester: courseForm.semester.trim() || "TBD",
      description: courseForm.description.trim(),
      color: courseForm.color,
    };
    setCourses((prev) => (editingCourseId ? prev.map((c) => (c.id === editingCourseId ? payload : c)) : [payload, ...prev]));
    resetCourseForm();
  };

  const handleEditCourse = (course) => {
    setEditingCourseId(course.id);
    setCourseForm({
      code: course.code,
      name: course.name,
      instructor: course.instructor,
      credits: String(course.credits ?? ""),
      semester: course.semester ?? "",
      description: course.description ?? "",
      color: course.color,
    });
    courseFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDeleteCourse = (courseId) => {
    setCourses((prev) => prev.filter((course) => course.id !== courseId));
    setClasses((prev) => prev.filter((session) => session.courseId !== courseId));
    if (editingCourseId === courseId) {
      resetCourseForm();
    }
  };

  const closeScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setEditingClassId(null);
  };

  const openScheduleModal = (resetForm = false) => {
    if (courses.length === 0) {
      alert("Add a course first.");
      return;
    }
    if (resetForm || !classForm.courseId) {
      setEditingClassId(null);
      setClassForm({
        courseId: courses[0].id,
        type: "lecture",
        dayOfWeek: "Monday",
        startTime: "09:00",
        endTime: "10:00",
        location: "",
      });
    }
    setIsScheduleModalOpen(true);
  };

  const handleClassInputChange = (e) => {
    const { name, value } = e.target;
    setClassForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignmentInputChange = (e) => {
    const { name, value } = e.target;
    setAssignmentForm((prev) => ({
      ...prev,
      [name]: name === "weight" ? Number(value) : value,
    }));
  };

  const handleClassFormSubmit = (e) => {
    e.preventDefault();
    if (!classForm.courseId) return;
    const payload = {
      ...classForm,
      id: editingClassId ?? Date.now().toString(),
    };
    setClasses((prev) =>
      editingClassId ? prev.map((session) => (session.id === editingClassId ? payload : session)) : [payload, ...prev]
    );
    closeScheduleModal();
  };

  const handleDeleteClass = (id) => {
    setClasses((prev) => prev.filter((session) => session.id !== id));
    if (editingClassId === id) {
      closeScheduleModal();
    }
  };

  const startEditClass = (session) => {
    setEditingClassId(session.id);
    setClassForm({
      courseId: session.courseId,
      type: session.type,
      dayOfWeek: session.dayOfWeek,
      startTime: session.startTime,
      endTime: session.endTime,
      location: session.location,
    });
    setIsScheduleModalOpen(true);
  };

  const handleAddCourse = () => {
    setCurrentPage("courses");
    resetCourseForm();
    setTimeout(() => {
      courseFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const handleAddAssignment = () => {
    openAssignmentModal();
  };

  const handleAddClass = () => {
    openScheduleModal(true);
    setCurrentPage("calendar");
  };

  const openAssignmentModal = () => {
    if (courses.length === 0) {
      alert("Add a course first.");
      return;
    }
    setEditingAssignmentId(null);
    setAssignmentForm(buildAssignmentForm());
    setIsAssignmentModalOpen(true);
  };

  const closeAssignmentModal = () => {
    setIsAssignmentModalOpen(false);
    setEditingAssignmentId(null);
  };

  const handleAssignmentSubmit = (e) => {
    e.preventDefault();
    if (!assignmentForm.title.trim()) {
      alert("Assignment title is required.");
      return;
    }
    if (!assignmentForm.courseId) {
      alert("Select a course for the assignment.");
      return;
    }
    const base = {
      ...assignmentForm,
      title: assignmentForm.title.trim(),
      description: assignmentForm.description.trim(),
    };
    if (editingAssignmentId) {
      setAssignments((prev) => prev.map((a) => (a.id === editingAssignmentId ? { ...base, id: editingAssignmentId } : a)));
    } else {
      setAssignments((prev) => [{ ...base, id: Date.now().toString() }, ...prev]);
    }
    setIsAssignmentModalOpen(false);
    setEditingAssignmentId(null);
    setCurrentPage("assignments");
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

        <div
          ref={courseFormRef}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCourseId ? "Update Course" : "Add a Course"}
              </h3>
              <p className="text-sm text-gray-500">
                Enter the course details below to add it to your dashboard.
              </p>
            </div>
            {editingCourseId && (
              <button onClick={resetCourseForm} className="text-sm text-gray-500 hover:text-gray-700">
                Cancel
              </button>
            )}
          </div>
          <form onSubmit={handleCourseSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                <input
                  name="code"
                  value={courseForm.code}
                  onChange={handleCourseInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="e.g. CS101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                <input
                  name="name"
                  value={courseForm.name}
                  onChange={handleCourseInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Introduction to CS"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                <input
                  name="instructor"
                  value={courseForm.instructor}
                  onChange={handleCourseInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Dr. Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                <input
                  type="number"
                  min="0"
                  name="credits"
                  value={courseForm.credits}
                  onChange={handleCourseInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <input
                  name="semester"
                  value={courseForm.semester}
                  onChange={handleCourseInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Fall 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
                <select
                  name="color"
                  value={courseForm.color}
                  onChange={handleCourseInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  {courseColorPalette.map((color) => (
                    <option key={color} value={color}>
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={courseForm.description}
                onChange={handleCourseInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                rows="3"
                placeholder="Brief summary of the course"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              {editingCourseId && (
                <button
                  type="button"
                  onClick={() => handleDeleteCourse(editingCourseId)}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold"
              >
                {editingCourseId ? "Save Changes" : "Add Course"}
              </button>
            </div>
          </form>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
            No courses yet. Use the form above to add your first class.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className={`bg-gradient-to-br ${colorClasses[course.color]} p-6 text-white relative`}>
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
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
        )}
      </div>
    );
  };

  const CalendarPage = () => {
    const timeSlots = ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM"];

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

    const handlePrevMonth = () => {
      setCalendarMonth((prev) => {
        if (prev === 0) {
          setCalendarYear((year) => clampYear(year - 1));
          return 11;
        }
        return prev - 1;
      });
    };

    const handleNextMonth = () => {
      setCalendarMonth((prev) => {
        if (prev === 11) {
          setCalendarYear((year) => clampYear(year + 1));
          return 0;
        }
        return prev + 1;
      });
    };

    const handleMonthSelect = (value) => {
      setCalendarMonth(Number(value));
    };

    const handleYearSelect = (value) => {
      setCalendarYear(clampYear(Number(value)));
    };

    const getFirstDateForDay = (day) => {
      const firstOfMonth = new Date(calendarYear, calendarMonth, 1);
      const targetIndex = WEEKDAY_TO_INDEX[day];
      let diff = targetIndex - firstOfMonth.getDay();
      if (diff < 0) diff += 7;
      return new Date(calendarYear, calendarMonth, 1 + diff);
    };

    const dayDateMap = WEEK_DAYS.reduce((acc, day) => {
      acc[day] = getFirstDateForDay(day);
      return acc;
    }, {});

    const monthHolidays = holidays
      .map((holiday) => ({ ...holiday, dateObj: parseISODate(holiday.date) }))
      .filter((holiday) => holiday.dateObj.getMonth() === calendarMonth);

    const dayHolidayMap = WEEK_DAYS.reduce((acc, day) => {
      acc[day] = monthHolidays.filter((holiday) => INDEX_TO_WEEKDAY[holiday.dateObj.getDay()] === day);
      return acc;
    }, {});
    const holidayWeekdays = new Set(WEEK_DAYS.filter((day) => dayHolidayMap[day].length > 0));

    const monthLabel = MONTH_NAMES[calendarMonth] + " " + calendarYear;
    const yearOptions = Array.from({ length: 11 }, (_, idx) => calendarYear - 5 + idx).filter(
      (year) => year >= 2000 && year <= 2100
    );

    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Weekly Timetable</h2>
            <p className="text-gray-600">Your class schedule at a glance</p>
          </div>
          <div className="w-full sm:w-auto flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-gray-50">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <div className="px-4 py-2 text-sm font-semibold text-gray-800 whitespace-nowrap">{monthLabel}</div>
                <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-gray-50">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="flex gap-3">
                <select
                  value={calendarMonth}
                  onChange={(e) => handleMonthSelect(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={name} value={idx}>
                      {name}
                    </option>
                  ))}
                </select>
                <select
                  value={calendarYear}
                  onChange={(e) => handleYearSelect(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
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
                onClick={() => openScheduleModal(false)}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Schedule
              </button>
              <button
                onClick={() => openScheduleModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Class
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Weekly Schedule</h3>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <p className="text-sm font-semibold text-blue-900">Nigerian Holidays in {monthLabel}</p>
            </div>
            {holidaysLoading ? (
              <p className="text-sm text-gray-600">Loading holiday data...</p>
            ) : holidayError ? (
              <p className="text-sm text-red-600">{holidayError}</p>
            ) : monthHolidays.length === 0 ? (
              <p className="text-sm text-gray-600">No Nigerian public holidays in {monthLabel}.</p>
            ) : (
              <div className="space-y-2">
                {monthHolidays.map((holiday) => (
                  <div
                    key={holiday.date}
                    className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-sm border border-blue-100"
                  >
                    <span className="font-medium text-gray-900">{holiday.localName}</span>
                    <span className="text-gray-500">
                      {holiday.dateObj.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-200 bg-gray-50 p-3 text-left font-semibold text-gray-700">Time</th>
                  {WEEK_DAYS.map((day) => (
                    <th
                      key={day}
                      className={
                        "border border-gray-200 p-3 text-left font-semibold " +
                        (holidayWeekdays.has(day) ? "bg-amber-50 text-amber-700" : "bg-gray-50 text-gray-700")
                      }
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between gap-2">
                          <span>{day}</span>
                          <span className="text-xs text-gray-500">
                            {dayDateMap[day].toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        {dayHolidayMap[day].length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {dayHolidayMap[day].map((holiday) => (
                              <span key={day + "-" + holiday.date} className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                {holiday.localName}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time}>
                    <td className="border border-gray-200 p-3 text-gray-600 font-medium">{time}</td>
                    {WEEK_DAYS.map((day) => {
                      const dayClasses = getClassesForDay(day).filter((c) => c.startTime === to24h(time));
                      return (
                        <td
                          key={day}
                          className={
                            "border border-gray-200 p-2 align-top " + (holidayWeekdays.has(day) ? "bg-amber-50" : "")
                          }
                        >
                          {dayClasses.map((c) => {
                            const course = courses.find((x) => x.id === c.courseId);
                            const typeColors = {
                              lecture: "bg-blue-100 border-blue-500 text-blue-700",
                              lab: "bg-purple-100 border-purple-500 text-purple-700",
                              tutorial: "bg-green-100 border-green-500 text-green-700",
                            };
                            return (
                              <div key={c.id} className={typeColors[c.type] + " border-l-4 rounded p-2 text-xs mb-2"}>
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
                          {dayHolidayMap[day].length > 0 && (
                            <div className="mt-2 text-xs text-amber-700 space-y-1">
                              {dayHolidayMap[day].map((holiday) => (
                                <div key={day + "-detail-" + holiday.date}>
                                  {holiday.localName} (
                                  {holiday.dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })})
                                </div>
                              ))}
                            </div>
                          )}
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
                const course = courses.find((c) => c.id === a.courseId);
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
                        <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">{course?.code}</span>
                        <span className="px-2 py-1 rounded bg-purple-100 text-purple-700">{a.type}</span>
                        <span className={`px-2 py-1 rounded border ${priorityStyles}`}>{a.priority} priority</span>
                        {statusBadge && (
                          <span className={`px-2 py-1 rounded ${statusBadge.className}`}>{statusBadge.label}</span>
                        )}
                        <span className="px-2 py-1 rounded bg-blue-50 text-blue-600">Due {a.dueDate}</span>
                        <span className="px-2 py-1 rounded bg-gray-50 text-gray-600">{a.weight}% of grade</span>
                      </div>
                    </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAssignmentForm({
                        courseId: a.courseId,
                        title: a.title,
                        description: a.description,
                        dueDate: a.dueDate,
                        priority: a.priority,
                        status: a.status,
                        type: a.type,
                        weight: a.weight,
                      });
                      setEditingAssignmentId(a.id);
                      setIsAssignmentModalOpen(true);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => setAssignments((list) => list.filter((x) => x.id !== a.id))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
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

  const AISyllabusParser = () => {
    const [syllabusText, setSyllabusText] = useState("");
    const [parsedAssignments, setParsedAssignments] = useState([]);
    const [syllabusError, setSyllabusError] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? "");

    useEffect(() => {
      if (courses.length === 0) {
        setSelectedCourseId("");
        return;
      }
      setSelectedCourseId((prev) => (prev && courses.some((c) => c.id === prev) ? prev : courses[0].id));
    }, [courses]);

    const normalizePriority = (value) => {
      const text = (value || "").toString().toLowerCase();
      if (["high", "urgent", "critical"].includes(text)) return "high";
      if (["medium", "moderate"].includes(text)) return "medium";
      if (["low", "minor"].includes(text)) return "low";
      return "medium";
    };

    const parseResponse = (data) => {
      const text = data?.output?.[0]?.content?.[0]?.text ?? data?.choices?.[0]?.message?.content ?? "";
      if (!text) return [];
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) return parsed;
        if (Array.isArray(parsed.assignments)) return parsed.assignments;
      } catch {
        return [];
      }
      return [];
    };

    const handleParseSyllabus = async () => {
      const openAIApiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const openAIModel = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini";
      if (!openAIApiKey) {
        setSyllabusError("Set VITE_OPENAI_API_KEY in your .env file to enable the parser.");
        return;
      }
      if (!syllabusText.trim()) {
        setSyllabusError("Paste your syllabus text first.");
        return;
      }
      setSyllabusError("");
      setAiLoading(true);
      try {
        const prompt = `Extract assignment details (title, description, dueDate YYYY-MM-DD, priority (high/medium/low), type, weight percent) from this syllabus text. Only output valid JSON with an "assignments" array.\n\n${syllabusText}`;
        const response = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAIApiKey}`,
          },
          body: JSON.stringify({
            model: openAIModel,
            input: prompt,
            temperature: 0.2,
          }),
        });
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(errorBody || "Failed to reach OpenAI API.");
        }
        const data = await response.json();
        const assignmentsFromAI = parseResponse(data);
        if (assignmentsFromAI.length === 0) {
          throw new Error("OpenAI did not return any assignments. Try simplifying the prompt.");
        }
        setParsedAssignments(assignmentsFromAI);
      } catch (error) {
        setSyllabusError(error.message || "Unable to parse syllabus right now.");
      } finally {
        setAiLoading(false);
      }
    };

    const handleImportAssignments = () => {
      if (parsedAssignments.length === 0) {
        setSyllabusError("No parsed assignments to import yet.");
        return;
      }
      if (!selectedCourseId) {
        setSyllabusError("Add a course first so we can attach the assignments.");
        return;
      }
      const importPayload = parsedAssignments.map((item, idx) => {
        const dueDate = new Date(item.dueDate || item.due || Date.now());
        return {
          id: `${Date.now()}-${idx}`,
          courseId: selectedCourseId,
          title: item.title || `AI Assignment ${idx + 1}`,
          description: item.description || item.details || "",
          dueDate: isNaN(dueDate.valueOf()) ? new Date().toISOString().split("T")[0] : dueDate.toISOString().split("T")[0],
          priority: normalizePriority(item.priority),
          status: "not_started",
          type: (item.type || "assignment").toLowerCase(),
          weight: Number(item.weight) || 5,
        };
      });
      setAssignments((prev) => [...importPayload, ...prev]);
      setParsedAssignments([]);
      setSyllabusText("");
      setSyllabusError("");
      alert("Assignments imported! Check the assignments page to review them.");
    };

    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">AI Syllabus Parser</h2>
          </div>
          <p className="text-gray-600">Paste your syllabus text and let OpenAI extract key deadlines automatically.</p>
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
                <h4 className="font-semibold text-gray-900 mb-1">Paste syllabus</h4>
                <p className="text-sm text-gray-600">Drop the relevant text or copy/paste from PDF.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">OpenAI parses</h4>
                <p className="text-sm text-gray-600">We call OpenAI to pull out assignments.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Review & import</h4>
                <p className="text-sm text-gray-600">Send them straight to your assignments page.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Syllabus text</label>
            <textarea
              value={syllabusText}
              onChange={(e) => setSyllabusText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-4 min-h-[180px] focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Paste the important sections of your syllabus here..."
            />
          </div>
          {syllabusError && <p className="text-red-600 text-sm">{syllabusError}</p>}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleParseSyllabus}
                disabled={aiLoading}
                className="bg-purple-500 hover:bg-purple-600 disabled:opacity-70 text-white px-6 py-3 rounded-lg font-semibold flex items-center"
              >
                {aiLoading ? (
                  <>
                    <span className="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Parse with OpenAI
                  </>
                )}
              </button>
              {!import.meta.env.VITE_OPENAI_API_KEY && (
                <span className="text-sm text-gray-500">Add VITE_OPENAI_API_KEY to enable this.</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Attach to course:</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {courses.length === 0 && <option value="">No courses</option>}
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {parsedAssignments.length > 0 && (
            <div className="border border-dashed border-gray-300 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Parsed assignments ({parsedAssignments.length})</h4>
                <button
                  onClick={handleImportAssignments}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Import to Assignments
                </button>
              </div>
              <div className="space-y-3">
                {parsedAssignments.map((item, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3 text-sm">
                    <p className="font-semibold text-gray-900">{item.title || `Unnamed assignment ${idx + 1}`}</p>
                    {item.description && <p className="text-gray-600 mt-1">{item.description}</p>}
                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                      {item.dueDate && (
                        <span className="px-2 py-1 rounded bg-blue-50 text-blue-600">Due {item.dueDate}</span>
                      )}
                      {item.priority && (
                        <span className="px-2 py-1 rounded bg-purple-50 text-purple-600">{item.priority} priority</span>
                      )}
                      {item.weight && <span className="px-2 py-1 rounded bg-gray-50 text-gray-600">{item.weight}% weight</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const LandingPage = () => (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center gap-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="uppercase tracking-wide text-sm text-blue-200">StudyHub</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Stay organized, conquer deadlines, and study smarter.
          </h1>
          <p className="text-lg text-slate-200 mb-8">
            StudyHub centralizes your courses, schedule, assignments, and notes so you always know what&apos;s next.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setAuthScreen("signup")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Get started free
            </button>
            <button
              onClick={() => setAuthScreen("login")}
              className="border border-white/40 hover:bg-white/10 text-white px-6 py-3 rounded-lg font-semibold"
            >
              I already have an account
            </button>
          </div>
        </div>
        <div className="flex-1 bg-white/5 rounded-3xl border border-white/10 p-6 backdrop-blur">
          <h2 className="text-2xl font-semibold mb-4">What you get</h2>
          <ul className="space-y-4 text-slate-200">
            <li className="flex items-start gap-3">
              <CheckSquare className="w-5 h-5 text-blue-400 mt-1" />
              <p>Automated weekly timetable with exportable calendar events.</p>
            </li>
            <li className="flex items-start gap-3">
              <CalendarDays className="w-5 h-5 text-blue-400 mt-1" />
              <p>Holiday-aware schedule that highlights Nigerian public holidays.</p>
            </li>
            <li className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-400 mt-1" />
              <p>Progress metrics, study timer, AI syllabus parsing, and more.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const AuthPage = () => {
    const isSignup = authScreen === "signup";
    return (
      <div className="min-h-screen w-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="w-full max-w-4xl bg-slate-900/80 border border-white/10 rounded-3xl shadow-2xl flex flex-col lg:flex-row overflow-hidden">
          <div className="flex-1 p-8 bg-gradient-to-b from-blue-600 via-blue-500 to-indigo-600">
            <h2 className="text-3xl font-bold mb-4">{isSignup ? "Create an account" : "Welcome back"}</h2>
            <p className="text-blue-50 mb-8">
              {isSignup
                ? "Get personalized schedules, reminders, and study tools tailored just for you."
                : "Sign in to pick up where you left off across your courses and notes."}
            </p>
            <div className="space-y-4 text-blue-50">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5" />
                <span>Plan your week with intelligent schedule blocks.</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5" />
                <span>Track study time and stay accountable.</span>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                <span>Sync notes, assignments, and deadlines.</span>
              </div>
            </div>
          </div>
          <div className="flex-1 p-8 bg-slate-900">
            <div className="mb-6">
              <button
                onClick={() => setAuthScreen("landing")}
                className="text-sm text-slate-400 hover:text-white flex items-center gap-2"
              >
                ← Back to landing
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleManualAuth}>
              {isSignup && (
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Full Name</label>
                  <input
                    name="name"
                    value={authForm.name}
                    onChange={handleAuthInput}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Jane Doe"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  value={authForm.email}
                  onChange={handleAuthInput}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Password</label>
                <input
                  name="password"
                  type="password"
                  value={authForm.password}
                  onChange={handleAuthInput}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-70 text-white font-semibold py-2.5 rounded-lg"
              >
                {authLoading ? "Please wait..." : isSignup ? "Create account" : "Log in"}
              </button>
            </form>
            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-slate-500">
              <span className="flex-1 h-px bg-slate-700" />
              or continue with
              <span className="flex-1 h-px bg-slate-700" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <div ref={googleButtonRef} />
              {(!googleReady || isGoogleLoading) && <span className="text-sm text-slate-400">Loading Google sign-in...</span>}
            </div>
            {isSignup ? (
              <p className="text-sm text-slate-400 mt-6">
                Already have an account?{" "}
                <button onClick={() => setAuthScreen("login")} className="text-blue-400 hover:underline">
                  Log in
                </button>
              </p>
            ) : (
              <p className="text-sm text-slate-400 mt-6">
                Need an account?{" "}
                <button onClick={() => setAuthScreen("signup")} className="text-blue-400 hover:underline">
                  Sign up
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

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

  if (!user) {
    if (authScreen === "landing") {
      return <LandingPage />;
    }
    return <AuthPage />;
  }

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
                {avatarInitial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{displayUser.name}</p>
                <p className="text-xs text-gray-500 truncate">{displayUser.email}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 md:ml-64 w-full">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-6 space-y-3">
              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{authError}</div>
              )}
              {isGoogleConfigured ? (
                user ? (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      {user.picture ? (
                        <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-lg">
                          {(user.name?.[0] ?? "S").toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Signed in as</p>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="self-start sm:self-auto border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-dashed border-gray-300 rounded-xl p-4">
                    <div>
                      <p className="font-semibold text-gray-900">Sign in with Google</p>
                      <p className="text-sm text-gray-600">
                        Connect your Google account to sync schedules and personalize StudyHub.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div ref={googleButtonRef} />
                      {(!googleReady || isGoogleLoading) && <span className="text-sm text-gray-500">Loading…</span>}
                    </div>
                  </div>
                )
              ) : (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-xl p-4">
                  <p className="font-semibold mb-1">Google OAuth is not configured</p>
                  <p>
                    Add <code className="bg-white px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> to your environment (see README)
                    to enable Google sign-in.
                  </p>
                </div>
              )}
            </div>
            {renderPage()}
          </div>
        </main>
      </div>

      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingClassId ? "Edit Class Session" : "Add Class Session"}
                </h3>
                <p className="text-sm text-gray-500">Customize the classes that appear on your weekly timetable.</p>
              </div>
              <button onClick={closeScheduleModal} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {courses.length === 0 ? (
              <p className="text-sm text-gray-600">Add a course first to start building your timetable.</p>
            ) : (
              <form onSubmit={handleClassFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                    <select
                      name="courseId"
                      value={classForm.courseId}
                      onChange={handleClassInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    >
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.code} — {course.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      name="type"
                      value={classForm.type}
                      onChange={handleClassInputChange}
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
                      onChange={handleClassInputChange}
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
                      onChange={handleClassInputChange}
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
                      onChange={handleClassInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      name="endTime"
                      value={classForm.endTime}
                      onChange={handleClassInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  {editingClassId && (
                    <button
                      type="button"
                      onClick={() => handleDeleteClass(editingClassId)}
                      className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold"
                  >
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
                    const course = courses.find((course) => course.id === session.courseId);
                    return (
                      <div
                        key={session.id}
                        className="border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {course?.code} · {session.type} on {session.dayOfWeek}
                          </p>
                          <p className="text-xs text-gray-500">
                            {session.startTime} - {session.endTime} · {session.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditClass(session)}
                            className="p-2 rounded-lg hover:bg-gray-100"
                            type="button"
                          >
                            <Edit className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteClass(session.id)}
                            className="p-2 rounded-lg hover:bg-gray-100"
                            type="button"
                          >
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
      )}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingAssignmentId ? "Edit Assignment" : "New Assignment"}
                </h3>
                <p className="text-sm text-gray-500">
                  Track a task, exam, or project with a due date.
                </p>
              </div>
              <button onClick={closeAssignmentModal} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            {courses.length === 0 ? (
              <p className="text-sm text-gray-600">Add a course first before creating assignments.</p>
            ) : (
              <form className="space-y-4" onSubmit={handleAssignmentSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                    <select
                      name="courseId"
                      value={assignmentForm.courseId}
                      onChange={handleAssignmentInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    >
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.code} — {course.name}
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
                      onChange={handleAssignmentInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    name="title"
                    value={assignmentForm.title}
                    onChange={handleAssignmentInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="Midterm project"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={assignmentForm.description}
                    onChange={handleAssignmentInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    rows="3"
                    placeholder="Optional details, requirements, etc."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      name="priority"
                      value={assignmentForm.priority}
                      onChange={handleAssignmentInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      name="type"
                      value={assignmentForm.type}
                      onChange={handleAssignmentInputChange}
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
                      onChange={handleAssignmentInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button type="button" onClick={closeAssignmentModal} className="px-4 py-2 rounded-lg border border-gray-300">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold">
                    Add Assignment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyHubApp;
