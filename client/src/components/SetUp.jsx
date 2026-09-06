import React, { useState } from "react";
import { motion } from "motion/react";
import {
  FaUserTie,
  FaBriefcase,
  FaFileUpload,
  FaMicrophoneAlt,
  FaChartLine,
  FaCheckCircle,
  FaFileAlt,
  FaArrowRight,
  FaCode,
  FaUsers,
  FaSpinner,
} from "react-icons/fa";
import axios from "axios";
import { ServerUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";

function Step1SetUp({ onStart }) {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return;

    setAnalyzing(true);

    const formdata = new FormData();
    formdata.append("resume", resumeFile);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/resume",
        formdata,
        { withCredentials: true },
      );

      console.log(result.data);

      setRole(result.data.role || "");
      setExperience(result.data.experience || "");
      setProjects(result.data.projects || []);
      setSkills(result.data.skills || []);
      setResumeText(result.data.resumeText || "");
      setAnalysisDone(true);

      setAnalyzing(false);
    } catch (error) {
      console.log(error);
      setAnalyzing(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/generate-questions",
        {
          role,
          experience,
          mode,
          resumeText,
          projects,
          skills,
        },
        { withCredentials: true },
      );

      console.log(result.data);

      if (userData) {
        dispatch(
          setUserData({
            ...userData,
            credits: result.data.creditsLeft,
          }),
        );
      }

      setLoading(false);
      onStart(result.data);
    } catch (error) {
      console.log("START INTERVIEW ERROR:", error.response?.data);
      console.log("STATUS:", error.response?.status);
      setLoading(false);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="page-shell surface-grid min-h-screen px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <motion.header
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="brand-mark flex h-10 w-10 items-center justify-center rounded-xl text-white">
              <FaMicrophoneAlt className="text-sm" />
            </div>

            <div>
              <p className="font-display text-sm font-bold text-[var(--ink)]">
                AI Interview
              </p>

              <p className="text-xs text-[var(--muted)]">
                Interview practice workspace
              </p>
            </div>
          </div>

          <div className="max-w-2xl">
            <div className="eyebrow mb-2">Interview preparation</div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)] sm:text-4xl">
              Prepare for your next interview.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              Set up your interview, optionally upload your resume, and practice
              with an AI interviewer tailored to your profile.
            </p>
          </div>
        </motion.header>

        {/* =====================================================
            PROGRESS
        ====================================================== */}

        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:gap-3 sm:text-sm">
          <div className="flex shrink-0 items-center gap-2 font-semibold text-[var(--blue)]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--blue)] text-xs font-bold text-white shadow-sm">
              1
            </span>
            Setup
          </div>

          <div className="h-px w-8 shrink-0 bg-[var(--line-strong)] sm:w-14" />

          <div className="flex shrink-0 items-center gap-2 text-[var(--muted)]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line-strong)] text-xs font-semibold">
              2
            </span>
            Interview
          </div>

          <div className="h-px w-8 shrink-0 bg-[var(--line-strong)] sm:w-14" />

          <div className="flex shrink-0 items-center gap-2 text-[var(--muted)]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line-strong)] text-xs font-semibold">
              3
            </span>
            Report
          </div>
        </div>

        {/* =====================================================
            MAIN CARD
        ====================================================== */}

        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="
            soft-shadow
            overflow-hidden rounded-2xl
            border border-[var(--line)]
            bg-[var(--surface)]
          "
        >
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            {/* =================================================
                LEFT: INTERVIEW CONFIGURATION
            ================================================= */}

            <div className="border-b border-[var(--line)] p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="mb-7">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--blue-soft)] text-[var(--blue)]">
                    <FaUserTie className="text-sm" />
                  </div>

                  <h2 className="font-display text-lg font-bold text-[var(--ink)]">
                    Interview details
                  </h2>
                </div>

                <p className="text-sm leading-6 text-[var(--muted)]">
                  Tell us what you are preparing for. We will use this
                  information to generate relevant questions.
                </p>
              </div>

              <div className="space-y-5">
                {/* Role */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--ink-soft)]">
                    Job role
                  </label>

                  <div className="relative">
                    <FaUserTie className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]" />

                    <input
                      type="text"
                      placeholder="e.g. Software Engineer"
                      className="
                        focus-ring
                        w-full rounded-xl
                        border border-[var(--line-strong)]
                        bg-[var(--surface)]
                        py-3.5 pl-11 pr-4
                        text-sm text-[var(--ink)]
                        outline-none
                        transition-all duration-200
                        placeholder:text-[var(--muted)]
                        focus:border-[var(--blue)]
                        focus:bg-[var(--surface)]
                      "
                      onChange={(e) => setRole(e.target.value)}
                      value={role}
                    />
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--ink-soft)]">
                    Experience
                  </label>

                  <div className="relative">
                    <FaBriefcase className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]" />

                    <input
                      type="text"
                      placeholder="e.g. 2 years"
                      className="
                        focus-ring
                        w-full rounded-xl
                        border border-[var(--line-strong)]
                        bg-[var(--surface)]
                        py-3.5 pl-11 pr-4
                        text-sm text-[var(--ink)]
                        outline-none
                        transition-all duration-200
                        placeholder:text-[var(--muted)]
                        focus:border-[var(--blue)]
                      "
                      onChange={(e) => setExperience(e.target.value)}
                      value={experience}
                    />
                  </div>
                </div>

                {/* Interview Type */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--ink-soft)]">
                    Interview type
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Technical */}
                    <button
                      type="button"
                      onClick={() => setMode("Technical")}
                      className={`
                        focus-ring
                        flex items-center gap-3 rounded-xl
                        border p-3.5 text-left
                        transition-all duration-200
                        ${
                          mode === "Technical"
                            ? "border-[var(--blue)] bg-[var(--blue-soft)] shadow-sm"
                            : "border-[var(--line-strong)] bg-[var(--surface)] hover:border-[var(--blue)] hover:bg-[var(--surface-2)]"
                        }
                      `}
                    >
                      <div
                        className={`
                          flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
                          ${
                            mode === "Technical"
                              ? "bg-[var(--blue)] text-white"
                              : "bg-[var(--surface-2)] text-[var(--muted)]"
                          }
                        `}
                      >
                        <FaCode className="text-sm" />
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`
                            text-sm font-bold
                            ${
                              mode === "Technical"
                                ? "text-[var(--blue)]"
                                : "text-[var(--ink-soft)]"
                            }
                          `}
                        >
                          Technical
                        </p>

                        <p className="mt-0.5 text-[11px] leading-4 text-[var(--muted)]">
                          Skills & problem solving
                        </p>
                      </div>
                    </button>

                    {/* HR */}
                    <button
                      type="button"
                      onClick={() => setMode("HR")}
                      className={`
                        focus-ring
                        flex items-center gap-3 rounded-xl
                        border p-3.5 text-left
                        transition-all duration-200
                        ${
                          mode === "HR"
                            ? "border-[var(--blue)] bg-[var(--blue-soft)] shadow-sm"
                            : "border-[var(--line-strong)] bg-[var(--surface)] hover:border-[var(--blue)] hover:bg-[var(--surface-2)]"
                        }
                      `}
                    >
                      <div
                        className={`
                          flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
                          ${
                            mode === "HR"
                              ? "bg-[var(--blue)] text-white"
                              : "bg-[var(--surface-2)] text-[var(--muted)]"
                          }
                        `}
                      >
                        <FaUsers className="text-sm" />
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`
                            text-sm font-bold
                            ${
                              mode === "HR"
                                ? "text-[var(--blue)]"
                                : "text-[var(--ink-soft)]"
                            }
                          `}
                        >
                          HR
                        </p>

                        <p className="mt-0.5 text-[11px] leading-4 text-[var(--muted)]">
                          Behavioral questions
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Hidden native select */}
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="sr-only"
                    aria-hidden="true"
                    tabIndex="-1"
                  >
                    <option value="Technical">Technical Interview</option>

                    <option value="HR">HR Interview</option>
                  </select>
                </div>
              </div>
            </div>

            {/* =================================================
                RIGHT: RESUME
            ================================================= */}

            <div className="bg-[var(--surface-2)] p-6 sm:p-8">
              <div className="mb-7">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--muted)]">
                    <FaFileAlt className="text-sm" />
                  </div>

                  <h2 className="font-display text-lg font-bold text-[var(--ink)]">
                    Resume
                  </h2>

                  <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 text-[10px] font-bold text-[var(--muted)]">
                    Optional
                  </span>
                </div>

                <p className="text-sm leading-6 text-[var(--muted)]">
                  Upload your resume to make the interview more personalized.
                </p>
              </div>

              {!analysisDone && (
                <div
                  onClick={() =>
                    document.getElementById("resumeUpload").click()
                  }
                  className="
                    group cursor-pointer rounded-2xl
                    border border-dashed border-[var(--line-strong)]
                    bg-[var(--surface)]
                    p-7 text-center
                    transition-all duration-200
                    hover:border-[var(--blue)]
                    hover:bg-[var(--blue-soft)]
                  "
                >
                  <div
                    className="
                    mx-auto mb-4 flex h-14 w-14
                    items-center justify-center
                    rounded-xl bg-[var(--blue-soft)]
                    text-[var(--blue)]
                    transition-transform duration-200
                    group-hover:scale-105
                  "
                  >
                    <FaFileUpload className="text-xl" />
                  </div>

                  <p className="break-all text-sm font-semibold text-[var(--ink-soft)]">
                    {resumeFile ? resumeFile.name : "Upload your resume"}
                  </p>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    PDF files only
                  </p>

                  <input
                    type="file"
                    accept="application/pdf"
                    id="resumeUpload"
                    className="hidden"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                  />

                  {resumeFile && (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUploadResume();
                      }}
                      disabled={analyzing}
                      className="
                        button-primary
                        focus-ring
                        mt-5 inline-flex items-center
                        justify-center gap-2
                        rounded-lg px-5 py-2.5
                        text-sm font-semibold
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      {analyzing ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Analyze Resume
                          <FaArrowRight className="text-xs" />
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              )}

              {/* Resume analyzed */}
              {analysisDone && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="
                    rounded-2xl
                    border border-[var(--success-border)]
                    bg-[var(--success-soft)]
                    p-5
                  "
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="
                        flex h-10 w-10 shrink-0
                        items-center justify-center
                        rounded-xl
                        bg-[var(--surface)]
                        text-[var(--success)]
                      "
                      >
                        <FaCheckCircle />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-[var(--ink)]">
                          Resume analyzed
                        </h3>

                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          Your profile has been extracted successfully.
                        </p>
                      </div>
                    </div>

                    <span
                      className="
                      shrink-0 rounded-full
                      bg-[var(--surface)]
                      px-2.5 py-1
                      text-[10px] font-bold
                      text-[var(--success)]
                    "
                    >
                      Ready
                    </span>
                  </div>

                  {projects.length > 0 && (
                    <div className="mb-5">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                        Projects
                      </p>

                      <ul className="space-y-2">
                        {projects.map((p, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm leading-5 text-[var(--ink-soft)]"
                          >
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--success)]" />

                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {skills.length > 0 && (
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                        Skills
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {skills.map((s, i) => (
                          <span
                            key={i}
                            className="
                              rounded-lg
                              border border-[var(--line)]
                              bg-[var(--surface)]
                              px-2.5 py-1.5
                              text-xs font-medium
                              text-[var(--blue)]
                            "
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Why upload */}
              {!analysisDone && (
                <div
                  className="
                  mt-5 rounded-xl
                  border border-[var(--line)]
                  bg-[var(--surface)]
                  p-4
                "
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5 text-[var(--blue)]">
                      <FaChartLine />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[var(--ink-soft)]">
                        Why upload a resume?
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                        Your projects and skills can be used to create more
                        relevant interview questions.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ===================================================
              BOTTOM ACTION
          ==================================================== */}

          <div className="border-t border-[var(--line)] bg-[var(--surface)] px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--ink-soft)]">
                  Ready to practice?
                </p>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  Your AI interviewer will guide you through the session.
                </p>
              </div>

              <motion.button
                onClick={handleStart}
                disabled={!role || !experience || loading}
                whileHover={!loading ? { y: -1 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="
                  button-accent
                  focus-ring
                  inline-flex w-full items-center
                  justify-center gap-2
                  rounded-xl px-7 py-3.5
                  text-sm font-bold
                  shadow-sm
                  disabled:cursor-not-allowed
                  disabled:bg-[var(--line-strong)]
                  disabled:text-[var(--muted)]
                  disabled:shadow-none
                  sm:w-auto
                "
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    Start Interview
                    <FaArrowRight className="text-xs" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* =====================================================
            FEATURE ROW
        ====================================================== */}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: <FaUserTie />,
              title: "Role-specific",
              text: "Questions tailored to your role",
            },
            {
              icon: <FaMicrophoneAlt />,
              title: "Voice enabled",
              text: "Practice speaking naturally",
            },
            {
              icon: <FaChartLine />,
              title: "Actionable feedback",
              text: "Review your performance after",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.25 + index * 0.08,
              }}
              className="
                flex items-center gap-3 rounded-xl
                border border-[var(--line)]
                bg-[var(--surface)]
                px-4 py-3.5
                shadow-sm
              "
            >
              <div
                className="
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-lg
                bg-[var(--surface-2)]
                text-sm text-[var(--blue)]
              "
              >
                {item.icon}
              </div>

              <div>
                <p className="text-xs font-bold text-[var(--ink-soft)]">
                  {item.title}
                </p>

                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  {item.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.main>
  );
}

export default Step1SetUp;
