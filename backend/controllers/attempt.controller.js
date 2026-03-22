import AssessmentInvite from "../models/assessmentInvite.model.js";
import AssessmentSubmission from "../models/assessmentSubmission.model.js";
import Assessment from "../models/assessment.model.js";
import Question from "../models/questions.model.js";
import axios from "axios";

// ----------------------------
// Validate Invite Token (Step 3)
// ----------------------------
export const validateInviteToken = async (req, res) => {
  try {
    const { token } = req.params;

    const invite = await AssessmentInvite.findOne({ token })
      .populate("assessmentId")
      .populate("employerId", "name company");

    if (!invite) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid or expired invite link" });
    }

    // Check expiry
    if (new Date() > invite.expiresAt) {
      invite.status = "expired";
      await invite.save();
      return res
        .status(400)
        .json({ success: false, message: "This invite link has expired" });
    }

    // Check if already completed
    if (invite.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "You have already completed this assessment",
      });
    }

    const assessment = invite.assessmentId;

    res.status(200).json({
      success: true,
      invite: {
        status: invite.status,
        expiresAt: invite.expiresAt,
      },
      assessment: {
        title: assessment.title,
        aptitudeCount: assessment.aptitudeCount,
        technicalCount: assessment.technicalCount,
        codingProblemsCount: assessment.codingProblems.length,
        timeLimit: assessment.timeLimit,
        passingMarks: assessment.passingMarks,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------
// Start Assessment (Step 4)
// ----------------------------
export const startAssessment = async (req, res) => {
  try {
    const { token } = req.params;

    const invite = await AssessmentInvite.findOne({ token }).populate(
      "assessmentId",
    );

    if (!invite) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid invite token" });
    }

    if (new Date() > invite.expiresAt) {
      return res
        .status(400)
        .json({ success: false, message: "Invite has expired" });
    }

    if (invite.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Assessment already completed",
      });
    }

    const assessment = invite.assessmentId;

    // If already started, return existing submission questions
    if (invite.status === "started") {
      const existingSubmission = await AssessmentSubmission.findOne({
        inviteId: invite._id,
      })
        .populate("aptitudeQuestions", "-correctAnswer")
        .populate("technicalQuestions", "-correctAnswer");

      const startedAt = invite.startedAt;
      // const totalSeconds =
      //   (assessment.timeLimit.aptitude +
      //     assessment.timeLimit.technical +
      //     assessment.timeLimit.coding) *
      //   60;
      // const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
      // const remainingSeconds = Math.max(0, totalSeconds - elapsed);

      // return res.status(200).json({
      //   success: true,
      //   alreadyStarted: true,
      //   remainingSeconds,
      //   aptitudeQuestions: existingSubmission.aptitudeQuestions,
      //   technicalQuestions: existingSubmission.technicalQuestions,
      //   codingProblems: assessment.codingProblems,
      //   savedAnswers: {
      //     aptitudeAnswers: existingSubmission.aptitudeAnswers,
      //     technicalAnswers: existingSubmission.technicalAnswers,
      //     codingAnswers: existingSubmission.codingAnswers,
      //   },
      //   timeLimit: assessment.timeLimit,
      // });

      // ✅ CORRECT — calculate which section candidate is in
      // and how much time is left in that section
      const aptitudeSeconds = assessment.timeLimit.aptitude * 60;
      const technicalSeconds = assessment.timeLimit.technical * 60;
      const codingSeconds = assessment.timeLimit.coding * 60;

      const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);

      let currentSection = 0;
      let remainingSeconds = 0;

      if (elapsed < aptitudeSeconds) {
        // still in aptitude section
        currentSection = 0;
        remainingSeconds = aptitudeSeconds - elapsed;
      } else if (elapsed < aptitudeSeconds + technicalSeconds) {
        // in technical section
        currentSection = 1;
        remainingSeconds = aptitudeSeconds + technicalSeconds - elapsed;
      } else if (elapsed < aptitudeSeconds + technicalSeconds + codingSeconds) {
        // in coding section
        currentSection = 2;
        remainingSeconds =
          aptitudeSeconds + technicalSeconds + codingSeconds - elapsed;
      } else {
        // time is up — auto submit
        currentSection = 2;
        remainingSeconds = 0;
      }

      // ✅ ADD THIS BLOCK HERE — between the if/else and the return
      let currentQuestion = 0;

      if (currentSection === 0) {
        currentQuestion =
          existingSubmission.aptitudeAnswers?.length > 0
            ? existingSubmission.aptitudeAnswers.length - 1
            : 0;
      } else if (currentSection === 1) {
        currentQuestion =
          existingSubmission.technicalAnswers?.length > 0
            ? existingSubmission.technicalAnswers.length - 1
            : 0;
      } else {
        currentQuestion = 0;
      }

      return res.status(200).json({
        success: true,
        alreadyStarted: true,
        remainingSeconds,
        currentSection, // ✅ tell frontend which section to show
        currentQuestion, // ✅ ADD THIS LINE in the response object too
        aptitudeQuestions: existingSubmission.aptitudeQuestions,
        technicalQuestions: existingSubmission.technicalQuestions,
        codingProblems: assessment.codingProblems,
        savedAnswers: {
          aptitudeAnswers: existingSubmission.aptitudeAnswers,
          technicalAnswers: existingSubmission.technicalAnswers,
          codingAnswers: existingSubmission.codingAnswers,
        },
        timeLimit: assessment.timeLimit,
      });
    }

    // Randomly pick aptitude questions using MongoDB $sample
    const aptitudeQuestions = await Question.aggregate([
      { $match: { type: "aptitude" } },
      { $sample: { size: assessment.aptitudeCount } },
    ]);

    // Randomly pick technical questions using MongoDB $sample
    const technicalQuestions = await Question.aggregate([
      { $match: { type: "technical" } },
      { $sample: { size: assessment.technicalCount } },
    ]);

    // Mark invite as started
    invite.status = "started";
    invite.startedAt = new Date();
    await invite.save();

    // Create submission document to track progress
    const submission = new AssessmentSubmission({
      inviteId: invite._id,
      candidateId: invite.candidateId,
      assessmentId: assessment._id,
      aptitudeQuestions: aptitudeQuestions.map((q) => q._id),
      technicalQuestions: technicalQuestions.map((q) => q._id),
      codingAnswers: assessment.codingProblems.map((p) => ({
        problemId: p._id,
        code: "",
        language: "javascript",
      })),
    });

    await submission.save();

    // Strip correctAnswer before sending to frontend
    const safeAptitude = aptitudeQuestions.map(
      ({ correctAnswer, ...rest }) => rest,
    );
    const safeTechnical = technicalQuestions.map(
      ({ correctAnswer, ...rest }) => rest,
    );

    const totalSeconds =
      (assessment.timeLimit.aptitude +
        assessment.timeLimit.technical +
        assessment.timeLimit.coding) *
      60;

    res.status(200).json({
      success: true,
      aptitudeQuestions: safeAptitude,
      technicalQuestions: safeTechnical,
      codingProblems: assessment.codingProblems,
      timeLimit: assessment.timeLimit,
      totalSeconds,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------
// Auto-Save Progress (Step 5)
// ----------------------------
export const saveProgress = async (req, res) => {
  try {
    const { token } = req.params;
    const { aptitudeAnswers, technicalAnswers, codingAnswers } = req.body;

    const invite = await AssessmentInvite.findOne({ token });

    if (!invite || invite.status === "completed") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot save progress" });
    }

    await AssessmentSubmission.findOneAndUpdate(
      { inviteId: invite._id },
      {
        ...(aptitudeAnswers && { aptitudeAnswers }),
        ...(technicalAnswers && { technicalAnswers }),
        ...(codingAnswers && { codingAnswers }),
      },
    );

    res.status(200).json({ success: true, message: "Progress saved" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------
// Submit Assessment (Step 6 + 7)
// ----------------------------
// export const submitAssessment = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { aptitudeAnswers, technicalAnswers, codingAnswers } = req.body;

//     const invite = await AssessmentInvite.findOne({ token }).populate(
//       "assessmentId",
//     );

//     if (!invite) {
//       return res.status(404).json({ success: false, message: "Invalid token" });
//     }

//     if (invite.status === "completed") {
//       return res
//         .status(400)
//         .json({ success: false, message: "Already submitted" });
//     }

//     const assessment = invite.assessmentId;
//     const submission = await AssessmentSubmission.findOne({
//       inviteId: invite._id,
//     });

//     // ---- Evaluate Aptitude MCQs ----
//     const aptitudeQuestionsFromDB = await Question.find({
//       _id: { $in: submission.aptitudeQuestions },
//     });

//     let aptitudeScore = 0;
//     const evaluatedAptitude = aptitudeQuestionsFromDB.map((q) => {
//       const candidateAnswer = aptitudeAnswers?.find(
//         (a) => a.questionId === q._id.toString(),
//       );
//       const isCorrect = candidateAnswer?.selectedOption === q.correctAnswer;
//       const marksAwarded = isCorrect ? q.marks : 0;
//       aptitudeScore += marksAwarded;
//       return {
//         questionId: q._id,
//         selectedOption: candidateAnswer?.selectedOption || null,
//         isCorrect,
//         marksAwarded,
//       };
//     });

//     // ---- Evaluate Technical MCQs ----
//     const technicalQuestionsFromDB = await Question.find({
//       _id: { $in: submission.technicalQuestions },
//     });

//     let technicalScore = 0;
//     const evaluatedTechnical = technicalQuestionsFromDB.map((q) => {
//       const candidateAnswer = technicalAnswers?.find(
//         (a) => a.questionId === q._id.toString(),
//       );
//       const isCorrect = candidateAnswer?.selectedOption === q.correctAnswer;
//       const marksAwarded = isCorrect ? q.marks : 0;
//       technicalScore += marksAwarded;
//       return {
//         questionId: q._id,
//         selectedOption: candidateAnswer?.selectedOption || null,
//         isCorrect,
//         marksAwarded,
//       };
//     });

//     // ---- Coding Score (basic — marks given if code is non-empty) ----
//     // Replace this with Judge0 integration later
//     let codingScore = 0;
//     const evaluatedCoding =
//       codingAnswers?.map((ans) => {
//         const problem = assessment.codingProblems.find(
//           (p) => p._id.toString() === ans.problemId,
//         );
//         const marksAwarded =
//           ans.code && ans.code.trim().length > 0
//             ? Math.floor((problem?.marks || 10) * 0.5) // 50% for attempt
//             : 0;
//         codingScore += marksAwarded;
//         return {
//           problemId: ans.problemId,
//           code: ans.code,
//           language: ans.language,
//           marksAwarded,
//         };
//       }) || [];

//     const totalScore = aptitudeScore + technicalScore + codingScore;

//     // Calculate total possible marks
//     const aptitudeTotalMarks = aptitudeQuestionsFromDB.reduce(
//       (sum, q) => sum + q.marks,
//       0,
//     );
//     const technicalTotalMarks = technicalQuestionsFromDB.reduce(
//       (sum, q) => sum + q.marks,
//       0,
//     );
//     const codingTotalMarks = assessment.codingProblems.reduce(
//       (sum, p) => sum + p.marks,
//       0,
//     );
//     const totalPossibleMarks =
//       aptitudeTotalMarks + technicalTotalMarks + codingTotalMarks;

//     const isPassed = totalScore >= assessment.passingMarks;

//     // Calculate time taken
//     const timeTaken = Math.floor(
//       (Date.now() - invite.startedAt.getTime()) / 1000,
//     );

//     // Update submission with final scores
//     submission.aptitudeAnswers = evaluatedAptitude;
//     submission.technicalAnswers = evaluatedTechnical;
//     submission.codingAnswers = evaluatedCoding;
//     submission.scores = {
//       aptitude: aptitudeScore,
//       technical: technicalScore,
//       coding: codingScore,
//       total: totalScore,
//     };
//     submission.totalMarks = totalPossibleMarks;
//     submission.isPassed = isPassed;
//     submission.timeTaken = timeTaken;
//     submission.status = "completed";
//     await submission.save();

//     // Mark invite as completed
//     invite.status = "completed";
//     invite.submittedAt = new Date();
//     await invite.save();

//     res.status(200).json({
//       success: true,
//       message: "Assessment submitted successfully",
//       result: {
//         scores: submission.scores,
//         totalMarks: totalPossibleMarks,
//         isPassed,
//         timeTaken,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const submitAssessment = async (req, res) => {
  try {
    const { token } = req.params;
    const { aptitudeAnswers, technicalAnswers, codingAnswers } = req.body;

    const invite = await AssessmentInvite.findOne({ token }).populate(
      "assessmentId",
    );

    if (!invite) {
      return res.status(404).json({ success: false, message: "Invalid token" });
    }

    if (invite.status === "completed") {
      return res
        .status(400)
        .json({ success: false, message: "Already submitted" });
    }

    const assessment = invite.assessmentId;
    const submission = await AssessmentSubmission.findOne({
      inviteId: invite._id,
    });

    // ---- Evaluate Aptitude MCQs ----
    const aptitudeQuestionsFromDB = await Question.find({
      _id: { $in: submission.aptitudeQuestions },
    });

    let aptitudeScore = 0;
    const evaluatedAptitude = aptitudeQuestionsFromDB.map((q) => {
      const candidateAnswer = aptitudeAnswers?.find(
        (a) => a.questionId === q._id.toString(),
      );
      const isCorrect = candidateAnswer?.selectedOption === q.correctAnswer;
      const marksAwarded = isCorrect ? 1 : 0; // ✅ CHANGED: was "q.marks", now hardcoded 1
      aptitudeScore += marksAwarded;
      return {
        questionId: q._id,
        selectedOption: candidateAnswer?.selectedOption || null,
        isCorrect,
        marksAwarded,
      };
    });

    // ---- Evaluate Technical MCQs ----
    const technicalQuestionsFromDB = await Question.find({
      _id: { $in: submission.technicalQuestions },
    });

    let technicalScore = 0;
    const evaluatedTechnical = technicalQuestionsFromDB.map((q) => {
      const candidateAnswer = technicalAnswers?.find(
        (a) => a.questionId === q._id.toString(),
      );
      const isCorrect = candidateAnswer?.selectedOption === q.correctAnswer;
      const marksAwarded = isCorrect ? 1 : 0; // ✅ CHANGED: was "q.marks", now hardcoded 1
      technicalScore += marksAwarded;
      return {
        questionId: q._id,
        selectedOption: candidateAnswer?.selectedOption || null,
        isCorrect,
        marksAwarded,
      };
    });

    // ---- Coding Score (5 out of 10 for non-empty attempt) ----
    // let codingScore = 0;
    // const evaluatedCoding =
    //   codingAnswers?.map((ans) => {
    //     const marksAwarded = ans.code && ans.code.trim().length > 0 ? 5 : 0; // ✅ CHANGED: flat 5/10 for attempt, removed problem.marks dependency
    //     codingScore += marksAwarded;
    //     return {
    //       problemId: ans.problemId,
    //       code: ans.code,
    //       language: ans.language,
    //       marksAwarded,
    //     };
    //   }) || [];

    // ---- Coding Score (based on test cases passed via Piston) ----
    let codingScore = 0;
    const evaluatedCoding = [];

    for (const ans of codingAnswers || []) {
      try {
        // Find the matching problem to get its test cases
        const problem = assessment.codingProblems.find(
          (p) => p._id.toString() === ans.problemId,
        );

        // If no code written or no problem found — 0 marks
        if (!ans.code || !ans.code.trim() || !problem) {
          evaluatedCoding.push({
            problemId: ans.problemId,
            code: ans.code || "",
            language: ans.language || "javascript",
            testResults: [],
            marksAwarded: 0,
          });
          continue;
        }

        // If problem has no test cases — give attempt marks (5/10)
        if (!problem.testCases || problem.testCases.length === 0) {
          const marksAwarded = ans.code.trim().length > 0 ? 5 : 0;
          codingScore += marksAwarded;
          evaluatedCoding.push({
            problemId: ans.problemId,
            code: ans.code,
            language: ans.language,
            testResults: [],
            marksAwarded,
          });
          continue;
        }

        // ── Run code against each test case via Piston ──
        // const PISTON_URL =
        //   process.env.PISTON_API_URL || "https://emkc.org/api/v2/piston";

        // const LANGUAGE_MAP = {
        //   javascript: { language: "javascript", version: "*" },
        //   python: { language: "python", version: "*" },
        //   java: { language: "java", version: "*" },
        //   cpp: { language: "c++", version: "*" },
        //   c: { language: "c", version: "*" },
        // };
        const PISTON_URL =
          process.env.PISTON_API_URL || "http://localhost:2000/api/v2";

        const LANGUAGE_MAP = {
          javascript: { language: "javascript", version: "18.15.0" },
          python: { language: "python", version: "3.10.0" },
          java: { language: "java", version: "15.0.2" },
          cpp: { language: "c++", version: "10.2.0" },
          c: { language: "c", version: "10.2.0" },
        };

        const langConfig =
          LANGUAGE_MAP[ans.language] || LANGUAGE_MAP["javascript"];

        const testResults = [];
        let passedCount = 0;

        for (const testCase of problem.testCases) {
          try {
            // const pistonRes = await axios.post(
            //   `${PISTON_URL}/execute`,
            //   {
            //     language: langConfig.language,
            //     version: langConfig.version,
            //     files: [{ name: "solution", content: ans.code }],
            //     stdin: testCase.input || "",
            //     run_timeout: 5000,
            //   },
            //   { timeout: 15000 },
            // );

            // ✅ REPLACE with this — uses driver wrapper on final submit too
            const driverTemplate =
              problem.driverTemplates?.[ans.language] || "";
            const finalCode =
              driverTemplate && driverTemplate.trim()
                ? driverTemplate.includes("// CANDIDATE_CODE_HERE")
                  ? driverTemplate.replace("// CANDIDATE_CODE_HERE", ans.code)
                  : ans.code + "\n\n" + driverTemplate
                : ans.code;

            // const pistonRes = await axios.post(
            //   `${PISTON_URL}/execute`,
            //   {
            //     language: langConfig.language,
            //     version: langConfig.version,
            //     files: [{ name: "solution", content: finalCode }],
            //     stdin: testCase.input || "",
            //     run_timeout: 5000,
            //   },
            //   { timeout: 15000 },
            // );
            const pistonRes = await axios.post(
              `${PISTON_URL}/execute`,
              {
                language: langConfig.language,
                version: langConfig.version,
                files: [{ name: "solution", content: finalCode }],
                stdin: testCase.input || "",
                run_timeout: 3000, // ✅ within local Piston limit
                compile_timeout: 3000,
              },
              { timeout: 10000 },
            );

            const actualOutput = (pistonRes.data.run?.stdout || "")
              .trim()
              .replace(/\r\n/g, "\n")
              .replace(/\r/g, "\n");

            const expectedOutput = (testCase.output || "")
              .trim()
              .replace(/\r\n/g, "\n")
              .replace(/\r/g, "\n");

            const passed = actualOutput === expectedOutput;
            if (passed) passedCount++;

            testResults.push({
              input: testCase.input || "",
              expectedOutput,
              actualOutput,
              passed,
            });
          } catch (tcError) {
            // If one test case fails due to network — mark as failed
            testResults.push({
              input: testCase.input || "",
              expectedOutput: testCase.output || "",
              actualOutput: "",
              passed: false,
            });
          }
        }

        // Marks = (passed / total) × 10
        const marksAwarded = Math.round(
          (passedCount / problem.testCases.length) * 10,
        );
        codingScore += marksAwarded;

        evaluatedCoding.push({
          problemId: ans.problemId,
          code: ans.code,
          language: ans.language,
          testResults,
          marksAwarded,
        });
      } catch (problemError) {
        // If entire problem evaluation fails — 0 marks, don't crash
        console.error("Coding evaluation error:", problemError.message);
        evaluatedCoding.push({
          problemId: ans.problemId,
          code: ans.code || "",
          language: ans.language || "javascript",
          testResults: [],
          marksAwarded: 0,
        });
      }
    }

    // ✅ CHANGED: all three total mark calculations simplified, no more q.marks dependency
    const aptitudeTotalMarks = aptitudeQuestionsFromDB.length; // 1 per question
    const technicalTotalMarks = technicalQuestionsFromDB.length; // 1 per question
    const codingTotalMarks = assessment.codingProblems.length * 10; // 10 per problem

    const totalPossibleMarks =
      aptitudeTotalMarks + technicalTotalMarks + codingTotalMarks;

    const totalScore = aptitudeScore + technicalScore + codingScore;

    const isPassed = totalScore >= assessment.passingMarks;

    // Calculate time taken
    const timeTaken = Math.floor(
      (Date.now() - invite.startedAt.getTime()) / 1000,
    );

    // ✅ CHANGED: wrapped all scores in Number() to prevent any NaN from reaching MongoDB
    submission.aptitudeAnswers = evaluatedAptitude;
    submission.technicalAnswers = evaluatedTechnical;
    submission.codingAnswers = evaluatedCoding;
    submission.scores = {
      aptitude: Number(aptitudeScore) || 0,
      technical: Number(technicalScore) || 0,
      coding: Number(codingScore) || 0,
      total: Number(totalScore) || 0,
    };
    submission.totalMarks = Number(totalPossibleMarks) || 0;
    submission.isPassed = isPassed;
    submission.timeTaken = timeTaken;
    submission.status = "completed";
    await submission.save();

    // Mark invite as completed
    invite.status = "completed";
    invite.submittedAt = new Date();
    await invite.save();

    res.status(200).json({
      success: true,
      message: "Assessment submitted successfully",
      result: {
        scores: submission.scores,
        totalMarks: Number(totalPossibleMarks) || 0,
        isPassed,
        timeTaken,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------
// Get Own Result — Candidate (Step 8)
// ----------------------------
export const getCandidateOwnResult = async (req, res) => {
  try {
    const { token } = req.params;

    const invite = await AssessmentInvite.findOne({ token });

    if (!invite) {
      return res.status(404).json({ success: false, message: "Invalid token" });
    }

    const submission = await AssessmentSubmission.findOne({
      inviteId: invite._id,
      status: "completed",
    }).populate("assessmentId", "title passingMarks timeLimit");

    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Result not found" });
    }

    res.status(200).json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
