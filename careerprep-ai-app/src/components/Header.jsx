import React from "react";
import { FiBriefcase } from "react-icons/fi";

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080b12]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-300 text-[#07100d]">
            <FiBriefcase size={18} />
          </div>

          <h1 className="text-lg font-bold text-white">
            CareerPrep <span className="text-emerald-300">AI</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#home"
            className="text-sm text-gray-400 transition hover:text-emerald-300"
          >
            Home
          </a>

          <a
            href="#features"
            className="text-sm text-gray-400 transition hover:text-emerald-300"
          >
            Features
          </a>

          <a
            href="#about"
            className="text-sm text-gray-400 transition hover:text-emerald-300"
          >
            About
          </a>
        </nav>

        {/* Button */}
        <button className="rounded-lg border border-emerald-300/40 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-300 hover:text-[#07100d]">
          Start Practice
        </button>

      </div>
    </header>
  );
}

export default Header;