import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthModel from "../components/AuthModel";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

import {
  BsRobot,
  BsMic,
  BsClock,
  BsBarChart,
  BsFileEarmarkText,
  BsArrowRight,
  BsCheck2,
} from "react-icons/bs";

import { HiSparkles } from "react-icons/hi";

import hrImg from "../assets/HR.png";
import techImg from "../assets/tech.png";
import confidenceImg from "../assets/confi.png";
import creditImg from "../assets/credit.png";
import evalImg from "../assets/ai-ans.png";
import resumeImg from "../assets/resume.png";
import pdfImg from "../assets/pdf.png";
import analyticsImg from "../assets/history.png";

function Home() {
  const { userData } = useSelector((state) => state.user);

  const [showAuth, setShowAuth] = useState(false);

  const navigate = useNavigate();

  // =========================================================
  // START INTERVIEW
  // =========================================================

  const handleStartInterview = () => {
    if (!userData) {
      setShowAuth(true);
      return;
    }

    navigate("/interview");
  };

  // =========================================================
  // VIEW HISTORY
  // =========================================================

  const handleViewHistory = () => {
    if (!userData) {
      setShowAuth(true);
      return;
    }

    navigate("/history");
  };

  // =========================================================
  // WORKFLOW
  // =========================================================

  const workflow = [
    {
      icon: <BsRobot size={21} />,
      step: "01",
      title: "Choose your interview",
      desc: "Select a role, experience level, and interview type.",
    },
    {
      icon: <BsMic size={21} />,
      step: "02",
      title: "Interview with AI",
      desc: "Answer naturally using your voice or keyboard.",
    },
    {
      icon: <BsBarChart size={21} />,
      step: "03",
      title: "Review your performance",
      desc: "Get detailed feedback and understand where to improve.",
    },
  ];

  // =========================================================
  // CAPABILITIES
  // =========================================================

  const capabilities = [
    {
      image: evalImg,
      icon: <BsBarChart size={18} />,
      title: "AI Answer Evaluation",
      desc: "Scores communication, technical accuracy and confidence.",
    },
    {
      image: resumeImg,
      icon: <BsFileEarmarkText size={18} />,
      title: "Resume Based Interview",
      desc: "Project-specific questions based on your uploaded resume.",
    },
    {
      image: pdfImg,
      icon: <BsFileEarmarkText size={18} />,
      title: "Downloadable PDF Report",
      desc: "Detailed strengths, weaknesses and improvement insights.",
    },
    {
      image: analyticsImg,
      icon: <BsBarChart size={18} />,
      title: "History & Analytics",
      desc: "Track your performance across previous interview sessions.",
    },
  ];

  // =========================================================
  // INTERVIEW MODES
  // =========================================================

  const interviewModes = [
    {
      img: hrImg,
      number: "01",
      title: "HR Interview Mode",
      desc: "Behavioral and communication-based interview practice.",
    },
    {
      img: techImg,
      number: "02",
      title: "Technical Mode",
      desc: "Technical questions based on your selected role and experience.",
    },
    {
      img: confidenceImg,
      number: "03",
      title: "Confidence Insights",
      desc: "Understand how confidently and clearly you communicate.",
    },
    {
      img: creditImg,
      number: "04",
      title: "Credits System",
      desc: "Use credits to access and manage your interview sessions.",
    },
  ];

  return (
    <div className="page-shell min-h-screen bg-[var(--canvas)] text-[var(--ink)] transition-colors duration-200">
      <Navbar />

      {/* =====================================================
          HERO
      ====================================================== */}

      <main>
        <section className="relative overflow-hidden border-b border-[var(--line)] bg-[var(--canvas)]">
          <div className="surface-grid absolute inset-0 opacity-60" />

          <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:px-10 lg:pb-28">
            <div className="mx-auto max-w-4xl text-center">
              {/* Eyebrow */}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mb-7 flex justify-center"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--blue-border)] bg-[var(--blue-soft)] px-3.5 py-2 text-xs font-semibold text-[var(--blue)]">
                  <HiSparkles size={15} />

                  <span>AI-powered interview practice</span>
                </div>
              </motion.div>

              {/* Heading */}

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="text-4xl font-bold leading-[1.08] tracking-tight text-[var(--ink)] sm:text-5xl lg:text-6xl"
              >
                Practice interviews.
                <br />
                <span className="text-[var(--blue)]">
                  Improve with every attempt.
                </span>
              </motion.h1>

              {/* Description */}

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.12 }}
                className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base"
              >
                Practice realistic HR and technical interviews with an AI
                interviewer, get instant feedback, and track your progress over
                time.
              </motion.p>

              {/* Actions */}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18 }}
                className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"
              >
                <button
                  type="button"
                  onClick={handleStartInterview}
                  className="button-accent focus-ring inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold shadow-sm"
                >
                  Start Interview
                  <BsArrowRight />
                </button>

                <button
                  type="button"
                  onClick={handleViewHistory}
                  className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] px-7 py-3.5 text-sm font-bold text-[var(--ink-soft)] shadow-sm transition-colors duration-200 hover:border-[var(--blue)] hover:text-[var(--blue)]"
                >
                  View History
                </button>
              </motion.div>

              {/* Trust points */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-[var(--muted)]"
              >
                <span className="inline-flex items-center gap-2">
                  <BsCheck2 className="text-[var(--success)]" />
                  Voice or text answers
                </span>

                <span className="hidden h-1 w-1 rounded-full bg-[var(--line-strong)] sm:block" />

                <span className="inline-flex items-center gap-2">
                  <BsCheck2 className="text-[var(--success)]" />
                  Instant AI feedback
                </span>

                <span className="hidden h-1 w-1 rounded-full bg-[var(--line-strong)] sm:block" />

                <span className="inline-flex items-center gap-2">
                  <BsCheck2 className="text-[var(--success)]" />
                  Performance history
                </span>
              </motion.div>
            </div>
          </div>
        </section>

        {/* =====================================================
            WORKFLOW
        ====================================================== */}

        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="mb-10 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow mb-2">How it works</p>

              <h2 className="text-2xl font-bold text-[var(--ink)] sm:text-3xl">
                A simple interview workflow
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
              Everything you need to simulate the pressure of a real interview
              without waiting for someone to interview you.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] md:grid-cols-3">
            {workflow.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="group relative bg-[var(--surface)] p-6 transition-colors duration-200 sm:p-7"
              >
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--blue-soft)] text-[var(--blue)]">
                    {item.icon}
                  </div>

                  <span className="font-mono text-xs font-semibold text-[var(--muted-light)]">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--ink)]">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {item.desc}
                </p>

                <div className="mt-7 h-px w-8 bg-[var(--blue)] transition-all duration-300 group-hover:w-14" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* =====================================================
            CAPABILITIES
        ====================================================== */}

        <section className="border-y border-[var(--line)] bg-[var(--surface-soft)] transition-colors duration-200">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
            <div className="max-w-2xl">
              <p className="eyebrow mb-2">Built for better preparation</p>

              <h2 className="text-3xl font-bold text-[var(--ink)] sm:text-4xl">
                Everything you need to prepare with confidence.
              </h2>

              <p className="mt-4 text-sm leading-7 text-[var(--muted)] sm:text-base">
                From resume-based questions to detailed performance reports, the
                platform turns every practice session into useful preparation.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              {capabilities.map((item, index) => (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
                >
                  <div className="grid items-center gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_190px] sm:p-6">
                    <div className="order-2 sm:order-1">
                      <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--blue-soft)] text-[var(--blue)]">
                        {item.icon}
                      </div>

                      <h3 className="text-lg font-bold text-[var(--ink)]">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {item.desc}
                      </p>
                    </div>

                    <div className="order-1 flex h-44 items-center justify-center overflow-hidden rounded-xl bg-[var(--surface-soft)] sm:order-2 sm:h-40">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            INTERVIEW MODES
        ====================================================== */}

        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow mb-2">Interview modes</p>

              <h2 className="text-3xl font-bold text-[var(--ink)] sm:text-4xl">
                Practice the way you actually interview.
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
              Switch between different preparation experiences depending on what
              you need to improve.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {interviewModes.map((mode, index) => (
              <motion.article
                key={mode.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-md)] sm:p-7"
              >
                <div className="flex min-h-[190px] flex-col justify-between">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <span className="font-mono text-xs font-semibold text-[var(--muted-light)]">
                        {mode.number}
                      </span>

                      <h3 className="mt-4 text-lg font-bold text-[var(--ink)]">
                        {mode.title}
                      </h3>

                      <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
                        {mode.desc}
                      </p>
                    </div>

                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-soft)] transition-colors duration-200">
                      <img
                        src={mode.img}
                        alt={mode.title}
                        className="h-20 w-20 object-contain transition duration-300 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-2 text-xs font-bold text-[var(--blue)]">
                    <span>Available in interview setup</span>

                    <BsArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* =====================================================
            FINAL CTA
        ====================================================== */}

        <section className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8 lg:px-10 lg:pb-24">
          <div className="overflow-hidden rounded-2xl bg-[#101828] px-6 py-12 text-white transition-colors duration-200 dark:bg-[#151a22] sm:px-10 sm:py-14 lg:px-14">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-white/60">
                  Ready when you are
                </p>

                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Turn interview practice into interview confidence.
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
                  Start a realistic AI interview and get actionable feedback
                  after every answer.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartInterview}
                className="focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#101828] transition-colors duration-200 hover:bg-[#f2f4f7]"
              >
                Start practicing
                <BsArrowRight />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          AUTH MODAL
      ====================================================== */}

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}

      <Footer />
    </div>
  );
}

export default Home;
