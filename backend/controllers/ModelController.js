import * as Models from "../models/models.js";
import bcrypt from "bcrypt";

export function err_500 (res, error){
    res.status(500).json({ error: error.message });
    console.error("CreateUser Error:", error);
}

export function err_404 (res){
    return res.status(404).json({ error: "not found" });
    console.error("CreateUser Error:", error);
}

export const createUser = async (req, res) => {
    try {
        console.log("Creating user:", req.body); 

        //take the attribute from the register form//
        let {username, email, pswd_hash} = req.body;
        //hash the password with bcrypt//
        pswd_hash = await bcrypt.hash(pswd_hash,10);

        //prepare User obj to push to db//
        const newUserObj = new Models.User({
            username,
            email,
            pswd_hash: pswd_hash
        });

        //save the user obj//
        await newUserObj.save();
        res.status(201).json(newUserObj);
    } catch (error) {
        err_500(json);
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await Models.User.find();
        res.json(users);
    } catch (err) {
        err_500(res,error);    
    }
};

export const getUsersById = async (req,res)=>{
    try{
        const {userId} = req.params;
        const user = await Models.User.findById(userId);
        if(!user){
            err_404(res);
        }
        res.json(user);
    }catch(error){
        err_500(res,error);
    }
};

export const getUserByEmail = async (req,res)=>{
    try{
        const {email} = req.params;
        const user = await Models.User.findOne({email});
        if (!user) {
            return err_404(res);
        }
        res.json(user);
    }catch(error){
        err_500(res,error);
    }
};

//cpurse//

export const createCourse = async (req, res) => {
    try {
        const course = await Models.Course.create(req.body);
        res.json(course);
    } catch (err) {
        err_500(res,error);
    }
};

export const getCoursesByUser = async (req, res) => {
    try {
        const courses = await Models.Course.find({ user_id: req.params.userId });
        res.json(courses);
    } catch (err) {
        err_500(res,error);
    }
};

export const getCoursesById = async (removeEventListenerq,res) =>{
    try{
        const {courseId} = req.params;
        const course = await Models.Course.findById(courseId);
        if(!course){
            err_404(res);
        }
        res.json(course);
    }catch(error){
        err_500(res,error);
    }
};

export const createCourseWork = async (req, res) => {
    try {
        const cw = await Models.CourseWork.create(req.body);
        res.json(cw);
    } catch (error) {
        err_500(res,error);
    }
};

export const getCourseWorkByCourse = async (req, res) => {
    try {
        const cw = await Models.CourseWork.find({ course_id: req.params.courseId });
        res.json(cw);
    } catch (err) {
        err_500(res,error);
    }
};

export const getCourseWorkByGrade = async (req,res) =>{
    try{
        const {grade_greater, grade_less, course_id} = req.query;
        const filter = {};

        if(course_id) filter.course_id = course_id;
        if(grade_gt) filter.grade = {...filter.grade, $gt: Number(grade_greater)};
        if(grade_lt) filter.grade = { ...filter.grade, $lt: Number(grade_less)};

        const coursework = await Models.CourseWork.find(filter);
        res.json(coursework);
    }catch(error){
        err_500(res,error);
    }
};

export const createQuiz = async (req, res) => {
    try {
        const quiz = await Models.Quiz.create(req.body);
        res.json(quiz);
    } catch (err) {
        err_500(res,error);
    }
};

export const getQuizzesByCourse = async (req, res) => {
    try {
        const quizzes = await Models.Quiz.find({ course_id: req.params.courseId });
        res.json(quizzes);
    } catch (err) {
        err_500(res,error);
    }
};

export const getQuizById = async (req,res) =>{
    try{
        const {quizId} = req.params;
        const quiz = await Models.Quiz.findById(quizId);
        if(!quiz){
            err_404(res);
        }
        res.json(quiz);
    }catch(error){
        err_500(res,error);
    }
}

export const getQuizByDate = async (req,res) =>{
    try{
        const {date} = req.params;
        const quiz = await Models.Quiz.find({ date: req.params.date })
        if(!quiz){
            err_404(res);
        }
        res.json(quiz);
    }catch(error){
        err_500(req,error);
    }
};

// Question //

export const createQuestion = async (req, res) => {
    try {
        const question = await Models.Question.create(req.body);
        res.json(question);
    } catch (error) {
        err_500(res,error);
    }
};

export const getQuestionsByQuiz = async (req, res) => {
    try {
        const questions = await Models.Question.find({ quiz_id: req.params.quizId });
        res.json(questions);
    } catch (error) {
        err_500(res,error);
    }
};

