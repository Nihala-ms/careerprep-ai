import React, { useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiTarget,
  FiZap,
} from "react-icons/fi";

function InterviewSetup({onStart}) {
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const roles = [
    "React Developer",
    "Frontend Developer",
    "MERN Stack Developer",
    "Full Stack Developer",
    "JavaScript Developer",
  ];

  const experiences = [
    "Fresher",
    "0–1 Year",
    "1–2 Years",
    "2+ Years",
  ];

  const difficulties = [
    {
      name: "Beginner",
      description: "Basic concepts & easy questions",
    },
    {
      name: "Intermediate",
      description: "Practical & technical questions",
    },
    {
      name: "Advanced",
      description: "Deep technical questions",
    },
  ];

  const canStart = role && experience && difficulty;

  const handleStart = () => {
  if (!canStart) return;

  onStart({
    role,
    experience,
    difficulty,
  });
};

  return (
    <main className="min-h-screen bg-[#080b12] px-5 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl">

        {/* Back */}
        <button
          onClick={() => window.history.back()}
          className="mb-10 flex items-center gap-2 text-sm text-gray-500 transition hover:text-emerald-300"
        >
          <FiArrowLeft />
          Back
        </button>

        {/* Heading */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-300">
            <FiZap size={25} />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
            Set Up Your Interview
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-gray-500">
            Tell us a little about your target role and we'll prepare
            questions that match your experience.
          </p>
        </div>

        {/* Form */}
        <div className="mt-12 space-y-9 rounded-2xl border border-gray-800 bg-[#0f141c] p-6 sm:p-8">

          {/* Role */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-300/10 text-emerald-300">
                <FiBriefcase />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-white">
                  Target Role
                </h2>

                <p className="text-xs text-gray-500">
                  What role are you preparing for?
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {roles.map((item) => (
                <button
                  key={item}
                  onClick={() => setRole(item)}
                  className={`rounded-lg border p-4 text-left text-sm transition ${
                    role === item
                      ? "border-emerald-300/60 bg-emerald-300/10 text-emerald-300"
                      : "border-gray-800 bg-[#121822] text-gray-400 hover:border-gray-600 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{item}</span>

                    {role === item && <FiCheck />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-300/10 text-emerald-300">
                <FiTarget />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-white">
                  Experience Level
                </h2>

                <p className="text-xs text-gray-500">
                  Select your current experience.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {experiences.map((item) => (
                <button
                  key={item}
                  onClick={() => setExperience(item)}
                  className={`rounded-lg border px-3 py-4 text-center text-xs transition ${
                    experience === item
                      ? "border-emerald-300/60 bg-emerald-300/10 text-emerald-300"
                      : "border-gray-800 bg-[#121822] text-gray-400 hover:border-gray-600 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-white">
                Difficulty
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                How challenging should the questions be?
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {difficulties.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setDifficulty(item.name)}
                  className={`rounded-lg border p-4 text-left transition ${
                    difficulty === item.name
                      ? "border-emerald-300/60 bg-emerald-300/10"
                      : "border-gray-800 bg-[#121822] hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        difficulty === item.name
                          ? "text-emerald-300"
                          : "text-white"
                      }`}
                    >
                      {item.name}
                    </span>

                    {difficulty === item.name && (
                      <FiCheck className="text-emerald-300" />
                    )}
                  </div>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    {item.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Start */}
          <button
            onClick={handleStart}
            disabled={!canStart}
            className={`flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-semibold transition ${
              canStart
                ? "bg-emerald-300 text-[#07100d] hover:-translate-y-0.5"
                : "cursor-not-allowed bg-gray-800 text-gray-600"
            }`}
          >
            Start AI Interview
            <FiArrowRight />
          </button>

        </div>

        {/* Bottom info */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-600">
          <FiZap className="text-emerald-300" />
          Your questions will be personalized by AI
        </div>

      </div>
    </main>
  );
}

export default InterviewSetup;