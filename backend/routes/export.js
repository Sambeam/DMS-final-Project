import express from "express";
import {CourseWork} from "../models/models.js";

const export_router = express.Router();

export_router.get("/coursework/xml", async(req, res) =>{
    try{
        const {course_id,user_id} = req.query;

        if(!course_id || !user_id){
            return res.status(500).send("both student ID and course ID are required for the query");
        }
        
        //fetch course work//
        const cw = await CourseWork.find({
            student_id: user_id,
            course_id: course_id
        })
        cw.sort({due_date: 1});
        

        //writing xml//
        let total = 0;

        let xml_export = `<?xml version="1.0" encoding="UTF-8"?>\n<coursework student="${studentId}" course="${courseId}">\n`;

        for (let c in cw){
            xml+=`<item>\n`;
            xml+=`  <title>${c.cw_name}</title>\n`;
            xml+=`  <grade>${c.cw_grade}</grade>\n`;
            xml+=`  <weight>${c.cw_weight}</weight>\n`;
            xml+=`</item>\n`;
            total += c.cw_grade*c.cw_weight;
        }
        xml += `<total>${total}</total>\n`;
        xml += `</coursework>`;

        res.set("Content-Type","application/xml");
        res.send(xml);
    }catch(erroe){
        console.error(error);
        res.status(500).send("Failed to generate course work XML");
    }
});

export default export_router;