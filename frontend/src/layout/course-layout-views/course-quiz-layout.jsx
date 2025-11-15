import React, {useEffect,useState} from "react";
import AddButton from "../../assets/AddButton.png";

export default function QuizView(){
  const [newQuiz, setNewQuizForm] = useState(false);
    const quizzes = [
    {
      quiz_id: 1,
      quiz_name: "Database Fundamentals Quiz",
      date: "2025-11-25",
      grade: 88,
    },
    {
      quiz_id: 2,
      quiz_name: "SQL Query Practice",
      date: "2025-12-02",
      grade: 94,
    },
    {
      quiz_id: 3,
      quiz_name: "Normalization and Keys",
      date: "2025-12-10",
      grade: 79,
    },
  ];

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

function NewQuizForm({ onClose }){
  const [numQuestions, setNumQuestions] = useState(0);
  const [file, setFile] = useState(null);

  const generateQuiz = async (e) => {
    e.preventDefault();
    if(!file){
      e.preventDefault(); 
      alert("You did not select a file");
      onClose(); 
    }else{
      setLoading(true);
      const quiz = await generateQuiz(file,numQuestions);
      if(quiz.success){
        setQuiz(data.quiz);
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

async function generateQuiz(file , numQuestions){
  const formData = new FormData();
  formData.append("file", file);
  formData.append("numQ", numQuestions);

  try {
    const res = await fetch("http://localhost:3000/generateQuiz", {
      method: "POST",
      body: formData,
    });

    return await res.json(); 
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}