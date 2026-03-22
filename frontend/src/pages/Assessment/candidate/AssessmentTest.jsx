// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";
// import Editor from "@monaco-editor/react";

// import { BASE_URL } from "../../../utils/apiPaths";

// const SECTIONS = ["aptitude", "technical", "coding"];

// // ── Monaco language map ───────────────────────────────────────────────────────
// const MONACO_LANGUAGE_MAP = {
//   javascript: "javascript",
//   python: "python",
//   java: "java",
//   cpp: "cpp",
//   c: "c",
// };

// // ── Starter code per language ─────────────────────────────────────────────────
// // Candidates MUST read from stdin and print to stdout for test cases to pass.
// // These templates show them exactly how to do that in each language.
// const STARTER_CODE = {
//   javascript: `// Read all input from stdin
// process.stdin.resume();
// process.stdin.setEncoding('utf8');
// let inputData = '';
// process.stdin.on('data', (data) => { inputData += data; });
// process.stdin.on('end', () => {
//   const lines = inputData.trim().split('\\n');
//   // lines[0] => first line of input
//   // lines[1] => second line of input
//   // Parse as needed: parseInt(lines[0]), lines[0].split(' '), etc.

//   // ── Write your solution here ──

//   // Print your answer using console.log()
//   // console.log(answer);
// });`,

//   python: `import sys

// lines = sys.stdin.read().strip().split('\\n')
// # lines[0] => first line of input
// # lines[1] => second line of input
// # Parse as needed: int(lines[0]), list(map(int, lines[0].split())), etc.

// # ── Write your solution here ──

// # Print your answer using print()
// # print(answer)
// `,

//   java: `import java.util.*;

// public class Main {
//     public static void main(String[] args) {
//         Scanner sc = new Scanner(System.in);
//         // Read input using:
//         // sc.nextInt()    => read integer
//         // sc.next()       => read word
//         // sc.nextLine()   => read full line

//         // ── Write your solution here ──

//         // Print your answer using System.out.println()
//         // System.out.println(answer);
//     }
// }`,

//   cpp: `#include <iostream>
// #include <vector>
// #include <string>
// using namespace std;

// int main() {
//     // Read input using cin
//     // cin >> a >> b;
//     // getline(cin, str);

//     // ── Write your solution here ──

//     // Print your answer using cout
//     // cout << answer << endl;

//     return 0;
// }`,

//   c: `#include <stdio.h>
// #include <string.h>

// int main() {
//     // Read input using scanf
//     // scanf("%d", &n);
//     // scanf("%s", str);

//     // ── Write your solution here ──

//     // Print your answer using printf
//     // printf("%d\\n", answer);

//     return 0;
// }`,
// };

// export default function AssessmentTest() {
//   const { token } = useParams();
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");

//   // Assessment data
//   const [aptitudeQuestions, setAptitudeQuestions] = useState([]);
//   const [technicalQuestions, setTechnicalQuestions] = useState([]);
//   const [codingProblems, setCodingProblems] = useState([]);
//   const [timeLimit, setTimeLimit] = useState({
//     aptitude: 20,
//     technical: 20,
//     coding: 40,
//   });

//   // Navigation
//   const [currentSection, setCurrentSection] = useState(0);
//   const [currentQuestion, setCurrentQuestion] = useState(0);

//   // Answers
//   const [aptitudeAnswers, setAptitudeAnswers] = useState({});
//   const [technicalAnswers, setTechnicalAnswers] = useState({});
//   const [codingAnswers, setCodingAnswers] = useState([]);

//   // Timer
//   const [sectionTimeLeft, setSectionTimeLeft] = useState(0);
//   const timerRef = useRef(null);
//   const autoSaveRef = useRef(null);

//   // Tab switch detection
//   const tabSwitchCount = useRef(0);
//   const [tabWarning, setTabWarning] = useState(false);

//   // ── NEW: code execution state ─────────────────────────────────────────────
//   const [running, setRunning] = useState(false);
//   const [runResults, setRunResults] = useState({}); // { [problemIndex]: results }

//   // ── Load assessment ───────────────────────────────────────────────────────
//   useEffect(() => {
//     const load = async () => {
//       try {
//         const res = await axios.post(`${BASE_URL}/api/attempt/start/${token}`);
//         const d = res.data;
//         setAptitudeQuestions(d.aptitudeQuestions);
//         setTechnicalQuestions(d.technicalQuestions);
//         setCodingProblems(d.codingProblems);
//         setTimeLimit(d.timeLimit);
//         setSectionTimeLeft(d.timeLimit.aptitude * 60);

//         // ✅ Load JS starter code by default so candidate knows stdin/stdout format
//         setCodingAnswers(
//           d.codingProblems.map((p) => ({
//             problemId: p._id,
//             code: STARTER_CODE["javascript"],
//             language: "javascript",
//           })),
//         );

//         if (d.alreadyStarted && d.savedAnswers) {
//           const {
//             aptitudeAnswers: sa,
//             technicalAnswers: st,
//             codingAnswers: sc,
//           } = d.savedAnswers;
//           if (sa) {
//             const aMap = {};
//             sa.forEach((a) => {
//               aMap[a.questionId] = a.selectedOption;
//             });
//             setAptitudeAnswers(aMap);
//           }
//           if (st) {
//             const tMap = {};
//             st.forEach((a) => {
//               tMap[a.questionId] = a.selectedOption;
//             });
//             setTechnicalAnswers(tMap);
//           }
//           if (sc && sc.length > 0) {
//             setCodingAnswers(sc);
//           }
//           setSectionTimeLeft(d.remainingSeconds);
//         }
//       } catch (err) {
//         setError(err.response?.data?.message || "Failed to load assessment");
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [token]);

//   // ── Section timer ─────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (loading) return;
//     clearInterval(timerRef.current);
//     timerRef.current = setInterval(() => {
//       setSectionTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(timerRef.current);
//           handleSectionTimeout();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//     return () => clearInterval(timerRef.current);
//   }, [currentSection, loading]);

//   // ── Auto-save every 30s ───────────────────────────────────────────────────
//   useEffect(() => {
//     if (loading) return;
//     autoSaveRef.current = setInterval(() => {
//       autoSave();
//     }, 30000);
//     return () => clearInterval(autoSaveRef.current);
//   }, [loading, aptitudeAnswers, technicalAnswers, codingAnswers]);

//   // ── Tab switch detection ──────────────────────────────────────────────────
//   useEffect(() => {
//     const handleVisibility = () => {
//       if (document.hidden) {
//         tabSwitchCount.current += 1;
//         setTabWarning(true);
//         setTimeout(() => setTabWarning(false), 4000);
//       }
//     };
//     document.addEventListener("visibilitychange", handleVisibility);
//     return () =>
//       document.removeEventListener("visibilitychange", handleVisibility);
//   }, []);

//   const autoSave = async () => {
//     try {
//       const body = buildAnswerPayload();
//       await axios.post(`${BASE_URL}/api/attempt/save/${token}`, body);
//     } catch (_) {}
//   };

//   const buildAnswerPayload = () => {
//     const aptArr = Object.entries(aptitudeAnswers).map(([qId, opt]) => ({
//       questionId: qId,
//       selectedOption: opt,
//     }));
//     const techArr = Object.entries(technicalAnswers).map(([qId, opt]) => ({
//       questionId: qId,
//       selectedOption: opt,
//     }));
//     return {
//       aptitudeAnswers: aptArr,
//       technicalAnswers: techArr,
//       codingAnswers,
//     };
//   };

//   const handleSectionTimeout = () => {
//     if (currentSection < 2) {
//       const nextSection = currentSection + 1;
//       setCurrentSection(nextSection);
//       setCurrentQuestion(0);
//       const sectionKeys = ["aptitude", "technical", "coding"];
//       setSectionTimeLeft(timeLimit[sectionKeys[nextSection]] * 60);
//     } else {
//       handleSubmit(true);
//     }
//   };

//   const handleSubmit = async (auto = false) => {
//     if (!auto) {
//       const confirmed = window.confirm(
//         "Are you sure you want to submit the assessment? This cannot be undone.",
//       );
//       if (!confirmed) return;
//     }
//     clearInterval(timerRef.current);
//     clearInterval(autoSaveRef.current);
//     setSubmitting(true);
//     try {
//       const body = buildAnswerPayload();
//       await axios.post(`${BASE_URL}/api/attempt/submit/${token}`, body);
//       navigate(`/assessment/${token}/result`);
//     } catch (err) {
//       setError(err.response?.data?.message || "Submission failed");
//       setSubmitting(false);
//     }
//   };

//   // ── NEW: Run code against test cases ─────────────────────────────────────
//   const handleRunCode = async (problemIndex) => {
//     const problem = codingProblems[problemIndex];
//     const answer = codingAnswers[problemIndex];

//     if (!answer?.code?.trim()) {
//       setRunResults((prev) => ({
//         ...prev,
//         [problemIndex]: {
//           error: "Please write some code before running.",
//           results: [],
//         },
//       }));
//       return;
//     }

//     if (!problem.testCases || problem.testCases.length === 0) {
//       setRunResults((prev) => ({
//         ...prev,
//         [problemIndex]: {
//           error: "No test cases defined for this problem.",
//           results: [],
//         },
//       }));
//       return;
//     }

//     setRunning(true);
//     setRunResults((prev) => ({
//       ...prev,
//       [problemIndex]: { loading: true, results: [] },
//     }));

//     try {
//       const res = await axios.post(`${BASE_URL}/api/judge/run`, {
//         code: answer.code,
//         language: answer.language || "javascript",
//         testCases: problem.testCases,
//       });

//       setRunResults((prev) => ({
//         ...prev,
//         [problemIndex]: {
//           loading: false,
//           results: res.data.results,
//           passedCount: res.data.passedCount,
//           totalCount: res.data.totalCount,
//           marksAwarded: res.data.marksAwarded,
//           error: null,
//         },
//       }));
//     } catch (err) {
//       setRunResults((prev) => ({
//         ...prev,
//         [problemIndex]: {
//           loading: false,
//           results: [],
//           error:
//             err.response?.data?.message ||
//             "Execution failed. Please try again.",
//         },
//       }));
//     } finally {
//       setRunning(false);
//     }
//   };

