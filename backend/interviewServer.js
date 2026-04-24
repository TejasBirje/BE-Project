import { Server } from "socket.io";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import Interview from "./models/interview.model.js";
import Resume from "./models/resume.model.js";

// ── CONFIG ──
const PYTHON_SERVICE =
  process.env.PYTHON_SERVER_URL ||
  process.env.PYTHON_MICROSERVICE_URL ||
  process.env.PYTHON_BASE ||
  "http://localhost:8000";
const QUESTION_SELECTOR_URL = `${PYTHON_SERVICE}/select_questions`;
const ATS_SERVICE_URL = `${PYTHON_SERVICE}/calculate_weighted_score`;
const KEYWORDS_URL = `${PYTHON_SERVICE}/extract_keywords`;
const AI_ANALYZE_URL = `${PYTHON_SERVICE}/analyze-content`;

// ── DUMMY JD (fallback when no JD is provided) ──
const DUMMY_JD = `
Job Title: Full Stack Software Engineer

We are looking for a skilled Full Stack Software Engineer to join our team.

Requirements:
- 2+ years of experience in software development
- Proficiency in JavaScript, TypeScript, Python, or Java
- Experience with React, Angular, or Vue.js for frontend development
- Backend experience with Node.js, Express, Django, or Spring Boot
- Database experience with MongoDB, PostgreSQL, or MySQL
- Familiarity with RESTful APIs and microservices architecture
- Experience with Git, CI/CD pipelines, and cloud platforms (AWS/GCP/Azure)
- Strong problem-solving and communication skills
- Experience with Docker, Kubernetes, or containerization is a plus
- Knowledge of system design and distributed systems is preferred

Responsibilities:
- Design, develop, and maintain web applications
- Collaborate with cross-functional teams to deliver features
- Write clean, testable, and well-documented code
- Participate in code reviews and mentor junior developers
- Optimize application performance and scalability
`;

// ── HELPERS ──

/** Strip markdown fences and parse JSON from AI output */
function cleanAndParseJSON(rawText) {
  try {
    let cleaned = rawText.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned
        .replace(/^```(?:json)?\s*\n?/, "")
        .replace(/\n?```\s*$/, "");
    }
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("JSON parse failed:", err.message);
    return null;
  }
}

/** Grading Agent — evaluates the interview transcript via Gemini */
async function generateFeedback(genAI, interviewHistory) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are an expert technical interviewer. Evaluate the following interview transcript:
    ${JSON.stringify(interviewHistory)}
    
    OUTPUT JSON ONLY in this format:
    {
        "technicalScore": (number 1-10),
        "communicationScore": (number 1-10),
        "strengths": ["list of strengths"],
        "weaknesses": ["list of weaknesses"],
        "summary": "2 sentence summary"
    }
    `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const feedbackData = cleanAndParseJSON(text);

  if (!feedbackData) {
    return {
      technicalScore: 0,
      communicationScore: 0,
      strengths: ["Error generating feedback"],
      weaknesses: ["Please try again"],
      summary: "The AI could not generate a valid report.",
    };
  }

  return feedbackData;
}

function buildTranscript(messages = []) {
  return messages
    .map((m) => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.content}`)
    .join("\n")
    .trim();
}

async function analyzeAiContent(messages = []) {
  const transcript = buildTranscript(messages);
  if (!transcript) {
    return { label: null, score: null };
  }

  try {
    // Example Node -> Python call:
    // await axios.post(`${PYTHON_SERVICE}/analyze-content`, { text: transcript })
    const aiRes = await axios.post(AI_ANALYZE_URL, { text: transcript });
    const label = aiRes.data?.label === "AI" ? "AI" : "HUMAN";
    const scoreNum = Number(aiRes.data?.score);

    return {
      label,
      score: Number.isFinite(scoreNum) ? Math.max(0, Math.min(1, scoreNum)) : null,
    };
  } catch (error) {
    console.warn("⚠️ AI content analysis unavailable:", error.message);
    return { label: null, score: null };
  }
}

