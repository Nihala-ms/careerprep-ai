import React, { useEffect, useRef, useState } from "react";

const TOTAL_QUESTIONS = 25;

// NEW VERCEL BACKEND URL
const API_URL = import.meta.env.VITE_API_URL;
const Interview = ({ interviewData = {} }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const hasGeneratedQuestions = useRef(false);

  // ==========================================================
  // GENERATE QUESTIONS
  // ==========================================================

  const generateQuestions = async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await fetch(`${API_URL}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: interviewData?.role || "React Developer",
          experience: interviewData?.experience || "Fresher",
          difficulty:
            interviewData?.difficulty ||
            interviewData?.level ||
            "Beginner",
          count: TOTAL_QUESTIONS,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to generate questions."
        );
      }

      if (!Array.isArray(data?.questions)) {
        throw new Error(
          "No questions were returned from the server."
        );
      }

      if (data.questions.length !== TOTAL_QUESTIONS) {
        throw new Error(
          `The server returned ${data.questions.length} questions instead of ${TOTAL_QUESTIONS}.`
        );
      }

      setQuestions(data.questions);
      setAnswers([]);
      setCurrentQuestion(0);
      setAnswer("");
    } catch (err) {
      console.error("Question generation error:", err);

      setError(
        err?.message ||
          "Failed to generate interview questions."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    if (hasGeneratedQuestions.current) {
      return;
    }

    hasGeneratedQuestions.current = true;

    generateQuestions();
  }, []);

  // ==========================================================
  // FINAL EVALUATION
  // ==========================================================

  const finishInterview = async (finalAnswers) => {
    try {
      setIsEvaluating(true);
      setError("");

      const cleanQuestions = questions.map(
        (question, index) => ({
          id: index + 1,
          question:
            typeof question === "object"
              ? question?.question || ""
              : String(question),
          category:
            typeof question === "object"
              ? question?.category || "General"
              : "General",
        })
      );

      const cleanAnswers = cleanQuestions.map(
        (question, index) => ({
          question: question.question,
          answer:
            typeof finalAnswers[index] === "string"
              ? finalAnswers[index]
              : finalAnswers[index]?.answer || "",
        })
      );

      console.log(
        "Sending final evaluation request..."
      );

      const response = await fetch(
        `${API_URL}/final-evaluation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role:
              interviewData?.role ||
              "React Developer",

            experience:
              interviewData?.experience ||
              "Fresher",

            difficulty:
              interviewData?.difficulty ||
              interviewData?.level ||
              "Beginner",

            questions: cleanQuestions,
            answers: cleanAnswers,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Final evaluation response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to evaluate interview."
        );
      }

      if (!data || data.success === false) {
        throw new Error(
          data?.message ||
            "No evaluation was returned from the server."
        );
      }

      setResult(data);
    } catch (err) {
      console.error(
        "Final evaluation error:",
        err
      );

      setError(
        err?.message ||
          "No evaluation was returned from the server."
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  // ==========================================================
  // NEXT QUESTION
  // ==========================================================

  const handleNext = async () => {
    const currentAnswer = answer.trim();

    const updatedAnswers = [...answers];

    updatedAnswers[currentQuestion] =
      currentAnswer;

    setAnswers(updatedAnswers);

    if (
      currentQuestion ===
      questions.length - 1
    ) {
      await finishInterview(
        updatedAnswers
      );

      return;
    }

    setCurrentQuestion(
      (prev) => prev + 1
    );

    setAnswer(
      updatedAnswers[
        currentQuestion + 1
      ] || ""
    );
  };

  // ==========================================================
  // PREVIOUS QUESTION
  // ==========================================================

  const handlePrevious = () => {
    if (currentQuestion === 0) {
      return;
    }

    setCurrentQuestion(
      (prev) => prev - 1
    );

    setAnswer(
      answers[
        currentQuestion - 1
      ] || ""
    );
  };

  // ==========================================================
  // RETRY
  // ==========================================================

  const handleRetry = () => {
    setResult(null);
    setError("");
    setQuestions([]);
    setAnswers([]);
    setAnswer("");
    setCurrentQuestion(0);

    // Allow generateQuestions() to run again
    hasGeneratedQuestions.current = false;

    generateQuestions();
  };

  // ==========================================================
  // BACK TO HOME
  // ==========================================================

  const handleBackToHome = () => {
    window.location.href = "/";
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07100d] text-white px-6">
        <div className="text-center">
          <div className="text-5xl mb-5">
            🤖
          </div>

          <h2 className="text-2xl font-bold mb-2">
            Preparing Your Interview
          </h2>

          <p className="text-gray-400">
            Generating 25 interview questions...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // EVALUATING
  // ==========================================================

  if (isEvaluating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07100d] text-white px-6">
        <div className="text-center">
          <div className="text-5xl mb-5">
            🧠
          </div>

          <h2 className="text-2xl font-bold mb-2">
            Evaluating Your Interview
          </h2>

          <p className="text-gray-400">
            AI is reviewing your 25 answers...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07100d] text-white px-6">
        <div className="max-w-xl w-full bg-[#10151e] border border-red-500/30 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">
            ⚠️
          </div>

          <h2 className="text-2xl font-bold mb-3">
            Something went wrong
          </h2>

          <p className="text-gray-400 mb-6">
            {error}
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleRetry}
              className="px-5 py-3 rounded-lg bg-emerald-300 text-[#07100d] font-semibold hover:bg-emerald-200 transition"
            >
              Try Again
            </button>

            <button
              onClick={handleBackToHome}
              className="px-5 py-3 rounded-lg border border-gray-700 text-white hover:border-emerald-300 hover:text-emerald-300 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RESULT
  // ==========================================================

  if (result) {
    const overallScore =
      Number(result?.overallScore) || 0;

    const percentage =
      Number(result?.percentage) || 0;

    const correct =
      Number(result?.correctAnswers) || 0;

    const partial =
      Number(result?.partiallyCorrect) || 0;

    const incorrect =
      Number(result?.incorrectAnswers) || 0;

    const reviews = Array.isArray(
      result?.questionResults
    )
      ? result.questionResults
      : [];

    return (
      <div className="min-h-screen bg-[#07100d] text-white px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {/* HEADER */}

          <div className="text-center mb-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-emerald-300 mb-3">
              CAREERPREP AI
            </p>

            <h1 className="text-3xl font-bold mb-2">
              Interview Result
            </h1>

            <p className="text-gray-400">
              {interviewData?.role ||
                "React Developer"}{" "}
              •{" "}
              {interviewData?.experience ||
                "Fresher"}
            </p>
          </div>

          {/* SCORE */}

          <div className="bg-[#10151e] border border-gray-800 rounded-2xl p-8 text-center mb-6">
            <p className="text-gray-400 mb-2">
              Overall Score
            </p>

            <div className="text-6xl font-bold text-emerald-300">
              {overallScore}/25
            </div>

            <p className="text-xl mt-3">
              {result?.overallRating ||
                "Evaluation Complete"}
            </p>

            <p className="text-gray-400 mt-2">
              {percentage}%
            </p>
          </div>

          {/* SCORE BREAKDOWN */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

            <div className="bg-[#10151e] border border-gray-800 rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-emerald-300">
                {correct}
              </div>

              <p className="text-gray-400">
                Correct
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {correct} marks
              </p>
            </div>

            <div className="bg-[#10151e] border border-gray-800 rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-yellow-300">
                {partial}
              </div>

              <p className="text-gray-400">
                Partially Correct
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {partial * 0.5} marks
              </p>
            </div>

            <div className="bg-[#10151e] border border-gray-800 rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-red-400">
                {incorrect}
              </div>

              <p className="text-gray-400">
                Incorrect
              </p>

              <p className="text-xs text-gray-500 mt-1">
                0 marks
              </p>
            </div>
          </div>

          {/* OVERALL FEEDBACK */}

          <div className="bg-[#10151e] border border-gray-800 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-3">
              Overall Feedback
            </h2>

            <p className="text-gray-300 leading-7">
              {result?.overallFeedback ||
                result?.summary ||
                "Interview completed."}
            </p>
          </div>

          {/* STRENGTHS */}

          {Array.isArray(
            result?.strengths
          ) &&
            result.strengths.length > 0 && (
              <div className="bg-[#10151e] border border-gray-800 rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">
                  Strengths
                </h2>

                <ul className="space-y-2">
                  {result.strengths.map(
                    (item, index) => (
                      <li
                        key={index}
                        className="text-gray-300"
                      >
                        <span className="text-emerald-300 mr-2">
                          ✓
                        </span>

                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

          {/* IMPROVEMENTS */}

          {Array.isArray(
            result?.improvements
          ) &&
            result.improvements.length >
              0 && (
              <div className="bg-[#10151e] border border-gray-800 rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">
                  Areas to Improve
                </h2>

                <ul className="space-y-2">
                  {result.improvements.map(
                    (item, index) => (
                      <li
                        key={index}
                        className="text-gray-300"
                      >
                        <span className="text-emerald-300 mr-2">
                          →
                        </span>

                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

          {/* QUESTION REVIEW */}

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-5">
              Question Review
            </h2>

            <div className="space-y-5">
              {reviews.map(
                (item, index) => (
                  <div
                    key={
                      item?.questionNumber ||
                      index
                    }
                    className="bg-[#10151e] border border-gray-800 rounded-2xl p-6"
                  >

                    <div className="flex justify-between gap-4 mb-4">
                      <h3 className="font-semibold text-white">
                        Question{" "}
                        {item?.questionNumber ||
                          index + 1}
                      </h3>

                      <span className="text-emerald-300 font-bold">
                        {item?.score ?? 0}/1
                      </span>
                    </div>

                    <p className="text-gray-200 mb-4">
                      {item?.question}
                    </p>

                    <div className="bg-[#171d27] rounded-lg p-4 mb-4">
                      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
                        Your Answer
                      </p>

                      <p className="text-gray-300">
                        {item?.candidateAnswer ||
                          "No answer provided"}
                      </p>
                    </div>

                    <p className="text-gray-300 mb-4">
                      <span className="font-semibold text-white">
                        Status:
                      </span>{" "}
                      <span className="text-emerald-300">
                        {item?.status ||
                          "Not evaluated"}
                      </span>
                    </p>

                    <p className="text-gray-400 mb-4 leading-7">
                      {item?.feedback}
                    </p>

                    {item?.betterAnswer && (
                      <div className="bg-emerald-300/5 border border-emerald-300/20 rounded-lg p-4">
                        <p className="text-xs text-emerald-300 mb-2 uppercase tracking-wider">
                          Better Answer
                        </p>

                        <p className="text-gray-300 leading-7">
                          {item.betterAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>

          {/* BUTTONS */}

          <div className="flex flex-col sm:flex-row justify-center gap-4 pb-10">

            <button
              onClick={handleRetry}
              className="px-6 py-3 rounded-lg bg-emerald-300 text-[#07100d] font-semibold hover:bg-emerald-200 transition"
            >
              Try Again
            </button>

            <button
              onClick={handleBackToHome}
              className="px-6 py-3 rounded-lg border border-gray-700 text-white hover:border-emerald-300 hover:text-emerald-300 transition"
            >
              Back to Home
            </button>

          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // NO QUESTIONS
  // ==========================================================

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07100d] text-white px-6">
        <div className="text-center">

          <p className="mb-4 text-gray-400">
            No questions available.
          </p>

          <div className="flex justify-center gap-3">

            <button
              onClick={handleRetry}
              className="px-5 py-3 rounded-lg bg-emerald-300 text-[#07100d] font-semibold hover:bg-emerald-200 transition"
            >
              Try Again
            </button>

            <button
              onClick={handleBackToHome}
              className="px-5 py-3 rounded-lg border border-gray-700 text-white hover:border-emerald-300 hover:text-emerald-300 transition"
            >
              Back to Home
            </button>

          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // CURRENT QUESTION
  // ==========================================================

  const currentQuestionData =
    questions[currentQuestion];

  const questionText =
    typeof currentQuestionData === "object"
      ? currentQuestionData?.question
      : currentQuestionData;

  const category =
    typeof currentQuestionData === "object"
      ? currentQuestionData?.category
      : "General";

  const progress =
    ((currentQuestion + 1) /
      TOTAL_QUESTIONS) *
    100;

  // ==========================================================
  // INTERVIEW SCREEN
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#07100d] text-white px-4 py-8">

      <div className="max-w-4xl mx-auto">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-6">

          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-emerald-300 mb-1">
              CAREERPREP AI
            </p>

            <h1 className="text-2xl font-bold">
              AI Interview
            </h1>

            <p className="text-gray-400 mt-1">
              {interviewData?.role ||
                "React Developer"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-gray-500 text-sm">
              Question
            </p>

            <p className="text-xl font-bold text-emerald-300">
              {currentQuestion + 1}/
              {TOTAL_QUESTIONS}
            </p>
          </div>

        </div>

        {/* PROGRESS BAR */}

        <div className="w-full bg-[#171d27] rounded-full h-2 mb-8">

          <div
            className="bg-emerald-300 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

        {/* QUESTION CARD */}

        <div className="bg-[#10151e] border border-gray-800 rounded-2xl p-6 md:p-8">

          {/* CATEGORY */}

          <div className="mb-5">

            <span className="inline-block px-3 py-1 rounded-full bg-emerald-300/10 text-emerald-300 text-sm">
              {category || "Technical"}
            </span>

          </div>

          {/* QUESTION */}

          <h2 className="text-2xl font-bold leading-relaxed mb-8">
            {questionText}
          </h2>

          {/* ANSWER */}

          <textarea
            value={answer}
            onChange={(e) =>
              setAnswer(e.target.value)
            }
            placeholder="Type your answer here..."
            className="w-full min-h-[220px] bg-[#171d27] border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 outline-none focus:border-emerald-300 resize-none transition"
          />

          {/* BUTTONS */}

          <div className="flex justify-between mt-6">

            <button
              onClick={handlePrevious}
              disabled={
                currentQuestion === 0
              }
              className="px-5 py-3 rounded-lg border border-gray-700 text-white hover:border-emerald-300 hover:text-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-lg bg-emerald-300 text-[#07100d] font-semibold hover:bg-emerald-200 transition"
            >
              {currentQuestion ===
              TOTAL_QUESTIONS - 1
                ? "Finish Interview"
                : "Next Question"}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Interview;