//   const formatTime = (seconds) => {
//     const m = Math.floor(seconds / 60)
//       .toString()
//       .padStart(2, "0");
//     const s = (seconds % 60).toString().padStart(2, "0");
//     return `${m}:${s}`;
//   };

//   const isUrgent = sectionTimeLeft <= 120;

//   const currentQuestions =
//     currentSection === 0
//       ? aptitudeQuestions
//       : currentSection === 1
//         ? technicalQuestions
//         : [];

//   const currentAnswers =
//     currentSection === 0 ? aptitudeAnswers : technicalAnswers;

//   const setAnswer = (qId, option) => {
//     if (currentSection === 0)
//       setAptitudeAnswers((p) => ({ ...p, [qId]: option }));
//     else setTechnicalAnswers((p) => ({ ...p, [qId]: option }));
//   };

//   const answeredCount = Object.keys(currentAnswers).length;

//   // ── Loading ───────────────────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <div style={styles.page}>
//         <div style={styles.loadingCenter}>
//           <div style={styles.spinner} />
//           <p style={{ color: "#64748b" }}>Loading your assessment...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div style={styles.page}>
//         <div style={styles.loadingCenter}>
//           <div style={styles.errorCard}>
//             <p style={{ color: "#fca5a5" }}>{error}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const sectionLabels = ["Aptitude MCQ", "Technical MCQ", "Coding"];

//   return (
//     <div style={styles.page}>
//       {/* Tab switch warning */}
//       {tabWarning && (
//         <div style={styles.tabWarning}>
//           Tab switch detected ({tabSwitchCount.current} time
//           {tabSwitchCount.current > 1 ? "s" : ""}). This is being logged.
//         </div>
//       )}

//       {/* ── Top bar ── */}
//       <div style={styles.topBar}>
//         <div style={styles.topLeft}>
//           <span style={styles.assessmentLabel}>Assessment</span>
//           <div style={styles.sectionTabs}>
//             {sectionLabels.map((label, i) => (
//               <div
//                 key={i}
//                 style={{
//                   ...styles.sectionTab,
//                   background: currentSection === i ? "#1e293b" : "transparent",
//                   color: currentSection === i ? "#e2e8f0" : "#475569",
//                   borderBottom:
//                     currentSection === i
//                       ? "2px solid #6366f1"
//                       : "2px solid transparent",
//                 }}
//               >
//                 {i < currentSection ? "✓ " : ""}
//                 {label}
//               </div>
//             ))}
//           </div>
//         </div>
//         <div style={styles.topRight}>
//           <div
//             style={{
//               ...styles.timerBox,
//               background: isUrgent ? "#1e0a0a" : "#0f172a",
//               borderColor: isUrgent ? "#7f1d1d" : "#1e293b",
//               color: isUrgent ? "#fca5a5" : "#e2e8f0",
//             }}
//           >
//             <span style={styles.timerIcon}>⏱</span>
//             <span style={styles.timerVal}>{formatTime(sectionTimeLeft)}</span>
//           </div>
//           {currentSection === 2 && (
//             <button
//               style={styles.submitBtn}
//               onClick={() => handleSubmit(false)}
//               disabled={submitting}
//             >
//               {submitting ? "Submitting..." : "Submit All"}
//             </button>
//           )}
//         </div>
//       </div>

//       {/* ── MCQ Section ── */}
//       {currentSection < 2 && (
//         <div style={styles.mcqLayout}>
//           {/* Left: Question panel */}
//           <div style={styles.questionPanel}>
//             <div style={styles.qHeader}>
//               <span style={styles.qCounter}>
//                 Question {currentQuestion + 1} of {currentQuestions.length}
//               </span>
//               <span style={styles.qAnswered}>{answeredCount} answered</span>
//             </div>

//             <div style={styles.questionBox}>
//               <p style={styles.questionText}>
//                 {currentQuestions[currentQuestion]?.questionText}
//               </p>

//               <div style={styles.optionsList}>
//                 {currentQuestions[currentQuestion]?.options?.map((opt, oi) => {
//                   const qId = currentQuestions[currentQuestion]._id;
//                   const selected = currentAnswers[qId] === opt;
//                   return (
//                     <button
//                       key={oi}
//                       style={{
//                         ...styles.optionBtn,
//                         background: selected ? "#1e1b4b" : "#1e293b",
//                         border: `1px solid ${selected ? "#6366f1" : "#334155"}`,
//                         color: selected ? "#a5b4fc" : "#cbd5e1",
//                       }}
//                       onClick={() => setAnswer(qId, opt)}
//                     >
//                       <span
//                         style={{
//                           ...styles.optionDot,
//                           background: selected ? "#6366f1" : "#334155",
//                         }}
//                       >
//                         {["A", "B", "C", "D"][oi]}
//                       </span>
//                       {opt}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Navigation */}
//             <div style={styles.navRow}>
//               <button
//                 style={{
//                   ...styles.navBtn,
//                   opacity: currentQuestion === 0 ? 0.4 : 1,
//                 }}
//                 onClick={() => setCurrentQuestion((p) => Math.max(0, p - 1))}
//                 disabled={currentQuestion === 0}
//               >
//                 ← Previous
//               </button>

//               {currentQuestion < currentQuestions.length - 1 ? (
//                 <button
//                   style={styles.navBtnPrimary}
//                   onClick={() => setCurrentQuestion((p) => p + 1)}
//                 >
//                   Next →
//                 </button>
//               ) : (
//                 <button
//                   style={styles.navBtnPrimary}
//                   onClick={() => {
//                     if (currentSection < 2) {
//                       const next = currentSection + 1;
//                       setCurrentSection(next);
//                       setCurrentQuestion(0);
//                       const sectionKeys = ["aptitude", "technical", "coding"];
//                       setSectionTimeLeft(timeLimit[sectionKeys[next]] * 60);
//                     }
//                   }}
//                 >
//                   {currentSection === 1 ? "Go to Coding →" : "Next Section →"}
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Right: Question grid */}
//           <div style={styles.gridPanel}>
//             <p style={styles.gridTitle}>Questions</p>
//             <div style={styles.questionGrid}>
//               {currentQuestions.map((q, i) => {
//                 const answered = !!currentAnswers[q._id];
//                 const isCurrent = currentQuestion === i;
//                 return (
//                   <button
//                     key={i}
//                     style={{
//                       ...styles.gridBtn,
//                       background: isCurrent
//                         ? "#6366f1"
//                         : answered
//                           ? "#10b981"
//                           : "#1e293b",
//                       color: isCurrent || answered ? "#fff" : "#64748b",
//                       border: isCurrent
//                         ? "2px solid #818cf8"
//                         : "1px solid transparent",
//                     }}
//                     onClick={() => setCurrentQuestion(i)}
//                   >
//                     {i + 1}
//                   </button>
//                 );
//               })}
//             </div>

//             <div style={styles.legend}>
//               {[
//                 { color: "#6366f1", label: "Current" },
//                 { color: "#10b981", label: "Answered" },
//                 { color: "#1e293b", label: "Not visited" },
//               ].map(({ color, label }) => (
//                 <div key={label} style={styles.legendItem}>
//                   <span style={{ ...styles.legendDot, background: color }} />
//                   <span style={styles.legendLabel}>{label}</span>
//                 </div>
//               ))}
//             </div>

//             <button
//               style={styles.finishSectionBtn}
//               onClick={() => {
//                 if (currentSection < 2) {
//                   const next = currentSection + 1;
//                   setCurrentSection(next);
//                   setCurrentQuestion(0);
//                   const sectionKeys = ["aptitude", "technical", "coding"];
//                   setSectionTimeLeft(timeLimit[sectionKeys[next]] * 60);
//                 }
//               }}
//             >
//               {currentSection === 0 ? "Finish Aptitude →" : "Go to Coding →"}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ── Coding Section ── */}
//       {currentSection === 2 && (
//         <div style={styles.codingLayout}>
//           {/* Problem list sidebar */}
//           <div style={styles.problemSidebar}>
//             <p style={styles.gridTitle}>Problems</p>
//             {codingProblems.map((p, i) => {
//               const result = runResults[i];
//               const allPassed =
//                 result?.passedCount === result?.totalCount &&
//                 result?.totalCount > 0;
//               const somePassed = result?.passedCount > 0 && !allPassed;
//               return (
//                 <button
//                   key={i}
//                   style={{
//                     ...styles.problemTabBtn,
//                     background:
//                       currentQuestion === i ? "#1e293b" : "transparent",
//                     borderLeft: `3px solid ${
//                       currentQuestion === i ? "#6366f1" : "transparent"
//                     }`,
//                     color: currentQuestion === i ? "#e2e8f0" : "#64748b",
//                   }}
//                   onClick={() => setCurrentQuestion(i)}
//                 >
//                   <span style={styles.problemNum}>P{i + 1}</span>
//                   {p.title}
//                   {/* ── NEW: show pass/fail indicator per problem ── */}
//                   {allPassed && <span style={styles.allPassedBadge}>✓</span>}
//                   {somePassed && (
//                     <span style={styles.somePassedBadge}>
//                       {result.passedCount}/{result.totalCount}
//                     </span>
//                   )}
//                   {result &&
//                     !allPassed &&
//                     !somePassed &&
//                     result.totalCount > 0 && (
//                       <span style={styles.failedBadge}>✕</span>
//                     )}
//                   {codingAnswers[i]?.code?.trim() && !result && (
//                     <span style={styles.codedBadge}>✎</span>
//                   )}
//                 </button>
//               );
//             })}

//             <button
//               style={styles.submitAllBtn}
//               onClick={() => handleSubmit(false)}
//               disabled={submitting}
//             >
//               {submitting ? "Submitting..." : "Submit Assessment"}
//             </button>
//           </div>

