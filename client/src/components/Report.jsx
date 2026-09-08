import React from "react";
import {
  FaArrowLeft,
  FaDownload,
  FaCheckCircle,
  FaChartLine,
  FaBullseye,
  FaComments,
  FaLightbulb,
  FaExclamationTriangle,
  FaTrophy,
  FaBookOpen,
  FaClock,
  FaMicrophoneAlt,
  FaArrowUp,
  FaLayerGroup,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Step3Report({ report }) {
  const navigate = useNavigate();

  if (!report) {
    return (
      <div className="page-shell surface-grid flex min-h-screen items-center justify-center px-5">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[var(--line)] border-t-[var(--blue)]" />

          <p className="text-sm font-medium text-[var(--muted)]">
            Loading your interview report...
          </p>
        </div>
      </div>
    );
  }

  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    readinessScore = 0,
    communicationAnalysis = "",
    overallStrengths = [],
    overallWeaknesses = [],
    skillPerformance = [],
    preparationPlan = [],
    interviewType = "",
    role = "",
    experience = "",
    questionWiseScore = [],
  } = report;

  const safeFinalScore = Number(finalScore || 0);
  const safeConfidence = Number(confidence || 0);
  const safeCommunication = Number(communication || 0);
  const safeCorrectness = Number(correctness || 0);

  const safeReadiness =
    Number(readinessScore || 0) ||
    Math.round(
      ((safeFinalScore + safeConfidence + safeCommunication + safeCorrectness) /
        40) *
        100,
    );

  const questionScoreData = questionWiseScore.map((item, index) => ({
    name: `Q${index + 1}`,
    score: Number(item.score || 0),
  }));

  const coreSkills = [
    {
      label: "Confidence",
      value: safeConfidence,
      icon: FaBullseye,
    },
    {
      label: "Communication",
      value: safeCommunication,
      icon: FaComments,
    },
    {
      label: "Correctness",
      value: safeCorrectness,
      icon: FaLightbulb,
    },
  ];

  let performanceText = "";
  let shortTagline = "";

  if (safeFinalScore >= 8) {
    performanceText = "Ready for job opportunities.";
    shortTagline = "Excellent clarity and structured responses.";
  } else if (safeFinalScore >= 5) {
    performanceText = "Needs minor improvement before interviews.";
    shortTagline = "Good foundation, refine articulation.";
  } else {
    performanceText = "Significant improvement required.";
    shortTagline = "Work on clarity and confidence.";
  }

  const readinessLabel =
    safeReadiness >= 80
      ? "Interview ready"
      : safeReadiness >= 60
        ? "Almost ready"
        : safeReadiness >= 40
          ? "Needs practice"
          : "Keep practicing";

  const readinessDescription =
    safeReadiness >= 80
      ? "Your current performance indicates strong interview readiness."
      : safeReadiness >= 60
        ? "You have a solid foundation. A little more focused practice can improve consistency."
        : safeReadiness >= 40
          ? "You understand the basics, but more practice is needed before high-pressure interviews."
          : "Focus on fundamentals, structured answers, confidence, and repeated practice.";

  const normalizedStrengths = Array.isArray(overallStrengths)
    ? overallStrengths.filter(Boolean)
    : [];

  const normalizedWeaknesses = Array.isArray(overallWeaknesses)
    ? overallWeaknesses.filter(Boolean)
    : [];

  const normalizedSkills = Array.isArray(skillPerformance)
    ? skillPerformance.filter((item) => item && item.name)
    : [];

  const normalizedPlan = Array.isArray(preparationPlan)
    ? preparationPlan.filter((item) => item && item.topic)
    : [];

  const getPriorityClasses = (priority) => {
    if (priority === "High") {
      return "bg-[var(--danger-soft)] text-[var(--danger)]";
    }

    if (priority === "Low") {
      return "bg-[var(--surface-2)] text-[var(--muted)]";
    }

    return "bg-[var(--warning-soft)] text-[var(--warning)]";
  };

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();

    const margin = 18;
    const contentWidth = pageWidth - margin * 2;

    let currentY = 22;

    // =====================================================
    // TITLE
    // =====================================================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);

    doc.text("AI Interview Performance Report", pageWidth / 2, currentY, {
      align: "center",
    });

    currentY += 5;

    doc.setDrawColor(37, 99, 235);

    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

    currentY += 13;

    // =====================================================
    // INTERVIEW DETAILS
    // =====================================================

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);

    const interviewDetails = [
      role ? `Role: ${role}` : "",
      experience ? `Experience: ${experience}` : "",
      interviewType ? `Interview Type: ${interviewType}` : "",
    ].filter(Boolean);

    if (interviewDetails.length > 0) {
      doc.text(interviewDetails.join("  |  "), pageWidth / 2, currentY, {
        align: "center",
      });

      currentY += 12;
    }

    // =====================================================
    // FINAL SCORE
    // =====================================================

    doc.setFillColor(239, 246, 255);

    doc.roundedRect(margin, currentY, contentWidth, 24, 4, 4, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(0, 0, 0);

    doc.text(
      `Final Score: ${safeFinalScore}/10`,
      pageWidth / 2,
      currentY + 10,
      {
        align: "center",
      },
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(
      `Interview Readiness: ${safeReadiness}%`,
      pageWidth / 2,
      currentY + 17,
      {
        align: "center",
      },
    );

    currentY += 34;

    // =====================================================
    // CORE METRICS
    // =====================================================

    doc.setFillColor(249, 250, 251);

    doc.roundedRect(margin, currentY, contentWidth, 31, 4, 4, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    doc.text(`Confidence: ${safeConfidence}/10`, margin + 8, currentY + 9);

    doc.text(
      `Communication: ${safeCommunication}/10`,
      margin + 8,
      currentY + 17,
    );

    doc.text(`Correctness: ${safeCorrectness}/10`, margin + 8, currentY + 25);

    doc.text(`Readiness: ${safeReadiness}%`, margin + 100, currentY + 9);

    doc.text(
      `Questions: ${questionWiseScore.length}`,
      margin + 100,
      currentY + 17,
    );

    doc.text(`Status: ${readinessLabel}`, margin + 100, currentY + 25);

    currentY += 42;

    // =====================================================
    // STRENGTHS
    // =====================================================

    if (normalizedStrengths.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);

      doc.text("Key Strengths", margin, currentY);

      currentY += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      normalizedStrengths.slice(0, 6).forEach((strength) => {
        const lines = doc.splitTextToSize(`• ${strength}`, contentWidth);

        doc.text(lines, margin + 2, currentY);

        currentY += lines.length * 5 + 1;
      });

      currentY += 4;
    }

    // =====================================================
    // WEAKNESSES
    // =====================================================

    if (normalizedWeaknesses.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);

      doc.text("Areas to Improve", margin, currentY);

      currentY += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      normalizedWeaknesses.slice(0, 6).forEach((weakness) => {
        const lines = doc.splitTextToSize(`• ${weakness}`, contentWidth);

        doc.text(lines, margin + 2, currentY);

        currentY += lines.length * 5 + 1;
      });

      currentY += 4;
    }

    // =====================================================
    // COMMUNICATION
    // =====================================================

    if (communicationAnalysis) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);

      doc.text("Communication Analysis", margin, currentY);

      currentY += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      const communicationLines = doc.splitTextToSize(
        communicationAnalysis,
        contentWidth,
      );

      doc.text(communicationLines, margin, currentY);

      currentY += communicationLines.length * 5 + 10;
    }

    // =====================================================
    // PREPARATION PLAN
    // =====================================================

    if (normalizedPlan.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);

      doc.text("Personalized Preparation Plan", margin, currentY);

      currentY += 7;

      autoTable(doc, {
        startY: currentY,
        margin: {
          left: margin,
          right: margin,
        },
        head: [["Topic", "Reason", "Priority"]],
        body: normalizedPlan
          .slice(0, 8)
          .map((item) => [
            item.topic,
            item.reason || "Practice recommended",
            item.priority || "Medium",
          ]),
        styles: {
          fontSize: 8.5,
          cellPadding: 4,
          valign: "top",
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: 255,
        },
      });

      currentY = (doc.lastAutoTable?.finalY || currentY) + 12;
    }

    // =====================================================
    // QUESTION TABLE
    // =====================================================

    autoTable(doc, {
      startY: currentY,
      margin: {
        left: margin,
        right: margin,
      },
      head: [["#", "Question", "Score", "Feedback"]],
      body: questionWiseScore.map((q, i) => [
        `${i + 1}`,
        q.question || "Question not available",
        `${q.score || 0}/10`,
        q.feedback || "No feedback available",
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 4,
        valign: "top",
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        halign: "center",
      },
      columnStyles: {
        0: {
          cellWidth: 9,
          halign: "center",
        },
        1: {
          cellWidth: 48,
        },
        2: {
          cellWidth: 18,
          halign: "center",
        },
        3: {
          cellWidth: "auto",
        },
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
    });

    doc.save("AI_Interview_Report.pdf");
  };

  const score = safeFinalScore;
  const percentage = Math.min(Math.max((score / 10) * 100, 0), 100);

  const readinessPercentage = Math.min(Math.max(safeReadiness, 0), 100);

  return (
    <div className="page-shell min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4 sm:h-[72px]">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => navigate("/history")}
                className="
                  focus-ring
                  flex h-10 w-10 shrink-0 items-center justify-center
                  rounded-xl border border-[var(--line)]
                  bg-[var(--surface)]
                  text-[var(--muted)]
                  transition-all duration-200
                  hover:border-[var(--line-strong)]
                  hover:text-[var(--ink)]
                  hover:shadow-sm
                "
                title="Back to history"
              >
                <FaArrowLeft className="text-xs" />
              </button>

              <div className="min-w-0">
                <p className="hidden text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)] sm:block">
                  Interview results
                </p>

                <h1 className="truncate font-display text-base font-bold text-[var(--ink)] sm:text-lg">
                  Performance Report
                </h1>
              </div>
            </div>

            <button
              onClick={downloadPDF}
              className="
                button-accent
                focus-ring
                inline-flex shrink-0 items-center justify-center gap-2
                rounded-xl px-3.5 py-2.5
                text-xs font-bold
                sm:px-4 sm:text-sm
              "
            >
              <FaDownload className="text-[10px] sm:text-xs" />

              <span className="hidden sm:inline">Download PDF</span>

              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        {/* ===================================================
            INTRO
        ==================================================== */}

        <div className="mb-7 sm:mb-9">
          <div className="eyebrow mb-3">
            <FaCheckCircle className="text-[var(--success)]" />
            Interview completed
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
                Here's how you performed
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
                Review your strengths, weaknesses, readiness, and personalized
                preparation plan before your next interview.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {role && (
                <span className="rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-[10px] font-bold text-[var(--muted)]">
                  {role}
                </span>
              )}

              {interviewType && (
                <span className="rounded-full bg-[var(--blue-soft)] px-3 py-1.5 text-[10px] font-bold text-[var(--blue)]">
                  {interviewType}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ===================================================
            TOP METRICS
        ==================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Overall Score */}

          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.35,
            }}
            className="
              rounded-2xl border border-[var(--line)]
              bg-[var(--surface)]
              p-5
              shadow-sm
              sm:p-6
            "
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--muted)]">
                Overall Score
              </p>

              <span className="rounded-lg bg-[var(--blue-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--blue)]">
                OVERALL
              </span>
            </div>

            <div className="flex items-center gap-5">
              <div className="h-[76px] w-[76px] shrink-0">
                <CircularProgressbar
                  value={percentage}
                  text={`${score}`}
                  styles={buildStyles({
                    textSize: "26px",
                    pathColor: "#2563eb",
                    textColor: "var(--ink)",
                    trailColor: "#e5e7eb",
                  })}
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold leading-5 text-[var(--ink)]">
                  {performanceText}
                </p>

                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  {shortTagline}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Readiness */}

          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.35,
              delay: 0.08,
            }}
            className="
              rounded-2xl border border-[var(--line)]
              bg-[var(--surface)]
              p-5 shadow-sm
              sm:p-6
            "
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--muted)]">
                Interview Readiness
              </p>

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--success-soft)] text-[var(--success)]">
                <FaTrophy className="text-xs" />
              </div>
            </div>

            <div className="flex items-end justify-between">
              <span className="font-display text-3xl font-bold text-[var(--ink)]">
                {safeReadiness}%
              </span>

              <span className="mb-1 text-xs font-bold text-[var(--success)]">
                {readinessLabel}
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${readinessPercentage}%`,
                }}
                transition={{
                  duration: 0.8,
                }}
                className="h-full rounded-full bg-[var(--success)]"
              />
            </div>

            <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
              {readinessDescription}
            </p>
          </motion.div>

          {/* Confidence */}

          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.35,
              delay: 0.16,
            }}
            className="
              rounded-2xl border border-[var(--line)]
              bg-[var(--surface)]
              p-5 shadow-sm
              sm:p-6
            "
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--muted)]">
                Confidence
              </p>

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--blue-soft)] text-[var(--blue)]">
                <FaBullseye className="text-xs" />
              </div>
            </div>

            <div className="flex items-end justify-between">
              <span className="font-display text-3xl font-bold text-[var(--ink)]">
                {safeConfidence}
              </span>

              <span className="mb-1 text-sm text-[var(--muted)]">/ 10</span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${Math.min(safeConfidence * 10, 100)}%`,
                }}
                transition={{
                  duration: 0.7,
                }}
                className="h-full rounded-full bg-[var(--blue)]"
              />
            </div>
          </motion.div>

          {/* Communication */}

          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.35,
              delay: 0.24,
            }}
            className="
              rounded-2xl border border-[var(--line)]
              bg-[var(--surface)]
              p-5 shadow-sm
              sm:p-6
            "
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--muted)]">
                Communication
              </p>

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--blue)]">
                <FaComments className="text-xs" />
              </div>
            </div>

            <div className="flex items-end justify-between">
              <span className="font-display text-3xl font-bold text-[var(--ink)]">
                {safeCommunication}
              </span>

              <span className="mb-1 text-sm text-[var(--muted)]">/ 10</span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${Math.min(safeCommunication * 10, 100)}%`,
                }}
                transition={{
                  duration: 0.7,
                }}
                className="h-full rounded-full bg-[var(--blue)]"
              />
            </div>
          </motion.div>
        </div>

        {/* ===================================================
            COMMUNICATION ANALYSIS
        ==================================================== */}

        {communicationAnalysis && (
          <motion.section
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--blue-soft)] text-[var(--blue)]">
                <FaMicrophoneAlt className="text-sm" />
              </div>

              <div>
                <h3 className="font-display text-base font-bold text-[var(--ink)]">
                  Communication analysis
                </h3>

                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  AI analysis of how clearly and effectively you communicated.
                </p>

                <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
                  {communicationAnalysis}
                </p>
              </div>
            </div>
          </motion.section>
        )}

        {/* ===================================================
            STRENGTHS + WEAKNESSES
        ==================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Strengths */}

          <motion.section
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm sm:p-6"
          >
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--success-soft)] text-[var(--success)]">
                <FaCheckCircle className="text-sm" />
              </div>

              <div>
                <h3 className="font-display text-base font-bold text-[var(--ink)]">
                  Your strengths
                </h3>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  What you are already doing well.
                </p>
              </div>
            </div>

            {normalizedStrengths.length > 0 ? (
              <div className="space-y-3">
                {normalizedStrengths.map((strength, index) => (
                  <motion.div
                    key={index}
                    initial={{
                      opacity: 0,
                      x: -8,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: index * 0.05,
                    }}
                    className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3.5"
                  >
                    <FaCheckCircle className="mt-1 shrink-0 text-xs text-[var(--success)]" />

                    <p className="text-sm leading-6 text-[var(--ink-soft)]">
                      {strength}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-[var(--muted)]">
                Strength analysis is not available for this interview.
              </p>
            )}
          </motion.section>

          {/* Weaknesses */}

          <motion.section
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.08,
            }}
            className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm sm:p-6"
          >
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--danger-soft)] text-[var(--danger)]">
                <FaExclamationTriangle className="text-sm" />
              </div>

              <div>
                <h3 className="font-display text-base font-bold text-[var(--ink)]">
                  AI weakness detection
                </h3>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  Areas that deserve more practice.
                </p>
              </div>
            </div>

            {normalizedWeaknesses.length > 0 ? (
              <div className="space-y-3">
                {normalizedWeaknesses.map((weakness, index) => (
                  <motion.div
                    key={index}
                    initial={{
                      opacity: 0,
                      x: 8,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: index * 0.05,
                    }}
                    className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3.5"
                  >
                    <FaExclamationTriangle className="mt-1 shrink-0 text-xs text-[var(--danger)]" />

                    <p className="text-sm leading-6 text-[var(--ink-soft)]">
                      {weakness}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-[var(--muted)]">
                No major weaknesses were detected in this interview.
              </p>
            )}
          </motion.section>
        </div>

        {/* ===================================================
            PERFORMANCE + SKILLS
        ==================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Performance Trend */}

          <motion.section
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
            }}
            className="
              overflow-hidden rounded-2xl
              border border-[var(--line)]
              bg-[var(--surface)]
              p-5 shadow-sm
              sm:p-6
              lg:col-span-2
            "
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-base font-bold text-[var(--ink)]">
                  Performance trend
                </h3>

                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  Score across your interview questions
                </p>
              </div>

              <span className="hidden rounded-lg bg-[var(--surface-2)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--muted)] sm:block">
                Scale: 0–10
              </span>
            </div>

            {questionScoreData.length > 0 ? (
              <div className="h-60 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={questionScoreData}>
                    <defs>
                      <linearGradient
                        id="reportAreaFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#2563eb"
                          stopOpacity={0.18}
                        />

                        <stop
                          offset="100%"
                          stopColor="#2563eb"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#667085",
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      domain={[0, 10]}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#667085",
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 10px 25px rgba(15,23,42,0.08)",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#2563eb"
                      fill="url(#reportAreaFill)"
                      strokeWidth={2.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-60 items-center justify-center text-sm text-[var(--muted)]">
                No question score data available.
              </div>
            )}
          </motion.section>

          {/* Core Skill Evaluation */}

          <motion.section
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
            }}
            className="
              rounded-2xl border border-[var(--line)]
              bg-[var(--surface)]
              p-5 shadow-sm
              sm:p-6
            "
          >
            <div className="mb-6">
              <h3 className="font-display text-base font-bold text-[var(--ink)]">
                Core skill evaluation
              </h3>

              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                Breakdown of your core interview skills.
              </p>
            </div>

            <div className="space-y-6">
              {coreSkills.map((skill, index) => {
                const Icon = skill.icon;

                return (
                  <div key={skill.label}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-semibold text-[var(--ink-soft)]">
                        <Icon className="text-xs text-[var(--blue)]" />
                        {skill.label}
                      </span>

                      <span className="text-sm font-bold text-[var(--ink)]">
                        {skill.value}/10
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
                      <motion.div
                        initial={{
                          width: 0,
                        }}
                        animate={{
                          width: `${Math.min(skill.value * 10, 100)}%`,
                        }}
                        transition={{
                          duration: 0.7,
                          delay: index * 0.1,
                        }}
                        className="h-full rounded-full bg-[var(--blue)]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        </div>

        {/* ===================================================
            SKILL-WISE PERFORMANCE
        ==================================================== */}

        {normalizedSkills.length > 0 && (
          <motion.section
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm sm:p-6"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--blue-soft)] text-[var(--blue)]">
                  <FaLayerGroup className="text-sm" />
                </div>

                <div>
                  <h3 className="font-display text-base font-bold text-[var(--ink)]">
                    Skill-wise performance
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    AI evaluated the skills demonstrated across your answers.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {normalizedSkills.map((skill, index) => {
                const skillScore = Math.min(
                  Math.max(Number(skill.score || 0), 0),
                  10,
                );

                return (
                  <motion.div
                    key={`${skill.name}-${index}`}
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.05,
                    }}
                    className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-bold text-[var(--ink-soft)]">
                        {skill.name}
                      </p>

                      <span className="shrink-0 font-display text-lg font-bold text-[var(--blue)]">
                        {skillScore}/10
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[var(--surface)]">
                      <motion.div
                        initial={{
                          width: 0,
                        }}
                        animate={{
                          width: `${skillScore * 10}%`,
                        }}
                        transition={{
                          duration: 0.7,
                          delay: index * 0.06,
                        }}
                        className="h-full rounded-full bg-[var(--blue)]"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* ===================================================
            PERSONALIZED PREPARATION PLAN
        ==================================================== */}

        {normalizedPlan.length > 0 && (
          <motion.section
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm sm:p-6"
          >
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--warning-soft)] text-[var(--warning)]">
                <FaBookOpen className="text-sm" />
              </div>

              <div>
                <h3 className="font-display text-base font-bold text-[var(--ink)]">
                  Personalized preparation plan
                </h3>

                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  Focus your next practice sessions on the areas with the
                  highest impact.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {normalizedPlan.map((item, index) => (
                <motion.div
                  key={`${item.topic}-${index}`}
                  initial={{
                    opacity: 0,
                    x: -8,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: index * 0.06,
                  }}
                  className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-xs font-bold text-[var(--blue)]">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--ink)]">
                          {item.topic}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                          {item.reason ||
                            "Practice this topic to improve interview performance."}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`
                          inline-flex w-fit shrink-0
                          rounded-full px-3 py-1.5
                          text-[10px] font-bold
                          ${getPriorityClasses(item.priority)}
                        `}
                    >
                      {item.priority || "Medium"} priority
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ===================================================
            QUESTION BREAKDOWN
        ==================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
          }}
          className="
            overflow-hidden rounded-2xl
            border border-[var(--line)]
            bg-[var(--surface)]
            shadow-sm
          "
        >
          <div className="border-b border-[var(--line)] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-base font-bold text-[var(--ink)]">
                  Question-by-question review
                </h3>

                <p className="mt-1 text-xs leading-5 text-[var(--muted)] sm:text-sm">
                  Review your answers, AI feedback, and improved answer
                  suggestions.
                </p>
              </div>

              <span className="hidden rounded-lg bg-[var(--surface-2)] px-2.5 py-1.5 text-[10px] font-bold text-[var(--muted)] sm:block">
                {questionWiseScore.length} QUESTIONS
              </span>
            </div>
          </div>

          <div className="divide-y divide-[var(--line)]">
            {questionWiseScore.map((q, i) => {
              const questionScore = Number(q.score ?? 0);

              const questionSkills = Array.isArray(q.skills)
                ? q.skills.filter(Boolean)
                : [];

              const strengths = Array.isArray(q.strengths)
                ? q.strengths.filter(Boolean)
                : [];

              const weaknesses = Array.isArray(q.weaknesses)
                ? q.weaknesses.filter(Boolean)
                : [];

              return (
                <div
                  key={i}
                  className="
                      p-5 transition-colors duration-200
                      hover:bg-[var(--surface-2)]
                      sm:p-6
                    "
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <div
                        className="
                            flex h-9 w-9 shrink-0 items-center
                            justify-center rounded-lg
                            bg-[var(--blue-soft)]
                            text-xs font-bold text-[var(--blue)]
                          "
                      >
                        {i + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                            Question {i + 1}
                          </p>

                          {q.isFollowUp && (
                            <span className="rounded-full bg-[var(--blue-soft)] px-2 py-0.5 text-[9px] font-bold text-[var(--blue)]">
                              Adaptive follow-up
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-bold leading-6 text-[var(--ink)] sm:text-base">
                          {q.question || "Question not available"}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span
                        className={`
                            inline-flex rounded-lg px-3 py-1.5
                            text-sm font-bold
                            ${
                              questionScore >= 8
                                ? "bg-[var(--success-soft)] text-[var(--success)]"
                                : questionScore >= 5
                                  ? "bg-[var(--warning-soft)] text-[var(--warning)]"
                                  : "bg-[var(--danger-soft)] text-[var(--danger)]"
                            }
                          `}
                      >
                        {questionScore}/10
                      </span>
                    </div>
                  </div>

                  {/* Skills */}

                  {questionSkills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 sm:ml-[52px]">
                      {questionSkills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--blue)]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Feedback */}

                  <div className="mt-5 space-y-3 sm:ml-[52px]">
                    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <FaLightbulb className="text-xs text-[var(--blue)]" />

                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                          AI Feedback
                        </p>
                      </div>

                      <p className="text-sm leading-6 text-[var(--ink-soft)]">
                        {q.feedback && q.feedback.trim() !== ""
                          ? q.feedback
                          : "No feedback available for this question."}
                      </p>
                    </div>

                    {/* Strengths */}

                    {strengths.length > 0 && (
                      <div className="rounded-xl border border-[var(--line)] bg-[var(--success-soft)] p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <FaCheckCircle className="text-xs text-[var(--success)]" />

                          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--success)]">
                            What you did well
                          </p>
                        </div>

                        <ul className="space-y-1.5">
                          {strengths.map((strength, strengthIndex) => (
                            <li
                              key={strengthIndex}
                              className="flex items-start gap-2 text-xs leading-5 text-[var(--ink-soft)]"
                            >
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--success)]" />

                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Weaknesses */}

                    {weaknesses.length > 0 && (
                      <div className="rounded-xl border border-[var(--line)] bg-[var(--danger-soft)] p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <FaExclamationTriangle className="text-xs text-[var(--danger)]" />

                          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--danger)]">
                            Improvement area
                          </p>
                        </div>

                        <ul className="space-y-1.5">
                          {weaknesses.map((weakness, weaknessIndex) => (
                            <li
                              key={weaknessIndex}
                              className="flex items-start gap-2 text-xs leading-5 text-[var(--ink-soft)]"
                            >
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--danger)]" />

                              <span>{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Improved Answer */}

                    {q.improvedAnswer && q.improvedAnswer.trim() !== "" && (
                      <div className="rounded-xl border border-[var(--line)] bg-[var(--blue-soft)] p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <FaArrowUp className="text-xs text-[var(--blue)]" />

                          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--blue)]">
                            AI improved answer
                          </p>
                        </div>

                        <p className="text-sm leading-6 text-[var(--ink-soft)]">
                          {q.improvedAnswer}
                        </p>
                      </div>
                    )}

                    {/* Answer metadata */}

                    {(q.wordCount || q.timeTaken || q.fillerWords) && (
                      <div className="flex flex-wrap gap-2">
                        {q.wordCount > 0 && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--surface-2)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--muted)]">
                            <FaChartLine />
                            {q.wordCount} words
                          </span>
                        )}

                        {q.timeTaken > 0 && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--surface-2)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--muted)]">
                            <FaClock />
                            {q.timeTaken}s
                          </span>
                        )}

                        {q.fillerWords > 0 && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--warning-soft)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--warning)]">
                            {q.fillerWords} filler words
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* ===================================================
            FOOTER
        ==================================================== */}

        <div className="flex flex-col items-center gap-3 py-8 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate("/history")}
            className="
              focus-ring
              inline-flex items-center gap-2
              rounded-lg px-3 py-2
              text-sm font-semibold text-[var(--muted)]
              transition-colors duration-200
              hover:bg-[var(--surface)]
              hover:text-[var(--blue)]
            "
          >
            <FaArrowLeft className="text-xs" />
            Back to interview history
          </button>

          <button
            onClick={() => navigate("/interview")}
            className="
              button-accent
              focus-ring
              inline-flex items-center gap-2
              rounded-xl px-5 py-3
              text-sm font-bold
            "
          >
            Practice another interview
            <FaArrowUp className="rotate-90 text-xs" />
          </button>
        </div>
      </main>
    </div>
  );
}

export default Step3Report;
