import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  BookOpen,
  FileText,
  Clock,
  Settings,
  CheckSquare,
  FileEdit,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import CourseLayout from "./layout/courselayout.jsx";
import AuthPage from "./Authentication/AuthPage.jsx";
import LandingPage from "./Authentication/LandingPage.jsx";
import api from "./api/client.js";
import Sidebar from "./components/Sidebar.jsx";
import UserBanner from "./components/UserBanner.jsx";
import ScheduleModal from "./components/ScheduleModal.jsx";
import AssignmentModal from "./components/AssignmentModal.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CoursesPage from "./pages/CoursesPage.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import AssignmentsPage from "./pages/AssignmentsPage.jsx";
import NotesPage from "./pages/NotesPage.jsx";
import StudyTimerPage from "./pages/StudyTimerPage.jsx";
import AISyllabusParser from "./pages/AISyllabusParser.jsx";

/**
 * StudyHubApp — owns all shared state and handlers, and renders the
 * sidebar + the current page + whichever modal is open.
 */
const StudyHubApp = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const USER_STORAGE_KEY = "studyhub_user";
  const [user, setUser] = useState(null);

  // Persists login status across page reloads. Strips pswd_hash since the
  // backend's login/signup responses include it and it must never sit in
  // localStorage.
  const applyUser = (nextUser) => {
    setUser(nextUser);
    if (typeof window === "undefined") return;
    if (!nextUser) {
      localStorage.removeItem(USER_STORAGE_KEY);
      return;
    }
    const { pswd_hash, ...safeUser } = nextUser;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(safeUser));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (!saved) return;
    try {
      setUser(JSON.parse(saved));
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);
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

  const handleManualAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    if (!authForm.email || !authForm.password || (authScreen === "signup" && !authForm.name)) {
      setAuthError("Please fill in all required fields.");
      return;
    }
    setAuthLoading(true);
    try {
      if (authScreen === "signup") {
        const response = await api.post("/user", {
          username: authForm.name,
          email: authForm.email,
          pswd_hash: authForm.password,
        });
        applyUser(response.data);
      } else {
        const response = await api.post("/user/login", {
          email: authForm.email,
          password: authForm.password,
        });
        applyUser(response.data);
      }
      setAuthForm({ name: "", email: "", password: "" });
      setAuthScreen("landing");
    } catch (error) {
      setAuthError(error.response?.data?.error || "Authentication failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
    
  };

  const decodeCredential = (credential) => {
    try {
      const payload = credential.split(".")[1];
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = window.atob(base64);
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
    applyUser({
      name: profile.name,
      email: profile.email,
      picture: profile.picture,
    });
    if (typeof window !== "undefined") {
      window.google?.accounts.id?.disableAutoSelect?.();
    }
  };

  const handleSignOut = () => {
    applyUser(null);
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
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);

  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const courseColorPalette = ["purple", "blue", "pink", "green", "orange"];
  const [editingCourseId, setEditingCourseId] = useState(null);
  const courseFormRef = useRef(null);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState(null);
  const [classForm, setClassForm] = useState({
    courseId: "",
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
    courseId: courses[0]?._id ?? "",
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
      name: "My Notebook",
      color: "blue",
      courseId: null,
      pages: [
        {
          id: "1",
          title: "Page 1",
          content: "",
          createdDate: new Date().toISOString(),
        },
      ],
    },
  ]);

  const [studySessions, setStudySessions] = useState([]);

  const [timerState, setTimerState] = useState({
    isRunning: false,
    seconds: 0,
    selectedCourse: null,
  });

  // Fetch this user's courses once logged in.
  useEffect(() => {
    if (!user?._id) {
      setCourses([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const response = await api.get(`/course/user/${user._id}`);
        if (!cancelled) setCourses(response.data);
      } catch (error) {
        console.error("Fetch courses error:", error.response?.data || error.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  // Complete the "return to course page after taking a quiz" flow.
  useEffect(() => {
    if (localStorage.getItem("returnToCourseLayout") === "true") {
      const saved = localStorage.getItem("selectedCourse");
      if (saved) {
        try {
          setSelectedCourse(JSON.parse(saved));
          setCurrentPage("courseLayout");
        } catch {
          // ignore malformed value
        }
      }
      localStorage.removeItem("returnToCourseLayout");
    }
  }, []);

  useEffect(() => {
    if (courses.length === 0) {
      setClassForm((prev) => ({ ...prev, courseId: "" }));
      setAssignmentForm((prev) => ({ ...prev, courseId: "" }));
      return;
    }
    setClassForm((prev) => {
      if (prev.courseId && courses.some((course) => course._id === prev.courseId)) {
        return prev;
      }
      return { ...prev, courseId: courses[0]._id };
    });
    setAssignmentForm((prev) => {
      if (prev.courseId && courses.some((course) => course._id === prev.courseId)) {
        return prev;
      }
      return { ...prev, courseId: courses[0]._id };
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
    assignments.length > 0 ? Math.round((completedAssignments / assignments.length) * 100) : 0;

  // ----- COURSE ACTIONS -----
  const handleEditCourse = (course) => {
    setEditingCourseId(course._id);
    courseFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onCancelEditCourse = () => setEditingCourseId(null);

  const onCourseSaved = (savedCourse) => {
    setCourses((prev) => {
      const exists = prev.some((c) => c._id === savedCourse._id);
      return exists ? prev.map((c) => (c._id === savedCourse._id ? savedCourse : c)) : [savedCourse, ...prev];
    });
    setEditingCourseId(null);
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await api.delete(`/course/${courseId}`);
    } catch (error) {
      console.error("Delete course error:", error.response?.data || error.message);
      alert("Failed to delete course.");
      return;
    }
    setCourses((prev) => prev.filter((course) => course._id !== courseId));
    setClasses((prev) => prev.filter((session) => session.courseId !== courseId));
    setAssignments((prev) => prev.filter((a) => a.courseId !== courseId));
    if (editingCourseId === courseId) {
      setEditingCourseId(null);
    }
  };

  const handleAddCourse = () => {
    setEditingCourseId(null);
    setCurrentPage("courses");
    setTimeout(() => {
      courseFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const openCourse = (course) => {
    setSelectedCourse(course);
    setCurrentPage("courseLayout");
    localStorage.setItem("selectedCourse", JSON.stringify(course));
  };

  // ----- CLASS SCHEDULE ACTIONS -----
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
        courseId: courses[0]._id,
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

  const handleAddClass = () => {
    openScheduleModal(true);
    setCurrentPage("calendar");
  };

  // ----- ASSIGNMENT ACTIONS -----
  const openAssignmentModal = () => {
    if (courses.length === 0) {
      alert("Add a course first.");
      return;
    }
    setEditingAssignmentId(null);
    setAssignmentForm(buildAssignmentForm());
    setIsAssignmentModalOpen(true);
  };

  const openAssignmentModalForCourse = (courseId) => {
    if (courses.length === 0) {
      alert("Add a course first.");
      return;
    }
    setEditingAssignmentId(null);
    setAssignmentForm({ ...buildAssignmentForm(), courseId });
    setIsAssignmentModalOpen(true);
  };

  const handleAddAssignment = () => openAssignmentModal();

  const closeAssignmentModal = () => {
    setIsAssignmentModalOpen(false);
    setEditingAssignmentId(null);
  };

  const handleAssignmentInputChange = (e) => {
    const { name, value } = e.target;
    setAssignmentForm((prev) => ({
      ...prev,
      [name]: name === "weight" ? Number(value) : value,
    }));
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

  const onEditAssignment = (a) => {
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
  };

  const onDeleteAssignment = (id) => setAssignments((list) => list.filter((x) => x.id !== id));

  const exportICS = () => {
    const pad = (n) => String(n).padStart(2, "0");
    const now = new Date();
    const y = now.getFullYear();
    const m = pad(now.getMonth() + 1);
    const d = pad(now.getDate());
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
        const course = courses.find((x) => x._id === c.courseId);
        const [sh, sm] = c.startTime.split(":");
        const [eh, em] = c.endTime.split(":");
        const dtstart = `${y}${m}${d}T${sh}${sm}00`;
        const dtend = `${y}${m}${d}T${eh}${em}00`;
        const rrule = `RRULE:FREQ=WEEKLY;BYDAY=${dayMap[c.dayOfWeek]}`;
        return [
          "BEGIN:VEVENT",
          `DTSTAMP:${dtstamp}`,
          `SUMMARY:${course?.course_code} ${c.type}`,
          `DESCRIPTION:${course?.course_name} - ${c.location}`,
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

  // ----- NAV -----
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
        return (
          <Dashboard
            courses={courses}
            assignments={assignments}
            classes={classes}
            upcomingAssignments={upcomingAssignments}
            overdueAssignments={overdueAssignments}
            totalStudyTime={totalStudyTime}
            setCurrentPage={setCurrentPage}
            handleAddCourse={handleAddCourse}
            handleAddAssignment={handleAddAssignment}
            handleAddClass={handleAddClass}
          />
        );
      case "courses":
        return (
          <CoursesPage
            courses={courses}
            user={user}
            courseColorPalette={courseColorPalette}
            editingCourseId={editingCourseId}
            courseFormRef={courseFormRef}
            onCourseSaved={onCourseSaved}
            onCancelEdit={onCancelEditCourse}
            onDeleteCourse={handleDeleteCourse}
            handleEditCourse={handleEditCourse}
            handleAddCourse={handleAddCourse}
            openCourse={openCourse}
          />
        );
      case "calendar":
        return (
          <CalendarPage
            classes={classes}
            courses={courses}
            holidays={holidays}
            holidayError={holidayError}
            holidaysLoading={holidaysLoading}
            calendarMonth={calendarMonth}
            calendarYear={calendarYear}
            setCalendarMonth={setCalendarMonth}
            setCalendarYear={setCalendarYear}
            exportICS={exportICS}
            openScheduleModal={openScheduleModal}
          />
        );
      case "assignments":
        return (
          <AssignmentsPage
            assignments={assignments}
            courses={courses}
            upcomingAssignments={upcomingAssignments}
            overdueAssignments={overdueAssignments}
            completedAssignments={completedAssignments}
            completionRate={completionRate}
            handleAddAssignment={handleAddAssignment}
            onEditAssignment={onEditAssignment}
            onDeleteAssignment={onDeleteAssignment}
          />
        );
      case "notes":
        return <NotesPage notebooks={notebooks} setNotebooks={setNotebooks} />;
      case "timer":
        return (
          <StudyTimerPage
            courses={courses}
            timerState={timerState}
            setTimerState={setTimerState}
            studySessions={studySessions}
            setStudySessions={setStudySessions}
          />
        );
      case "syllabus":
        return <AISyllabusParser courses={courses} setAssignments={setAssignments} />;
      case "courseLayout":
        return (
          <CourseLayout
            course={selectedCourse}
            assignments={assignments}
            onEditAssignment={onEditAssignment}
            onDeleteAssignment={onDeleteAssignment}
            onAddAssignmentForCourse={openAssignmentModalForCourse}
          />
        );
      default:
        return (
          <Dashboard
            courses={courses}
            assignments={assignments}
            classes={classes}
            upcomingAssignments={upcomingAssignments}
            overdueAssignments={overdueAssignments}
            totalStudyTime={totalStudyTime}
            setCurrentPage={setCurrentPage}
            handleAddCourse={handleAddCourse}
            handleAddAssignment={handleAddAssignment}
            handleAddClass={handleAddClass}
          />
        );
    }
  };

  if (!user) {
    if (authScreen === "landing") {
      return <LandingPage setAuthScreen={setAuthScreen} />;
    }
    return (
      <AuthPage
        authScreen={authScreen}
        setAuthScreen={setAuthScreen}
        authForm={authForm}
        handleAuthInput={handleAuthInput}
        authLoading={authLoading}
        handleManualAuth={handleManualAuth}
        googleReady={googleReady}
        isGoogleLoading={isGoogleLoading}
        googleButtonRef={googleButtonRef}
      />
    );
  }

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gray-50">
      <div className="flex">
        <Sidebar
          menuItems={menuItems}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          displayUser={displayUser}
          avatarInitial={avatarInitial}
        />

        {/* Main content */}
        <main className="flex-1 md:ml-64 w-full">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <UserBanner
              authError={authError}
              isGoogleConfigured={isGoogleConfigured}
              user={user}
              googleReady={googleReady}
              isGoogleLoading={isGoogleLoading}
              googleButtonRef={googleButtonRef}
              handleSignOut={handleSignOut}
            />
            {renderPage()}
          </div>
        </main>
      </div>

      {isScheduleModalOpen && (
        <ScheduleModal
          courses={courses}
          classes={classes}
          classForm={classForm}
          editingClassId={editingClassId}
          onInputChange={handleClassInputChange}
          onSubmit={handleClassFormSubmit}
          onClose={closeScheduleModal}
          onDeleteClass={handleDeleteClass}
          onStartEditClass={startEditClass}
        />
      )}
      {isAssignmentModalOpen && (
        <AssignmentModal
          courses={courses}
          assignmentForm={assignmentForm}
          editingAssignmentId={editingAssignmentId}
          onInputChange={handleAssignmentInputChange}
          onSubmit={handleAssignmentSubmit}
          onClose={closeAssignmentModal}
        />
      )}
    </div>
  );
};

export default StudyHubApp;
