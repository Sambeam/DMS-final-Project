import express from "express";
import * as controllers from "../controllers/ModelController.js";
import axios from "axios";
import { Holiday } from "../models/models.js"
import {validate} from "../DataValidation/ValidateEntry.js";
import { validateParams } from "../DataValidation/ValidateEntry.js";
import { validateQuery } from "../DataValidation/ValidateEntry.js";
import * as Schemas from "../DataValidation/ModelValidation.js"

const router = express.Router();

router.post("/users", validate(Schemas.UserSchema),controllers.createUser);
router.get("/users", controllers.getUsers);

router.post("/courses", validate(Schemas.CourseSchema),controllers.createCourse);
router.get("/courses/:userId", validateParams(Schemas.makeIdSchema("userId")),controllers.getCoursesByUser);

router.post("/coursework", validate(Schemas.CourseWorkSchema),controllers.createCourseWork);
router.get("/coursework/:courseId", controllers.getCourseWorkByCourse);

router.post("/quizzes", validate(Schemas.QuizSchema),controllers.createQuiz);
router.get("/quizzes/:courseId", controllers.getQuizzesByCourse);

router.post("/questions", validate(Schemas.QuestionSchema),controllers.createQuestion);
router.get("/questions/:quizId", controllers.getQuestionsByQuiz);

router.post("/resources", validate(Schemas.ResourceSchema),controllers.createResource);
router.get("/resources/:courseId", controllers.getResourcesByCourse);

router.post("/events", validate(Schemas.CalendarEventSchema),controllers.createEvent);
router.get("/events/:userId", controllers.getEventsByUser);

router.post("/studysections", validate(Schemas.StudySectionSchema),controllers.createStudySection);
router.get("/studysections/:userId", controllers.getStudySections);

router.post("/studynotes", validate(Schemas.StudyNoteSchema),controllers.createStudyNote);
router.get("/studynotes/:courseId", controllers.getStudyNotesByCourse);

router.post("/notepages", validate(Schemas.NotePageSchema),controllers.createNotePage);
router.get("/notepages/:noteId", controllers.getPagesByNote);

router.post("/eventtags", validate(Schemas.EventTagSchema),controllers.createEventTag);
router.get("/eventtags/:eventId", controllers.getTagsByEvent);

router.post("/aiqueries", validate(Schemas.AIQuerySchema),controllers.createAIQuery);
router.get("/aiqueries/:userId", controllers.getAIQueries);

router.post("/performancestats", validate(Schemas.PerformanceStatSchema),controllers.createPerformanceStat);
router.get("/performancestats/:userId", controllers.getPerformanceStats);

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

export default router;
