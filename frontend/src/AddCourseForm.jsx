import React, { useState, useEffect, useRef, memo } from "react";
import axios from "axios";


function AddCourseForm({user,courseColorPalette, editingCourseId, setCourses, resetCourseForm}){
      const [courseForm, setCourseForm] = useState({
        code: "",
        name: "",
        instructor: "",
        credits: "3",
        semester: "Fall 2024",
        description: "",
        color: courseColorPalette[0],
      });

    const handleCourseInputChange = (e) => {
    const { name, value } = e.target;
    setCourseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCourseSubmit = async(e) => {
      e.preventDefault();
      if (!courseForm.code.trim() || !courseForm.name.trim()) {
        alert("Course code and name are required.");
        return;
      }
      const payload = {
        user_id: user._id,
        code: courseForm.code.trim(),
        course_name: courseForm.name.trim(),
        instructor: courseForm.instructor.trim() || "TBD",
        credit: Number(courseForm.credits) || 0,
        semester: courseForm.semester.trim() || "TBD",
        description: courseForm.description.trim(),
        color: courseForm.color
      };
      try{
        const response = await axios.post("http://localhost:3000/api/course",payload);
        const savedCourse = response.data;
        //update list of course in the page//
        setCourses((prev)=>[savedCourse,...prev]);
        resetCourseForm();
        alert("course saved");
      }catch(error){
        console.error("Add course error:", error.response?.data || error.message);
        alert("Failed to save course.");
      }
      setCourses((prev) => (editingCourseId ? prev.map((c) => (c.id === editingCourseId ? payload : c)) : [payload, ...prev]));
      resetCourseForm();
    };
    return(
        <form onSubmit={handleCourseSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                <input
                  name="code"
                  value={courseForm.code}
                  onChange={handleCourseInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="e.g. CS101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                <input
                  name="name"
                  value={courseForm.name}
                  onChange={handleCourseInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Introduction to CS"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                <input
                  name="instructor"
                  value={courseForm.instructor}
                  onChange={handleCourseInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Dr. Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                <input
                  type="number"
                  min="0"
                  name="credit"
                  value={courseForm.credits}
                  onChange={handleCourseInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <input
                  name="semester"
                  value={courseForm.semester}
                  onChange={handleCourseInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Fall 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
                <select
                  name="color"
                  value={courseForm.color}
                  onChange={handleCourseInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  {courseColorPalette.map((color) => (
                    <option key={color} value={color}>
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={courseForm.description}
                onChange={handleCourseInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                rows="3"
                placeholder="Brief summary of the course"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              {editingCourseId && (
                <button
                  type="button"
                  onClick={() => handleDeleteCourse(editingCourseId)}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold"
              >
                {editingCourseId ? "Save Changes" : "Add Course"}
              </button>
            </div>
          </form>
    );
}

//stop rendering//
export default memo(AddCourseForm);