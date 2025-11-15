import React, {useEffect,useState} from "react";

function Quiz ({ quizID }){
    const [quizQuestion, setQuizQ] = useState([]);
    const questions = [
        {
            question_id: "1",
            quiz_id: "1",
            question: "1+1",
            options: [1,2,3,4],
            answer: "2",
            user_answer: ""
        },
        {
            question_id: "2",
            quiz_id: "1",
            question: "1+2",
            options: [1,2,3,4],
            answer: "3",
            user_answer: ""
        },
        {
            question_id: "3",
            quiz_id: "2",
            question: "1+3",
            options: [1,2,3,4],
            answer: "4",
            user_answer: ""
        }
    ];
    //question that belong to the quiz//
    useEffect(() => {
        const selectedQuestion = [];
        for (const q of questions) {
            if(q.quiz_id === quizID){
                selectedQuestion.push(q);
            }
        }
        setQuizQ(selectedQuestion);
    }, [quizID]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle quiz submission
        console.log("Quiz submitted:", quizQuestion);
    };

    const handleAnswerChange = (questionId, answer) => {
        setQuizQ(prev => prev.map(q => 
            q.question_id === questionId 
                ? { ...q, user_answer: answer }
                : q
        ));
    };

    return(
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
            <form onSubmit={handleSubmit} className="w-full max-w-2xl">
                {quizQuestion.length > 0 ? (
                    quizQuestion.map((question, index) => (
                        <div key={question.question_id} className="bg-white shadow-md rounded-xl border border-gray-300 p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Question {index + 1}: {question.question}
                            </h3>
                            <div className="space-y-2">
                                {question.options.map((option, optIndex) => (
                                    <label key={optIndex} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`question-${question.question_id}`}
                                            value={option}
                                            checked={question.user_answer === String(option)}
                                            onChange={() => handleAnswerChange(question.question_id, String(option))}
                                            className="mr-3"
                                        />
                                        <span className="text-gray-700">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">No questions found for this quiz.</p>
                )}
                {quizQuestion.length > 0 && (
                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition mt-6"
                    >
                        Submit Quiz
                    </button>
                )}
            </form>
        </div>
    );
}

export default Quiz;