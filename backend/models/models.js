import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    pswd_hash: {type: String, required: true}
});
export const User = mongoose.model("User", userSchema);

const courseSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User",required: true },
    course_name: {type: String, required: true},
    instructor: {type: String, required: true},
    credit:{type: Number},
    semester: {type: String},
    description: {type: String},
    color: {type: String},
});
export const Course = mongoose.model("Course", courseSchema);

const courseworkSchema = new mongoose.Schema({
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    cw_name:{type:String, required:true},
    cw_grade: {type:Number, default: null},
    cw_weight: {type:Number, required: true}
});
export const CourseWork = mongoose.model("CourseWork", courseworkSchema);

const quizSchema = new mongoose.Schema({
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    quiz_name: {type: String, required: true},
    date: {type: Date},
    grade: {type: Number, default: null},
    time: {type: TimeRanges, default: null}
});
export const Quiz = mongoose.model("Quiz", quizSchema);

const quizquestionSchema = new mongoose.Schema({
    quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    questions: {type: String, required: true},
    options: {type: [String], required: true},
    answer: {type: String, required: true},
    user_answer: {type: String, default: null}
})
export const Question = mongoose.model("Question",quizquestionSchema);

const courseresourceSchema = new mongoose.Schema({
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course",required: true },
    resource_name: {type: String, required: true},
    file_url: {type: String, required: true},
    type: {type: String},
    upload_time: { type: Date, default: Date.now }
});
export const Resource = mongoose.model("Resource", courseresourceSchema);

const eventSchema = new mongoose.Schema({
   user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
   course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
   title: {type: String, required: true},
   type: {type: String, required: true},
   description: {type: String, default: ""},
   start_time: {type: Date, required: true},
   end_time: {type: Date, required: true}
});
export const Calendar_Event = mongoose.model("Calendar_Event",eventSchema);

const studysectionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    start_time: {type: Date, required: true},
    end_time: {type: Date, required: true},
});
export const Study_Section = mongoose.model("Study_Section",studysectionSchema);

const studynoteSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User",required: true },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    title: {type:String, required:true},
    date: {type:Date, required: true},
});
export const Study_Note = mongoose.model("Study_Note",studynoteSchema);

const notepageSchema = new mongoose.Schema({
    note_id: { type: mongoose.Schema.Types.ObjectId, ref: "Study_Note", required: true },
    page: {type: String, required: true},
    content: {type:String, default: ""},
    date: {type: Date, required: true}
});
export const Note_Page = mongoose.model("Note_Page",notepageSchema);

const eventtagSchema = new mongoose.Schema({
    event_id: { type: mongoose.Schema.Types.ObjectId, ref: "Calendar_Event",required: true },
    name: {type: String, required: true}
});
export const Event_Tag = mongoose.model("Event_Tag", eventtagSchema);

const aiquerySchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User",required: true },
    content: {type: String, required: true},
    response: {type: String, default: ""},
    date:{ type: Date, required: true}
});
export const AI_Query = mongoose.model("AI_Query", aiquerySchema);

const performancestatSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    metric_type: {type: String, required:true},
    value: {type: Number, default: 0},
    record_time: {type: Date, required: true}
});
export const Performance_Stat = mongoose.model("Performance_Stat", performancestatSchema);

const holidaySchema = new mongoose.Schema({
    country_code: { type: String, required:true},
    year: {type: Number, required: true},
    date: {type: Date, required: true},
    local_name: String,
    name: String,
    type: String,
}, {timestamps: true});
holidaySchema.index({country_code: 1, year: 1, date: 1}, {unique: true});
export const Holiday  = mongoose.model("Holiday", holidaySchema);
