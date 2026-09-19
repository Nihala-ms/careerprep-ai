import "dotenv/config";
import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

// ============================================================
// GEMINI CONFIGURATION
// ============================================================

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is missing in .env");
}

const ai = new GoogleGenAI({
  apiKey,
});

// The working model from your logs is first.
const MODELS = [
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
];

const REQUEST_TIMEOUT = 120000;

const TOTAL_QUESTIONS = 25;

// In-memory question cache
const questionCache = new Map();

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getErrorStatus(error) {
  return (
    error?.status ||
    error?.code ||
    error?.response?.status ||
    error?.error?.code ||
    null
  );
}

function getErrorMessage(error) {
  if (!error) {
    return "Unknown error";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

function ensureString(value, fallback = "") {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value).trim();
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function cleanJsonText(text) {
  if (!text) {
    return "";
  }

  let cleaned = text.trim();

  cleaned = cleaned.replace(/^```json\s*/i, "");
  cleaned = cleaned.replace(/^```\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/i, "");

  return cleaned.trim();
}

function parseJson(text) {
  const cleaned = cleanJsonText(text);

  try {
    return JSON.parse(cleaned);
  } catch {}

  const firstObject = cleaned.indexOf("{");
  const lastObject = cleaned.lastIndexOf("}");

  if (firstObject !== -1 && lastObject !== -1) {
    try {
      return JSON.parse(
        cleaned.slice(firstObject, lastObject + 1)
      );
    } catch {}
  }

  const firstArray = cleaned.indexOf("[");
  const lastArray = cleaned.lastIndexOf("]");

  if (firstArray !== -1 && lastArray !== -1) {
    try {
      return JSON.parse(
        cleaned.slice(firstArray, lastArray + 1)
      );
    } catch {}
  }

  throw new Error("Gemini returned invalid JSON.");
}

function normalizeStatus(status) {
  const value = ensureString(status).toLowerCase();

  if (
    value.includes("partial") ||
    value.includes("partially")
  ) {
    return "Partially Correct";
  }

  if (
    value.includes("incorrect") ||
    value.includes("wrong")
  ) {
    return "Incorrect";
  }

  if (value.includes("correct")) {
    return "Correct";
  }

  return "Incorrect";
}

// ============================================================
// GEMINI REQUEST
// ============================================================

async function generateGemini(prompt) {
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing from .env"
    );
  }

  let lastError = null;

  for (
    let modelIndex = 0;
    modelIndex < MODELS.length;
    modelIndex++
  ) {
    const model = MODELS[modelIndex];

    console.log(
      `Gemini model ${modelIndex + 1}/${MODELS.length}: ${model}`
    );

    for (let attempt = 1; attempt <= 2; attempt++) {
      console.log(
        `Gemini request attempt ${attempt}/2`
      );

      try {
        const requestPromise =
          ai.models.generateContent({
            model,

            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],

            config: {
              thinkingConfig: {
                thinkingLevel: "low",
              },

              responseMimeType:
                "application/json",
            },
          });

        const timeoutPromise =
          new Promise((_, reject) => {
            setTimeout(() => {
              reject(
                new Error(
                  "Gemini request timed out."
                )
              );
            }, REQUEST_TIMEOUT);
          });

        const response =
          await Promise.race([
            requestPromise,
            timeoutPromise,
          ]);

        const text = response?.text;

        if (!text) {
          throw new Error(
            "Gemini returned an empty response."
          );
        }

        console.log(
          `✅ Gemini response received from ${model}`
        );

        return text;
      } catch (error) {
        lastError = error;

        const status = getErrorStatus(error);
        const message = getErrorMessage(error);

        console.error(
          `Gemini ${model} attempt ${attempt} failed.`
        );

        console.error(
          `Status: ${status}`
        );

        console.error(
          `Message: ${message}`
        );

        // 400 = Bad request
        if (status === 400) {
          throw error;
        }

        // 429 = Quota exceeded
        // Do NOT retry the same model.
        if (status === 429) {
          console.log(
            `⚠️ ${model} quota exceeded. Trying next model...`
          );

          break;
        }

        // 503 = Temporary high demand
        if (status === 503) {
          if (attempt === 1) {
            console.log(
              "Gemini temporarily unavailable. Retrying in 3 seconds..."
            );

            await sleep(3000);

            continue;
          }

          console.log(
            `⚠️ ${model} unavailable. Trying next model...`
          );

          break;
        }

        // Other server errors
        if (
          status === 500 ||
          status === 502 ||
          status === 504
        ) {
          if (attempt === 1) {
            console.log(
              "Gemini server error. Retrying in 3 seconds..."
            );

            await sleep(3000);

            continue;
          }

          console.log(
            `⚠️ ${model} failed. Trying next model...`
          );

          break;
        }

        // Timeout
        if (
          message
            .toLowerCase()
            .includes("timed out")
        ) {
          console.log(
            `⚠️ ${model} timed out. Trying next model...`
          );

          break;
        }

        console.log(
          "⚠️ Unexpected error. Trying next model..."
        );

        break;
      }
    }
  }

  throw (
    lastError ||
    new Error(
      "All Gemini models failed."
    )
  );
}

