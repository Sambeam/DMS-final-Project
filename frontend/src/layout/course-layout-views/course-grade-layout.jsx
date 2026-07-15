//This page display all user defined course work(could be quiz, exam, assignment and project, anything that would have a grade)
//and their grades. User should be able to add and remove course work, as well as setting their weight. A logic of weight setting
//should be made to ensure it is done logically (does not exceed 100%)
import React, {useEffect,useState} from "react";
import { Trash2 } from "lucide-react";
import AddButton from "../../assets/AddButton.png";
import api from "../../api/client.js";

export default function GradeView({course}){
  const [course_work, setCW] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCW, setNewCW] = useState(false);

  const loadCourseWork = async () => {
    try {
      const response = await api.get(`/coursework/course/${course._id}`);
      setCW(response.data);
    } catch (error) {
      console.error("Fetch coursework error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseWork();
  }, [course._id]);

  const deleteCourseWork = async (id) => {
    try {
      await api.delete(`/coursework/${id}`);
      setCW((prev) => prev.filter((cw) => cw._id !== id));
    } catch (error) {
      console.error("Delete coursework error:", error.response?.data || error.message);
      alert("Failed to delete course work.");
    }
  };

  const weighted_grade = course_work.reduce(
    (acc, cw) => acc + (cw.cw_grade != null ? cw.cw_grade * (cw.cw_weight / 100) : 0),
    0
  );
  const totalWeight = course_work.reduce((acc, cw) => acc + cw.cw_weight, 0);

  //build a block for each course_work, and the display of the average(later become the accurate calculation of the course GPA)
  return (
    <div className="p-2">
      <h2 className="text-2xl text-gray-900 font-bold mb-4">Grades</h2>
      <div className="divide-y divide-gray-300">
      <button  className="flex items-center gap-2 px-4 pb-2 mb-2 rounded
             bg-transparent text-blue-600
             hover:bg-gray-200
             focus:outline-none focus:ring-0
             active:outline-none active:ring-0
             border-none transition"
            style={{ outline: "none", boxShadow: "none" }}
            onClick={() => setNewCW(true)}>
          <img src={AddButton} alt="Make Quiz" className="w-5 h-5" />
          Add a Course Work
        </button>
        {loading ? (
          <p className="text-gray-500 py-3">Loading...</p>
        ) : course_work.length === 0 ? (
          <p className="text-gray-500 py-3">No course work added yet.</p>
        ) : (
          course_work.map((g) => (
            <div key={g._id} className="flex justify-between items-center py-3">
              <span className="text-gray-800 font-medium">{g.cw_name}</span>
              <div className="flex items-center gap-3">
                <span className="text-gray-700 font-semibold">
                  {g.cw_grade != null ? `${g.cw_grade}%` : "Ungraded"} · {g.cw_weight}% weight
                </span>
                <button onClick={() => deleteCourseWork(g._id)} className="p-1 hover:bg-gray-100 rounded">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))
        )}
        <div className="flex justify-between text-gray-800 font-semibold border-t border-gray-300 pt-2 mt-2">
            <span className="text-gray-800 font-medium">Total ({totalWeight}% of grade weighted): </span>
            <span className="text-gray-700 font-semibold">{weighted_grade.toFixed(1)}%</span>
        </div>
      </div>
      {newCW && (
        <NewCWForm
          course={course}
          totalWeight={totalWeight}
          onClose={() => setNewCW(false)}
          onCreated={(created) => {
            setCW((prev) => [...prev, created]);
            setNewCW(false);
          }}
        />
      )}
    </div>
  );
}

function NewCWForm({ onClose, onCreated, course, totalWeight }){
  const [weight, setWeight] = useState(0);
  const [grade, setGrade] = useState("");
  const [cw_name, setCWName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const addCourseWork = async (e) => {
    e.preventDefault();
    if(cw_name.trim() === ""){
      alert("Please give the course work a name.");
      return;
    }
    if(weight <= 0){
      alert("Please set a weight greater than 0%.");
      return;
    }
    if(totalWeight + weight > 100){
      alert(`That would bring the total weight to ${totalWeight + weight}%, which is over 100%.`);
      return;
    }

    const payload = {
      course_id: course._id,
      cw_name: cw_name.trim(),
      cw_grade: grade === "" ? null : Number(grade),
      cw_weight: weight,
    };

    setSubmitting(true);
    try {
      const response = await api.post("/coursework", payload);
      onCreated(response.data);
    } catch (error) {
      console.error("Add coursework error:", error.response?.data || error.message);
      alert("Failed to save course work.");
    } finally {
      setSubmitting(false);
    }
  };

  return(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md">
        <form onSubmit={addCourseWork}>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Add a Course Work</h2>
          <p className="text-l font-semibold mb-4 text-black">Course Work Title:</p>
          <input type="text" value={cw_name} onChange={(e) => setCWName(e.target.value)} className="w-full text-black bg-white border border-gray-300 rounded p-2 mb-4"></input>
          <p className="text-l font-semibold mb-2 text-black">Weight (%):</p>
          <div className="mb-4">
            <input type="number" min="1" max="100" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full bg-white text-gray-900 border border-gray-300 rounded p-2"/>
          </div>
          <p className="text-l font-semibold mb-2 text-black">Grade (%, optional if not graded yet):</p>
          <div className="mb-4">
            <input type="number" min="0" max="100" value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full bg-white text-gray-900 border border-gray-300 rounded p-2"/>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 transition"> Cancel </button>
            <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-70"> {submitting ? "Saving..." : "Create"} </button>
          </div>
        </form>
      </div>
    </div>
  );
}