//           {/* Problem + editor */}
//           <div style={styles.codingMain}>
//             {codingProblems[currentQuestion] && (
//               <>
//                 {/* Problem statement */}
//                 <div style={styles.problemStatement}>
//                   <h3 style={styles.problemTitle}>
//                     {codingProblems[currentQuestion].title}
//                     <span style={styles.marksBadge}>
//                       {codingProblems[currentQuestion].marks} marks
//                     </span>
//                   </h3>
//                   <p style={styles.problemDesc}>
//                     {codingProblems[currentQuestion].description}
//                   </p>

//                   {codingProblems[currentQuestion].sampleInput && (
//                     <div style={styles.sampleBlock}>
//                       <p style={styles.sampleLabel}>Sample Input:</p>
//                       <pre style={styles.sampleCode}>
//                         {codingProblems[currentQuestion].sampleInput}
//                       </pre>
//                     </div>
//                   )}
//                   {codingProblems[currentQuestion].sampleOutput && (
//                     <div style={styles.sampleBlock}>
//                       <p style={styles.sampleLabel}>Sample Output:</p>
//                       <pre style={styles.sampleCode}>
//                         {codingProblems[currentQuestion].sampleOutput}
//                       </pre>
//                     </div>
//                   )}
//                 </div>

//                 {/* ── Editor area ── */}
//                 <div style={styles.editorArea}>
//                   {/* Editor header */}
//                   <div style={styles.editorHeader}>
//                     <select
//                       style={styles.langSelect}
//                       value={
//                         codingAnswers[currentQuestion]?.language || "javascript"
//                       }
//                       onChange={(e) => {
//                         const newLang = e.target.value;
//                         const updated = [...codingAnswers];
//                         const currentCode =
//                           updated[currentQuestion]?.code || "";

//                         // ✅ If editor has only starter code or is empty,
//                         // replace with starter code for the new language.
//                         // If candidate has written real code, keep it.
//                         const isStarterCode = Object.values(STARTER_CODE).some(
//                           (sc) => sc.trim() === currentCode.trim(),
//                         );
//                         const newCode =
//                           !currentCode.trim() || isStarterCode
//                             ? STARTER_CODE[newLang] || ""
//                             : currentCode;

//                         updated[currentQuestion] = {
//                           ...updated[currentQuestion],
//                           language: newLang,
//                           code: newCode,
//                         };
//                         setCodingAnswers(updated);
//                         // clear run results when language changes
//                         setRunResults((prev) => ({
//                           ...prev,
//                           [currentQuestion]: null,
//                         }));
//                       }}
//                     >
//                       {["javascript", "python", "java", "cpp", "c"].map(
//                         (lang) => (
//                           <option key={lang} value={lang}>
//                             {lang}
//                           </option>
//                         ),
//                       )}
//                     </select>

//                     <span style={styles.editorHint}>
//                       Write your solution below · Read input from stdin · Print
//                       output to stdout
//                     </span>

//                     {/* ── NEW: Run Code button ── */}
//                     <button
//                       style={{
//                         ...styles.runBtn,
//                         opacity: running ? 0.6 : 1,
//                         cursor: running ? "not-allowed" : "pointer",
//                       }}
//                       onClick={() => handleRunCode(currentQuestion)}
//                       disabled={running}
//                     >
//                       {running ? (
//                         <>
//                           <span style={styles.runSpinner} /> Running...
//                         </>
//                       ) : (
//                         <>▶ Run Code</>
//                       )}
//                     </button>
//                   </div>

//                   {/* ── NEW: Monaco Editor replacing textarea ── */}
//                   <div style={styles.monacoWrapper}>
//                     <Editor
//                       height="100%"
//                       language={
//                         MONACO_LANGUAGE_MAP[
//                           codingAnswers[currentQuestion]?.language
//                         ] || "javascript"
//                       }
//                       value={codingAnswers[currentQuestion]?.code || ""}
//                       theme="vs-dark"
//                       onChange={(value) => {
//                         const updated = [...codingAnswers];
//                         updated[currentQuestion] = {
//                           ...updated[currentQuestion],
//                           code: value || "",
//                         };
//                         setCodingAnswers(updated);
//                       }}
//                       options={{
//                         fontSize: 14,
//                         fontFamily:
//                           "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
//                         minimap: { enabled: false },
//                         scrollBeyondLastLine: false,
//                         lineNumbers: "on",
//                         roundedSelection: true,
//                         automaticLayout: true,
//                         tabSize: 2,
//                         wordWrap: "on",
//                         padding: { top: 12 },
//                         suggest: { showKeywords: true },
//                       }}
//                     />
//                   </div>

//                   {/* ── NEW: Test case results panel ── */}
//                   {runResults[currentQuestion] && (
//                     <div style={styles.resultsPanel}>
//                       {/* Loading state */}
//                       {runResults[currentQuestion].loading && (
//                         <div style={styles.resultsLoading}>
//                           <div style={styles.runSpinnerLg} />
//                           <span
//                             style={{ color: "#64748b", fontSize: "0.85rem" }}
//                           >
//                             Running your code against test cases...
//                           </span>
//                         </div>
//                       )}

//                       {/* Error state */}
//                       {!runResults[currentQuestion].loading &&
//                         runResults[currentQuestion].error && (
//                           <div style={styles.resultsError}>
//                             ⚠ {runResults[currentQuestion].error}
//                           </div>
//                         )}

//                       {/* Results */}
//                       {!runResults[currentQuestion].loading &&
//                         !runResults[currentQuestion].error &&
//                         runResults[currentQuestion].results?.length > 0 && (
//                           <>
//                             {/* Summary bar */}
//                             <div style={styles.resultsSummary}>
//                               <span style={styles.resultsSummaryText}>
//                                 Test Results
//                               </span>
//                               <div style={styles.resultsSummaryRight}>
//                                 <span
//                                   style={{
//                                     ...styles.passedBadge,
//                                     background:
//                                       runResults[currentQuestion]
//                                         .passedCount ===
//                                       runResults[currentQuestion].totalCount
//                                         ? "#022c22"
//                                         : "#1e0a0a",
//                                     color:
//                                       runResults[currentQuestion]
//                                         .passedCount ===
//                                       runResults[currentQuestion].totalCount
//                                         ? "#6ee7b7"
//                                         : "#fca5a5",
//                                     border: `1px solid ${
//                                       runResults[currentQuestion]
//                                         .passedCount ===
//                                       runResults[currentQuestion].totalCount
//                                         ? "#065f46"
//                                         : "#7f1d1d"
//                                     }`,
//                                   }}
//                                 >
//                                   {runResults[currentQuestion].passedCount}/
//                                   {runResults[currentQuestion].totalCount}{" "}
//                                   passed
//                                 </span>
//                                 <span style={styles.marksPreview}>
//                                   ~{runResults[currentQuestion].marksAwarded} /
//                                   10 marks
//                                 </span>
//                               </div>
//                             </div>

//                             {/* Individual test case rows */}
//                             <div style={styles.testCaseList}>
//                               {runResults[currentQuestion].results.map(
//                                 (r, i) => (
//                                   <div
//                                     key={i}
//                                     style={{
//                                       ...styles.testCaseRow,
//                                       borderLeft: `3px solid ${
//                                         r.passed ? "#10b981" : "#ef4444"
//                                       }`,
//                                     }}
//                                   >
//                                     <div style={styles.testCaseHeader}>
//                                       <span
//                                         style={{
//                                           ...styles.testCaseStatus,
//                                           color: r.passed
//                                             ? "#10b981"
//                                             : "#ef4444",
//                                         }}
//                                       >
//                                         {r.passed ? "✓ Passed" : "✕ Failed"}
//                                       </span>
//                                       <span style={styles.testCaseNum}>
//                                         Test Case {i + 1}
//                                       </span>
//                                     </div>

//                                     <div style={styles.testCaseDetails}>
//                                       {r.input && (
//                                         <div style={styles.tcDetail}>
//                                           <span style={styles.tcDetailLabel}>
//                                             Input:
//                                           </span>
//                                           <code style={styles.tcDetailCode}>
//                                             {r.input}
//                                           </code>
//                                         </div>
//                                       )}
//                                       <div style={styles.tcDetail}>
//                                         <span style={styles.tcDetailLabel}>
//                                           Expected:
//                                         </span>
//                                         <code style={styles.tcDetailCode}>
//                                           {r.expectedOutput || "(empty)"}
//                                         </code>
//                                       </div>
//                                       <div style={styles.tcDetail}>
//                                         <span style={styles.tcDetailLabel}>
//                                           Got:
//                                         </span>
//                                         <code
//                                           style={{
//                                             ...styles.tcDetailCode,
//                                             color: r.passed
//                                               ? "#6ee7b7"
//                                               : "#fca5a5",
//                                           }}
//                                         >
//                                           {r.actualOutput || "(empty)"}
//                                         </code>
//                                       </div>
//                                       {r.errorMessage && (
//                                         <div style={styles.tcDetail}>
//                                           <span
//                                             style={{
//                                               ...styles.tcDetailLabel,
//                                               color: "#fca5a5",
//                                             }}
//                                           >
//                                             Error:
//                                           </span>
//                                           <code
//                                             style={{
//                                               ...styles.tcDetailCode,
//                                               color: "#fca5a5",
//                                             }}
//                                           >
//                                             {r.errorMessage}
//                                           </code>
//                                         </div>
//                                       )}
//                                     </div>
//                                   </div>
//                                 ),
//                               )}
//                             </div>
//                           </>
//                         )}
//                     </div>
//                   )}
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Styles ────────────────────────────────────────────────────────────────────
// const styles = {
//   page: {
//     minHeight: "100vh",
//     background: "#0a0f1e",
//     fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
//     display: "flex",
//     flexDirection: "column",
//   },
//   loadingCenter: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     justifyContent: "center",
//     minHeight: "100vh",
//     gap: "1rem",
//   },
//   spinner: {
//     width: "36px",
//     height: "36px",
//     border: "3px solid #1e293b",
//     borderTop: "3px solid #6366f1",
//     borderRadius: "50%",
//     animation: "spin 0.8s linear infinite",
//   },
//   errorCard: {
//     background: "#1e0a0a",
//     border: "1px solid #7f1d1d",
//     borderRadius: "12px",
//     padding: "2rem",
//   },
//   tabWarning: {
//     background: "#451a03",
//     color: "#fed7aa",
//     textAlign: "center",
//     padding: "0.6rem",
//     fontSize: "0.85rem",
//     borderBottom: "1px solid #92400e",
//   },
//   topBar: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     background: "#0f172a",
//     borderBottom: "1px solid #1e293b",
//     padding: "0 1.5rem",
//     height: "56px",
//     flexShrink: 0,
//   },
//   topLeft: { display: "flex", alignItems: "center", gap: "2rem" },
//   assessmentLabel: {
//     fontSize: "0.8rem",
//     color: "#475569",
//     fontWeight: 600,
//     textTransform: "uppercase",
//     letterSpacing: "0.08em",
//   },
//   sectionTabs: { display: "flex", gap: "0" },
//   sectionTab: {
//     padding: "0 1.25rem",
//     height: "56px",
//     display: "flex",
//     alignItems: "center",
//     fontSize: "0.85rem",
//     fontWeight: 500,
//     cursor: "default",
//     transition: "all 0.15s",
//   },
//   topRight: { display: "flex", alignItems: "center", gap: "1rem" },
//   timerBox: {
//     display: "flex",
//     alignItems: "center",
//     gap: "0.4rem",
//     border: "1px solid",
//     borderRadius: "8px",
//     padding: "0.4rem 0.9rem",
//     fontFamily: "monospace",
//   },
//   timerIcon: { fontSize: "0.9rem" },
//   timerVal: { fontSize: "1.1rem", fontWeight: 700 },
//   submitBtn: {
//     background: "#6366f1",
//     color: "#fff",
//     border: "none",
//     borderRadius: "8px",
//     padding: "0.5rem 1.2rem",
//     fontWeight: 600,
//     fontSize: "0.88rem",
//     cursor: "pointer",
//   },

