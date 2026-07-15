//This page display all user created practice quizzes. User should be able to click on each quiz and view their answer.
//They should also be able to feed the system a course material and generate a new practice quiz. For any quiz without a grade
//(not compelted), the system would navigate user to the quiz-layout page where all the ai-generated question would be displayed
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddButton from "../../assets/AddButton.png";
import api, { API_BASE } from "../../api/client.js";

export default function QuizView({ course }){
  //the state to describe the visibility of the quiz generating form//
  const [newQuiz, setNewQuizForm] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadQuizzes = async () => {
    try {
      const response = await api.get(`/quiz/course/${course._id}`);
      setQuizzes(response.data);
    } catch (error) {
      console.error("Fetch quizzes error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, [course._id]);

  //handle the event of user clicking quiz block(graded or not)//
  const openQuiz = (quiz) => {
    localStorage.setItem("returnToCourseLayout", "true"); //to return from quiz page to course page//
    localStorage.setItem("selectedCourse", JSON.stringify(course)); //flag the current course page//
    localStorage.setItem("courseLayoutTab", "3"); //flag the current view of in the course page//
    if (quiz.grade === null || quiz.grade === undefined) { //if quiz is not completed
      navigate(`/quiz/${quiz._id}`,{state:{displayType: "quiz"}}); //navigate to quiz page in quiz mode//
    }else{
      navigate(`/quiz/${quiz._id}`,{state:{displayType: "review"}}); //navigate to quiz page in review mode//
    }
  };

  //build a block for each quiz//
  return (
    <div className="p-1">
      <h2 className="text-2xl text-black font-bold mb-4">Your Quizzes</h2>
      <div className="space-y-4">
        <button  className="flex items-center gap-2 px-4 pb-2 mb-2 rounded
             bg-transparent text-blue-600
             hover:bg-gray-200
             focus:outline-none focus:ring-0
             active:outline-none active:ring-0
             border-none transition"
  style={{ outline: "none", boxShadow: "none" }}
          onClick={() => setNewQuizForm(true)}>
          <img src={AddButton} alt="Make Quiz" className="w-5 h-5" />
          Generate a New Quiz
        </button>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : quizzes.length === 0 ? (
          <p className="text-gray-500">No quizzes yet for this course.</p>
        ) : (
          quizzes.map((quiz) => (
            <div
              key={quiz._id}
              onClick={() => openQuiz(quiz)}
              className="bg-white shadow-md rounded-xl border border-gray-300 p-4 w-full mx-auto hover:shadow-lg transition cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {quiz.quiz_name}
              </h3>
              {quiz.date && (
                <p className="text-gray-600 mt-2">
                  Date: {new Date(quiz.date).toLocaleDateString()}
                </p>
              )}
              <p className="text-sm text-gray-700 font-semibold mt-2">
                {quiz.grade != null ? `Grade: ${quiz.grade}%` : "Not attempted yet"}
              </p>
            </div>
          ))
        )}
      </div>
      {newQuiz && (
        <NewQuizForm
          course={course}
          onClose={() => setNewQuizForm(false)}
          onCreated={() => {
            setNewQuizForm(false);
            loadQuizzes();
          }}
        />
      )}
    </div>
  );
}

//build a form for user to define a new quiz//
function NewQuizForm({ onClose, onCreated, course }){
  const [numQuestions, setNumQuestions] = useState(5);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //handle form submission//
  const generateQuiz = async (e) => {
    e.preventDefault();
    if(!file){
      alert("You did not select a file");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await callGenerateQuizAPI(file, numQuestions);
      if(!result.success){
        throw new Error(result.error || "Failed to generate quiz");
      }
      const generated = result.quiz;

      // Save the quiz, then each of its questions, to the real backend.
      const quizResponse = await api.post("/quiz", {
        course_id: course._id,
        quiz_name: generated.quiz_name || "Practice Quiz",
        date: new Date().toISOString(),
      });
      const quizId = quizResponse.data._id;

      const letterIndex = { a: 0, b: 1, c: 2, d: 3 };
      for (const q of generated.questions || []) {
        const idx = letterIndex[(q.correct_answer || "").toLowerCase().replace(/[^a-d]/g, "")] ?? 0;
        await api.post("/question", {
          quiz_id: quizId,
          questions: q.question,
          options: q.options,
          answer: q.options?.[idx] ?? q.options?.[0],
        });
      }

      onCreated();
    } catch (err) {
      console.error("Generate quiz error:", err);
      setError(err.message || "Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  };

  return(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md">
        <form onSubmit={generateQuiz}>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Make a New Quiz</h2>
          <p className="text-l font-semibold mb-4 text-black">Reference File (PDF):</p>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} className="w-full text-black bg-white border border-gray-300 rounded p-2 appearance-none file:bg-blue-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 hover:file:bg-blue-700 mb-4"></input>
          <p className="text-l font-semibold mb-2 text-black">Number of Question: {numQuestions}</p>
          <div className="mb-4">
            <input type="range" min="1" max="10" value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(numQuestions - 1) * 11.11}%, #e5e7eb ${(numQuestions - 1) * 11.11}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>1</span>
              <span>10</span>
            </div>
          </div>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 transition"> Cancel </button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-70"> {loading ? "Generating..." : "Generate"} </button>
          </div>
        </form>
      </div>
    </div>
  );
}

async function callGenerateQuizAPI(file , numQuestions){
  //insert argument to formData
  const formData = new FormData();
  formData.append("file", file);
  formData.append("numQ", numQuestions);

  //make HTTP request with quiz arguments//
  try {
    const res = await fetch(`${API_BASE}/generateQuiz`, {
      method: "POST",
      body: formData,
    });

    return await res.json(); //return result//
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}
