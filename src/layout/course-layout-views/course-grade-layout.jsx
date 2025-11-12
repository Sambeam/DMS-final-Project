import React, {useEffect,useState} from "react";



export default function GradeView(){
    const grades = [
        { id: 1, cw_title: "Build Database", grade: 87 },
        { id: 2, cw_title: "Populate Database", grade: 92 },
        { id: 3, cw_title: "ER Diagram Design", grade: 75 },
    ];

    let total = 0;
    for(let i = 0 ; i < grades.length;i++){
        total += grades[i].grade;
    }
    total = total/grades.length;

  return (
    <div className="p-6">
      <h2 className="text-2xl text-black-500 font-bold mb-4">Grades</h2>
      <div className="divide-y divide-gray-300">
        {grades.map((g) => (
          <div key={g.id} className="flex justify-between items-center py-3">
            <span className="text-gray-800 font-medium">{g.cw_title}</span>
            <span className="text-gray-700 font-semibold">{g.grade}%</span>
          </div>
        ))}
        <div className="flex justify-between text-gray-800 font-semibold border-t border-gray-300 pt-2 mt-2">
            <span className="text-gray-800 font-medium">Total</span>
            <span className="text-gray-700 font-semibold">{total.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}