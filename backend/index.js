import express from "express";
import cors from "cors";
import { askingLLMQuestion } from "./chatbot.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello form my app");
});

app.post("/chat", async (req, res) => {
  const { question, threadId } = req.body;

  if (!question || !threadId) {
    res.status(400).json({
      message: "All fields are required",
    });
    return;
  }
  const llmAnswer = await askingLLMQuestion(question, threadId);
  res.json({ message: llmAnswer });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
