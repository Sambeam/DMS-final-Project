import * as Models from "../models/models.js";

//update model function//
async function updateModel(Model, idParam, req, res){
    try{
        const updated = await Model.findByIdAndUpdate(
            req.params[idParam],
            req.body,
            {new: true}
        );

        if(!updated){
            return res.status(404).json({error: `${Model.modelName} not found in database`});
        }

        res.json(updated);
    }catch(error){
        return res.status(404).json({error: error.message});
    }
}

//list of put controller for selected models//
export const updateCourse = (req, res) =>
  updateModel(Models.Course, "courseId", req, res);

export const updateCourseWork = (req, res) =>
  updateModel(Models.CourseWork, "courseWorkId", req, res);

export const updateResource = (req, res) =>
  updateModel(Models.Resource, "resourceId", req, res);

export const updateQuiz = (req, res) =>
  updateModel(Models.Quiz, "quizId", req, res);

export const updateEvent = (req, res) =>
  updateModel(Models.CalendarEvent, "eventId", req, res);

export const updateStudyNote = (req, res) =>
  updateModel(Models.StudyNote, "noteId", req, res);

export const updateNotePage = (req, res) =>
  updateModel(Models.NotePage, "pageId", req, res);

export const updateQuestion = (req, res) =>
  updateModel(Models.Question, "questionId", req, res);

export const updateEventTag = (req, res) =>
  updateModel(Models.EventTag, "tagId", req, res);


