import {z} from "zod";

//validation rule for posting//
export const UserSchema = z.object({
    username: z.string().min(1),
    email: z.string().email(),
    pswd_hash: z.string().min(1)
});

export const CourseSchema = z.object({
    user_id: z.string().min(1),
    course_code: z.string().min(1),
    course_name: z.string().min(1),
    instructor: z.string().min(1),
    credit: z.number().optional(),
    semester: z.string().optional(),
    description: z.string().optional(),
    color: z.string().optional()
});

export const CourseWorkSchema = z.object({
    course_id: z.string().min(1),
    cw_name: z.string().min(1),
    cw_grade: z.number().min(1),
    cw_weight: z.number().min(1)
});

export const QuizSchema = z.object({
    course_id: z.string().min(1),
    quiz_name: z.string().min(1),
    date: z.date().optional(),
    grade: z.number().nullable().optional()
});

export const QuestionSchema = z.object({
    quiz_id: z.string().min(1),
    questions: z.string().min(1),
    options: z.array(z.string()).min(2),
    answer: z.string().min(1),
    user_answer: z.string().nullable().optional()
});

export const ResourceSchema = z.object({
    course_id: z.string().min(1),
    resource_name: z.string().min(1),
    file_url: z.string().url(),
    type: z.string().optional(),
    upload_time: z.date().optional()
});

export const CalendarEventSchema = z.object({
    user_id: z.string().min(1),
    course_id: z.string().min(1).optional(),
    title: z.string().min(1),
    decsription: z.string().optional(),
    start_time: z.date(),
    end_time: z.date()
});

export const StudySectionSchema = z.object({
    user_id: z.string().min(1),
    course_id: z.string().optional(),
    start_time: z.date(),
    end_time: z.date()
});

export const StudyNoteSchema = z.object({
    user_id: z.string().min(1),
    course_id: z.string().optional(),
    title: z.string().min(1),
    date: z.date()
});

export const NotePageSchema = z.object({
    note_id: z.string().min(1),
    page: z.string().min(1),
    content: z.string().optional(),
    date: z.date()
});

export const EventTagSchema = z.object({
    event_id: z.string().min(1),
    name: z.string().min(1)
});

export const AIQuerySchema = z.object({
    user_id: z.string().min(1),
    content: z.string().min(1),
    response: z.string().optional(),
    date: z.date()
});

export const PerformanceStatSchema = z.object({
    user_id: z.string().min(1),
    metric_type: z.string().min(1),
    value: z.number().optional(),
    record_time: z.date()
});

export const HolidaySchema = z.object({
    country_code: z.string().min(1),
    year: z.number(),
    date: z.date(),
    local_name: z.string().optional(),
    name: z.string().optional(),
    type: z.string().optional()
});

//validation rule for getting//
export const makeIdSchema = (paramName) =>
z.object({
    [paramName]: z.string().min(1)
});

export const HolidayQuerySchema = z.object({
    year: z.string().min(4),
    countryCode: z.string().optional()
});


