import React, {useEffect,useState} from "react";



export default function QuizView(){
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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Quizzes</h2>
      <div className="space-y-4">
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
    </div>
  );
}