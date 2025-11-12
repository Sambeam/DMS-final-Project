import React, {useEffect,useState} from "react";
import { useParams } from "react-router-dom";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Dumpster from "../assets/trash_icon.png";
import AddButton from "../assets/AddButton.png";
import AssignmentView from "./course-layout-views/course-assignment-layout.jsx";
import GradeView from "./course-layout-views/course-grade-layout.jsx";
import QuizView from "./course-layout-views/course-quiz-layout.jsx";
import ResourceView from "./course-layout-views/course-resource-layout.jsx";


//--------component function---------//
function Banner({course}){
    return(
        <div className="relative w-full h-[35vh] bg-gray-100 rounded-xl shadow-md pb-10">
            <div className="absolute bottom-4 left-6 text-black text-left">
            <p className="text-lg font-medium">{course.code}</p>
            <p className="text-2xl font-bold">{course.name}</p>
        </div>
    </div>
    );
}

function CustomTab({course}) {
  const [value, setValue] = useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className="mt-8 -screen">
        {/* https://mui.com/material-ui/react-tabs/ */}
        <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handleChange} aria-label="lab API tabs example">
                    <Tab label="Upcoming Assignment" value="1" className="w-1/4 focus:outline-none focus:ring-0"/>
                    <Tab label="Grade" value="2" className="w-1/4 focus:outline-none focus:ring-0"/>
                    <Tab label="Practice Quiz" value="3" className="w-1/4 focus:outline-none focus:ring-0"/>
                    <Tab label="Course Resource" value="4" className="w-1/4 focus:outline-none focus:ring-0"/>
                </TabList>
            </Box>
            <TabPanel value="1">
                <AssignmentView courseID={course.course_id} />
            </TabPanel>
            <TabPanel value="2">
                <GradeView />
            </TabPanel>
            <TabPanel value="3">
                <QuizView />
            </TabPanel>
            <TabPanel value="4">
                    <ResourceView />
            </TabPanel>
        </TabContext>
    </div>
  );
}
 
export default function CourseLayout({course}) {
    if(!course) return <p>No course selected.</p>;

    return (
        <div>
            <Banner course={course} />
            <CustomTab course={course}/>
        </div>
    )
}


