/*
this script add routes manage schema in database (create, get, delete and put)
*/
import express from "express";
import * as controllers from "../controllers/ModelController.js";
import * as updateControllers from "../controllers/PutControllers.js";
import * as deleteControllers from "../controllers/DeleteControllers.js";
import axios from "axios";
import { Holiday } from "../models/models.js"
import {validate} from "../DataValidation/ValidateEntry.js";
import { validateParams } from "../DataValidation/ValidateEntry.js";
import { validateQuery } from "../DataValidation/ValidateEntry.js";
import * as Schemas from "../DataValidation/ModelValidation.js"
import { loginAttempt } from "../controllers/AuthenticationController.js";


const router = express.Router();

const models = ["user", "course","coursework","quiz","question","resource","event","eventtag","studysection", "studynote","notepage","aiquery","performancestat"];

const zod_schemas = {
    user: Schemas.UserSchema,
    course: Schemas.CourseSchema,
    coursework: Schemas.CourseWorkSchema,
    quiz: Schemas.QuizSchema,
    question: Schemas.QuestionSchema,
    resource: Schemas.ResourceSchema,
    event: Schemas.CalendarEventSchema,
    studysection: Schemas.StudySectionSchema,
    studynote: Schemas.StudyNoteSchema,
    notepage: Schemas.NotePageSchema,
    eventtag: Schemas.EventTagSchema,
    aiquery: Schemas.AIQuerySchema,
    performancestat: Schemas.PerformanceStatSchema,
    holiday: Schemas.HolidaySchema,
};

const create_controllers = {
    user: controllers.createUser,
    course: controllers.createCourse,
    coursework: controllers.createCourseWork,
    quiz: controllers.createQuiz,
    question: controllers.createQuestion,
    resource: controllers.createResource,
    event: controllers.createEvent,
    eventtag: controllers.createEventTag,
    studysection: controllers.createStudySection,
    studynote: controllers.createStudyNote,
    notepage: controllers.createNotePage,
    aiquery: controllers.createAIQuery,
    performancestat: controllers.createPerformanceStat
};

for (const m of models){
    router.post(`/${m}`, validate(zod_schemas[m]), create_controllers[m]);
    //router.get(`/${m}/:${m}Id`, get_controllers[m]);
}

//for login//
router.post("/user/login", loginAttempt);

//for user//
router.get("/user", controllers.getUsers);
router.get("/user/:userId", validateParams(Schemas.makeIdSchema("userId")), controllers.getUsersById);

//for course//
router.get("/course/user/:userId", validateParams(Schemas.makeIdSchema("userId")), controllers.getCoursesByUser);
router.get("/course/:courseId", validateParams(Schemas.makeIdSchema("courseId")), controllers.getCoursesById);

//for course work//
router.get("/coursework/course/:courseId", validateParams(Schemas.makeIdSchema("courseId")), controllers.getCourseWorkByCourse);
router.get("/coursework/grade", validateQuery(Schemas.HolidayQuerySchema), controllers.getCourseWorkByGrade);

//for quiz//
router.get("/quiz/course/:courseId", validateParams(Schemas.makeIdSchema("courseId")), controllers.getQuizzesByCourse);
router.get("/quiz/id/:quizId", validateParams(Schemas.makeIdSchema("quizId")), controllers.getQuizById);
router.get("/quiz/date/:date", validateParams(Schemas.makeIdSchema("date")), controllers.getQuizByDate);

//for question//
router.get("/question/quiz/:quizId", validateParams(Schemas.makeIdSchema("quizId")), controllers.getQuestionsByQuiz);
router.get("/question/correct", controllers.getCorrectQuestion);

//for course resource//
router.get("/resource/:resourceId", validateParams(Schemas.makeIdSchema("resourceId")), controllers.getResourceById);
router.get("/resource/course/:courseId", validateParams(Schemas.makeIdSchema("courseId")), controllers.getResourcesByCourse);

//for event//
router.get("/event/user/:userId", validateParams(Schemas.makeIdSchema("userId")), controllers.getEventsByUser);
router.get("/event/type/:type", validateParams(Schemas.makeIdSchema("type")), controllers.getEventsByType);

//for study section//
router.get("/studysection/user/:userId", validateParams(Schemas.makeIdSchema("userId")), controllers.getStudySections);
router.get("/studysection/course/:courseId", validateParams(Schemas.makeIdSchema("courseId")), controllers.getStudySectionsByCourse);

//for notes//
router.get("/studynote/course/:courseId", validateParams(Schemas.makeIdSchema("courseId")), controllers.getStudyNotesByCourse);
router.get("/studynote/user/:userId", validateParams(Schemas.makeIdSchema("userId")), controllers.getStudyNoteByUser);

// for pages//
router.get("/notepage/note/:noteId", validateParams(Schemas.makeIdSchema("noteId")), controllers.getPagesByNote);

//for event tag//
router.get("/eventtag/event/:eventId", validateParams(Schemas.makeIdSchema("eventId")), controllers.getTagsByEvent);

