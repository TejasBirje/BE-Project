// import axios from "axios";

// const PISTON_URL =
//   process.env.PISTON_API_URL || "https://emkc.org/api/v2/piston";

// // ── Language version mapping for Piston ──────────────────────────────────────
// // Piston requires exact language + version. "*" means latest available.
// const LANGUAGE_MAP = {
//   javascript: { language: "javascript", version: "*" },
//   python: { language: "python", version: "*" },
//   java: { language: "java", version: "*" },
//   cpp: { language: "c++", version: "*" },
//   c: { language: "c", version: "*" },
// };

// // ── Helper: execute one piece of code with one stdin input via Piston ─────────
// const executeCode = async (code, language, stdin = "") => {
//   const lang = LANGUAGE_MAP[language];

//   if (!lang) {
//     throw new Error(`Unsupported language: ${language}`);
//   }

//   const response = await axios.post(
//     `${PISTON_URL}/execute`,
//     {
//       language: lang.language,
//       version: lang.version,
//       files: [
//         {
//           name: "solution", // filename doesn't matter for execution
//           content: code,
//         },
//       ],
//       stdin,
//       run_timeout: 5000, // 5 seconds max per test case
//       compile_timeout: 10000, // 10 seconds max for compilation
//     },
//     {
//       timeout: 15000, // axios timeout — 15 seconds total
//     },
//   );

//   return response.data;
// };

// // ── Helper: normalize output for comparison ───────────────────────────────────
// // Trims whitespace and normalizes line endings so minor formatting
// // differences don't cause false failures
// const normalizeOutput = (output = "") => {
//   return output
//     .trim()
//     .replace(/\r\n/g, "\n") // Windows line endings → Unix
//     .replace(/\r/g, "\n"); // old Mac line endings → Unix
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // POST /api/judge/run
// // Body: { code, language, testCases: [{ input, output }] }
// // Called by frontend when candidate clicks "Run Code"
// // ─────────────────────────────────────────────────────────────────────────────
// export const runCode = async (req, res) => {
//   try {
//     const { code, language, testCases } = req.body;

//     // ── Validate request ──
//     if (!code || !code.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "No code provided",
//       });
//     }

//     if (!language) {
//       return res.status(400).json({
//         success: false,
//         message: "No language specified",
//       });
//     }

//     if (!testCases || testCases.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No test cases provided",
//       });
//     }

//     if (!LANGUAGE_MAP[language]) {
//       return res.status(400).json({
//         success: false,
//         message: `Unsupported language: ${language}. Supported: javascript, python, java, cpp, c`,
//       });
//     }

//     // ── Run code against each test case ──────────────────────────────────────
//     const results = [];
//     let passedCount = 0;

//     for (const testCase of testCases) {
//       try {
//         const pistonResult = await executeCode(
//           code,
//           language,
//           testCase.input || "",
//         );

//         const actualOutput = normalizeOutput(pistonResult.run?.stdout || "");
//         const expectedOutput = normalizeOutput(testCase.output || "");

//         // Check for runtime errors
//         const hasError =
//           pistonResult.run?.stderr && pistonResult.run.stderr.trim().length > 0;
//         const timedOut =
//           pistonResult.run?.code === 124 || // timeout exit code
//           (pistonResult.run?.stderr || "").includes("timeout");

//         let passed = false;
//         let errorMessage = null;

//         if (timedOut) {
//           errorMessage = "Time Limit Exceeded";
//         } else if (hasError && !actualOutput) {
//           // has error and no output at all = pure error
//           errorMessage = pistonResult.run.stderr.trim().split("\n")[0]; // first line of error
//         } else {
//           // compare actual vs expected output
//           passed = actualOutput === expectedOutput;
//           if (!passed && hasError) {
//             errorMessage = pistonResult.run.stderr.trim().split("\n")[0];
//           }
//         }

//         if (passed) passedCount++;

//         results.push({
//           input: testCase.input || "",
//           expectedOutput: testCase.output || "",
//           actualOutput,
//           passed,
//           errorMessage, // null if no error
//         });
//       } catch (testCaseError) {
//         // If one test case fails due to network/timeout, don't stop all
//         console.error("Test case execution error:", testCaseError.message);
//         results.push({
//           input: testCase.input || "",
//           expectedOutput: testCase.output || "",
//           actualOutput: "",
//           passed: false,
//           errorMessage: "Execution failed — please try again",
//         });
//       }
//     }

//     // ── Calculate marks ───────────────────────────────────────────────────────
//     const totalCount = testCases.length;
//     const marksAwarded = Math.round((passedCount / totalCount) * 10);

//     // ── Send response ─────────────────────────────────────────────────────────
//     res.status(200).json({
//       success: true,
//       results, // array of per-test-case results
//       passedCount, // how many passed
//       totalCount, // total test cases
//       marksAwarded, // marks out of 10
//     });
//   } catch (error) {
//     console.error("Judge controller error:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Code execution service failed. Please try again.",
//     });
//   }
// };

import axios from "axios";

