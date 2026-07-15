import React, {useEffect,useState} from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/client.js";

function Quiz (){
    const location = useLocation();
    const { quizId } = useParams();
    const [quiz, setQuiz] = useState(null);
    const [quizQuestion, setQuizQ] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const displayType = location.state?.displayType ?? "quiz"; //quiz or review//
    const navigate = useNavigate();

    //load the quiz and its questions from the backend//
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [quizResponse, questionsResponse] = await Promise.all([
                    api.get(`/quiz/id/${quizId}`),
                    api.get(`/question/quiz/${quizId}`),
                ]);
                if (cancelled) return;
                setQuiz(quizResponse.data);
                setQuizQ(questionsResponse.data);
            } catch (error) {
                console.error("Fetch quiz error:", error.response?.data || error.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [quizId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(quizQuestion.some(q => !q.user_answer)){
            alert("You haven't answer all the questions");
            return;
        }

        const correctCount = quizQuestion.filter((q) => q.user_answer === q.answer).length;
        const grade = quizQuestion.length > 0 ? (correctCount / quizQuestion.length) * 100 : 0;

        setSubmitting(true);
        try {
            await api.put(`/quiz/${quizId}`, {
                course_id: quiz.course_id,
                quiz_name: quiz.quiz_name,
                date: quiz.date,
                grade,
            });
            await Promise.all(
                quizQuestion.map((q) =>
                    api.put(`/question/${q._id}`, {
                        quiz_id: q.quiz_id,
                        questions: q.questions,
                        options: q.options,
                        answer: q.answer,
                        user_answer: q.user_answer,
                    })
                )
            );
        } catch (error) {
            console.error("Save quiz result error:", error.response?.data || error.message);
            alert("Failed to save your quiz result.");
            setSubmitting(false);
            return;
        }

        //flag to return to the course page's quiz tab//
        localStorage.setItem("returnToCourseLayout", "true");
        localStorage.setItem("courseLayoutTab", "3");

        //navigate back to main app//
        navigate("/");
    };

    const handleAnswerChange = (questionId, answer) => {
        setQuizQ(prev => prev.map(q =>
            q._id === questionId
                ? { ...q, user_answer: answer }
                : q
        ));
    };

    let content;
    if(loading){
        content = <p className="text-center text-gray-500">Loading quiz...</p>;
    } else if(quizQuestion.length > 0){
        if (displayType === "review"){
            content = <ReviewComponent quizQuestion={quizQuestion} />;
        }else{
            content = <QuizComponent quizQuestion={quizQuestion} handleSubmit={handleSubmit} handleAnswerChange={handleAnswerChange} submitting={submitting} />
        }
    }else{
        content = <NoQuestion />
    }

    return(
        <div className="w-screen bg-gray-300 flex flex-col items-center justify-center min-h-screen p-6">
            {content}
        </div>
    );
}

function QuizComponent({ quizQuestion, handleSubmit, handleAnswerChange, submitting }) {

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl flex flex-col items-center">
            {quizQuestion.map((question, index) => (
                <div
                    key={question._id}
                    className="w-[80%] bg-white shadow-md rounded-xl border border-gray-300 p-6 mb-6"
                >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Q{index + 1}: {question.questions}
                    </h3>
                    <div className="space-y-2">
                        {question.options.map((value, optionIdx) => {
                            const label = String.fromCharCode(65 + optionIdx); // A, B, C, D
                            return (
                                <label
                                    key={label}
                                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                    <span className="text-gray-800 pl-2 pr-5">{label}</span>
                                    <input
                                        type="radio"
                                        name={`question-${question._id}`}
                                        value={value}
                                        checked={question.user_answer === value}
                                        onChange={() => handleAnswerChange(question._id, value)}
                                        className="appearance-none h-4 w-4 mr-3 rounded-full border border-gray-400 checked:bg-blue-600 checked:border-black-800"
                                    />
                                    <span className="text-gray-700">{value}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            ))}
            <button type="submit" disabled={submitting}
            className="flex flex-col items-center bg-blue-800 w-[80%] hover:bg-blue-500 disabled:opacity-70 text-white py-3 rounded-lg">
                {submitting ? "Submitting..." : "Submit"}
            </button>
        </form>
    );
}

function ReviewComponent({ quizQuestion }) {
    return (
        <div className="w-full max-w-2xl flex flex-col items-center">
            {quizQuestion.map((question, index) => (
                <div
                    key={question._id}
                    className="w-[80%] bg-white shadow-md rounded-xl border border-gray-300 p-6 mb-6"
                >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Q{index + 1}: {question.questions}
                    </h3>

                    <div className="space-y-2">
                        {question.options.map((value) => {
                            let bg_color = "";
                            if(question.answer === value){
                                bg_color = "bg-green-500";
                            }else if(value === question.user_answer){
                                bg_color = "bg-red-500";
                            }else{
                                bg_color = "bg-gray-200";
                            }

                            return(
                                <label
                                key={value}
                                className={`${bg_color} flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer`}>
                                <span className="text-gray-700">{value}</span>
                            </label>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}



function NoQuestion(){
    return(
        <p className="text-center text-gray-500">No questions found for this quiz.</p>
    );
}

export default Quiz;
