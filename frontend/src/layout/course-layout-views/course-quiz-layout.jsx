//This page display all user created practice quizzes. User should be able to click on each quiz and view their answer.
//They should also be able to feed the system a course material and generate a new practice quiz. For any quiz without a grade
//(not compelted), the system would navigate user to the quiz-layout page where all the ai-generated question would be displayed
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddButton from "../../assets/AddButton.png";
import { useEffect } from "react";


export default function QuizView({ course }){
  //the state to describe the visibility of the quiz generating form//
  const [newQuiz, setNewQuizForm] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();
  //test entries for quizzes//
  useEffect(() => {
    let allQuizzes = []
    const storedQuizzes = localStorage.getItem("quizes");
    allQuizzes = JSON.parse(storedQuizzes);
    let courseQuizzes = allQuizzes.filter((q)=> String(q.course_id) == String(course.course_id));
    setQuizzes(courseQuizzes);
  },[course]);

  //handle the event of user clicking quiz block(graded or not)//
  const openQuiz = (quiz) => {
    localStorage.setItem("returnToCourseLayout", "true"); //to return from quiz page to course page//
    localStorage.setItem("selectedCourse", JSON.stringify(course)); //flag the current course page//
    localStorage.setItem("courseLayoutTab", "3"); //flag the current view of in the course page//
    if (quiz && quiz.grade == "") { //if quiz is not completed
      navigate(`/quiz/${quiz.quiz_id}`,{state:{displayType: "quiz"}}); //navigate to quiz page in quiz mode//
    }else{
      navigate(`/quiz/${quiz.quiz_id}`,{state:{displayType: "review"}}); //navigate to quiz page in review mode//
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
        {quizzes.map((quiz) => (
          <div
            key={quiz.quiz_id}
            onClick={() => openQuiz(quiz)}
            className="bg-white shadow-md rounded-xl border border-gray-300 p-4 w-full mx-auto hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold text-gray-800">
              {quiz.quiz_name}
            </h3>
            <p className="text-gray-600 mt-2">
              Date: {new Date(quiz.date).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-700 font-semibold mt-2">
              Grade: {quiz.grade}%
            </p>
          </div>
        ))}
      </div>
      {newQuiz && <NewQuizForm onClose={() => setNewQuizForm(false)} />}
    </div>
  );
}

//build a form for user to define a new quiz//
function NewQuizForm({ onClose }){
  const [numQuestions, setNumQuestions] = useState(0);
  const [file, setFile] = useState(null);

  //handle form submission//
  const generateQuiz = async (e) => {
    e.preventDefault();
    if(!file){ 
      e.preventDefault(); 
      alert("You did not select a file");
      onClose(); 
    }else{ 
      setLoading(true);
      const quiz = await callGenerateQuizAPI(file, numQuestions); //passes arguments of new quiz//
      if(quiz.success){
        setQuiz(quiz); 
      }else{
        alert("Failed to generate quiz: " + quiz.error);
      }
      setLoading(false);
    }
  };
  
  return(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md">
        <form onSubmit={generateQuiz}>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Make a New Quiz</h2>
          <p className="text-l font-semibold mb-4 text-black">Reference File:</p>
          <input type="file" onChange={(e) => setFile(e.target.value)} className="w-full text-black bg-white border border-gray-300 rounded p-2 appearance-none file:bg-blue-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 hover:file:bg-blue-700 mb-4"></input>
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
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 transition"> Cancel </button>
            <button type="submit" className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"> Generate </button>
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
    const res = await fetch(`${import.meta.env.VITE_API_URL}/generateQuiz`, {
      method: "POST",
      body: formData,
    });

    return await res.json(); //return result//
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}