// const PISTON_URL =
//   process.env.PISTON_API_URL || "https://emkc.org/api/v2/piston";
const PISTON_URL = process.env.PISTON_API_URL || "http://localhost:2000/api/v2";

// ── Language version mapping for Piston ──────────────────────────────────────
const LANGUAGE_MAP = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  cpp: { language: "c++", version: "10.2.0" },
  c: { language: "c", version: "10.2.0" },
};

// ── Placeholder that employer puts in driver template ─────────────────────────
const CANDIDATE_PLACEHOLDER = "// CANDIDATE_CODE_HERE";

// ── Helper: build final code to send to Piston ───────────────────────────────
// If driver template exists → insert candidate code into it
// If no driver template    → send candidate code as-is (fallback)
const buildFinalCode = (candidateCode, driverTemplate) => {
  if (!driverTemplate || !driverTemplate.trim()) {
    // No driver defined — candidate handles stdin/stdout themselves
    return candidateCode;
  }

  if (!driverTemplate.includes(CANDIDATE_PLACEHOLDER)) {
    // Driver exists but placeholder missing — append candidate code at top
    return candidateCode + "\n\n" + driverTemplate;
  }

  // ✅ Normal case — insert candidate code where placeholder is
  return driverTemplate.replace(CANDIDATE_PLACEHOLDER, candidateCode);
};

// ── Helper: execute code via Piston ──────────────────────────────────────────
const executeCode = async (finalCode, language, stdin = "") => {
  const lang = LANGUAGE_MAP[language];

  if (!lang) {
    throw new Error(`Unsupported language: ${language}`);
  }

  try {
    const response = await axios.post(
      `${PISTON_URL}/execute`,
      {
        language: lang.language,
        version: lang.version,
        files: [
          {
            name: "solution",
            content: finalCode,
          },
        ],
        stdin,
        // run_timeout: 5000,
        // compile_timeout: 10000,
        // ✅ AFTER
        run_timeout: 3000,
        compile_timeout: 3000,
      },
      {
        timeout: 15000,
      },
    );
    return response.data;
  } catch (axiosError) {
    throw axiosError;
  }
};

// ── Helper: normalize output for comparison ───────────────────────────────────
const normalizeOutput = (output = "") => {
  return output.trim().replace(/\r\n/g, "\n").replace(/\r/g, "\n");
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/judge/run
// Body: {
//   code,          — candidate's function/solution code
//   language,      — javascript | python | java | cpp | c
//   testCases,     — [{ input, output }]
//   driverTemplate — optional: the driver wrapper for this language
// }
// ─────────────────────────────────────────────────────────────────────────────
export const runCode = async (req, res) => {
  try {
    const { code, language, testCases, driverTemplate } = req.body;

    // ── Validate request ──────────────────────────────────────────────────
    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "No code provided",
      });
    }

    if (!language) {
      return res.status(400).json({
        success: false,
        message: "No language specified",
      });
    }

    if (!testCases || testCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No test cases provided",
      });
    }

    if (!LANGUAGE_MAP[language]) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language: ${language}`,
      });
    }

    // ── Build final code — wrap with driver if available ──────────────────
    const finalCode = buildFinalCode(code, driverTemplate);

    // ── Run against each test case ────────────────────────────────────────
    const results = [];
    let passedCount = 0;

    for (const testCase of testCases) {
      try {
        const pistonResult = await executeCode(
          finalCode,
          language,
          testCase.input || "",
        );

        const actualOutput = normalizeOutput(pistonResult.run?.stdout || "");
        const expectedOutput = normalizeOutput(testCase.output || "");

        const hasError =
          pistonResult.run?.stderr && pistonResult.run.stderr.trim().length > 0;

        const timedOut =
          pistonResult.run?.code === 124 ||
          (pistonResult.run?.stderr || "").includes("timeout");

        let passed = false;
        let errorMessage = null;

        if (timedOut) {
          errorMessage = "Time Limit Exceeded";
        } else if (hasError && !actualOutput) {
          errorMessage = pistonResult.run.stderr.trim().split("\n")[0];
        } else {
          passed = actualOutput === expectedOutput;
          if (!passed && hasError) {
            errorMessage = pistonResult.run.stderr.trim().split("\n")[0];
          }
        }

        if (passed) passedCount++;

        results.push({
          input: testCase.input || "",
          expectedOutput: testCase.output || "",
          actualOutput,
          passed,
          errorMessage,
        });
      } catch (testCaseError) {
        console.error("Test case execution error:", testCaseError.message);
        results.push({
          input: testCase.input || "",
          expectedOutput: testCase.output || "",
          actualOutput: "",
          passed: false,
          errorMessage: "Execution failed — please try again",
        });
      }
    }

    // ── Calculate marks ───────────────────────────────────────────────────
    const totalCount = testCases.length;
    const marksAwarded = Math.round((passedCount / totalCount) * 10);

    res.status(200).json({
      success: true,
      results,
      passedCount,
      totalCount,
      marksAwarded,
    });
  } catch (error) {
    console.error("Judge controller error:", error.message);
    res.status(500).json({
      success: false,
      message: "Code execution service failed. Please try again.",
    });
  }
};