//   // ── MCQ styles ──
//   mcqLayout: {
//     display: "grid",
//     gridTemplateColumns: "1fr 240px",
//     flex: 1,
//     overflow: "hidden",
//   },
//   questionPanel: {
//     padding: "2rem",
//     overflowY: "auto",
//     display: "flex",
//     flexDirection: "column",
//     gap: "1.5rem",
//   },
//   qHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   qCounter: { fontSize: "0.85rem", color: "#64748b", fontWeight: 600 },
//   qAnswered: {
//     fontSize: "0.78rem",
//     color: "#10b981",
//     background: "#022c22",
//     padding: "3px 10px",
//     borderRadius: "999px",
//     border: "1px solid #065f46",
//   },
//   questionBox: {
//     background: "#0f172a",
//     border: "1px solid #1e293b",
//     borderRadius: "12px",
//     padding: "1.75rem",
//   },
//   questionText: {
//     fontSize: "1rem",
//     color: "#e2e8f0",
//     lineHeight: 1.7,
//     margin: "0 0 1.5rem",
//   },
//   optionsList: { display: "flex", flexDirection: "column", gap: "0.75rem" },
//   optionBtn: {
//     display: "flex",
//     alignItems: "center",
//     gap: "0.9rem",
//     padding: "0.85rem 1rem",
//     borderRadius: "10px",
//     cursor: "pointer",
//     textAlign: "left",
//     fontSize: "0.9rem",
//     transition: "all 0.15s",
//     width: "100%",
//   },
//   optionDot: {
//     width: "28px",
//     height: "28px",
//     borderRadius: "6px",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: "0.75rem",
//     fontWeight: 700,
//     color: "#fff",
//     flexShrink: 0,
//   },
//   navRow: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   navBtn: {
//     background: "transparent",
//     border: "1px solid #334155",
//     color: "#94a3b8",
//     borderRadius: "8px",
//     padding: "0.6rem 1.2rem",
//     cursor: "pointer",
//     fontSize: "0.88rem",
//   },
//   navBtnPrimary: {
//     background: "#6366f1",
//     border: "none",
//     color: "#fff",
//     borderRadius: "8px",
//     padding: "0.6rem 1.4rem",
//     cursor: "pointer",
//     fontSize: "0.88rem",
//     fontWeight: 600,
//   },
//   gridPanel: {
//     background: "#0f172a",
//     borderLeft: "1px solid #1e293b",
//     padding: "1.5rem",
//     display: "flex",
//     flexDirection: "column",
//     gap: "1rem",
//     overflowY: "auto",
//   },
//   gridTitle: {
//     fontSize: "0.72rem",
//     color: "#475569",
//     textTransform: "uppercase",
//     letterSpacing: "0.08em",
//     fontWeight: 600,
//     margin: 0,
//   },
//   questionGrid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(5, 1fr)",
//     gap: "0.4rem",
//   },
//   gridBtn: {
//     width: "100%",
//     aspectRatio: "1",
//     borderRadius: "6px",
//     border: "none",
//     fontSize: "0.78rem",
//     fontWeight: 600,
//     cursor: "pointer",
//     transition: "all 0.15s",
//   },
//   legend: { display: "flex", flexDirection: "column", gap: "0.4rem" },
//   legendItem: { display: "flex", alignItems: "center", gap: "0.5rem" },
//   legendDot: {
//     width: "10px",
//     height: "10px",
//     borderRadius: "3px",
//     flexShrink: 0,
//   },
//   legendLabel: { fontSize: "0.75rem", color: "#64748b" },
//   finishSectionBtn: {
//     background: "#1e293b",
//     border: "1px solid #334155",
//     color: "#94a3b8",
//     borderRadius: "8px",
//     padding: "0.6rem",
//     fontSize: "0.82rem",
//     cursor: "pointer",
//     marginTop: "auto",
//   },

//   // ── Coding styles ──
//   codingLayout: {
//     display: "grid",
//     gridTemplateColumns: "200px 1fr",
//     flex: 1,
//     overflow: "hidden",
//     minHeight: 0,
//   },
//   problemSidebar: {
//     background: "#0f172a",
//     borderRight: "1px solid #1e293b",
//     padding: "1.25rem",
//     display: "flex",
//     flexDirection: "column",
//     gap: "0.4rem",
//     overflowY: "auto",
//   },
//   problemTabBtn: {
//     display: "flex",
//     alignItems: "center",
//     gap: "0.6rem",
//     padding: "0.7rem 0.9rem",
//     borderRadius: "0 8px 8px 0",
//     border: "none",
//     borderLeft: "3px solid transparent",
//     cursor: "pointer",
//     fontSize: "0.85rem",
//     fontWeight: 500,
//     textAlign: "left",
//     transition: "all 0.15s",
//   },
//   problemNum: {
//     fontSize: "0.7rem",
//     color: "#475569",
//     fontWeight: 700,
//     minWidth: "20px",
//   },
//   codedBadge: { marginLeft: "auto", color: "#64748b", fontSize: "0.75rem" },
//   allPassedBadge: {
//     marginLeft: "auto",
//     color: "#10b981",
//     fontSize: "0.8rem",
//     fontWeight: 700,
//   },
//   somePassedBadge: {
//     marginLeft: "auto",
//     color: "#f59e0b",
//     fontSize: "0.72rem",
//     fontWeight: 700,
//     background: "#1c1408",
//     padding: "1px 6px",
//     borderRadius: "4px",
//     border: "1px solid #92400e",
//   },
//   failedBadge: {
//     marginLeft: "auto",
//     color: "#ef4444",
//     fontSize: "0.8rem",
//     fontWeight: 700,
//   },
//   submitAllBtn: {
//     marginTop: "auto",
//     background: "#6366f1",
//     color: "#fff",
//     border: "none",
//     borderRadius: "8px",
//     padding: "0.7rem",
//     fontWeight: 600,
//     fontSize: "0.88rem",
//     cursor: "pointer",
//   },
//   codingMain: {
//     display: "flex",
//     flexDirection: "column",
//     overflow: "hidden",
//     minHeight: 0,
//   },
//   problemStatement: {
//     padding: "1.25rem 1.5rem",
//     borderBottom: "1px solid #1e293b",
//     overflowY: "auto",
//     maxHeight: "35vh",
//     flexShrink: 0,
//   },
//   problemTitle: {
//     display: "flex",
//     alignItems: "center",
//     gap: "1rem",
//     color: "#e2e8f0",
//     fontSize: "1.05rem",
//     fontWeight: 700,
//     margin: "0 0 0.75rem",
//   },
//   marksBadge: {
//     background: "#1e293b",
//     color: "#f59e0b",
//     fontSize: "0.75rem",
//     padding: "3px 10px",
//     borderRadius: "999px",
//     fontWeight: 600,
//   },
//   problemDesc: {
//     color: "#94a3b8",
//     fontSize: "0.88rem",
//     lineHeight: 1.7,
//     margin: "0 0 0.75rem",
//     whiteSpace: "pre-wrap",
//   },
//   sampleBlock: { marginBottom: "0.6rem" },
//   sampleLabel: {
//     fontSize: "0.72rem",
//     color: "#64748b",
//     fontWeight: 600,
//     textTransform: "uppercase",
//     letterSpacing: "0.06em",
//     marginBottom: "0.3rem",
//   },
//   sampleCode: {
//     background: "#1e293b",
//     borderRadius: "6px",
//     padding: "0.5rem 0.8rem",
//     fontSize: "0.8rem",
//     color: "#94a3b8",
//     fontFamily: "monospace",
//     margin: 0,
//     overflowX: "auto",
//   },
//   editorArea: {
//     flex: 1,
//     display: "flex",
//     flexDirection: "column",
//     overflow: "hidden",
//     minHeight: 0,
//   },
//   editorHeader: {
//     display: "flex",
//     alignItems: "center",
//     gap: "0.75rem",
//     padding: "0.5rem 1rem",
//     background: "#0f172a",
//     borderBottom: "1px solid #1e293b",
//     flexShrink: 0,
//   },
//   langSelect: {
//     background: "#1e293b",
//     border: "1px solid #334155",
//     color: "#94a3b8",
//     borderRadius: "6px",
//     padding: "4px 8px",
//     fontSize: "0.82rem",
//     cursor: "pointer",
//     outline: "none",
//   },
//   editorHint: { fontSize: "0.75rem", color: "#334155", flex: 1 },

