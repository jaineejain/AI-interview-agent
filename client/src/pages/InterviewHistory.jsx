import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import {
  FaArrowLeft,
  FaChartLine,
  FaChevronRight,
  FaClock,
  FaCheckCircle,
  FaCalendarAlt,
  FaClipboardList,
} from "react-icons/fa";
import { motion } from "motion/react";

function InterviewHistory() {
  const [interviews, setInterviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getMyInterviews = async () => {
      try {
        const result = await axios.get(
          ServerUrl + "/api/interview/get-interview",
          { withCredentials: true },
        );

        setInterviews(result.data);
      } catch (error) {
        console.log(error);
      }
    };

    getMyInterviews();
  }, []);

  return (
    <div className="page-shell surface-grid min-h-screen px-5 py-8 sm:px-6 sm:py-12 lg:py-16">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="mb-9 flex items-start gap-4 sm:mb-12">
          <motion.button
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/")}
            className="
              focus-ring
              mt-1 flex h-11 w-11 shrink-0 items-center justify-center
              rounded-xl border border-[var(--line)]
              bg-[var(--surface)]
              text-[var(--muted)]
              shadow-sm
              transition-all duration-200
              hover:border-[var(--line-strong)]
              hover:text-[var(--ink)]
              hover:shadow-md
            "
            aria-label="Go back"
          >
            <FaArrowLeft className="text-sm" />
          </motion.button>

          <div className="min-w-0">
            <div className="eyebrow mb-2">
              <FaChartLine className="text-[var(--blue)]" />
              Your progress archive
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)] sm:text-4xl">
              Interview History
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              Review your previous interviews, scores, and performance reports
              in one place.
            </p>
          </div>
        </div>

        {/* Summary */}
        {interviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--blue-soft)] text-[var(--blue)]">
                <FaClipboardList className="text-sm" />
              </div>

              <p className="font-display text-2xl font-bold text-[var(--ink)]">
                {interviews.length}
              </p>

              <p className="mt-1 text-xs font-medium text-[var(--muted)]">
                Total interviews
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--success-soft)] text-[var(--success)]">
                <FaCheckCircle className="text-sm" />
              </div>

              <p className="font-display text-2xl font-bold text-[var(--ink)]">
                {
                  interviews.filter((item) => item.status === "completed")
                    .length
                }
              </p>

              <p className="mt-1 text-xs font-medium text-[var(--muted)]">
                Completed
              </p>
            </div>

            <div className="col-span-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm sm:p-5 md:col-span-1">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--warning-soft)] text-[var(--warning)]">
                <FaChartLine className="text-sm" />
              </div>

              <p className="font-display text-2xl font-bold text-[var(--ink)]">
                {interviews.length
                  ? (
                      interviews.reduce(
                        (sum, item) => sum + Number(item.finalScore || 0),
                        0,
                      ) / interviews.length
                    ).toFixed(1)
                  : "0.0"}
              </p>

              <p className="mt-1 text-xs font-medium text-[var(--muted)]">
                Average score
              </p>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {interviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="
              rounded-2xl border border-[var(--line)]
              bg-[var(--surface)]
              px-6 py-14 text-center
              shadow-[0_14px_36px_rgba(15,23,42,0.05)]
              sm:px-10 sm:py-20
            "
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--blue-soft)] text-[var(--blue)]">
              <FaClipboardList className="text-xl" />
            </div>

            <h2 className="mt-5 font-display text-xl font-bold text-[var(--ink)]">
              No interviews yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
              Your completed interviews will appear here with scores and
              detailed performance reports.
            </p>

            <button
              onClick={() => navigate("/interview")}
              className="button-accent focus-ring mt-6 rounded-xl px-5 py-3 text-sm font-bold"
            >
              Start your first interview
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {/* Section heading */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-display text-base font-bold text-[var(--ink)]">
                  Past interviews
                </p>

                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Select an interview to view its full report
                </p>
              </div>

              <span className="hidden rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] sm:block">
                {interviews.length}{" "}
                {interviews.length === 1 ? "interview" : "interviews"}
              </span>
            </div>

            {/* Interview list */}
            {interviews.map((item, index) => {
              const isCompleted = item.status === "completed";
              const score = Number(item.finalScore || 0);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(index * 0.05, 0.3),
                  }}
                  onClick={() => navigate(`/report/${item._id}`)}
                  className="
                    group cursor-pointer
                    rounded-2xl border border-[var(--line)]
                    bg-[var(--surface)]
                    p-4 shadow-sm
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:border-[var(--line-strong)]
                    hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)]
                    sm:p-5
                  "
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Main info */}
                    <div className="flex min-w-0 items-start gap-4">
                      <div
                        className="
                        flex h-11 w-11 shrink-0 items-center
                        justify-center rounded-xl
                        bg-[var(--blue-soft)]
                        text-[var(--blue)]
                      "
                      >
                        <FaClipboardList className="text-sm" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-display text-base font-bold text-[var(--ink)] sm:text-lg">
                          {item.role}
                        </h3>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)] sm:text-sm">
                          <span>{item.experience}</span>

                          <span className="h-1 w-1 rounded-full bg-[var(--line-strong)]" />

                          <span>{item.mode}</span>
                        </div>

                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                          <FaCalendarAlt className="text-[10px]" />

                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Score + status */}
                    <div className="flex items-center justify-between gap-5 border-t border-[var(--line)] pt-3 sm:justify-end sm:border-0 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p
                          className={`
                            font-display text-xl font-bold
                            ${
                              score >= 7
                                ? "text-[var(--success)]"
                                : score >= 5
                                  ? "text-[var(--warning)]"
                                  : "text-[var(--danger)]"
                            }
                          `}
                        >
                          {score}/10
                        </p>

                        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
                          Overall score
                        </p>
                      </div>

                      <span
                        className={`
                          inline-flex items-center gap-1.5
                          rounded-full px-3 py-1.5
                          text-[11px] font-bold
                          ${
                            isCompleted
                              ? "bg-[var(--success-soft)] text-[var(--success)]"
                              : "bg-[var(--warning-soft)] text-[var(--warning)]"
                          }
                        `}
                      >
                        {isCompleted ? (
                          <FaCheckCircle className="text-[10px]" />
                        ) : (
                          <FaClock className="text-[10px]" />
                        )}

                        {item.status}
                      </span>

                      <FaChevronRight
                        className="
                          hidden text-xs text-[var(--muted)]
                          transition-transform duration-200
                          group-hover:translate-x-1
                          group-hover:text-[var(--blue)]
                          sm:block
                        "
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewHistory;