//for ai query//
router.get("/aiquery/user/:userId", validateParams(Schemas.makeIdSchema("userId")), controllers.getAIQueries);

//for performance stat//
router.get("/performance/user/:userId", validateParams(Schemas.makeIdSchema("userId")), controllers.getPerformanceStats);

//for holiday//
router.post("/sync",validate(Schemas.HolidaySchema), async (req ,res)=>{
    try{
        const {year,countryCode} = req.body;

        //retrieving list of holiday from nager//
        const nager_url = `https://date.nager.at/api/v3/publicholidays/${year}/${countryCode}`;
        const response = await axios.get(nager_url);
        const holidays = response.data;

        let count = 0; //counter of saved entry//

        for(let h of holidays){
            try{
                await Holiday.updateOne(
                    {country_code: countryCode, year, date: h.date},
                    {
                        country_code: countryCode,
                        year,
                        date: h.date,
                        local_name: h.localName,
                        name: h.name,
                        type: h.types?.join(",")?? "Public",
                    },
                    {upsert: true}
                );
                count++;
            }catch(error){
                console.log("Skip duplicatd entry", h.date);
            }
        }

        res.json({
            messasge: "Holidays synced",
            saved: count,
        });
    }catch (error){
        console.error(error);
        res.status(600).json({error: "Holidays failed to sync with Nager"});
    }
});

router.get("/holidays", validateQuery(Schemas.HolidayQuerySchema),async(req,res)=>{
    try{
        const {year, countryCode = "CA"} = req.query;
        if(!year){
            return res.status(400).json({error: "year is required for query"});
        }

        const holidays = await Holiday.find({
            country_code: countryCode,
            year: parseInt(year)
        });
        holidays.sort((a, b) => new Date(a.date) - new Date(b.date));


        res.json({year, countryCode, holidays});
    }catch(error){
        res.status(500).json({error: "Cannot load Holiday"});
    }
});

//added put route for selected models//
//for course//
router.put("/course/:courseId", validateParams(Schemas.makeIdSchema("courseId")), validate(Schemas.CourseSchema), updateControllers.updateCourse);

//for course work//
router.put("/coursework/:courseWorkId", validateParams(Schemas.makeIdSchema("courseWorkId")), validate(Schemas.CourseWorkSchema), updateControllers.updateCourseWork);

//for resource//
router.put("/resource/:resourceId", validateParams(Schemas.makeIdSchema("resourceId")), validate(Schemas.ResourceSchema), updateControllers.updateResource);

//for quiz//
router.put("/quiz/:quizId", validateParams(Schemas.makeIdSchema("quizId")), validate(Schemas.QuizSchema), updateControllers.updateQuiz);

//for event//
router.put("/event/:eventId", validateParams(Schemas.makeIdSchema("eventId")), validate(Schemas.CalendarEventSchema), updateControllers.updateEvent);

//for study note//
router.put("/studynote/:noteId", validateParams(Schemas.makeIdSchema("noteId")), validate(Schemas.StudyNoteSchema), updateControllers.updateStudyNote);

//for note page//
router.put("/notepage/:pageId", validateParams(Schemas.makeIdSchema("pageId")), validate(Schemas.NotePageSchema), updateControllers.updateNotePage);

//for question//
router.put("/question/:questionId", validateParams(Schemas.makeIdSchema("questionId")), validate(Schemas.QuestionSchema), updateControllers.updateQuestion);

//for event tag//
router.put("/eventtag/:tagId", validateParams(Schemas.makeIdSchema("tagId")), validate(Schemas.EventTagSchema), updateControllers.updateEventTag);

//added delete for selected model//
//for course//
router.delete("/course/:courseId", validateParams(Schemas.makeIdSchema("courseId")), deleteControllers.deleteCourse);

//for course work//
router.delete("/coursework/:courseWorkId", validateParams(Schemas.makeIdSchema("courseWorkId")), deleteControllers.deleteCourseWork);

//for resource//
router.delete("/resource/:resourceId", validateParams(Schemas.makeIdSchema("resourceId")), deleteControllers.deleteResource);

//for quiz//
router.delete("/quiz/:quizId", validateParams(Schemas.makeIdSchema("quizId")), deleteControllers.deleteQuiz);

//for event//
router.delete("/event/:eventId", validateParams(Schemas.makeIdSchema("eventId")), deleteControllers.deleteEvent);

//for study note//
router.delete("/studynote/:noteId", validateParams(Schemas.makeIdSchema("noteId")), deleteControllers.deleteStudyNote);

//for note page//
router.delete("/notepage/:pageId", validateParams(Schemas.makeIdSchema("pageId")), deleteControllers.deleteNotePage);

//for question//
router.delete("/question/:questionId", validateParams(Schemas.makeIdSchema("questionId")), deleteControllers.deleteQuestion);

//for event tag//
router.delete("/eventtag/:tagId", validateParams(Schemas.makeIdSchema("tagId")), deleteControllers.deleteEventTag);


export default router;
