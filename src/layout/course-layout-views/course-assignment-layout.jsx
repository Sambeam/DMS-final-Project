import React, {useEffect,useState} from "react";
 
export default function AssignmentView({courseID}){
    const [assignments, setAssignments] = useState([]);

    //fetch set of assignments from database using courseID//
    /*useEffect(()=>{
        fetch(`http://localhost:3000/api/assignments?course_id=${courseID}`)
        .then((res) => res.json())
        .then((data) => setAssignments(data))
        .catch((err) => console.error(err))
    }, [courseID]);*/

    useEffect(() => {
        const mockAssignment = [
            {
                cw_id:1,
                user_id:1,
                course_id:1,
                cw_title: "Build Database",
                cw_type: "assignment",
                description: "build a database for assignment 2",
                due_date: "2025-12-01",
                grade: null,
            },
            {
                cw_id:2,
                user_id:1,
                course_id:1,
                cw_title: "populate database",
                cw_type: "assignment",
                description: "populate the database for assignmnet 2",
                due_date: "2025-12-10",
                grade: null,
            },
        ];
        setAssignments(mockAssignment);
    }, []);

    return(
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Assignments</h2>
                <div className="flex flex-col gap-4">
                {assignments.map((assignment) => (
                    <div key={assignment.cw_id} className="bg-white shadow-md rounded-xl border border-gray-300 p-4 w-full hover:shadow-lg transition">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {assignment.cw_title}
                        </h3>
                        <p className="text-gray-600 mt-2">{assignment.description}</p>
                        <p className="text-sm text-gray-500 mt-3">
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}