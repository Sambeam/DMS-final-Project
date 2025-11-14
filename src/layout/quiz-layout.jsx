import React, {useEffect,useState} from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

function Quiz (){
    const location = useLocation();
    const { quizId } = useParams();
    const [quizQuestion, setQuizQ] = useState([]);
    const [displayType, setDisplayType] = useState("quiz"); //quiz or review//
    const navigate = useNavigate();
    const questions = [
        {
            question_id: "1",
            quiz_id: "3",
            question: "1+1",
            options: {A:1, B:2, C:3, D:4},
            answer: "B",
            user_answer: "B"
        },
        {
            question_id: "2",
            quiz_id: "3",
            question: "1+2",
            options: {A:1, B:2, C:3, D:4},
            answer: "C",
            user_answer: "B"
        },
        {
            question_id: "3",
            quiz_id: "2",
            question: "1+3",
            options: {A:1, B:2, C:3, D:4},
            answer: "D",
            user_answer: "B"
        },
        {
            question_id: "4",
            quiz_id: "4",
            question: "5+1",
            options: {A:1, B:6, C:3, D:4},
            answer: "B",
            user_answer: ""
        },
        {
            question_id: "5",
            quiz_id: "4",
            question: "6+2",
            options: {A:1, B:6, C:8, D:4},
            answer: "C",
            user_answer: ""
        }
    ];

    //define display type(quiz or review)//
    useEffect(() => {
        setDisplayType(location.state?.displayType);
    });  
    
    //takes question that belong to the quiz//
    useEffect(() => {
        const selectedQuestion = [];
        for (const q of questions) {
            if(String(q.quiz_id) === String(quizId)){
                selectedQuestion.push(q);
            }
        }
        setQuizQ(selectedQuestion);
    }, [quizId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle quiz submission
        const max = quizQuestion.length;
        let grade = 0;
        if(quizQuestion.some(q => q.user_answer === "")){
            alert("You haven't answer all the questions");
            return;
        }else{
            for (const q of questions){
                if(q.user_answer === q.answer){
                    grade++;
                }
            }
        }
        grade = grade/max * 100;
        //update user quiz grade in database
        const quizzes = JSON.parse(localStorage.getItem("quizes")) || [];
        const new_quizzes = quizzes.map(q => 
            q.quiz_id === quizId 
            ? { ...q, grade: grade }
            : q
        );

        localStorage.setItem("quizes",JSON.stringify(new_quizzes));
        localStorage.setItem("questions",JSON.stringify(quizQuestion))
        localStorage.setItem("returnToCourseLayout", "true");
        
        //navigate back to main app//
        navigate("/");
    };

    const handleAnswerChange = (questionId, answer) => {
        setQuizQ(prev => prev.map(q => 
            q.question_id === questionId 
                ? { ...q, user_answer: answer }
                : q
        ));
    };

    let content;
    if(quizQuestion.length > 0){
        if (quizQuestion.length > 0 && displayType == "review"){
            content = <ReviewComponent quizQuestion={quizQuestion} handleSubmit={handleSubmit} handleAnswerChange={handleAnswerChange}/>;
        }else if(displayType == "quiz"){
            content = <QuizComponent quizQuestion={quizQuestion} handleSubmit={handleSubmit} handleAnswerChange={handleAnswerChange}/>
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

function QuizComponent({ quizQuestion, handleSubmit, handleAnswerChange }) {

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl flex flex-col items-center">
            {quizQuestion.map((question, index) => (
                <div 
                    key={question.question_id} 
                    className="w-[80%] bg-white shadow-md rounded-xl border border-gray-300 p-6 mb-6"
                >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Q{index + 1}: {question.question}
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(question.options).map(([label,value]) => (
                            <label 
                                key={label} 
                                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                                <span className="text-gray-800 pl-2 pr-5">{label}</span>
                                <input
                                    type="radio"
                                    name={`question-${question.question_id}`}
                                    value={label}
                                    checked={question.user_answer === String(label)}
                                    onChange={() => handleAnswerChange(question.question_id, String(label))}
                                    className="appearance-none h-4 w-4 mr-3 rounded-full border border-gray-400 checked:bg-blue-600 checked:border-black-800"
                                />
                                <span className="text-gray-700">{value}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}
            <button type="submit" onClick={(e) => handleSubmit(e)}
            className="flex flex-col items-center bg-blue-800 w-[80%] hover:bg-blue-500">Submit</button>
        </form>
    );
}

function ReviewComponent({ quizQuestion, handleSubmit, handleAnswerChange }) {
    return (
        <>
            {quizQuestion.map((question, index) => (
                <div 
                    key={question.question_id} 
                    className="w-[80%] bg-white shadow-md rounded-xl border border-gray-300 p-6 mb-6"
                >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Q{index + 1}: {question.question}
                    </h3>

                    <div className="space-y-2">
                        {Object.entries(question.options).map(([label,value]) => {
                            let bg_color = "";
                            if(question.answer == label){
                                bg_color = "bg-green-500";
                            }else if(label == question.user_answer){
                                bg_color = "bg-red-500";
                            }else{
                                bg_color = "bg-gray-200";
                            }
                            
                            return(
                                <label 
                                key={label} 
                                className={`${bg_color} flex items-center p-3 border border-gray-200 rounded-lg  cursor-pointer`}>
                                <p className="mr-3 text-gray-700">
                                    {label}: 
                                </p>
                                <span className="text-gray-700 ${bg_color}">{value}</span>
                            </label>
                            );
                        })}
                    </div>
                </div>
            ))}
        </>
    );
}



function NoQuestion(){
    return(
        <p className="text-center text-gray-500">No questions found for this quiz.</p>
    );
}

export default Quiz;