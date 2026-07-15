import express from "express";
import multer from "multer";
import path from "path";
import { put } from "@vercel/blob";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const blobName = `${unique}${path.extname(req.file.originalname)}`;

    const blob = await put(blobName, req.file.buffer, {
        access: "public",
        contentType: req.file.mimetype,
    });

    res.json({ url: blob.url, originalName: req.file.originalname });
});

export default router;
