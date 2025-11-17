import express from "express";
import * as controllers from "../controllers/ModelController.js";
import axios from "axios";

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

//for holiday//
router.post("/sync", async (req ,res)=>{
    try{
        const {year,countryCode} = req.body;
        if(!year||!countryCode){
            return res.status(400).json({error: "year and country code required"});
        }

        //retrieving list of holiday from nager//
        const nager_url = `https://date.nager.at/api/v3/publicholidays/${Year}/${CountryCode}`;
        const response = await axios.get(nager_url_url);
        const holidays = response.data;

        let count = 0; //counter of saved entry//

        for(let h of holidays){
            try{
                await Holiday.updateOne(
                    {country_code: countryCode, eyar, date: h.date},
                    {
                        country_code: countryCode,year,
                        date: h.date,
                        local_name: h.localName,
                        name: h.name,
                        type: h.types?.join(",")?? "Public"
                    },
                    {upsert: true}
                );
                count++;
            }catch(error){
                console.log("Skip duplicatd entry", h.date);
            }
        }

        res.join({
            messasge: "Holidays synced",
            saved: count,
        });
    }catch (error){
        console.error(error);
        res.status(600).json({error: "Holidays failed to sync with Nager"});
    }
});

router.get("/", async(req,res)=>{
    try{
        const {year, countryCode = "CA"} = req.query;
        if(!year){
            return res.status(400).json({error: "year is required for query"});
        }

        const holidays = await Holidays.find({
            country_code: countryCode,
            year: parseInt(year)
        })
        holidays.sort({date:1});

        res,json({year, countryCode, holidays});
    }catch(error){
        res.status(500).json({error: "Cannot load Holiday"});
    }
});

export default router;