// ============================================================
// 1. GENERATE 25 QUESTIONS
// POST /api/ai/questions
// ============================================================

router.post("/questions", async (req, res) => {
  try {
    const role = ensureString(
      req.body?.role,
      "React Developer"
    );

    const experience = ensureString(
      req.body?.experience,
      "Fresher"
    );

    const difficulty = ensureString(
      req.body?.difficulty ||
        req.body?.level,
      "Beginner"
    );

    // Always exactly 25
    const count = TOTAL_QUESTIONS;

    console.log(
      `Generating questions for ${role} | ${experience} | ${difficulty}`
    );

    // --------------------------------------------------------
    // CACHE KEY
    // --------------------------------------------------------

    const cacheKey =
      `${role.toLowerCase()}|` +
      `${experience.toLowerCase()}|` +
      `${difficulty.toLowerCase()}|` +
      `${count}`;

    // --------------------------------------------------------
    // CACHE
    // --------------------------------------------------------

    if (questionCache.has(cacheKey)) {
      console.log(
        "✅ Returning cached questions."
      );

      return res.status(200).json({
        success: true,
        cached: true,
        role,
        experience,
        difficulty,
        questions:
          questionCache.get(cacheKey),
      });
    }

    // --------------------------------------------------------
    // GEMINI PROMPT
    // --------------------------------------------------------

    const prompt = `
You are a professional technical interviewer.

Generate EXACTLY 25 interview questions.

Candidate role:
${role}

Experience:
${experience}

Difficulty:
${difficulty}

Requirements:

1. Generate exactly 25 questions.
2. Do not generate fewer than 25.
3. Do not generate more than 25.
4. Do not duplicate questions.
5. Questions must be relevant to the selected role.
6. Questions must match the candidate's experience.
7. Include technical and conceptual questions.
8. Include project-related questions.
9. Include frontend, backend, database and API questions when relevant.
10. Keep questions clear and interview-friendly.
11. Do not provide answers.
12. Return ONLY valid JSON.

Return exactly:

{
  "questions": [
    {
      "id": 1,
      "question": "What is React?",
      "category": "Technical"
    }
  ]
}
`;

    const rawResponse =
      await generateGemini(prompt);

    console.log(
      "Gemini raw question response received."
    );

    let result;

    try {
      result = parseJson(rawResponse);
    } catch {
      return res.status(500).json({
        success: false,
        message:
          "Gemini returned invalid question data.",
      });
    }

    let questions =
      ensureArray(result?.questions);

    questions = questions
      .map((item, index) => ({
        id: index + 1,

        question: ensureString(
          item?.question
        ),

        category: ensureString(
          item?.category,
          "General"
        ),
      }))
      .filter(
        (item) =>
          item.question.length > 0
      );

    // --------------------------------------------------------
    // EXACT 25 CHECK
    // --------------------------------------------------------

    if (
      questions.length !==
      TOTAL_QUESTIONS
    ) {
      console.error(
        `❌ Gemini returned ${questions.length} questions instead of 25.`
      );

      return res.status(500).json({
        success: false,

        message:
          `Gemini returned ${questions.length} questions instead of 25. Please try again.`,
      });
    }

    // --------------------------------------------------------
    // SAVE CACHE
    // --------------------------------------------------------

    questionCache.set(
      cacheKey,
      questions
    );

    console.log(
      `✅ Saved ${questions.length} questions to cache.`
    );

    return res.status(200).json({
      success: true,
      cached: false,
      role,
      experience,
      difficulty,
      questions,
    });
  } catch (error) {
    console.error(
      "❌ /questions error:"
    );

    console.error(error);

    return res.status(500).json({
      success: false,

      message:
        getErrorMessage(error) ||
        "Failed to generate questions.",
    });
  }
});

