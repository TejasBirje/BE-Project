// backend/scripts/seedQuestions.js

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Question from "../models/questions.model.js";
import questionsData from "../data/questions.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const seedQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected...");

    await Question.deleteMany({});
    console.log("Existing questions cleared...");

    const aptitudeQuestions = questionsData.aptitude.map((q) => ({
      ...q,
      type: "aptitude",
    }));

    const technicalQuestions = questionsData.technical.map((q) => ({
      ...q,
      type: "technical",
    }));

    const allQuestions = [...aptitudeQuestions, ...technicalQuestions];
    await Question.insertMany(allQuestions);

    console.log(`Successfully inserted:`);
    console.log(`  Aptitude questions: ${aptitudeQuestions.length}`);
    console.log(`  Technical questions: ${technicalQuestions.length}`);
    console.log(`  Total: ${allQuestions.length}`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedQuestions();
