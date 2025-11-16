import * as Models from "../models/models.js";

export const createUser = async (req, res) => {
    try {
        const user = await Models.User.create(req.body);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await Models.User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createCourse = async (req, res) => {
    try {
        const course = await Models.Course.create(req.body);
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getCoursesByUser = async (req, res) => {
    try {
        const courses = await Models.Course.find({ user_id: req.params.userId });
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createCourseWork = async (req, res) => {
    try {
        const cw = await Models.CourseWork.create(req.body);
        res.json(cw);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getCourseWorkByCourse = async (req, res) => {
    try {
        const cw = await Models.CourseWork.find({ course_id: req.params.courseId });
        res.json(cw);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createQuiz = async (req, res) => {
    try {
        const quiz = await Models.Quiz.create(req.body);
        res.json(quiz);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getQuizzesByCourse = async (req, res) => {
    try {
        const quizzes = await Models.Quiz.find({ course_id: req.params.courseId });
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createQuestion = async (req, res) => {
    try {
        const question = await Models.Question.create(req.body);
        res.json(question);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getQuestionsByQuiz = async (req, res) => {
    try {
        const questions = await Models.Question.find({ quiz_id: req.params.quizId });
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createResource = async (req, res) => {
    try {
        const resource = await Models.Resource.create(req.body);
        res.json(resource);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getResourcesByCourse = async (req, res) => {
    try {
        const resources = await Models.Resource.find({ course_id: req.params.courseId });
        res.json(resources);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createEvent = async (req, res) => {
    try {
        const event = await Models.Calendar_Event.create(req.body);
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getEventsByUser = async (req, res) => {
    try {
        const events = await Models.Calendar_Event.find({ user_id: req.params.userId });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createStudySection = async (req, res) => {
    try {
        const section = await Models.Study_Section.create(req.body);
        res.json(section);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getStudySections = async (req, res) => {
    try {
        const sections = await Models.Study_Section.find({ user_id: req.params.userId });
        res.json(sections);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createStudyNote = async (req, res) => {
    try {
        const note = await Models.Study_Note.create(req.body);
        res.json(note);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getStudyNotesByCourse = async (req, res) => {
    try {
        const notes = await Models.Study_Note.find({ course_id: req.params.courseId });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

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

export const createEventTag = async (req, res) => {
    try {
        const tag = await Models.Event_Tag.create(req.body);
        res.json(tag);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getTagsByEvent = async (req, res) => {
    try {
        const tags = await Models.Event_Tag.find({ event_id: req.params.eventId });
        res.json(tags);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createAIQuery = async (req, res) => {
    try {
        const query = await Models.AI_Query.create(req.body);
        res.json(query);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAIQueries = async (req, res) => {
    try {
        const queries = await Models.AI_Query.find({ user_id: req.params.userId });
        res.json(queries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createPerformanceStat = async (req, res) => {
    try {
        const stat = await Models.Performance_Stat.create(req.body);
        res.json(stat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getPerformanceStats = async (req, res) => {
    try {
        const stats = await Models.Performance_Stat.find({ user_id: req.params.userId });
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
