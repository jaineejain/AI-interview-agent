import React from "react";
import { BsRobot, BsArrowUpRight } from "react-icons/bs";

function Footer() {
  return (
    <footer className="bg-transparent px-4 pb-6 pt-4 sm:px-6 sm:pb-8">
      <div
        className="
          mx-auto w-full max-w-6xl overflow-hidden
          rounded-2xl
          border border-[var(--line)]
          bg-[var(--ink)]
          px-6 py-8
          shadow-[0_18px_45px_rgba(15,23,42,0.10)]
          sm:px-8 sm:py-9
        "
      >
        <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="
                flex h-10 w-10 shrink-0 items-center justify-center
                rounded-xl
                bg-[var(--blue-soft)]
                text-[var(--blue)]
              "
            >
              <BsRobot size={17} />
            </div>

            <div>
              <h2 className="font-display text-sm font-bold tracking-tight text-white">
                InterviewIQ.AI
              </h2>

              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-white/45">
                AI interview preparation
              </p>
            </div>
          </div>

          {/* Small product marker */}
          <div className="hidden items-center gap-2 text-xs font-medium text-white/45 sm:flex">
            Practice
            <BsArrowUpRight className="text-[10px]" />
            Improve
            <BsArrowUpRight className="text-[10px]" />
            Perform
          </div>
        </div>

        {/* Description */}
        <div className="mt-7 border-t border-white/10 pt-6">
          <p className="max-w-2xl text-xs leading-5 text-white/55 sm:text-sm sm:leading-6">
            AI-powered interview preparation designed to improve communication
            skills, technical depth, and professional confidence.
          </p>
        </div>

        {/* Bottom */}
        <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-5 text-[10px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <span>InterviewIQ.AI</span>

          <span>Practice with purpose. Interview with confidence.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
