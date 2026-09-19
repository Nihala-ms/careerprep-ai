import React from "react";
import {
  FiArrowRight,
  FiCheckCircle,
  FiMessageSquare,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";

function Home({ onStart }) {
  return (
    <main className="bg-[#07100d] text-white">

      {/* =====================================================
          HERO
      ====================================================== */}
      <section
        id="home"
        className="relative overflow-hidden bg-[#07100d] px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
      >
        {/* Background Glow */}
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-300/10 blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">

          {/* LEFT */}
          <div>

            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/5 px-4 py-2 text-xs text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              AI-Powered Interview Preparation
            </div>

            {/* Heading */}
            <h2 className="max-w-2xl text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Prepare Smarter.
              <br />

              <span className="text-emerald-300">
                Interview Better.
              </span>
            </h2>

            {/* Description */}
            <p className="mt-6 max-w-xl text-base leading-8 text-gray-400">
              Practice realistic interview questions, improve your answers,
              and build confidence with personalized AI feedback.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

              {/* Start Interview */}
              <button
                onClick={onStart}
                className="flex items-center justify-center gap-2 rounded-lg bg-emerald-300 px-6 py-3 text-sm font-semibold text-[#07100d] transition hover:-translate-y-0.5 hover:bg-emerald-200"
              >
                Start Interview
                <FiArrowRight />
              </button>

              {/* Explore Features */}
              <button
                onClick={() =>
                  document.getElementById("features")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
                className="rounded-lg border border-gray-700 px-6 py-3 text-sm text-white transition hover:border-emerald-300 hover:text-emerald-300"
              >
                Explore Features
              </button>

            </div>

            {/* Small Text */}
            <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
              <FiCheckCircle className="text-emerald-300" />
              Built for students, freshers & job seekers
            </div>

          </div>

          {/* =====================================================
              RIGHT — AI PREVIEW
          ====================================================== */}
          <div className="relative">

            {/* Glow */}
            <div className="absolute inset-0 m-auto h-72 w-72 rounded-full bg-emerald-300/10 blur-[100px]" />

            {/* Preview Card */}
            <div className="relative rounded-2xl border border-gray-800 bg-[#10151e] p-6 shadow-2xl">

              {/* Header */}
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-[10px] tracking-widest text-gray-500">
                    YOUR AI INTERVIEW
                  </p>

                  <h3 className="mt-1 text-lg font-semibold text-white">
                    React Developer
                  </h3>
                </div>

                <div className="text-2xl font-bold text-emerald-300">
                  01
                  <span className="text-xs font-normal text-gray-500">
                    {" "}/ 10
                  </span>
                </div>

              </div>

              {/* Question */}
              <div className="mt-7 flex gap-4 rounded-xl border border-gray-800 bg-[#171d27] p-5">

                <div className="flex h-10 min-w-10 items-center justify-center rounded-lg bg-emerald-300/10 text-emerald-300">
                  <FiMessageSquare />
                </div>

                <div>
                  <p className="text-[10px] tracking-widest text-gray-500">
                    INTERVIEW QUESTION
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-300">
                    What is the difference between{" "}
                    <span className="font-semibold text-emerald-300">
                      let, const and var
                    </span>{" "}
                    in JavaScript?
                  </p>
                </div>

              </div>

              {/* Progress */}
              <div className="mt-6 flex gap-1.5">
                <span className="h-1 flex-1 rounded-full bg-emerald-300" />
                <span className="h-1 flex-1 rounded-full bg-gray-700" />
                <span className="h-1 flex-1 rounded-full bg-gray-700" />
                <span className="h-1 flex-1 rounded-full bg-gray-700" />
                <span className="h-1 flex-1 rounded-full bg-gray-700" />
              </div>

              {/* Answer Button */}
              <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-700 py-3 text-sm text-white transition hover:border-emerald-300 hover:text-emerald-300">
                Answer Question
                <FiArrowRight />
              </button>

            </div>
          </div>

        </div>
      </section>


      {/* =====================================================
          FEATURES
      ====================================================== */}
      <section
        id="features"
        className="relative overflow-hidden bg-[#07100d] px-5 py-24 sm:px-8 lg:px-10"
      >

        {/* Background Glow */}
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-emerald-300/5 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl">

          {/* Heading */}
          <div className="text-center">

            <p className="text-xs font-semibold tracking-[0.2em] text-emerald-300">
              WHY CAREERPREP AI?
            </p>

            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Everything you need to prepare.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-400">
              Practice, improve, and build confidence with tools designed
              specifically for your interview preparation.
            </p>

          </div>


          {/* Feature Cards */}
<div className="mt-12 grid gap-5 md:grid-cols-3">

  <FeatureCard
    icon={<FiTarget />}
    title="Role-Based Questions"
    text="Practice questions designed for your target role and experience level."
  />

  <FeatureCard
    icon={<FiMessageSquare />}
    title="AI Feedback"
    text="Get personalized feedback and understand exactly what you can improve."
  />

  <FeatureCard
    icon={<FiTrendingUp />}
    title="Detailed Results"
    text="Review your score, strengths, improvements, and feedback for every question."
  />

</div>
        </div>
      </section>


      {/* =====================================================
          ABOUT
      ====================================================== */}
      <section
        id="about"
        className="relative overflow-hidden bg-[#07100d] px-5 py-24 sm:px-8 lg:px-10"
      >

        {/* Background Glow */}
        <div className="absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-emerald-300/5 blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">

          {/* Left */}
          <div>

            <p className="text-xs font-semibold tracking-[0.2em] text-emerald-300">
              ABOUT CAREERPREP AI
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
              Turn interview anxiety into{" "}
              <span className="text-emerald-300">
                confidence.
              </span>
            </h2>

          </div>


          {/* Right */}
          <p className="self-center text-sm leading-8 text-gray-400">
            CareerPrep AI helps students and job seekers prepare for interviews
            through realistic practice and intelligent feedback. Choose your
            role, answer questions, and learn how to improve your responses.
          </p>

        </div>

      </section>

    </main>
  );
}


/* =====================================================
   FEATURE CARD
===================================================== */

function FeatureCard({ icon, title, text }) {
  return (
    <div
      className="
        group
        rounded-xl
        border
        border-gray-800
        bg-[#10151e]
        p-7
        transition
        duration-300
        hover:-translate-y-1
        hover:border-emerald-300/40
        hover:shadow-lg
        hover:shadow-emerald-300/5
      "
    >

      {/* Icon */}
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-300/10 text-emerald-300 transition group-hover:bg-emerald-300/15">
        {icon}
      </div>

      {/* Title */}
      <h3 className="mt-5 text-base font-semibold text-white">
        {title}
      </h3>

      {/* Description */}
      <p className="mt-2 text-sm leading-7 text-gray-400">
        {text}
      </p>

    </div>
  );
}


export default Home;