//   // ── NEW: Run button styles ──
//   runBtn: {
//     display: "flex",
//     alignItems: "center",
//     gap: "0.4rem",
//     background: "#10b981",
//     color: "#fff",
//     border: "none",
//     borderRadius: "7px",
//     padding: "0.45rem 1rem",
//     fontSize: "0.82rem",
//     fontWeight: 700,
//     cursor: "pointer",
//     boxShadow: "0 0 12px rgba(16,185,129,0.3)",
//     flexShrink: 0,
//   },
//   runSpinner: {
//     width: "12px",
//     height: "12px",
//     border: "2px solid rgba(255,255,255,0.3)",
//     borderTop: "2px solid #fff",
//     borderRadius: "50%",
//     animation: "spin 0.6s linear infinite",
//     display: "inline-block",
//   },

//   // ── NEW: Monaco wrapper ──
//   monacoWrapper: {
//     flex: 1,
//     minHeight: 0,
//     overflow: "hidden",
//   },

//   // ── NEW: Test results panel ──
//   resultsPanel: {
//     background: "#060d1a",
//     borderTop: "1px solid #1e293b",
//     maxHeight: "280px",
//     overflowY: "auto",
//     flexShrink: 0,
//   },
//   resultsLoading: {
//     display: "flex",
//     alignItems: "center",
//     gap: "0.75rem",
//     padding: "1rem 1.25rem",
//   },
//   runSpinnerLg: {
//     width: "18px",
//     height: "18px",
//     border: "2px solid #1e293b",
//     borderTop: "2px solid #10b981",
//     borderRadius: "50%",
//     animation: "spin 0.6s linear infinite",
//     flexShrink: 0,
//   },
//   resultsError: {
//     padding: "0.75rem 1.25rem",
//     color: "#fca5a5",
//     fontSize: "0.85rem",
//     background: "#1e0a0a",
//     borderBottom: "1px solid #7f1d1d",
//   },
//   resultsSummary: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: "0.6rem 1.25rem",
//     borderBottom: "1px solid #1e293b",
//     position: "sticky",
//     top: 0,
//     background: "#060d1a",
//     zIndex: 1,
//   },
//   resultsSummaryText: {
//     fontSize: "0.72rem",
//     color: "#475569",
//     fontWeight: 600,
//     textTransform: "uppercase",
//     letterSpacing: "0.07em",
//   },
//   resultsSummaryRight: {
//     display: "flex",
//     alignItems: "center",
//     gap: "0.75rem",
//   },
//   passedBadge: {
//     fontSize: "0.75rem",
//     fontWeight: 700,
//     padding: "3px 10px",
//     borderRadius: "999px",
//   },
//   marksPreview: {
//     fontSize: "0.75rem",
//     color: "#f59e0b",
//     fontWeight: 600,
//   },
//   testCaseList: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "0",
//   },
//   testCaseRow: {
//     padding: "0.75rem 1.25rem",
//     borderBottom: "1px solid #0f172a",
//   },
//   testCaseHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "0.5rem",
//   },
//   testCaseStatus: {
//     fontSize: "0.8rem",
//     fontWeight: 700,
//   },
//   testCaseNum: {
//     fontSize: "0.72rem",
//     color: "#334155",
//   },
//   testCaseDetails: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "0.25rem",
//   },
//   tcDetail: {
//     display: "flex",
//     alignItems: "flex-start",
//     gap: "0.5rem",
//   },
//   tcDetailLabel: {
//     fontSize: "0.72rem",
//     color: "#475569",
//     minWidth: "64px",
//     paddingTop: "2px",
//     fontWeight: 500,
//   },
//   tcDetailCode: {
//     fontSize: "0.78rem",
//     color: "#94a3b8",
//     fontFamily: "monospace",
//     background: "#1e293b",
//     padding: "1px 6px",
//     borderRadius: "4px",
//     wordBreak: "break-all",
//   },
// };

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";

import { BASE_URL } from "../../../utils/apiPaths";

const SECTIONS = ["aptitude", "technical", "coding"];

// ── Monaco language map ───────────────────────────────────────────────────────
const MONACO_LANGUAGE_MAP = {
  javascript: "javascript",
  python: "python",
  java: "java",
  cpp: "cpp",
  c: "c",
};

// ── Fallback starter code if employer did not define function signature ────────
const FALLBACK_STARTER = {
  javascript: `// Write your solution function here
// Do NOT include process.stdin or console.log
// Just write the function

`,
  python: `# Write your solution function here
# Do NOT include input() or print()
# Just write the function

`,
  java: `// Write your solution function here
// Do NOT include main() or Scanner
// Just write the function

`,
  cpp: `// Write your solution function here
// Do NOT include main() or cin/cout
// Just write the function

`,
  c: `// Write your solution function here
// Do NOT include main() or scanf/printf
// Just write the function

`,
};

// ── Get starter code for a problem + language ─────────────────────────────────
// Uses employer-defined function signature if available
// Falls back to generic template if not
const getStarterCode = (problem, language) => {
  const sig = problem?.functionSignatures?.[language];
  if (sig && sig.trim()) return sig;
  return FALLBACK_STARTER[language] || "// Write your solution here\n";
};

