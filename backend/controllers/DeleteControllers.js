import * as Models from "../models/models.js";

//delete function//
async function deleteModel(Model, idParam, req, res){
    try{
        const deleted_entry = await Model.findByIdAndDelete(req.params[idParam]);
        if(!deleted_entry){
            return res.status(404).json({error: `model not found`});
        }
        res.json({success:true, message: `${Model.modeName} deleted`});
    }catch(error){
        res.status(500).json({error: error.message});
    }
}

//delete controllers//
export const deleteCourse = (req, res) =>
  deleteModel(Models.Course, "courseId", req, res);

export const deleteCourseWork = (req, res) =>
  deleteModel(Models.CourseWork, "courseWorkId", req, res);

export const deleteResource = (req, res) =>
  deleteModel(Models.Resource, "resourceId", req, res);

export const deleteQuiz = (req, res) =>
  deleteModel(Models.Quiz, "quizId", req, res);

export const deleteEvent = (req, res) =>
  deleteModel(Models.CalendarEvent, "eventId", req, res);

export const deleteStudyNote = (req, res) =>
  deleteModel(Models.StudyNote, "noteId", req, res);

export const deleteNotePage = (req, res) =>
  deleteModel(Models.NotePage, "pageId", req, res);

export const deleteQuestion = (req, res) =>
  deleteModel(Models.Question, "questionId", req, res);

export const deleteEventTag = (req, res) =>
  deleteModel(Models.EventTag, "tagId", req, res);