import React from "react";
import { Edit, Trash2 } from "lucide-react";
import AddButton from "../../assets/AddButton.png";

export default function AssignmentView({ course, assignments, onEditAssignment, onDeleteAssignment, onAddAssignmentForCourse }) {
    const courseAssignments = assignments.filter((a) => a.courseId === course._id);

    return(
        <div className="p-6">
            <h2 className="text-2xl text-black font-bold mb-4">Assignments</h2>
            <button  className="flex items-center gap-2 px-4 pb-2 mb-2 rounded
             bg-transparent text-blue-600
             hover:bg-gray-200
             focus:outline-none focus:ring-0
             active:outline-none active:ring-0
             border-none transition"
                style={{ outline: "none", boxShadow: "none" }}
                onClick={() => onAddAssignmentForCourse(course._id)}>
                <img src={AddButton} alt="Add Assignment" className="w-5 h-5" />
                Add an Assignment
            </button>
            {courseAssignments.length === 0 ? (
                <p className="text-gray-500">No assignments for this course yet.</p>
            ) : (
                <div className="flex flex-col gap-4">
                {courseAssignments.map((assignment) => (
                    <div key={assignment.id} className="bg-white shadow-md rounded-xl border border-gray-300 p-4 w-full hover:shadow-lg transition flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                {assignment.title}
                            </h3>
                            <p className="text-gray-600 mt-2">{assignment.description || "No description provided."}</p>
                            <p className="text-sm text-gray-500 mt-3">
                                Due: {new Date(assignment.dueDate).toLocaleDateString()} · {assignment.weight}% of grade
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => onEditAssignment(assignment)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Edit className="w-4 h-4 text-blue-500" />
                            </button>
                            <button onClick={() => onDeleteAssignment(assignment.id)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            )}
        </div>
    );
}
