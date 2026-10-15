import React, { useEffect, useMemo, useState } from "react";
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
  FaFire,
  FaBullseye,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaMedal,
} from "react-icons/fa";
import { motion } from "motion/react";
import { useSelector } from "react-redux";

function InterviewHistory() {
  const [interviews, setInterviews] = useState([]);
  const [historyMessage, setHistoryMessage] = useState("");
  const { userData } = useSelector((state) => state.user);

  const [goal, setGoal] = useState(() => {
    const savedGoal = Number(localStorage.getItem("interviewWeeklyGoal"));

    return savedGoal >= 1 && savedGoal <= 30 ? savedGoal : 5;
  });

  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(goal));

  const navigate = useNavigate();

  useEffect(() => {
    if (userData?.isGuest) {
      setHistoryMessage(
        "Guest mode does not sync interview history because there is no backend account. Sign in with Google after the server is configured to save history.",
      );
      return;
    }

    const getMyInterviews = async () => {
      try {
        const result = await axios.get(
          ServerUrl + "/api/interview/get-interview",
          { withCredentials: true },
        );

        setInterviews(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        console.log("GET INTERVIEW HISTORY ERROR:", error);
        setHistoryMessage(
          "Interview history is unavailable because the backend could not be reached.",
        );
      }
    };

    getMyInterviews();
  }, [userData]);

  /*
    Only completed interviews should count toward
    progress, streaks, averages, and goals.

    We also explicitly sort them newest-first so that
    scoreTrend always compares the latest interview
    against the immediately previous completed interview.
  */

  const completedInterviews = useMemo(() => {
    return interviews
      .filter((item) => item.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [interviews]);

  /*
    Date helper.
    We normalize dates to local calendar days so that
    streak calculation is not affected by time components.
  */

  const getDateKey = (dateValue) => {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const getStartOfWeek = (date = new Date()) => {
    const result = new Date(date);

    result.setHours(0, 0, 0, 0);

    const day = result.getDay();

    /*
      Monday = start of week.
      Sunday becomes the previous Monday.
    */

    const diff = day === 0 ? -6 : 1 - day;

    result.setDate(result.getDate() + diff);

    return result;
  };

  /*
    Current week progress
  */

  const weeklyProgress = useMemo(() => {
    const startOfWeek = getStartOfWeek();

    const count = completedInterviews.filter((item) => {
      const date = new Date(item.createdAt);

      return date >= startOfWeek;
    }).length;

    return count;
  }, [completedInterviews]);

  const goalProgress = Math.min(100, Math.round((weeklyProgress / goal) * 100));

  /*
    Interview streak.

    We count consecutive days on which at least one
    completed interview was recorded.
  */

  const currentStreak = useMemo(() => {
    if (completedInterviews.length === 0) {
      return 0;
    }

    const uniqueDates = [
      ...new Set(
        completedInterviews
          .map((item) => getDateKey(item.createdAt))
          .filter(Boolean),
      ),
    ].sort((a, b) => {
      return new Date(b) - new Date(a);
    });

    if (uniqueDates.length === 0) {
      return 0;
    }

    const today = getDateKey(new Date());

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    const yesterday = getDateKey(yesterdayDate);

    /*
      A streak is active if the latest interview
      happened today or yesterday.
    */

    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      return 0;
    }

    let streak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const previous = new Date(uniqueDates[i - 1]);

      const current = new Date(uniqueDates[i]);

      const difference = (previous - current) / (1000 * 60 * 60 * 24);

      if (Math.round(difference) === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [completedInterviews]);

  /*
    Best score
  */

  const bestScore = useMemo(() => {
    if (completedInterviews.length === 0) {
      return 0;
    }

    return Math.max(
      ...completedInterviews.map((item) => Number(item.finalScore || 0)),
    );
  }, [completedInterviews]);

  /*
    Average score
  */

  const averageScore = useMemo(() => {
    if (completedInterviews.length === 0) {
      return 0;
    }

    return (
      completedInterviews.reduce(
        (sum, item) => sum + Number(item.finalScore || 0),
        0,
      ) / completedInterviews.length
    );
  }, [completedInterviews]);

  /*
    Average readiness
  */

  const averageReadiness = useMemo(() => {
    if (completedInterviews.length === 0) {
      return 0;
    }

    return (
      completedInterviews.reduce(
        (sum, item) => sum + Number(item.readinessScore || 0),
        0,
      ) / completedInterviews.length
    );
  }, [completedInterviews]);

  /*
    Score improvement.

    completedInterviews is explicitly sorted newest-first,
    so the previous score is the second item.
  */

  const scoreTrend = useMemo(() => {
    if (completedInterviews.length < 2) {
      return {
        value: 0,
        type: "neutral",
      };
    }

    const latest = Number(completedInterviews[0].finalScore || 0);

    const previous = Number(completedInterviews[1].finalScore || 0);

    const difference = Number((latest - previous).toFixed(1));

    if (difference > 0) {
      return {
        value: difference,
        type: "up",
      };
    }

    if (difference < 0) {
      return {
        value: Math.abs(difference),
        type: "down",
      };
    }

    return {
      value: 0,
      type: "neutral",
    };
  }, [completedInterviews]);

  /*
    Interview type statistics
  */

  const typeStats = useMemo(() => {
    const stats = {};

    completedInterviews.forEach((item) => {
      const type = item.interviewType || item.mode || "Technical";

      if (!stats[type]) {
        stats[type] = {
          count: 0,
          totalScore: 0,
        };
      }

      stats[type].count += 1;
      stats[type].totalScore += Number(item.finalScore || 0);
    });

    return Object.entries(stats)
      .map(([name, data]) => ({
        name,
        count: data.count,
        average:
          data.count > 0
            ? Number((data.totalScore / data.count).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [completedInterviews]);

  /*
    Save weekly goal.
  */

  const handleSaveGoal = () => {
    const value = Number(goalInput);

    if (Number.isNaN(value) || value < 1 || value > 30) {
      setGoalInput(String(goal));
      setEditingGoal(false);
      return;
    }

    const roundedValue = Math.round(value);

    setGoal(roundedValue);
    setGoalInput(String(roundedValue));

    localStorage.setItem("interviewWeeklyGoal", String(roundedValue));

    setEditingGoal(false);
  };

  /*
    Trend icon
  */

  const TrendIcon = () => {
    if (scoreTrend.type === "up") {
      return <FaArrowUp />;
    }

    if (scoreTrend.type === "down") {
      return <FaArrowDown />;
    }

    return <FaMinus />;
  };

  return (
    <div className="page-shell surface-grid min-h-screen px-5 py-8 sm:px-6 sm:py-12 lg:py-16">
      <div className="mx-auto w-full max-w-6xl">
        {/* =====================================================
            HEADER
        ====================================================== */}

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
              Track your interview performance, consistency, readiness, and
              improvement over time.
            </p>
          </div>
        </div>

        {historyMessage && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-[var(--blue-border)] bg-[var(--blue-soft)] px-4 py-3 text-sm leading-6 text-[var(--blue)]"
          >
            {historyMessage}
          </div>
        )}

        {/* =====================================================
            PROGRESS + STREAK + GOAL
        ====================================================== */}

        {completedInterviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]"
          >
            {/* Weekly Goal */}

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--blue-soft)] text-[var(--blue)]">
                    <FaBullseye className="text-sm" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[var(--ink)]">
                      Weekly interview goal
                    </p>

                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      Build consistency through regular practice.
                    </p>
                  </div>
                </div>

                {!editingGoal ? (
                  <button
                    type="button"
                    onClick={() => {
                      setGoalInput(String(goal));
                      setEditingGoal(true);
                    }}
                    className="
                      focus-ring rounded-lg
                      border border-[var(--line)]
                      bg-[var(--surface-2)]
                      px-3 py-1.5
                      text-[10px] font-bold
                      text-[var(--muted)]
                      transition-colors
                      hover:text-[var(--blue)]
                    "
                  >
                    Edit goal
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveGoal();
                        }
                      }}
                      className="
                        focus-ring
                        h-8 w-16 rounded-lg
                        border border-[var(--line-strong)]
                        bg-[var(--surface)]
                        px-2 text-center text-xs
                        text-[var(--ink)]
                        outline-none
                      "
                    />

                    <button
                      type="button"
                      onClick={handleSaveGoal}
                      className="
                        rounded-lg
                        bg-[var(--blue)]
                        px-3 py-1.5
                        text-[10px] font-bold
                        text-white
                      "
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--muted)]">
                    {weeklyProgress} of {goal} interviews
                  </span>

                  <span className="text-xs font-bold text-[var(--blue)]">
                    {goalProgress}%
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${goalProgress}%`,
                    }}
                    transition={{
                      duration: 0.7,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full bg-[var(--blue)]"
                  />
                </div>

                <p className="mt-3 text-xs text-[var(--muted)]">
                  {weeklyProgress >= goal
                    ? "Weekly goal completed. Keep the momentum going."
                    : `${goal - weeklyProgress} more interview${
                        goal - weeklyProgress === 1 ? "" : "s"
                      } to reach your weekly goal.`}
                </p>
              </div>
            </div>

            {/* Streak */}

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--warning-soft)] text-[var(--warning)]">
                    <FaFire className="text-sm" />
                  </div>

                  <p className="font-display text-3xl font-bold text-[var(--ink)]">
                    {currentStreak}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                    Day interview streak
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    Best score
                  </p>

                  <p className="mt-1 font-display text-2xl font-bold text-[var(--success)]">
                    {bestScore.toFixed(1)}
                    <span className="text-sm text-[var(--muted)]">/10</span>
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-[var(--line)] pt-4">
                <p className="text-xs leading-5 text-[var(--muted)]">
                  {currentStreak > 0
                    ? "Keep practicing on consecutive days to extend your streak."
                    : "Start a new interview today to begin your streak."}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* =====================================================
            SUMMARY CARDS
        ====================================================== */}

        {interviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
          >
            {/* Total */}

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

            {/* Completed */}

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--success-soft)] text-[var(--success)]">
                <FaCheckCircle className="text-sm" />
              </div>

              <p className="font-display text-2xl font-bold text-[var(--ink)]">
                {completedInterviews.length}
              </p>

              <p className="mt-1 text-xs font-medium text-[var(--muted)]">
                Completed
              </p>
            </div>

            {/* Average */}

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--warning-soft)] text-[var(--warning)]">
                <FaChartLine className="text-sm" />
              </div>

              <p className="font-display text-2xl font-bold text-[var(--ink)]">
                {averageScore.toFixed(1)}
              </p>

              <p className="mt-1 text-xs font-medium text-[var(--muted)]">
                Average score
              </p>
            </div>

            {/* Readiness */}

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--blue-soft)] text-[var(--blue)]">
                <FaMedal className="text-sm" />
              </div>

              <p className="font-display text-2xl font-bold text-[var(--ink)]">
                {averageReadiness.toFixed(0)}%
              </p>

              <p className="mt-1 text-xs font-medium text-[var(--muted)]">
                Avg readiness
              </p>
            </div>

            {/* Improvement */}

            <div className="col-span-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm sm:col-span-1 sm:p-5">
              <div
                className={`
                  mb-3 flex h-9 w-9 items-center justify-center rounded-lg
                  ${
                    scoreTrend.type === "up"
                      ? "bg-[var(--success-soft)] text-[var(--success)]"
                      : scoreTrend.type === "down"
                        ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                        : "bg-[var(--surface-2)] text-[var(--muted)]"
                  }
                `}
              >
                <TrendIcon />
              </div>

              <p
                className={`
                  font-display text-2xl font-bold
                  ${
                    scoreTrend.type === "up"
                      ? "text-[var(--success)]"
                      : scoreTrend.type === "down"
                        ? "text-[var(--danger)]"
                        : "text-[var(--ink)]"
                  }
                `}
              >
                {scoreTrend.type === "up"
                  ? "+"
                  : scoreTrend.type === "down"
                    ? "-"
                    : ""}
                {scoreTrend.value.toFixed(1)}
              </p>

              <p className="mt-1 text-xs font-medium text-[var(--muted)]">
                Since last interview
              </p>
            </div>
          </motion.div>
        )}

        {/* =====================================================
            INTERVIEW TYPE PERFORMANCE
        ====================================================== */}

        {typeStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm sm:p-6"
          >
            <div className="mb-5">
              <p className="font-display text-base font-bold text-[var(--ink)]">
                Performance by interview type
              </p>

              <p className="mt-0.5 text-xs text-[var(--muted)]">
                See where you have practiced most and how you are performing.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {typeStats.map((item, index) => {
                const percentage = Math.min(
                  100,
                  Math.round((item.average / 10) * 100),
                );

                return (
                  <motion.div
                    key={item.name}
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
                      <div>
                        <p className="text-sm font-bold text-[var(--ink-soft)]">
                          {item.name}
                        </p>

                        <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                          {item.count}{" "}
                          {item.count === 1 ? "interview" : "interviews"}
                        </p>
                      </div>

                      <span className="font-display text-lg font-bold text-[var(--blue)]">
                        {item.average}/10
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface)]">
                      <div
                        style={{
                          width: `${percentage}%`,
                        }}
                        className="h-full rounded-full bg-[var(--blue)]"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* =====================================================
            EMPTY STATE
        ====================================================== */}

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
              Your completed interviews will appear here with scores, readiness,
              progress, and detailed performance reports.
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
            {/* =================================================
                SECTION HEADING
            ================================================== */}

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

            {/* =================================================
                INTERVIEW LIST
            ================================================== */}

            {interviews.map((item, index) => {
              const isCompleted = item.status === "completed";

              const score = Number(item.finalScore || 0);

              const readiness = Number(item.readinessScore || 0);

              const interviewType =
                item.interviewType || item.mode || "Technical";

              return (
                <motion.div
                  key={item._id || index}
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
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

                          <span>{interviewType}</span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[var(--muted)]">
                          <span className="flex items-center gap-1.5">
                            <FaCalendarAlt className="text-[10px]" />

                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>

                          {isCompleted && readiness > 0 && (
                            <>
                              <span className="h-1 w-1 rounded-full bg-[var(--line-strong)]" />

                              <span>Readiness {readiness.toFixed(0)}%</span>
                            </>
                          )}
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
