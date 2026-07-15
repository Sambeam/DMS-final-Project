import express from "express";
import {CourseWork} from "../models/models.js";

const export_router = express.Router();

export_router.get("/coursework/xml", async(req, res) =>{
    try{
        const {course_id} = req.query;

        if(!course_id){
            return res.status(400).send("course ID is required for the query");
        }

        //fetch course work//
        const cw = await CourseWork.find({ course_id });

        //writing xml//
        let total = 0;

        let xml_export = `<?xml version="1.0" encoding="UTF-8"?>\n<coursework course="${course_id}">\n`;

        for (const c of cw){
            xml_export += `<item>\n`;
            xml_export += `  <title>${c.cw_name}</title>\n`;
            xml_export += `  <grade>${c.cw_grade}</grade>\n`;
            xml_export += `  <weight>${c.cw_weight}</weight>\n`;
            xml_export += `</item>\n`;
            total += (c.cw_grade ?? 0) * c.cw_weight;
        }
        xml_export += `<total>${total}</total>\n`;
        xml_export += `</coursework>`;

        res.set("Content-Type","application/xml");
        res.send(xml_export);
    }catch(error){
        console.error(error);
        res.status(500).send("Failed to generate course work XML");
    }
});

export default export_router;