// ============================================================
// 2. EVALUATE ONE ANSWER
// POST /api/ai/evaluate
// ============================================================

router.post("/evaluate", async (req, res) => {
  try {
    const role = ensureString(
      req.body?.role,
      "React Developer"
    );

    const question = ensureString(
      req.body?.question
    );

    const answer = ensureString(
      req.body?.answer,
      "No answer provided"
    );

    if (!question) {
      return res.status(400).json({
        success: false,
        message:
          "Question is required.",
      });
    }

    console.log(
      `Evaluating answer for ${role}`
    );

    const prompt = `
You are a professional technical interviewer.

Evaluate the candidate's answer.

Role:
${role}

Question:
${question}

Candidate Answer:
${answer}

Classify the answer as exactly one of:

"Correct"
"Partially Correct"
"Incorrect"

Rules:

Correct:
The candidate understands the main concept and the answer is technically correct.

Partially Correct:
The candidate understands part of the concept but misses important details or has a small mistake.

Incorrect:
The answer is wrong, irrelevant, or no answer was provided.

Return ONLY valid JSON.

{
  "status": "Correct",
  "feedback": "Your answer is correct because...",
  "betterAnswer": "A stronger interview answer would be..."
}
`;

    const rawResponse =
      await generateGemini(prompt);

    let result;

    try {
      result = parseJson(rawResponse);
    } catch {
      return res.status(500).json({
        success: false,

        message:
          "Invalid evaluation returned by Gemini.",
      });
    }

    const status =
      normalizeStatus(
        result?.status
      );

    // Single question score
    const score =
      status === "Correct"
        ? 1
        : status ===
          "Partially Correct"
        ? 0.5
        : 0;

    return res.status(200).json({
      success: true,

      score,

      status,

      feedback: ensureString(
        result?.feedback,
        "Keep practicing your explanation."
      ),

      betterAnswer: ensureString(
        result?.betterAnswer,
        "Try to give a clearer and more complete answer."
      ),
    });
  } catch (error) {
    console.error(
      "❌ /evaluate error:"
    );

    console.error(error);

    return res.status(500).json({
      success: false,

      message:
        getErrorMessage(error) ||
        "Failed to evaluate answer.",
    });
  }
});

// ============================================================
// 3. FINAL EVALUATION
// POST /api/ai/final-evaluation
// ============================================================