//for grading a quiz//
export const getCorrectQuestion = async (req,res) =>{
    try {
        const correctAnswers = await Models.QuizQuestion.find({
            $expr: { $eq: ["$answer", "$user_answer"] }
        });
        res.json(correctAnswers);
    } catch (error) {
        err_500(res,error);
    }
};

// Resource //

export const createResource = async (req, res) => {
    try {
        const resource = await Models.Resource.create(req.body);
        res.json(resource);
    } catch (error) {
        err_500(res,error);
    }
};

export const getResourceById = async (req, res) => {
    try {
        const { resourceId } = req.params;
        const resource = await Models.Resource.findById(resourceId);
        res.json(resource);
    } catch (error) {
        err_500(res,error);
    }
};

export const getResourcesByCourse = async (req, res) => {
    try {
        const resources = await Models.Resource.find({ course_id: req.params.courseId });
        res.json(resources);
    } catch (error) {
        err_500(res,error);
    }
};

// Event //

export const createEvent = async (req, res) => {
    try {
        const event = await Models.Calendar_Event.create(req.body);
        res.json(event);
    } catch (error) {
        err_500(res,error);
    }
};

export const getEventsByUser = async (req, res) => {
    try {
        const events = await Models.Calendar_Event.find({ user_id: req.params.userId });
        res.json(events);
    } catch (error) {
        err_500(res,error);
    }
};

export const getEventsByType = async (req, res) => {
    try {
        const { type } = req.params;     
        const { user_id } = req.query;   

        const events = await Models.Event.find({
            type: type,
            user_id: user_id
        });

        if (!events || events.length === 0) {
            return err_404(res);
        }
        res.json(events);
    } catch (error) {
        err_500(res,error);
    }
};

//study section//

export const createStudySection = async (req, res) => {
    try {
        const section = await Models.Study_Section.create(req.body);
        res.json(section);
    } catch (error) {
        err_500(res,error);
    }
};

export const getStudySections = async (req, res) => {
    try {
        const sections = await Models.Study_Section.find({ user_id: req.params.userId });
        res.json(sections);
    } catch (error) {
        err_500(res,error);
    }
};

export const getStudySectionsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const studySections = await Models.StudySection.find({
            course_id: courseId
        });

        if (!studySections || studySections.length === 0) {
            return err_404(res);
        }
        res.json(studySections);
    } catch (error) {
        err_500(res,error);
    }
};

//studey note//
export const createStudyNote = async (req, res) => {
    try {
        const note = await Models.Study_Note.create(req.body);
        res.json(note);
    } catch (error) {
        err_500(res,error);
    }
};

export const getStudyNotesByCourse = async (req, res) => {
    try {
        const notes = await Models.Study_Note.find({ course_id: req.params.courseId });
        res.json(notes);
    } catch (error) {
        err_500(res,error);
    }
};

export const getStudyNoteByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const notes = await Models.StudyNote.find({
            student_id: userId
        });

        if (!notes || notes.length === 0) {
            return err_404(res);
        }

        res.json(notes);
    } catch (error) {
        err_500(res,error);
    }
};

//note pages

export const createNotePage = async (req, res) => {
    try {
        const page = await Models.Note_Page.create(req.body);
        res.json(page);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getPagesByNote = async (req, res) => {
    try {
        const pages = await Models.Note_Page.find({ note_id: req.params.noteId });
        res.json(pages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//event tag//


export const createEventTag = async (req, res) => {
    try {
        const tag = await Models.Event_Tag.create(req.body);
        res.json(tag);
    } catch (error) {
        err_500(res,error);
    }
};

export const getTagsByEvent = async (req, res) => {
    try {
        const tags = await Models.Event_Tag.find({ event_id: req.params.eventId });
        res.json(tags);
    } catch (error) {
        err_500(res,error);
    }
};

//AI Query//

export const createAIQuery = async (req, res) => {
    try {
        const query = await Models.AI_Query.create(req.body);
        res.json(query);
    } catch (error) {
        err_500(res,error);
    }
};

export const getAIQueries = async (req, res) => {
    try {
        const queries = await Models.AI_Query.find({ user_id: req.params.userId });
        res.json(queries);
    } catch (error) {
        err_500(res,error);
    }
};

//Performance Stat//

export const createPerformanceStat = async (req, res) => {
    try {
        const stat = await Models.Performance_Stat.create(req.body);
        res.json(stat);
    } catch (error) {
        err_500(res,error);
    }
};

export const getPerformanceStats = async (req, res) => {
    try {
        const stats = await Models.Performance_Stat.find({ user_id: req.params.userId });
        res.json(stats);
    } catch (error) {
        err_500(res,error);
    }
};

//holiday//
export const getAllHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find();
        if (!holidays || holidays.length === 0) {
            return err_404(res);
        }

        res.json(holidays);
    } catch (error) {
        err_500(res,error);
    }
};





