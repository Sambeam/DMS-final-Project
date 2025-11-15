import express from "express";
import multer from "multer";
import fs from "fs";
import Anthropic from "@anthropic-ai/sdk";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// POST /generateQuiz (upload PDF + numQ)
router.post("/generateQuiz", upload.single("file"), async (req, res) => {
  try {
    const { numQ } = req.body;
    const filePath = req.file.path;

    const fileBuffer = fs.readFileSync(filePath); // Read uploaded PDF

    const prompt = `
You are an educator. Generate a quiz using the given material.
The rules are:
- the quiz must have exactly ${numQ} questions
- each question must be multiple choice with 4 options
- the difficulty must be in medium
- output must be valid JSON using this schema:

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
}`;

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

    const quizText = response.content[0].text;
    const quizJSON = JSON.parse(quizText);

    res.json({ success: true, quiz: quizJSON });

    fs.unlinkSync(filePath); 
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to generate quiz",
      details: error.message
    });
  }
});

export default router;