router.post(
  "/final-evaluation",
  async (req, res) => {
    try {
      const role = ensureString(
        req.body?.role,
        "React Developer"
      );

      const experience = ensureString(
        req.body?.experience,
        "Fresher"
      );

      const difficulty = ensureString(
        req.body?.difficulty ||
          req.body?.level,
        "Beginner"
      );

      const questions =
        ensureArray(
          req.body?.questions
        );

      const answers =
        ensureArray(
          req.body?.answers
        );

      console.log(
        `Evaluating interview for ${role} | ${experience} | ${difficulty}`
      );

      console.log(
        `Questions received: ${questions.length}`
      );

      console.log(
        `Answers received: ${answers.length}`
      );

      // --------------------------------------------------------
      // VALIDATION
      // --------------------------------------------------------

      if (
        questions.length !==
        TOTAL_QUESTIONS
      ) {
        return res.status(400).json({
          success: false,

          message:
            `Expected 25 questions but received ${questions.length}.`,
        });
      }

      if (
        answers.length !==
        TOTAL_QUESTIONS
      ) {
        return res.status(400).json({
          success: false,

          message:
            `Expected 25 answers but received ${answers.length}.`,
        });
      }

      // --------------------------------------------------------
      // CREATE CLEAN INTERVIEW DATA
      // --------------------------------------------------------

      const interviewData =
        questions.map(
          (questionItem, index) => {
            let questionText = "";

            if (
              typeof questionItem ===
              "object"
            ) {
              questionText =
                ensureString(
                  questionItem?.question
                );
            } else {
              questionText =
                ensureString(
                  questionItem
                );
            }

            let answerText = "";

            const answerItem =
              answers[index];

            if (
              typeof answerItem ===
              "object"
            ) {
              answerText =
                ensureString(
                  answerItem?.answer
                );
            } else {
              answerText =
                ensureString(
                  answerItem
                );
            }

            if (!answerText) {
              answerText =
                "No answer provided";
            }

            return {
              questionNumber:
                index + 1,

              question:
                questionText,

              candidateAnswer:
                answerText,
            };
          }
        );

      // --------------------------------------------------------
      // LOG
      // --------------------------------------------------------

      console.log(
        "========== FINAL EVALUATION DATA =========="
      );

      interviewData.forEach(
        (item) => {
          console.log(
            `Q${item.questionNumber}: ${item.question}`
          );

          console.log(
            `A${item.questionNumber}: ${item.candidateAnswer}`
          );
        }
      );

      console.log(
        "==========================================="
      );

      // --------------------------------------------------------
      // GEMINI PROMPT
      // --------------------------------------------------------

      const prompt = `
You are a professional technical interviewer.

Evaluate the following 25-question interview.

Candidate Role:
${role}

Experience:
${experience}

Difficulty:
${difficulty}

Each question carries exactly 1 mark.

Scoring rules:

Correct = 1 mark
Partially Correct = 0.5 mark
Incorrect = 0 mark

Maximum score = 25.

IMPORTANT:

Do NOT give scores out of 10.

For each question, return ONLY one of these statuses:

"Correct"
"Partially Correct"
"Incorrect"

Evaluate each answer fairly.

A short answer can still be Correct if it contains the important concept.

Do not mark an answer Incorrect just because it does not contain every possible detail.

An empty answer should be Incorrect.

INTERVIEW:

${interviewData
  .map(
    (item) => `
QUESTION ${item.questionNumber}:
${item.question}

CANDIDATE ANSWER:
${item.candidateAnswer}
`
  )
  .join("\n")}

Return ONLY valid JSON.

Return exactly:

{
  "questionResults": [
    {
      "questionNumber": 1,
      "status": "Correct",
      "feedback": "Feedback here.",
      "betterAnswer": "Better answer here."
    }
  ],

  "strengths": [
    "Strength 1"
  ],

  "improvements": [
    "Improvement 1"
  ],

  "recommendations": [
    "Recommendation 1"
  ],

  "overallFeedback": "Overall feedback.",
  "summary": "Short summary."
}

IMPORTANT:
- Return exactly 25 questionResults.
- Do not calculate the final score.
- The server will calculate the score.
`;

      // --------------------------------------------------------
      // GEMINI REQUEST
      // --------------------------------------------------------

      const rawResponse =
        await generateGemini(prompt);

      console.log(
        "Gemini final evaluation response received."
      );

      let result;

      try {
        result = parseJson(rawResponse);
      } catch {
        return res.status(500).json({
          success: false,

          message:
            "Gemini returned invalid final evaluation data.",
        });
      }

      // --------------------------------------------------------
      // GEMINI RESULTS
      // --------------------------------------------------------

      const rawResults =
        ensureArray(
          result?.questionResults
        );

      // --------------------------------------------------------
      // CREATE EXACTLY 25 RESULTS
      // --------------------------------------------------------

      const questionResults =
        interviewData.map(
          (item, index) => {
            const aiResult =
              rawResults[index] || {};

            const status =
              normalizeStatus(
                aiResult?.status
              );

            // IMPORTANT:
            // 1 mark / 0.5 mark / 0 mark
            const score =
              status === "Correct"
                ? 1
                : status ===
                  "Partially Correct"
                ? 0.5
                : 0;

            return {
              questionNumber:
                index + 1,

              question:
                item.question,

              candidateAnswer:
                item.candidateAnswer,

              score,

              status,

              correct:
                status === "Correct",

              feedback: ensureString(
                aiResult?.feedback,
                "Keep practicing this topic."
              ),

              betterAnswer:
                ensureString(
                  aiResult?.betterAnswer,
                  "Try to give a clearer and more complete answer."
                ),
            };
          }
        );

      // --------------------------------------------------------
      // CALCULATE /25
      // --------------------------------------------------------

      let overallScore = 0;

      let correctAnswers = 0;

      let partiallyCorrect = 0;

      let incorrectAnswers = 0;

      questionResults.forEach(
        (item) => {
          overallScore +=
            item.score;

          if (
            item.status ===
            "Correct"
          ) {
            correctAnswers++;
          } else if (
            item.status ===
            "Partially Correct"
          ) {
            partiallyCorrect++;
          } else {
            incorrectAnswers++;
          }
        }
      );

      overallScore = Number(
        overallScore.toFixed(1)
      );

      // --------------------------------------------------------
      // PERCENTAGE
      // --------------------------------------------------------

      const percentage = Math.round(
        (overallScore / TOTAL_QUESTIONS) *
          100
      );

      // --------------------------------------------------------
      // RATING
      // --------------------------------------------------------

      let overallRating =
        "Needs Improvement";

      if (percentage >= 80) {
        overallRating =
          "Excellent";
      } else if (percentage >= 60) {
        overallRating =
          "Good";
      } else if (percentage >= 40) {
        overallRating =
          "Needs Improvement";
      } else {
        overallRating =
          "Needs Significant Improvement";
      }

      // --------------------------------------------------------
      // FINAL RESPONSE
      // --------------------------------------------------------

      const finalEvaluation = {
        success: true,

        // IMPORTANT: /25
        overallScore,

        maxScore:
          TOTAL_QUESTIONS,

        percentage,

        overallRating,

        correctAnswers,

        partiallyCorrect,

        incorrectAnswers,

        strengths:
          ensureArray(
            result?.strengths
          ),

        improvements:
          ensureArray(
            result?.improvements
          ),

        recommendations:
          ensureArray(
            result?.recommendations
          ),

        overallFeedback:
          ensureString(
            result?.overallFeedback,
            "Keep practicing your technical concepts."
          ),

        summary:
          ensureString(
            result?.summary,
            "Interview evaluation completed."
          ),

        questionResults,

        answerReview:
          questionResults,
      };

      console.log(
        `✅ Final evaluation completed: ${overallScore}/25`
      );

      console.log(
        `Correct: ${correctAnswers}`
      );

      console.log(
        `Partially Correct: ${partiallyCorrect}`
      );

      console.log(
        `Incorrect: ${incorrectAnswers}`
      );

      console.log(
        `Percentage: ${percentage}%`
      );

      return res.status(200).json(
        finalEvaluation
      );
    } catch (error) {
      console.error(
        "❌ /final-evaluation error:"
      );

      console.error(error);

      return res.status(500).json({
        success: false,

        message:
          getErrorMessage(error) ||
          "Failed to complete final evaluation.",
      });
    }
  }
);

// ============================================================
// 4. ALIAS
// POST /api/ai/final-evaluate
// ============================================================

router.post(
  "/final-evaluate",
  async (req, res) => {
    req.url = "/final-evaluation";

    router.handle(req, res);
  }
);

// ============================================================
// EXPORT
// ============================================================

export default router;