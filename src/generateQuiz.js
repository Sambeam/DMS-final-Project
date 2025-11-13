import express from "express";
import fs from "fs";
import multer from "multer";
import Anthropic from "@anthropic-ai/sdk";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

router.post("/generateQuiz", upload.single("file"), async (req, res) => {
    const {material,numQ} = req.body;
    const prompt = `
    You are an educator. Create a quiz according to the given course material. 
    The rules are:
    - The quiz must have ${numQ} questions
    - The quiz's question must be related to the course material
    - The quiz's question must be a multiple choice with 4 options
    - The quiz's question must be in medium difficulty 
    
    The expected output for the questiones' answer should be valid JSONN using the schema"
    {
        "quiz_name": "",
        "questions": [
            {            
            "id": 1,
            "question": "",
            "options": ["","","",""],
            "correct_answer": "(a/b/c/d)"
            }
        ]
    }

    course material: ${material}`;

    try{
        const fileBuffer = FSWatcher.readFileSync("./slides.pdf");
        const response = await client.messages.create({
            model: "claude-3-5-sonnet-latest",
            max_tokens: 4000,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "input_file",
                            media_type: "application/pdf",
                            data: fileBuffer.toString("base64")
                        },
                        {
                            type: "text",
                            text: prompt
                        }
                    ]
                }
            ]
        });
    } catch (error) {
        return res.status(500).json({ error: "Failed to generate quiz" });
    }
});

export default router;