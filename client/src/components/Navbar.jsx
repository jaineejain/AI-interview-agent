import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "motion/react";
import { BsRobot, BsCoin, BsSun, BsMoon, BsChevronDown } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { ServerUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import AuthModel from "./AuthModel";
import { clearGuestSession } from "../utils/guestMode";

function Navbar() {
  const { userData } = useSelector((state) => state.user);

  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("theme");

      if (savedTheme === "dark" || savedTheme === "light") {
        return savedTheme;
      }

      return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } catch {
      return "light";
    }
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // =========================================================
  // THEME
  // =========================================================

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("dark", theme === "dark");

    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Ignore localStorage errors
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    try {
      if (!userData?.isGuest && ServerUrl) {
        await axios.get(ServerUrl + "/api/auth/logout", {
          withCredentials: true,
        });
      }

      clearGuestSession();
      dispatch(setUserData(null));

      setShowCreditPopup(false);
      setShowUserPopup(false);

      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  // =========================================================
  // CLOSE OTHER POPUPS
  // =========================================================

  const openCredits = () => {
    if (!userData) {
      setShowAuth(true);
      return;
    }

    setShowCreditPopup((prev) => !prev);
    setShowUserPopup(false);
  };

  const openUserMenu = () => {
    if (!userData) {
      setShowAuth(true);
      return;
    }

    setShowUserPopup((prev) => !prev);
    setShowCreditPopup(false);
  };

  return (
    <>
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <div className="sticky top-0 z-40 flex justify-center border-b border-[var(--line)] bg-[var(--canvas)]/90 px-3 py-3 backdrop-blur-md sm:px-5 sm:py-4">
        <motion.nav
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative flex w-full max-w-7xl items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 shadow-sm sm:px-4"
        >
          {/* =================================================
              BRAND
          ================================================== */}

          <button
            type="button"
            onClick={() => navigate("/")}
            className="focus-ring flex items-center gap-3 rounded-xl text-left"
          >
            <div className="brand-mark flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
              <BsRobot size={18} />
            </div>

            <div className="hidden sm:block">
              <h1 className="text-sm font-bold leading-tight text-[var(--ink)]">
                InterviewIQ.AI
              </h1>

              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Practice with precision
              </p>
            </div>
          </button>

          {/* =================================================
              RIGHT CONTROLS
          ================================================== */}

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* =================================================
                THEME TOGGLE
            ================================================== */}

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? "Switch to light theme"
                  : "Switch to dark theme"
              }
              title={
                theme === "dark"
                  ? "Switch to light theme"
                  : "Switch to dark theme"
              }
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]"
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === "dark" ? (
                  <motion.span
                    key="sun"
                    initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
                  >
                    <BsSun size={16} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="moon"
                    initial={{ opacity: 0, rotate: 30, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: -30, scale: 0.8 }}
                  >
                    <BsMoon size={15} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* =================================================
                CREDITS
            ================================================== */}

            <div className="relative">
              <button
                type="button"
                onClick={openCredits}
                aria-label="View interview credits"
                className="focus-ring flex h-9 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-2.5 text-sm font-bold text-[var(--ink-soft)] transition-colors duration-200 hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)] sm:px-3"
              >
                <BsCoin size={16} className="shrink-0 text-[var(--blue)]" />

                <span>{userData?.credits || 0}</span>

                <BsChevronDown className="hidden text-[9px] text-[var(--muted-light)] sm:block" />
              </button>

              <AnimatePresence>
                {showCreditPopup && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2.5 w-64 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-lg)]"
                  >
                    <div className="mb-4">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--blue-soft)] text-[var(--blue)]">
                          <BsCoin size={14} />
                        </div>

                        <div>
                          <p className="text-xs font-bold text-[var(--ink)]">
                            Interview credits
                          </p>

                          <p className="text-[11px] text-[var(--muted)]">
                            {userData?.credits || 0} available
                          </p>
                        </div>
                      </div>

                      <p className="text-xs leading-5 text-[var(--muted)]">
                        Need more credits to continue your interview practice?
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowCreditPopup(false);
                        navigate("/pricing");
                      }}
                      className="button-primary focus-ring w-full rounded-xl px-4 py-2.5 text-xs font-bold"
                    >
                      Buy more credits
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* =================================================
                DIVIDER
            ================================================== */}

            <div className="mx-1 hidden h-6 w-px bg-[var(--line)] sm:block" />

            {/* =================================================
                USER MENU
            ================================================== */}

            <div className="relative">
              <button
                type="button"
                onClick={openUserMenu}
                aria-label="Open user menu"
                className="focus-ring flex h-9 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-1.5 pr-2 text-[var(--ink)] transition-colors duration-200 hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)] sm:h-10 sm:pl-1.5"
              >
                {/* =================================================
                    USER AVATAR

                    Light:
                    dark navy background + white text

                    Dark:
                    muted dark background + light text
                ================================================== */}

                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--navy)] text-xs font-bold text-white transition-colors duration-200 dark:bg-[var(--surface-muted)] dark:text-[var(--ink)]">
                  {userData ? (
                    userData?.name?.slice(0, 1).toUpperCase()
                  ) : (
                    <FaUserAstronaut size={13} />
                  )}
                </span>

                {userData && (
                  <span className="hidden max-w-24 truncate text-xs font-semibold text-[var(--ink-soft)] md:block">
                    {userData.name}
                  </span>
                )}

                <BsChevronDown className="hidden text-[9px] text-[var(--muted-light)] sm:block" />
              </button>

              {/* =================================================
                  USER DROPDOWN
              ================================================== */}

              <AnimatePresence>
                {showUserPopup && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2.5 w-60 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-2 shadow-[var(--shadow-lg)]"
                  >
                    {/* =================================================
                        USER INFO
                    ================================================== */}

                    <div className="mb-1 rounded-xl bg-[var(--surface-soft)] px-3 py-3">
                      <p className="truncate text-sm font-bold text-[var(--ink)]">
                        {userData?.name}
                      </p>

                      <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                        {userData?.isGuest
                          ? "Local guest session"
                          : "Interview candidate"}
                      </p>
                    </div>

                    {/* =================================================
                        HISTORY
                    ================================================== */}

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserPopup(false);
                        navigate("/history");
                      }}
                      className="focus-ring flex w-full items-center rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-[var(--ink-soft)] transition-colors duration-200 hover:bg-[var(--surface-soft)] hover:text-[var(--blue)]"
                    >
                      Interview History
                    </button>

                    {/* =================================================
                        LOGOUT
                    ================================================== */}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="focus-ring flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-[var(--danger)] transition-colors duration-200 hover:bg-[var(--danger-soft)]"
                    >
                      <HiOutlineLogout size={15} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.nav>
      </div>

      {/* =====================================================
          AUTH MODAL
      ====================================================== */}

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </>
  );
}

export default Navbar;
