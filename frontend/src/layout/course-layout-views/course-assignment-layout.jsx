import React, {useEffect,useState} from "react";
import AddButton from "../../assets/AddButton.png";

 
export default function AssignmentView({course}){
    const [assignments, setAssignments] = useState([]); //state to control assignment in the page//
    const [newAssignment, setNewAssignmnet] = useState(false); //visibility of the new assignment form//

    //build a block for each assignment//
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
                onClick={() => setNewAssignmnet(true)}> 
                <img src={AddButton} alt="Make Quiz" className="w-5 h-5" />
                Add an Assignment
            </button>
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
            {newAssignment && <NewCWForm assignments={assignments} course={course} onClose={() => setNewAssignmnet(false)}/>}
        </div>
        
    );
}

function NewCWForm({ onClose, assignments, course}){
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [due_date_time, setDateTime] = useState("");
    const [makeEvent, setMakeEvent] = useState(false);
    const [currentDateTime, setCurrentDateTime] = useState("");
    const user_id = 0; //pass user later//

    const addAssignment= (e) => {
        if(name == ""){
            alert("please give the assignment a name");
            return;
        }
        if(!due_date_time){
            alert("please set the due date of the assingment");
            return;
        }
        
        const newAssignment={
            assignment_id: Date.now() + Math.random(),
            course_id: course.course_id,
            description: description,
            due_date: due_date_time
        };
        //pass the newAssignment obj to database

        if(makeEvent){
            const newEvent={
                event_id: Date.now() + Math.random(),
                user_id: user_id,
                event_name: ("(Assignment)"+name),
                description: description,
                event_start_time: due_date_time,
                event_end_time: due_date_time,
            };
            //pass to database//
        }

    };

    useEffect(() =>{
        const now = new Date();
        const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        setCurrentDateTime(local);
    },[]);

  return(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md">
        <form onSubmit={(e) => addAssignment(e)}>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Add a New Assignment</h2>
            <p className="text-l font-semibold mb-4 text-black">Assignment Title:</p>
            <input type="text" onChange={(e) => setName(e.target.value)} className="border-gray-500 w-full text-black bg-white border border-gray-300 rounded p-2 appearance-none file:bg-blue-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 hover:file:bg-blue-700 mb-4"></input>
            <p className="text-l font-semibold mb-2 text-black">Description / Note:</p>
            <div className="mb-4">
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full h-40 border border-gray-500 bg-white text-gray-900 p-3 rounded resize-none overflow-y-auto align-top text-left">
                </textarea>
            </div>
          <p className="text-l font-semibold mb-2 text-black">Due Date:</p>
          <div className="mb-4">
            <input type="datetime-local" min={currentDateTime} value={due_date_time} onChange={(e) => setDateTime(e.target.value)} className="border border-gray-500 bg-white text-gray-900"/>
          </div>
        <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox"  checked={makeEvent} onChange={(e) => setMakeEvent(e.target.checked)} className="accent-blue-600 text-gray-400 w-4 h-4"/>
            <span className="text-gray-800">Add a reminder in your calendar</span> 
        </label>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 transition"> Cancel </button>
            <button type="submit" className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"> Create </button>
          </div>
        </form>
      </div>
    </div>
  );
}