// ── MAIN EXPORT ──

/**
 * Attach Socket.io to an existing HTTP server and wire up
 * the interview WebSocket events.
 *
 * @param {import("http").Server} httpServer
 */
export default function initInterviewSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "https://usehirely.vercel.app"],
      methods: ["GET", "POST"],
    },
  });

  // Initialise Gemini once
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    // ──────────────────────────────────────────
    // EVENT: joinInterview
    // ──────────────────────────────────────────
    socket.on(
      "joinInterview",
      async ({ resumeId, limit, jobDescription, userId }) => {
        try {
          console.log("\n" + "=".repeat(60));
          console.log("🎙️  JOIN INTERVIEW REQUEST");
          console.log("=".repeat(60));
          console.log("   ResumeID:", resumeId);
          console.log("   Question Limit:", limit || 5);
          console.log(
            "   JD provided:",
            jobDescription ? "Yes" : "No (using dummy)"
          );

          const jdToUse = jobDescription || DUMMY_JD;

          // ── Call Python Question Selector ──
          let selectedQuestions = [];
          try {
            console.log("\n🔄 Calling Question Selector...");
            const qsResponse = await axios.post(QUESTION_SELECTOR_URL, {
              jd: jdToUse,
              num_questions: limit || 5,
            });
            const qsResult = qsResponse.data;

            if (qsResult.selected_questions) {
              selectedQuestions = qsResult.selected_questions;
              console.log("\n✅ QUESTIONS SELECTED:");
              console.log(
                "   Keywords:",
                qsResult.keywords?.map((k) => k.keyword).join(", ")
              );
              selectedQuestions.forEach((q, i) => {
                console.log(
                  `   ${i + 1}. [${q.difficulty}] [${q.topic}] sim=${
                    q.similarity
                  }`
                );
                console.log(`      Q: ${q.question}`);
              });
            }
          } catch (qsError) {
            console.warn("⚠️  Question Selector unavailable:", qsError.message);
            console.warn("   Gemini will generate its own questions.");
          }

          // ── Create Interview Document ──
          const newInterview = new Interview({
            candidateId: userId || null,
            userId: userId || null,
            resumeId,
            jobDescription: jdToUse,
            messages: [],
            questionLimit: limit || 5,
            questions: selectedQuestions.map((q) => ({
              question: q.question,
              topic: q.topic,
              difficulty: q.difficulty,
              similarity: q.similarity,
            })),
          });
          await newInterview.save();

          // Store selected questions on the socket for use in chatMessage
          socket.selectedQuestions = selectedQuestions;
          socket.join(newInterview._id.toString());
          socket.interviewId = newInterview._id.toString();

          socket.emit("interviewStarted", {
            interviewId: newInterview._id,
            selectedQuestions,
          });

          console.log("\n✅ Interview started:", newInterview._id);
          console.log("=".repeat(60) + "\n");
        } catch (error) {
          console.error("joinInterview Error:", error);
          socket.emit("error", { message: "Failed to start interview" });
        }
      }
    );

    // ──────────────────────────────────────────
    // EVENT: chatMessage
    // ──────────────────────────────────────────
    socket.on("chatMessage", async ({ message, interviewId }) => {
      try {
        const interview = await Interview.findById(interviewId).populate(
          "resumeId"
        );

        if (!interview) {
          socket.emit("error", { message: "Interview not found" });
          return;
        }

        const resumeText =
          interview.resumeId?.textContent || "No resume provided.";
        const jdText = interview.jobDescription || "";
        const questionLimit = interview.questionLimit || 5;

        // Count how many questions the AI has asked so far
        const aiMessageCount = interview.messages.filter(
          (m) => m.role === "model"
        ).length;
        const isLastQuestion = aiMessageCount >= questionLimit - 1;

        // ── Build system prompt ──
        const preSelectedQs = socket.selectedQuestions || [];
        const hasPreSelected = preSelectedQs.length > 0;

        let questionsBlock = "";
        if (hasPreSelected) {
          questionsBlock =
            "\n\nPRE-SELECTED QUESTIONS (use these in order, do NOT make up your own):\n";
          preSelectedQs.forEach((q, i) => {
            questionsBlock += `${i + 1}. [${q.difficulty}] [${q.topic}] ${
              q.question
            }\n`;
          });
          console.log("   📋 Using pre-selected questions in prompt");
        }

        let systemPrompt = `You are an expert technical interviewer. You are conducting a live interview.
The candidate's resume:
---
${resumeText}
---
${jdText ? `The job description for the role:\n---\n${jdText}\n---` : ""}
${questionsBlock}
Rules:
- Ask ONE question at a time, then wait for the candidate's answer.${
          hasPreSelected
            ? "\n- You MUST use the pre-selected questions above IN ORDER. Do NOT create your own questions."
            : "\n- Base questions on the candidate's resume skills and experience."
        }
- After each answer, give brief feedback (1 sentence) before asking the next question.
- Keep responses concise (2-3 sentences max per turn).
- You have a limit of ${questionLimit} questions total.`;

        if (isLastQuestion) {
          systemPrompt += `\n- This is your LAST question. After the candidate answers, thank them and say the interview is complete. Do NOT ask another question.`;
        }

        // ── Build Gemini-format conversation history ──
        const contents = [];

        // System instruction as the first user turn
        contents.push({
          role: "user",
          parts: [{ text: systemPrompt }],
        });
        contents.push({
          role: "model",
          parts: [
            {
              text: "Understood. I'll conduct the interview following these guidelines. Let's begin.",
            },
          ],
        });

        // Append stored conversation history
        for (const msg of interview.messages) {
          contents.push({
            role: msg.role,
            parts: [{ text: msg.content }],
          });
        }

        // Append the new user message
        contents.push({
          role: "user",
          parts: [{ text: message }],
        });

        // ── Stream response from Gemini ──
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContentStream({ contents });

        let fullResponse = "";

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullResponse += chunkText;
          socket.emit("aiResponseChunk", chunkText);
        }

        // ── Save messages to DB ──
        const lastQuestion = [...interview.messages]
          .reverse()
          .find((m) => m.role === "model")?.content;

        interview.messages.push({ role: "user", content: message });
        interview.responses.push({
          question: lastQuestion || "",
          answer: message,
          timestamp: new Date(),
        });
        interview.messages.push({ role: "model", content: fullResponse });
        await interview.save();

        socket.emit("aiResponseComplete", { fullResponse }); // ── If question limit reached → generate feedback & end ──
        const updatedAiCount = interview.messages.filter(
          (m) => m.role === "model"
        ).length;

        if (updatedAiCount >= questionLimit) {
          console.log("Question limit reached, generating feedback...");

          // ── Atomic lock — prevent duplicate completions ──
          const locked = await Interview.findOneAndUpdate(
            { _id: interviewId, status: "ongoing" },
            { $set: { status: "completing" } },
            { new: false }
          ).populate("resumeId");

          if (!locked) {
            console.log(
              "⚡ chatMessage completion: already completed/locked, skipping"
            );
            return;
          }

          const feedback = await generateFeedback(genAI, interview.messages);

          // Optionally call ATS scoring
          let atsScore = null;
          let keywords = [];
          const resumeTextForAts = interview.resumeId?.textContent || "";

          if (resumeTextForAts && interview.jobDescription) {
            try {
              const [atsRes, kwRes] = await Promise.all([
                axios.post(ATS_SERVICE_URL, {
                  jd: interview.jobDescription,
                  resume: resumeTextForAts,
                }),
                axios.post(KEYWORDS_URL, {
                  jd: interview.jobDescription,
                }),
              ]);
              atsScore = atsRes.data.ats_score ?? null;
              keywords = kwRes.data.keywords ?? [];
            } catch (atsErr) {
              console.warn("⚠️ ATS/Keywords service error:", atsErr.message);
            }
          }

          const aiScore = await analyzeAiContent(interview.messages);

          // ── Final atomic write — no .save(), no __v conflict ──
          await Interview.findByIdAndUpdate(interviewId, {
            $set: {
              status: "completed",
              terminationReason: "completed",
              feedback,
              atsScore,
              keywords,
              aiScore,
            },
          });

          socket.emit("interviewComplete", {
            feedback,
            atsScore,
            keywords,
            aiScore,
          });
          console.log("✅ Interview completed:", interviewId);
        }
      } catch (error) {
        console.error("chatMessage Error:", error);
        socket.emit("error", {
          message: "Something went wrong during the interview",
        });
      }
    }); // ──────────────────────────────────────────
    // EVENT: cheatingFlag
    // ──────────────────────────────────────────
    socket.on("cheatingFlag", async ({ interviewId, type, timestamp }) => {
      try {
        if (!interviewId || !type) {
          return;
        }

        const allowedTypes = new Set([
          "TAB_SWITCH",
          "NO_FACE",
          "MULTIPLE_FACES",
          "LOOKING_AWAY",
          "PHONE_DETECTED",
        ]);

        if (!allowedTypes.has(type)) {
          return;
        }

        await Interview.findByIdAndUpdate(interviewId, {
          $push: {
            cheatingFlags: {
              type,
              timestamp: Number.isFinite(Number(timestamp))
                ? Number(timestamp)
                : Date.now(),
            },
          },
        });

        socket.emit("cheatingFlagAck", { type, interviewId });
      } catch (error) {
        console.error("cheatingFlag Error:", error);
      }
    });

    // ──────────────────────────────────────────
    // EVENT: endInterview  (manual early end)
    // ──────────────────────────────────────────
    socket.on("endInterview", async ({ interviewId }) => {
      // ── Deduplicate: ignore if this socket already ended this interview ──
      if (socket._endingInterview === interviewId) {
        console.log("⚡ Duplicate endInterview ignored for:", interviewId);
        return;
      }
      socket._endingInterview = interviewId;

      try {
        // ── Atomic status-lock: only one caller wins the "ongoing→completing" race ──
        const locked = await Interview.findOneAndUpdate(
          { _id: interviewId, status: "ongoing" },
          { $set: { status: "completing" } },
          { new: false } // return OLD doc so we can read messages / resumeId
        ).populate("resumeId");

        if (!locked) {
          // Either not found OR another request already locked / completed it
          console.log(
            "⚡ endInterview: already completed/locked, skipping:",
            interviewId
          );
          // If it's already fully completed, re-emit the stored result to this socket
          const done = await Interview.findById(interviewId);
          if (done?.status === "completed" && done?.feedback) {
            socket.emit("interviewComplete", {
              feedback: done.feedback,
              atsScore: done.atsScore,
              keywords: done.keywords ?? [],
              aiScore: done.aiScore ?? { label: null, score: null },
            });
          }
          return;
        }

        console.log("🛑 Manual end requested for:", interviewId);

        // Generate feedback from whatever transcript we have
        const feedback = await generateFeedback(genAI, locked.messages);

        // ATS scoring
        let atsScore = null;
        let keywords = [];
        const resumeText = locked.resumeId?.textContent || "";

        if (resumeText && locked.jobDescription) {
          try {
            const [atsRes, kwRes] = await Promise.all([
              axios.post(ATS_SERVICE_URL, {
                jd: locked.jobDescription,
                resume: resumeText,
              }),
              axios.post(KEYWORDS_URL, {
                jd: locked.jobDescription,
              }),
            ]);
            atsScore = atsRes.data.ats_score ?? null;
            keywords = kwRes.data.keywords ?? [];
          } catch (atsErr) {
            console.warn("⚠️ ATS/Keywords service error:", atsErr.message);
          }
        }

        const aiScore = await analyzeAiContent(locked.messages);

        // ── Final atomic write — no .save(), no __v conflict ──
        await Interview.findByIdAndUpdate(interviewId, {
          $set: {
            status: "completed",
            terminationReason: "manual",
            feedback,
            atsScore,
            keywords,
            aiScore,
          },
        });

        socket.emit("interviewComplete", {
          feedback,
          atsScore,
          keywords,
          aiScore,
        });
        console.log("✅ Interview ended manually:", interviewId);
      } catch (error) {
        console.error("endInterview Error:", error);
        socket.emit("error", { message: "Failed to end interview" });
      } finally {
        // Clear the lock so the socket can end a *different* interview later
        delete socket._endingInterview;
      }
    });

    // ──────────────────────────────────────────
    // EVENT: tabSwitchViolation
    // ──────────────────────────────────────────
    socket.on("tabSwitchViolation", async ({ interviewId }) => {
      if (socket._endingInterview === interviewId) {
        console.log(
          "⚡ Duplicate tabSwitchViolation ignored for:",
          interviewId
        );
        return;
      }
      socket._endingInterview = interviewId;

      try {
        // ── Atomic status-lock ──
        const locked = await Interview.findOneAndUpdate(
          { _id: interviewId, status: "ongoing" },
          { $set: { status: "completing" } },
          { new: false }
        ).populate("resumeId");

        if (!locked) {
          console.log(
            "⚡ tabSwitchViolation: already completed/locked, skipping:",
            interviewId
          );
          const done = await Interview.findById(interviewId);
          if (done?.status === "completed" && done?.feedback) {
            socket.emit("interviewTerminated", {
              reason: "tab_switch",
              feedback: done.feedback,
              atsScore: done.atsScore,
              keywords: done.keywords ?? [],
              aiScore: done.aiScore ?? { label: null, score: null },
            });
          }
          return;
        }

        console.log("🚨 Tab-switch violation detected for:", interviewId);

        const feedback = await generateFeedback(genAI, locked.messages);

        let atsScore = null;
        let keywords = [];
        const resumeText = locked.resumeId?.textContent || "";

        if (resumeText && locked.jobDescription) {
          try {
            const [atsRes, kwRes] = await Promise.all([
              axios.post(ATS_SERVICE_URL, {
                jd: locked.jobDescription,
                resume: resumeText,
              }),
              axios.post(KEYWORDS_URL, {
                jd: locked.jobDescription,
              }),
            ]);
            atsScore = atsRes.data.ats_score ?? null;
            keywords = kwRes.data.keywords ?? [];
          } catch (atsErr) {
            console.warn("⚠️ ATS/Keywords service error:", atsErr.message);
          }
        }

        const aiScore = await analyzeAiContent(locked.messages);

        await Interview.findByIdAndUpdate(interviewId, {
          $set: {
            status: "completed",
            tabSwitchDetected: true,
            terminationReason: "tab_switch",
            feedback,
            atsScore,
            keywords,
            aiScore,
          },
        });

        socket.emit("interviewTerminated", {
          reason: "tab_switch",
          feedback,
          atsScore,
          keywords,
          aiScore,
        });
        console.log("✅ Interview terminated (tab switch):", interviewId);
      } catch (error) {
        console.error("tabSwitchViolation Error:", error);
        socket.emit("error", {
          message: "Failed to process tab switch violation",
        });
      } finally {
        delete socket._endingInterview;
      }
    });

    // ──────────────────────────────────────────
    // EVENT: disconnect
    // ──────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected:", socket.id);
    });
  });

  console.log("✅ Interview Socket.io initialised");
  return io;
}
