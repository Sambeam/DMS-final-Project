import { Routes, Route } from "react-router-dom";
import StudyHubApp from "./StudyHubApp.jsx";
import Quiz from "./layout/quiz-layout.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/quiz/:quizId" element={<Quiz />} />
      <Route path="/*" element={<StudyHubApp />} />
    </Routes>
  );
}
