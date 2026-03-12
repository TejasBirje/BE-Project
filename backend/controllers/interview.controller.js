import Interview from "../models/interview.model.js";

// GET /api/interview/:id — return single interview
export const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate(
      "resumeId",
      "filename skills",
    );

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/interview/user/all — list interviews for logged-in user
export const getUserInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select(
        "jobDescription status questionLimit createdAt feedback.technicalScore feedback.communicationScore atsScore",
      );

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
