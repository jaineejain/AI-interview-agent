import React from "react";
import {
  FaArrowLeft,
  FaDownload,
  FaCheckCircle,
  FaChartLine,
  FaBullseye,
  FaComments,
  FaLightbulb,
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
    questionWiseScore = [],
  } = report;

  const questionScoreData = questionWiseScore.map((score, index) => ({
    name: `Q${index + 1}`,
    score: score.score || 0,
  }));

  const skills = [
    {
      label: "Confidence",
      value: confidence,
      icon: FaBullseye,
    },
    {
      label: "Communication",
      value: communication,
      icon: FaComments,
    },
    {
      label: "Correctness",
      value: correctness,
      icon: FaLightbulb,
    },
  ];

  let performanceText = "";
  let shortTagline = "";

  if (finalScore >= 8) {
    performanceText = "Ready for job opportunities.";
    shortTagline = "Excellent clarity and structured responses.";
  } else if (finalScore >= 5) {
    performanceText = "Needs minor improvement before interviews.";
    shortTagline = "Good foundation, refine articulation.";
  } else {
    performanceText = "Significant improvement required.";
    shortTagline = "Work on clarity and confidence.";
  }

  const score = finalScore;
  const percentage = (score / 10) * 100;

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    let currentY = 25;

    // ================= TITLE =================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);

    doc.text("AI Interview Performance Report", pageWidth / 2, currentY, {
      align: "center",
    });

    currentY += 5;

    doc.setDrawColor(37, 99, 235);

    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

    currentY += 15;

    // ================= FINAL SCORE =================

    doc.setFillColor(239, 246, 255);

    doc.roundedRect(margin, currentY, contentWidth, 20, 4, 4, "F");

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);

    doc.text(`Final Score: ${finalScore}/10`, pageWidth / 2, currentY + 12, {
      align: "center",
    });

    currentY += 30;

    // ================= SKILLS =================

    doc.setFillColor(249, 250, 251);

    doc.roundedRect(margin, currentY, contentWidth, 30, 4, 4, "F");

    doc.setFontSize(12);

    doc.text(`Confidence: ${confidence}`, margin + 10, currentY + 10);

    doc.text(`Communication: ${communication}`, margin + 10, currentY + 18);

    doc.text(`Correctness: ${correctness}`, margin + 10, currentY + 26);

    currentY += 45;

    // ================= ADVICE =================

    let advice = "";

    if (finalScore >= 8) {
      advice =
        "Excellent performance. Maintain confidence and structure. Continue refining clarity and supporting answers with strong real-world examples.";
    } else if (finalScore >= 5) {
      advice =
        "Good foundation shown. Improve clarity and structure. Practice delivering concise, confident answers with stronger supporting examples.";
    } else {
      advice =
        "Significant improvement required. Focus on structured thinking, clarity, and confident delivery. Practice answering aloud regularly.";
    }

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220);

    doc.roundedRect(margin, currentY, contentWidth, 35, 4, 4);

    doc.setFont("helvetica", "bold");

    doc.text("Professional Advice", margin + 10, currentY + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const splitAdvice = doc.splitTextToSize(advice, contentWidth - 20);

    doc.text(splitAdvice, margin + 10, currentY + 20);

    currentY += 50;

    // ================= QUESTION TABLE =================

    autoTable(doc, {
      startY: currentY,
      margin: {
        left: margin,
        right: margin,
      },

      head: [["#", "Question", "Score", "Feedback"]],

      body: questionWiseScore.map((q, i) => [
        `${i + 1}`,
        q.question,
        `${q.score}/10`,
        q.feedback,
      ]),

      styles: {
        fontSize: 9,
        cellPadding: 5,
        valign: "top",
      },

      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        halign: "center",
      },

      columnStyles: {
        0: {
          cellWidth: 10,
          halign: "center",
        },

        1: {
          cellWidth: 55,
        },

        2: {
          cellWidth: 20,
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
          MAIN CONTENT
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        {/* Intro */}
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
                Review your strengths and identify areas to improve before your
                next interview.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
              <FaChartLine className="text-[var(--blue)]" />
              Performance overview
            </div>
          </div>
        </div>

        {/* =====================================================
            TOP METRICS
        ====================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Overall */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
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

          {/* Skill cards */}
          {skills.map((skill, index) => {
            const Icon = skill.icon;

            return (
              <motion.div
                key={skill.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.08 * (index + 1),
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
                    {skill.label}
                  </p>

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--blue)]">
                    <Icon className="text-xs" />
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <span className="font-display text-3xl font-bold text-[var(--ink)]">
                    {skill.value}
                  </span>

                  <span className="mb-1 text-sm text-[var(--muted)]">/ 10</span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(skill.value * 10, 100)}%`,
                    }}
                    transition={{
                      duration: 0.7,
                      delay: 0.15 + index * 0.1,
                    }}
                    className="h-full rounded-full bg-[var(--blue)]"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* =====================================================
            PERFORMANCE + SKILLS
        ====================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Performance Trend */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
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

                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
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
          </motion.section>

          {/* Skill Evaluation */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="
              rounded-2xl border border-[var(--line)]
              bg-[var(--surface)]
              p-5 shadow-sm
              sm:p-6
            "
          >
            <div className="mb-6">
              <h3 className="font-display text-base font-bold text-[var(--ink)]">
                Skill evaluation
              </h3>

              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                Breakdown of your core interview skills
              </p>
            </div>

            <div className="space-y-6">
              {skills.map((skill, index) => (
                <div key={index}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--ink-soft)]">
                      {skill.label}
                    </span>

                    <span className="text-sm font-bold text-[var(--ink)]">
                      {skill.value}/10
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
                    <motion.div
                      initial={{ width: 0 }}
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
              ))}
            </div>
          </motion.section>
        </div>

        {/* =====================================================
            QUESTION BREAKDOWN
        ====================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
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
                  Review how you answered each interview question.
                </p>
              </div>

              <span className="hidden rounded-lg bg-[var(--surface-2)] px-2.5 py-1.5 text-[10px] font-bold text-[var(--muted)] sm:block">
                {questionWiseScore.length} QUESTIONS
              </span>
            </div>
          </div>

          <div className="divide-y divide-[var(--line)]">
            {questionWiseScore.map((q, i) => {
              const questionScore = q.score ?? 0;

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
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                          Question {i + 1}
                        </p>

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

                  {/* Feedback */}
                  <div className="mt-5 sm:ml-[52px]">
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
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Footer Action */}
        <div className="flex justify-center py-8">
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
        </div>
      </main>
    </div>
  );
}

export default Step3Report;
