import mongoose from "mongoose";
import axios from "axios";

process.stdout.write("Script starting...\n");

try {
  await mongoose.connect("mongodb://localhost:27017/ai-interviewer");
  process.stdout.write("Connected to MongoDB\n");

  // Get the application
  const app = await mongoose.connection.db
    .collection("applications")
    .findOne({});
  console.log("Application ID:", app._id.toString());
  console.log("Current ATS score:", app.atsScore);

  // Get resume text
  const resume = await mongoose.connection.db
    .collection("resumes")
    .findOne({ _id: app.resume });
  const resumeText = resume.textContent;
  console.log("Resume text length:", resumeText?.length);

  // Get job description
  const job = await mongoose.connection.db
    .collection("jobs")
    .findOne({ _id: app.job });
  const jd = (job.description || "") + "\n" + (job.requirements || "");
  console.log("JD length:", jd.length);

  // Call Python ATS service
  console.log("Calling Python ATS service...");
  const { data } = await axios.post(
    "http://localhost:8000/calculate_weighted_score",
    {
      jd: jd,
      resume: resumeText,
    },
    { timeout: 60000 }
  );
  console.log("ATS Result:", JSON.stringify(data, null, 2));

  // Update application
  await mongoose.connection.db.collection("applications").updateOne(
    { _id: app._id },
    {
      $set: {
        atsScore: data.ats_score,
        atsBreakdown: data.breakdown || null,
        "atsKeywords.matched": data.keywords?.matched || [],
        "atsKeywords.missing": data.keywords?.missing || [],
      },
    }
  );

  // Verify update
  const updated = await mongoose.connection.db
    .collection("applications")
    .findOne({ _id: app._id });
  console.log("Updated ATS score:", updated.atsScore);
  console.log("Breakdown:", JSON.stringify(updated.atsBreakdown, null, 2));
  console.log("Keywords matched:", updated.atsKeywords?.matched);
  console.log("Keywords missing:", updated.atsKeywords?.missing);

  await mongoose.disconnect();
  console.log("Done!");
} catch (err) {
  process.stderr.write("Error: " + err.message + "\n");
  process.stderr.write(err.stack + "\n");
  process.exit(1);
}
