import express from "express";
import * as controllers from "../controllers/userController.js";

const router = express.Router();

router.post("/users", controllers.createUser);
router.get("/users", controllers.getUsers);

router.post("/courses", controllers.createCourse);
router.get("/courses/:userId", controllers.getCoursesByUser);

router.post("/coursework", controllers.createCourseWork);
router.get("/coursework/:courseId", controllers.getCourseWorkByCourse);

router.post("/quizzes", controllers.createQuiz);
router.get("/quizzes/:courseId", controllers.getQuizzesByCourse);

router.post("/questions", controllers.createQuestion);
router.get("/questions/:quizId", controllers.getQuestionsByQuiz);

router.post("/resources", controllers.createResource);
router.get("/resources/:courseId", controllers.getResourcesByCourse);

router.post("/events", controllers.createEvent);
router.get("/events/:userId", controllers.getEventsByUser);

router.post("/studysections", controllers.createStudySection);
router.get("/studysections/:userId", controllers.getStudySections);

router.post("/studynotes", controllers.createStudyNote);
router.get("/studynotes/:courseId", controllers.getStudyNotesByCourse);

router.post("/notepages", controllers.createNotePage);
router.get("/notepages/:noteId", controllers.getPagesByNote);

router.post("/eventtags", controllers.createEventTag);
router.get("/eventtags/:eventId", controllers.getTagsByEvent);

router.post("/aiqueries", controllers.createAIQuery);
router.get("/aiqueries/:userId", controllers.getAIQueries);

router.post("/performancestats", controllers.createPerformanceStat);
router.get("/performancestats/:userId", controllers.getPerformanceStats);

export default router;