export default function AssessmentTest() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Assessment data
  const [aptitudeQuestions, setAptitudeQuestions] = useState([]);
  const [technicalQuestions, setTechnicalQuestions] = useState([]);
  const [codingProblems, setCodingProblems] = useState([]);
  const [timeLimit, setTimeLimit] = useState({
    aptitude: 20,
    technical: 20,
    coding: 40,
  });

  // Navigation
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Answers
  const [aptitudeAnswers, setAptitudeAnswers] = useState({});
  const [technicalAnswers, setTechnicalAnswers] = useState({});
  const [codingAnswers, setCodingAnswers] = useState([]);

  // Timer
  const [sectionTimeLeft, setSectionTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);

  // Tab switch detection
  const tabSwitchCount = useRef(0);
  const [tabWarning, setTabWarning] = useState(false);

  // ── NEW: code execution state ─────────────────────────────────────────────
  const [running, setRunning] = useState(false);
  const [runResults, setRunResults] = useState({}); // { [problemIndex]: results }

  // ── Load assessment ───────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.post(`${BASE_URL}/api/attempt/start/${token}`);
        const d = res.data;
        setAptitudeQuestions(d.aptitudeQuestions);
        setTechnicalQuestions(d.technicalQuestions);
        setCodingProblems(d.codingProblems);
        setTimeLimit(d.timeLimit);
        setSectionTimeLeft(d.timeLimit.aptitude * 60);

        // ✅ Load function signature as starter code so candidate sees
        // exactly what function to implement — no stdin/stdout confusion
        setCodingAnswers(
          d.codingProblems.map((p) => ({
            problemId: p._id,
            code: getStarterCode(p, "javascript"),
            language: "javascript",
          })),
        );

        // if (d.alreadyStarted && d.savedAnswers) {
        //   const {
        //     aptitudeAnswers: sa,
        //     technicalAnswers: st,
        //     codingAnswers: sc,
        //   } = d.savedAnswers;
        //   if (sa) {
        //     const aMap = {};
        //     sa.forEach((a) => {
        //       aMap[a.questionId] = a.selectedOption;
        //     });
        //     setAptitudeAnswers(aMap);
        //   }
        //   if (st) {
        //     const tMap = {};
        //     st.forEach((a) => {
        //       tMap[a.questionId] = a.selectedOption;
        //     });
        //     setTechnicalAnswers(tMap);
        //   }
        //   if (sc && sc.length > 0) {
        //     setCodingAnswers(sc);
        //   }
        //   setSectionTimeLeft(d.remainingSeconds);
        // }
        // ✅ CORRECT — restore section, timer, and answers properly
        if (d.alreadyStarted && d.savedAnswers) {
          const {
            aptitudeAnswers: sa,
            technicalAnswers: st,
            codingAnswers: sc,
          } = d.savedAnswers;

          if (sa) {
            const aMap = {};
            sa.forEach((a) => {
              aMap[a.questionId] = a.selectedOption;
            });
            setAptitudeAnswers(aMap);
          }
          if (st) {
            const tMap = {};
            st.forEach((a) => {
              tMap[a.questionId] = a.selectedOption;
            });
            setTechnicalAnswers(tMap);
          }
          if (sc && sc.length > 0) {
            setCodingAnswers(sc);
          }

          // ✅ restore correct section
          if (typeof d.currentSection === "number") {
            setCurrentSection(d.currentSection);
          }

          // ✅ NEW — restore question index
          if (typeof d.currentQuestion === "number") {
            setCurrentQuestion(d.currentQuestion);
          }

          // ✅ restore correct remaining time for that section
          setSectionTimeLeft(d.remainingSeconds);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load assessment");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  // ── Section timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSectionTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSectionTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentSection, loading]);

  // ── Auto-save every 30s ───────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    autoSaveRef.current = setInterval(() => {
      autoSave();
    }, 30000);
    return () => clearInterval(autoSaveRef.current);
  }, [loading, aptitudeAnswers, technicalAnswers, codingAnswers]);

  // ── Tab switch detection ──────────────────────────────────────────────────
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        tabSwitchCount.current += 1;
        setTabWarning(true);
        setTimeout(() => setTabWarning(false), 4000);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const autoSave = async () => {
    try {
      const body = buildAnswerPayload();
      await axios.post(`${BASE_URL}/api/attempt/save/${token}`, body);
    } catch (_) {}
  };

  const buildAnswerPayload = () => {
    const aptArr = Object.entries(aptitudeAnswers).map(([qId, opt]) => ({
      questionId: qId,
      selectedOption: opt,
    }));
    const techArr = Object.entries(technicalAnswers).map(([qId, opt]) => ({
      questionId: qId,
      selectedOption: opt,
    }));
    return {
      aptitudeAnswers: aptArr,
      technicalAnswers: techArr,
      codingAnswers,
    };
  };

  const handleSectionTimeout = () => {
    if (currentSection < 2) {
      const nextSection = currentSection + 1;
      setCurrentSection(nextSection);
      setCurrentQuestion(0);
      const sectionKeys = ["aptitude", "technical", "coding"];
      setSectionTimeLeft(timeLimit[sectionKeys[nextSection]] * 60);
    } else {
      handleSubmit(true);
    }
  };

  const handleSubmit = async (auto = false) => {
    if (!auto) {
      const confirmed = window.confirm(
        "Are you sure you want to submit the assessment? This cannot be undone.",
      );
      if (!confirmed) return;
    }
    clearInterval(timerRef.current);
    clearInterval(autoSaveRef.current);
    setSubmitting(true);
    try {
      const body = buildAnswerPayload();
      await axios.post(`${BASE_URL}/api/attempt/submit/${token}`, body);
      navigate(`/assessment/${token}/result`);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed");
      setSubmitting(false);
    }
  };

  // ── Run code against test cases ─────────────────────────────────────
  const handleRunCode = async (problemIndex) => {
    const problem = codingProblems[problemIndex];
    const answer = codingAnswers[problemIndex];

    if (!answer?.code?.trim()) {
      setRunResults((prev) => ({
        ...prev,
        [problemIndex]: {
          error: "Please write some code before running.",
          results: [],
        },
      }));
      return;
    }

    if (!problem.testCases || problem.testCases.length === 0) {
      setRunResults((prev) => ({
        ...prev,
        [problemIndex]: {
          error: "No test cases defined for this problem.",
          results: [],
        },
      }));
      return;
    }

    setRunning(true);
    setRunResults((prev) => ({
      ...prev,
      [problemIndex]: { loading: true, results: [] },
    }));

    try {
      // ✅ Get driver template for the selected language
      const currentLang = answer.language || "javascript";
      const driverTemplate = problem.driverTemplates?.[currentLang] || "";

      const res = await axios.post(`${BASE_URL}/api/judge/run`, {
        code: answer.code,
        language: currentLang,
        testCases: problem.testCases,
        driverTemplate, // ✅ pass driver to backend
      });

      setRunResults((prev) => ({
        ...prev,
        [problemIndex]: {
          loading: false,
          results: res.data.results,
          passedCount: res.data.passedCount,
          totalCount: res.data.totalCount,
          marksAwarded: res.data.marksAwarded,
          error: null,
        },
      }));
    } catch (err) {
      setRunResults((prev) => ({
        ...prev,
        [problemIndex]: {
          loading: false,
          results: [],
          error:
            err.response?.data?.message ||
            "Execution failed. Please try again.",
        },
      }));
    } finally {
      setRunning(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const isUrgent = sectionTimeLeft <= 120;

  const currentQuestions =
    currentSection === 0
      ? aptitudeQuestions
      : currentSection === 1
        ? technicalQuestions
        : [];

  const currentAnswers =
    currentSection === 0 ? aptitudeAnswers : technicalAnswers;

  // const setAnswer = (qId, option) => {
  //   if (currentSection === 0)
  //     setAptitudeAnswers((p) => ({ ...p, [qId]: option }));
  //   else setTechnicalAnswers((p) => ({ ...p, [qId]: option }));
  // };
  // ✅ NEW — saves answers immediately to backend
  const saveAnswersNow = async (aptAnswers, techAnswers) => {
    try {
      const aptArr = Object.entries(aptAnswers).map(([qId, opt]) => ({
        questionId: qId,
        selectedOption: opt,
      }));
      const techArr = Object.entries(techAnswers).map(([qId, opt]) => ({
        questionId: qId,
        selectedOption: opt,
      }));
      await axios.post(`${BASE_URL}/api/attempt/save/${token}`, {
        aptitudeAnswers: aptArr,
        technicalAnswers: techArr,
        codingAnswers,
      });
    } catch (_) {
      // silent fail — auto save will catch it in 30 seconds
    }
  };

  // ✅ FIXED — updates state AND immediately saves to backend
  const setAnswer = (qId, option) => {
    if (currentSection === 0) {
      setAptitudeAnswers((p) => {
        const updated = { ...p, [qId]: option };
        // immediately save to backend
        saveAnswersNow(updated, technicalAnswers);
        return updated;
      });
    } else {
      setTechnicalAnswers((p) => {
        const updated = { ...p, [qId]: option };
        // immediately save to backend
        saveAnswersNow(aptitudeAnswers, updated);
        return updated;
      });
    }
  };

  const answeredCount = Object.keys(currentAnswers).length;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCenter}>
          <div style={styles.spinner} />
          <p style={{ color: "#64748b" }}>Loading your assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCenter}>
          <div style={styles.errorCard}>
            <p style={{ color: "#fca5a5" }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const sectionLabels = ["Aptitude MCQ", "Technical MCQ", "Coding"];

  return (
    <div style={styles.page}>
      {/* Tab switch warning */}
      {tabWarning && (
        <div style={styles.tabWarning}>
          Tab switch detected ({tabSwitchCount.current} time
          {tabSwitchCount.current > 1 ? "s" : ""}). This is being logged.
        </div>
      )}

      {/* ── Top bar ── */}
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <span style={styles.assessmentLabel}>Assessment</span>
          <div style={styles.sectionTabs}>
            {sectionLabels.map((label, i) => (
              <div
                key={i}
                style={{
                  ...styles.sectionTab,
                  background: currentSection === i ? "#1e293b" : "transparent",
                  color: currentSection === i ? "#e2e8f0" : "#475569",
                  borderBottom:
                    currentSection === i
                      ? "2px solid #6366f1"
                      : "2px solid transparent",
                }}
              >
                {i < currentSection ? "✓ " : ""}
                {label}
              </div>
            ))}
          </div>
        </div>
        <div style={styles.topRight}>
          <div
            style={{
              ...styles.timerBox,
              background: isUrgent ? "#1e0a0a" : "#0f172a",
              borderColor: isUrgent ? "#7f1d1d" : "#1e293b",
              color: isUrgent ? "#fca5a5" : "#e2e8f0",
            }}
          >
            <span style={styles.timerIcon}>⏱</span>
            <span style={styles.timerVal}>{formatTime(sectionTimeLeft)}</span>
          </div>
          {currentSection === 2 && (
            <button
              style={styles.submitBtn}
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit All"}
            </button>
          )}
        </div>
      </div>

      {/* ── MCQ Section ── */}
      {currentSection < 2 && (
        <div style={styles.mcqLayout}>
          {/* Left: Question panel */}
          <div style={styles.questionPanel}>
            <div style={styles.qHeader}>
              <span style={styles.qCounter}>
                Question {currentQuestion + 1} of {currentQuestions.length}
              </span>
              <span style={styles.qAnswered}>{answeredCount} answered</span>
            </div>

            <div style={styles.questionBox}>
              <p style={styles.questionText}>
                {currentQuestions[currentQuestion]?.questionText}
              </p>

              <div style={styles.optionsList}>
                {currentQuestions[currentQuestion]?.options?.map((opt, oi) => {
                  const qId = currentQuestions[currentQuestion]._id;
                  const selected = currentAnswers[qId] === opt;
                  return (
                    <button
                      key={oi}
                      style={{
                        ...styles.optionBtn,
                        background: selected ? "#1e1b4b" : "#1e293b",
                        border: `1px solid ${selected ? "#6366f1" : "#334155"}`,
                        color: selected ? "#a5b4fc" : "#cbd5e1",
                      }}
                      onClick={() => setAnswer(qId, opt)}
                    >
                      <span
                        style={{
                          ...styles.optionDot,
                          background: selected ? "#6366f1" : "#334155",
                        }}
                      >
                        {["A", "B", "C", "D"][oi]}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div style={styles.navRow}>
              <button
                style={{
                  ...styles.navBtn,
                  opacity: currentQuestion === 0 ? 0.4 : 1,
                }}
                onClick={() => setCurrentQuestion((p) => Math.max(0, p - 1))}
                disabled={currentQuestion === 0}
              >
                ← Previous
              </button>

              {currentQuestion < currentQuestions.length - 1 ? (
                <button
                  style={styles.navBtnPrimary}
                  onClick={() => setCurrentQuestion((p) => p + 1)}
                >
                  Next →
                </button>
              ) : (
                <button
                  style={styles.navBtnPrimary}
                  onClick={() => {
                    if (currentSection < 2) {
                      const next = currentSection + 1;
                      setCurrentSection(next);
                      setCurrentQuestion(0);
                      const sectionKeys = ["aptitude", "technical", "coding"];
                      setSectionTimeLeft(timeLimit[sectionKeys[next]] * 60);
                    }
                  }}
                >
                  {currentSection === 1 ? "Go to Coding →" : "Next Section →"}
                </button>
              )}
            </div>
          </div>

          {/* Right: Question grid */}
          <div style={styles.gridPanel}>
            <p style={styles.gridTitle}>Questions</p>
            <div style={styles.questionGrid}>
              {currentQuestions.map((q, i) => {
                const answered = !!currentAnswers[q._id];
                const isCurrent = currentQuestion === i;
                return (
                  <button
                    key={i}
                    style={{
                      ...styles.gridBtn,
                      background: isCurrent
                        ? "#6366f1"
                        : answered
                          ? "#10b981"
                          : "#1e293b",
                      color: isCurrent || answered ? "#fff" : "#64748b",
                      border: isCurrent
                        ? "2px solid #818cf8"
                        : "1px solid transparent",
                    }}
                    onClick={() => setCurrentQuestion(i)}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div style={styles.legend}>
              {[
                { color: "#6366f1", label: "Current" },
                { color: "#10b981", label: "Answered" },
                { color: "#1e293b", label: "Not visited" },
              ].map(({ color, label }) => (
                <div key={label} style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, background: color }} />
                  <span style={styles.legendLabel}>{label}</span>
                </div>
              ))}
            </div>

            <button
              style={styles.finishSectionBtn}
              onClick={() => {
                if (currentSection < 2) {
                  const next = currentSection + 1;
                  setCurrentSection(next);
                  setCurrentQuestion(0);
                  const sectionKeys = ["aptitude", "technical", "coding"];
                  setSectionTimeLeft(timeLimit[sectionKeys[next]] * 60);
                }
              }}
            >
              {currentSection === 0 ? "Finish Aptitude →" : "Go to Coding →"}
            </button>
          </div>
        </div>
      )}

      {/* ── Coding Section ── */}
      {currentSection === 2 && (
        <div style={styles.codingLayout}>
          {/* Problem list sidebar */}
          <div style={styles.problemSidebar}>
            <p style={styles.gridTitle}>Problems</p>
            {codingProblems.map((p, i) => {
              const result = runResults[i];
              const allPassed =
                result?.passedCount === result?.totalCount &&
                result?.totalCount > 0;
              const somePassed = result?.passedCount > 0 && !allPassed;
              return (
                <button
                  key={i}
                  style={{
                    ...styles.problemTabBtn,
                    background:
                      currentQuestion === i ? "#1e293b" : "transparent",
                    borderLeft: `3px solid ${
                      currentQuestion === i ? "#6366f1" : "transparent"
                    }`,
                    color: currentQuestion === i ? "#e2e8f0" : "#64748b",
                  }}
                  onClick={() => setCurrentQuestion(i)}
                >
                  <span style={styles.problemNum}>P{i + 1}</span>
                  {p.title}
                  {/* ── NEW: show pass/fail indicator per problem ── */}
                  {allPassed && <span style={styles.allPassedBadge}>✓</span>}
                  {somePassed && (
                    <span style={styles.somePassedBadge}>
                      {result.passedCount}/{result.totalCount}
                    </span>
                  )}
                  {result &&
                    !allPassed &&
                    !somePassed &&
                    result.totalCount > 0 && (
                      <span style={styles.failedBadge}>✕</span>
                    )}
                  {codingAnswers[i]?.code?.trim() && !result && (
                    <span style={styles.codedBadge}>✎</span>
                  )}
                </button>
              );
            })}

            <button
              style={styles.submitAllBtn}
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Assessment"}
            </button>
          </div>

          {/* Problem + editor */}
          <div style={styles.codingMain}>
            {codingProblems[currentQuestion] && (
              <>
                {/* Problem statement */}
                <div style={styles.problemStatement}>
                  <h3 style={styles.problemTitle}>
                    {codingProblems[currentQuestion].title}
                    <span style={styles.marksBadge}>
                      {codingProblems[currentQuestion].marks} marks
                    </span>
                  </h3>
                  <p style={styles.problemDesc}>
                    {codingProblems[currentQuestion].description}
                  </p>

                  {codingProblems[currentQuestion].sampleInput && (
                    <div style={styles.sampleBlock}>
                      <p style={styles.sampleLabel}>Sample Input:</p>
                      <pre style={styles.sampleCode}>
                        {codingProblems[currentQuestion].sampleInput}
                      </pre>
                    </div>
                  )}
                  {codingProblems[currentQuestion].sampleOutput && (
                    <div style={styles.sampleBlock}>
                      <p style={styles.sampleLabel}>Sample Output:</p>
                      <pre style={styles.sampleCode}>
                        {codingProblems[currentQuestion].sampleOutput}
                      </pre>
                    </div>
                  )}
                </div>

                {/* ── Editor area ── */}
                <div style={styles.editorArea}>
                  {/* Editor header */}
                  <div style={styles.editorHeader}>
                    <select
                      style={styles.langSelect}
                      value={
                        codingAnswers[currentQuestion]?.language || "javascript"
                      }
                      onChange={(e) => {
                        const newLang = e.target.value;
                        const updated = [...codingAnswers];
                        const currentCode =
                          updated[currentQuestion]?.code || "";
                        const problem = codingProblems[currentQuestion];

                        // ✅ If editor still has starter/signature code
                        // replace with new language signature
                        // If candidate wrote real code — keep it
                        const allSignatures = [
                          ...Object.values(FALLBACK_STARTER),
                          ...["javascript", "python", "java", "cpp", "c"].map(
                            (l) => problem?.functionSignatures?.[l] || "",
                          ),
                        ];
                        const isStarterCode = allSignatures.some(
                          (s) => s.trim() === currentCode.trim(),
                        );

                        const newCode =
                          !currentCode.trim() || isStarterCode
                            ? getStarterCode(problem, newLang)
                            : currentCode;

                        updated[currentQuestion] = {
                          ...updated[currentQuestion],
                          language: newLang,
                          code: newCode,
                        };
                        setCodingAnswers(updated);
                        setRunResults((prev) => ({
                          ...prev,
                          [currentQuestion]: null,
                        }));
                      }}
                    >
                      {["javascript", "python", "java", "cpp", "c"].map(
                        (lang) => (
                          <option key={lang} value={lang}>
                            {lang}
                          </option>
                        ),
                      )}
                    </select>

                    <span style={styles.editorHint}>
                      Write only the function body · Driver handles input/output
                      automatically
                    </span>

                    {/* ── NEW: Run Code button ── */}
                    <button
                      style={{
                        ...styles.runBtn,
                        opacity: running ? 0.6 : 1,
                        cursor: running ? "not-allowed" : "pointer",
                      }}
                      onClick={() => handleRunCode(currentQuestion)}
                      disabled={running}
                    >
                      {running ? (
                        <>
                          <span style={styles.runSpinner} /> Running...
                        </>
                      ) : (
                        <>▶ Run Code</>
                      )}
                    </button>
                  </div>

                  {/* ── NEW: Monaco Editor replacing textarea ── */}
                  <div style={styles.monacoWrapper}>
                    <Editor
                      height="100%"
                      language={
                        MONACO_LANGUAGE_MAP[
                          codingAnswers[currentQuestion]?.language
                        ] || "javascript"
                      }
                      value={codingAnswers[currentQuestion]?.code || ""}
                      theme="vs-dark"
                      onChange={(value) => {
                        const updated = [...codingAnswers];
                        updated[currentQuestion] = {
                          ...updated[currentQuestion],
                          code: value || "",
                        };
                        setCodingAnswers(updated);
                      }}
                      options={{
                        fontSize: 14,
                        fontFamily:
                          "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: "on",
                        roundedSelection: true,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: "on",
                        padding: { top: 12 },
                        suggest: { showKeywords: true },
                      }}
                    />
                  </div>

                  {/* ── NEW: Test case results panel ── */}
                  {runResults[currentQuestion] && (
                    <div style={styles.resultsPanel}>
                      {/* Loading state */}
                      {runResults[currentQuestion].loading && (
                        <div style={styles.resultsLoading}>
                          <div style={styles.runSpinnerLg} />
                          <span
                            style={{ color: "#64748b", fontSize: "0.85rem" }}
                          >
                            Running your code against test cases...
                          </span>
                        </div>
                      )}

                      {/* Error state */}
                      {!runResults[currentQuestion].loading &&
                        runResults[currentQuestion].error && (
                          <div style={styles.resultsError}>
                            ⚠ {runResults[currentQuestion].error}
                          </div>
                        )}

                      {/* Results */}
                      {!runResults[currentQuestion].loading &&
                        !runResults[currentQuestion].error &&
                        runResults[currentQuestion].results?.length > 0 && (
                          <>
                            {/* Summary bar */}
                            <div style={styles.resultsSummary}>
                              <span style={styles.resultsSummaryText}>
                                Test Results
                              </span>
                              <div style={styles.resultsSummaryRight}>
                                <span
                                  style={{
                                    ...styles.passedBadge,
                                    background:
                                      runResults[currentQuestion]
                                        .passedCount ===
                                      runResults[currentQuestion].totalCount
                                        ? "#022c22"
                                        : "#1e0a0a",
                                    color:
                                      runResults[currentQuestion]
                                        .passedCount ===
                                      runResults[currentQuestion].totalCount
                                        ? "#6ee7b7"
                                        : "#fca5a5",
                                    border: `1px solid ${
                                      runResults[currentQuestion]
                                        .passedCount ===
                                      runResults[currentQuestion].totalCount
                                        ? "#065f46"
                                        : "#7f1d1d"
                                    }`,
                                  }}
                                >
                                  {runResults[currentQuestion].passedCount}/
                                  {runResults[currentQuestion].totalCount}{" "}
                                  passed
                                </span>
                                <span style={styles.marksPreview}>
                                  ~{runResults[currentQuestion].marksAwarded} /
                                  10 marks
                                </span>
                              </div>
                            </div>

                            {/* Individual test case rows */}
                            <div style={styles.testCaseList}>
                              {runResults[currentQuestion].results.map(
                                (r, i) => (
                                  <div
                                    key={i}
                                    style={{
                                      ...styles.testCaseRow,
                                      borderLeft: `3px solid ${
                                        r.passed ? "#10b981" : "#ef4444"
                                      }`,
                                    }}
                                  >
                                    <div style={styles.testCaseHeader}>
                                      <span
                                        style={{
                                          ...styles.testCaseStatus,
                                          color: r.passed
                                            ? "#10b981"
                                            : "#ef4444",
                                        }}
                                      >
                                        {r.passed ? "✓ Passed" : "✕ Failed"}
                                      </span>
                                      <span style={styles.testCaseNum}>
                                        Test Case {i + 1}
                                      </span>
                                    </div>

                                    <div style={styles.testCaseDetails}>
                                      {r.input && (
                                        <div style={styles.tcDetail}>
                                          <span style={styles.tcDetailLabel}>
                                            Input:
                                          </span>
                                          <code style={styles.tcDetailCode}>
                                            {r.input}
                                          </code>
                                        </div>
                                      )}
                                      <div style={styles.tcDetail}>
                                        <span style={styles.tcDetailLabel}>
                                          Expected:
                                        </span>
                                        <code style={styles.tcDetailCode}>
                                          {r.expectedOutput || "(empty)"}
                                        </code>
                                      </div>
                                      <div style={styles.tcDetail}>
                                        <span style={styles.tcDetailLabel}>
                                          Got:
                                        </span>
                                        <code
                                          style={{
                                            ...styles.tcDetailCode,
                                            color: r.passed
                                              ? "#6ee7b7"
                                              : "#fca5a5",
                                          }}
                                        >
                                          {r.actualOutput || "(empty)"}
                                        </code>
                                      </div>
                                      {r.errorMessage && (
                                        <div style={styles.tcDetail}>
                                          <span
                                            style={{
                                              ...styles.tcDetailLabel,
                                              color: "#fca5a5",
                                            }}
                                          >
                                            Error:
                                          </span>
                                          <code
                                            style={{
                                              ...styles.tcDetailCode,
                                              color: "#fca5a5",
                                            }}
                                          >
                                            {r.errorMessage}
                                          </code>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </>
                        )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0f1e",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  loadingCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: "1rem",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid #1e293b",
    borderTop: "3px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  errorCard: {
    background: "#1e0a0a",
    border: "1px solid #7f1d1d",
    borderRadius: "12px",
    padding: "2rem",
  },
  tabWarning: {
    background: "#451a03",
    color: "#fed7aa",
    textAlign: "center",
    padding: "0.6rem",
    fontSize: "0.85rem",
    borderBottom: "1px solid #92400e",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#0f172a",
    borderBottom: "1px solid #1e293b",
    padding: "0 1.5rem",
    height: "56px",
    flexShrink: 0,
  },
  topLeft: { display: "flex", alignItems: "center", gap: "2rem" },
  assessmentLabel: {
    fontSize: "0.8rem",
    color: "#475569",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  sectionTabs: { display: "flex", gap: "0" },
  sectionTab: {
    padding: "0 1.25rem",
    height: "56px",
    display: "flex",
    alignItems: "center",
    fontSize: "0.85rem",
    fontWeight: 500,
    cursor: "default",
    transition: "all 0.15s",
  },
  topRight: { display: "flex", alignItems: "center", gap: "1rem" },
  timerBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    border: "1px solid",
    borderRadius: "8px",
    padding: "0.4rem 0.9rem",
    fontFamily: "monospace",
  },
  timerIcon: { fontSize: "0.9rem" },
  timerVal: { fontSize: "1.1rem", fontWeight: 700 },
  submitBtn: {
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0.5rem 1.2rem",
    fontWeight: 600,
    fontSize: "0.88rem",
    cursor: "pointer",
  },

  // ── MCQ styles ──
  mcqLayout: {
    display: "grid",
    gridTemplateColumns: "1fr 240px",
    flex: 1,
    overflow: "hidden",
  },
  questionPanel: {
    padding: "2rem",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  qHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qCounter: { fontSize: "0.85rem", color: "#64748b", fontWeight: 600 },
  qAnswered: {
    fontSize: "0.78rem",
    color: "#10b981",
    background: "#022c22",
    padding: "3px 10px",
    borderRadius: "999px",
    border: "1px solid #065f46",
  },
  questionBox: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1.75rem",
  },
  questionText: {
    fontSize: "1rem",
    color: "#e2e8f0",
    lineHeight: 1.7,
    margin: "0 0 1.5rem",
  },
  optionsList: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  optionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.9rem",
    padding: "0.85rem 1rem",
    borderRadius: "10px",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "0.9rem",
    transition: "all 0.15s",
    width: "100%",
  },
  optionDot: {
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },
  navRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navBtn: {
    background: "transparent",
    border: "1px solid #334155",
    color: "#94a3b8",
    borderRadius: "8px",
    padding: "0.6rem 1.2rem",
    cursor: "pointer",
    fontSize: "0.88rem",
  },
  navBtnPrimary: {
    background: "#6366f1",
    border: "none",
    color: "#fff",
    borderRadius: "8px",
    padding: "0.6rem 1.4rem",
    cursor: "pointer",
    fontSize: "0.88rem",
    fontWeight: 600,
  },
  gridPanel: {
    background: "#0f172a",
    borderLeft: "1px solid #1e293b",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    overflowY: "auto",
  },
  gridTitle: {
    fontSize: "0.72rem",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 600,
    margin: 0,
  },
  questionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "0.4rem",
  },
  gridBtn: {
    width: "100%",
    aspectRatio: "1",
    borderRadius: "6px",
    border: "none",
    fontSize: "0.78rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  legend: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  legendItem: { display: "flex", alignItems: "center", gap: "0.5rem" },
  legendDot: {
    width: "10px",
    height: "10px",
    borderRadius: "3px",
    flexShrink: 0,
  },
  legendLabel: { fontSize: "0.75rem", color: "#64748b" },
  finishSectionBtn: {
    background: "#1e293b",
    border: "1px solid #334155",
    color: "#94a3b8",
    borderRadius: "8px",
    padding: "0.6rem",
    fontSize: "0.82rem",
    cursor: "pointer",
    marginTop: "auto",
  },

  // ── Coding styles ──
  codingLayout: {
    display: "grid",
    gridTemplateColumns: "200px 1fr",
    flex: 1,
    overflow: "hidden",
    minHeight: 0,
  },
  problemSidebar: {
    background: "#0f172a",
    borderRight: "1px solid #1e293b",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    overflowY: "auto",
  },
  problemTabBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    padding: "0.7rem 0.9rem",
    borderRadius: "0 8px 8px 0",
    border: "none",
    borderLeft: "3px solid transparent",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 500,
    textAlign: "left",
    transition: "all 0.15s",
  },
  problemNum: {
    fontSize: "0.7rem",
    color: "#475569",
    fontWeight: 700,
    minWidth: "20px",
  },
  codedBadge: { marginLeft: "auto", color: "#64748b", fontSize: "0.75rem" },
  allPassedBadge: {
    marginLeft: "auto",
    color: "#10b981",
    fontSize: "0.8rem",
    fontWeight: 700,
  },
  somePassedBadge: {
    marginLeft: "auto",
    color: "#f59e0b",
    fontSize: "0.72rem",
    fontWeight: 700,
    background: "#1c1408",
    padding: "1px 6px",
    borderRadius: "4px",
    border: "1px solid #92400e",
  },
  failedBadge: {
    marginLeft: "auto",
    color: "#ef4444",
    fontSize: "0.8rem",
    fontWeight: 700,
  },
  submitAllBtn: {
    marginTop: "auto",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0.7rem",
    fontWeight: 600,
    fontSize: "0.88rem",
    cursor: "pointer",
  },
  codingMain: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minHeight: 0,
  },
  problemStatement: {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #1e293b",
    overflowY: "auto",
    maxHeight: "35vh",
    flexShrink: 0,
  },
  problemTitle: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    color: "#e2e8f0",
    fontSize: "1.05rem",
    fontWeight: 700,
    margin: "0 0 0.75rem",
  },
  marksBadge: {
    background: "#1e293b",
    color: "#f59e0b",
    fontSize: "0.75rem",
    padding: "3px 10px",
    borderRadius: "999px",
    fontWeight: 600,
  },
  problemDesc: {
    color: "#94a3b8",
    fontSize: "0.88rem",
    lineHeight: 1.7,
    margin: "0 0 0.75rem",
    whiteSpace: "pre-wrap",
  },
  sampleBlock: { marginBottom: "0.6rem" },
  sampleLabel: {
    fontSize: "0.72rem",
    color: "#64748b",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "0.3rem",
  },
  sampleCode: {
    background: "#1e293b",
    borderRadius: "6px",
    padding: "0.5rem 0.8rem",
    fontSize: "0.8rem",
    color: "#94a3b8",
    fontFamily: "monospace",
    margin: 0,
    overflowX: "auto",
  },
  editorArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minHeight: 0,
  },
  editorHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.5rem 1rem",
    background: "#0f172a",
    borderBottom: "1px solid #1e293b",
    flexShrink: 0,
  },
  langSelect: {
    background: "#1e293b",
    border: "1px solid #334155",
    color: "#94a3b8",
    borderRadius: "6px",
    padding: "4px 8px",
    fontSize: "0.82rem",
    cursor: "pointer",
    outline: "none",
  },
  editorHint: { fontSize: "0.75rem", color: "#334155", flex: 1 },

  // ── NEW: Run button styles ──
  runBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: "7px",
    padding: "0.45rem 1rem",
    fontSize: "0.82rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 0 12px rgba(16,185,129,0.3)",
    flexShrink: 0,
  },
  runSpinner: {
    width: "12px",
    height: "12px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
    display: "inline-block",
  },

  // ── NEW: Monaco wrapper ──
  monacoWrapper: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
  },

  // ── NEW: Test results panel ──
  resultsPanel: {
    background: "#060d1a",
    borderTop: "1px solid #1e293b",
    maxHeight: "280px",
    overflowY: "auto",
    flexShrink: 0,
  },
  resultsLoading: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "1rem 1.25rem",
  },
  runSpinnerLg: {
    width: "18px",
    height: "18px",
    border: "2px solid #1e293b",
    borderTop: "2px solid #10b981",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
    flexShrink: 0,
  },
  resultsError: {
    padding: "0.75rem 1.25rem",
    color: "#fca5a5",
    fontSize: "0.85rem",
    background: "#1e0a0a",
    borderBottom: "1px solid #7f1d1d",
  },
  resultsSummary: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.6rem 1.25rem",
    borderBottom: "1px solid #1e293b",
    position: "sticky",
    top: 0,
    background: "#060d1a",
    zIndex: 1,
  },
  resultsSummaryText: {
    fontSize: "0.72rem",
    color: "#475569",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },
  resultsSummaryRight: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  passedBadge: {
    fontSize: "0.75rem",
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: "999px",
  },
  marksPreview: {
    fontSize: "0.75rem",
    color: "#f59e0b",
    fontWeight: 600,
  },
  testCaseList: {
    display: "flex",
    flexDirection: "column",
    gap: "0",
  },
  testCaseRow: {
    padding: "0.75rem 1.25rem",
    borderBottom: "1px solid #0f172a",
  },
  testCaseHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  testCaseStatus: {
    fontSize: "0.8rem",
    fontWeight: 700,
  },
  testCaseNum: {
    fontSize: "0.72rem",
    color: "#334155",
  },
  testCaseDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  tcDetail: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.5rem",
  },
  tcDetailLabel: {
    fontSize: "0.72rem",
    color: "#475569",
    minWidth: "64px",
    paddingTop: "2px",
    fontWeight: 500,
  },
  tcDetailCode: {
    fontSize: "0.78rem",
    color: "#94a3b8",
    fontFamily: "monospace",
    background: "#1e293b",
    padding: "1px 6px",
    borderRadius: "4px",
    wordBreak: "break-all",
  },
};
