import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

export default function AISyllabusParser({ courses, setAssignments }) {
  const [syllabusText, setSyllabusText] = useState("");
  const [parsedAssignments, setParsedAssignments] = useState([]);
  const [syllabusError, setSyllabusError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?._id ?? "");

  useEffect(() => {
    if (courses.length === 0) {
      setSelectedCourseId("");
      return;
    }
    setSelectedCourseId((prev) => (prev && courses.some((c) => c._id === prev) ? prev : courses[0]._id));
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
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Paste syllabus</h4>
              <p className="text-sm text-gray-600">Drop the relevant text or copy/paste from PDF.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">OpenAI parses</h4>
              <p className="text-sm text-gray-600">We call OpenAI to pull out assignments.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">3</div>
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
            {!import.meta.env.VITE_OPENAI_API_KEY && <span className="text-sm text-gray-500">Add VITE_OPENAI_API_KEY to enable this.</span>}
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
                <option key={course._id} value={course._id}>
                  {course.course_code}
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
                    {item.dueDate && <span className="px-2 py-1 rounded bg-blue-50 text-blue-600">Due {item.dueDate}</span>}
                    {item.priority && <span className="px-2 py-1 rounded bg-purple-50 text-purple-600">{item.priority} priority</span>}
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
}
