import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

dotenv.config();

const app = express();
app.use(cors());
const upload = multer({ dest: "uploads/" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY );
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

app.post("/analyze", upload.single("file"), async (req, res) => {
  
  try {
    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
   // Uploading the file to Gemini storage
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType,
    });

  //   // Asking Gemini to analyze the resume
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
   
    const result = await model.generateContent([
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: req.file.mimetype,
        },
      },
      "Analyze this resume and provide insights."
    ]);
  
    res.json({ output: result.response.text() });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
