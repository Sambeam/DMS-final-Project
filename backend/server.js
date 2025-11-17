import express from "express";
import dotenv from "dotenv";
import connectDB from "./db.js";   
import apiRoutes from "./routes/ModelRoutes.js";
import ExportRoutes from "./routes/export.js";
import {User} from "./models/models.js";
import cors from "cors";


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/api/test-mongo", async (req, res) => {
  try {
    const u = await User.create({
      username: "test_user",
      email: "test@example.com",
      pswd_hash: "123456"
    });

    res.json({ success: true, data: u });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

//model routes//
app.use("/api", apiRoutes);

//XML export routes//
app.use("/api/export", ExportRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

/*const database = mysql.createConnection({
    host: "localhost", user: "root", password: "", database: "datamanagementproject"
});

//connection testing//
database.connect((err)=>{
    if(err) throw err;
    console.log("database connected successfully");
});

//fetch courses//
app.get("/api/courses",(request,result) =>{
    database.query("select * from course", (err,results) =>{
        if(err) return result.status(500).json(err);
        result.json(results);
    });
});

app.get("/api/course_work/:course_id", (request,result)=>{
    const courseID = request.params.course_id;
    //mysql query//
    const query = 
    `select cw.cw_title, cw.due_date, cw.grade
    from course_work cw, course c
    where cw.course_id = c.course_id and cw.cw_type = "assignment";
    `;
    database.query(query,[courseID],(err,results) =>{
        if(err) return result.status(500).json(err);
        result.json(results);
    });
});*/

//starting server//
