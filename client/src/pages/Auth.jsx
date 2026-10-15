import React, { useEffect, useState } from "react";
import { BsRobot, BsShieldCheck, BsArrowRight } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { motion } from "motion/react";
import { FcGoogle } from "react-icons/fc";

import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

import { auth } from "../utils/firebase";
import axios from "axios";
import { ServerUrl } from "../App";

import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import {
  clearGuestSession,
  getGuestUser,
  startGuestSession,
} from "../utils/guestMode";

function Auth({ isModel = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [authError, setAuthError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const completeBackendLogin = async (user) => {
    try {
      console.log("=================================");
      console.log("FIREBASE LOGIN SUCCESS");
      console.log("Name:", user.displayName);
      console.log("Email:", user.email);
      console.log("UID:", user.uid);
      console.log("=================================");

      const loginResponse = await axios.post(
        `${ServerUrl}/api/auth/google`,
        {
          name: user.displayName,
          email: user.email,
        },
        {
          withCredentials: true,
        },
      );

      console.log("BACKEND LOGIN SUCCESS:", loginResponse.data);

      const currentUser = await axios.get(
        `${ServerUrl}/api/user/current-user`,
        {
          withCredentials: true,
        },
      );

      clearGuestSession();
      console.log("CURRENT USER SUCCESS:", currentUser.data);

      dispatch(setUserData(currentUser.data));

      setAuthError("");
    } catch (error) {
      console.error("=================================");
      console.error("BACKEND LOGIN ERROR");
      console.error("=================================");

      console.error("Error:", error);
      console.error("Status:", error.response?.status);
      console.error("Response:", error.response?.data);
      console.error("Message:", error.message);

      setAuthError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Backend login failed.",
      );

      dispatch(setUserData(null));
    }
  };

  const handleGuestLogin = () => {
    setAuthError("");
    dispatch(setUserData(startGuestSession()));

    if (!isModel) {
      navigate("/");
    }
  };

  useEffect(() => {
    console.log("Firebase Auth initialized:", !!auth);

    if (!isModel && getGuestUser()) {
      navigate("/");
    }
  }, [isModel, navigate]);

  const handleGoogleAuth = async () => {
    if (isSigningIn) return;

    try {
      if (!auth) {
        throw new Error(
          "Firebase configuration is missing. Check your VITE_FIREBASE_* values.",
        );
      }

      setAuthError("");
      setIsSigningIn(true);

      console.log("Starting Google login...");

      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      console.log("Google popup authentication completed.");

      console.log("Firebase user:", result.user);

      await completeBackendLogin(result.user);
    } catch (error) {
      console.error("=================================");
      console.error("GOOGLE LOGIN ERROR");
      console.error("=================================");

      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Full error:", error);

      const messages = {
        "auth/popup-closed-by-user": "Google login was cancelled.",

        "auth/popup-blocked":
          "The browser blocked the Google login popup. Please allow popups for this site.",

        "auth/unauthorized-domain":
          "This domain is not authorized in Firebase. Add localhost to Firebase Authentication → Settings → Authorized domains.",

        "auth/operation-not-allowed":
          "Google sign-in is not enabled in Firebase Authentication.",

        "auth/configuration-not-found":
          "Google sign-in configuration was not found in Firebase.",

        "auth/network-request-failed":
          "Network error. Please check your internet connection.",
      };

      setAuthError(
        messages[error.code] || error.message || "Google login failed.",
      );

      dispatch(setUserData(null));
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div
      className={`
        w-full
        ${
          isModel
            ? "py-4"
            : "page-shell surface-grid flex min-h-screen items-center justify-center px-5 py-12 sm:py-16"
        }
      `}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className={`
          relative w-full overflow-hidden
          border border-[var(--line)]
          bg-[var(--surface)]
          shadow-[0_24px_70px_rgba(15,23,42,0.09)]
          ${
            isModel
              ? "max-w-md rounded-2xl p-6 sm:p-7"
              : "max-w-md rounded-3xl p-7 sm:p-10"
          }
        `}
      >
        {/* Small top accent */}
        <div className="absolute inset-x-0 top-0 h-1 bg-[var(--blue)]" />

        {/* Brand */}
        <div className="mb-8 flex items-center justify-center">
          <div className="flex items-center gap-2.5">
            <div className="brand-mark flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm">
              <BsRobot size={18} />
            </div>

            <div>
              <p className="font-display text-base font-bold tracking-tight text-[var(--ink)]">
                InterviewIQ.AI
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
                Interview workspace
              </p>
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center">
          <div className="eyebrow mb-3 justify-center">
            <IoSparkles className="text-[var(--blue)]" />
            AI-powered preparation
          </div>

          <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-[var(--ink)] sm:text-3xl">
            Practice smarter.
            <br />
            <span className="text-[var(--blue)]">
              Interview with confidence.
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[var(--muted)]">
            Sign in to start AI-powered mock interviews, track your progress,
            and get detailed performance insights.
          </p>
        </div>

        {/* Error */}
        {authError && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            className="mt-6 overflow-hidden rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3"
          >
            <p className="text-center text-sm leading-5 text-[var(--danger)]">
              {authError}
            </p>
          </motion.div>
        )}

        {/* Login Button */}
        <div className="mt-7">
          <motion.button
            onClick={handleGoogleAuth}
            disabled={isSigningIn}
            whileHover={!isSigningIn ? { y: -2 } : undefined}
            whileTap={!isSigningIn ? { scale: 0.985 } : undefined}
            className="
              focus-ring
              group flex w-full items-center justify-center gap-3
              rounded-xl border border-[var(--line)]
              bg-[var(--surface)]
              px-5 py-3.5
              text-sm font-bold text-[var(--ink)]
              shadow-sm
              transition-all duration-200
              hover:border-[var(--line-strong)]
              hover:bg-[var(--surface-2)]
              hover:shadow-md
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {isSigningIn ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--blue)] border-t-transparent" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm">
                  <FcGoogle size={19} />
                </span>

                <span>Continue with Google</span>

                <BsArrowRight className="ml-auto text-[var(--muted)] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[var(--blue)]" />
              </>
            )}
          </motion.button>

          <motion.button
            type="button"
            onClick={handleGuestLogin}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.985 }}
            className="
              focus-ring mt-3 flex w-full items-center justify-center gap-2
              rounded-xl border border-[var(--blue-border)]
              bg-[var(--blue-soft)] px-5 py-3.5
              text-sm font-bold text-[var(--blue)]
              transition-all duration-200 hover:shadow-sm
            "
          >
            Continue as Guest
            <BsArrowRight />
          </motion.button>
        </div>

        {/* Trust */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--muted)]">
          <BsShieldCheck className="text-[var(--success)]" />
          <span>Google sign-in is optional. Guest data stays in this browser.</span>
        </div>

        {/* Divider */}
        <div className="my-7 flex items-center gap-4">
          <div className="h-px flex-1 bg-[var(--line)]" />

          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
            What you get
          </span>

          <div className="h-px flex-1 bg-[var(--line)]" />
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-[var(--surface-2)] px-2 py-3 text-center">
            <p className="font-display text-sm font-bold text-[var(--ink)]">
              AI
            </p>
            <p className="mt-1 text-[10px] leading-4 text-[var(--muted)]">
              Smart interviews
            </p>
          </div>

          <div className="rounded-xl bg-[var(--surface-2)] px-2 py-3 text-center">
            <p className="font-display text-sm font-bold text-[var(--ink)]">
              Voice
            </p>
            <p className="mt-1 text-[10px] leading-4 text-[var(--muted)]">
              Real practice
            </p>
          </div>

          <div className="rounded-xl bg-[var(--surface-2)] px-2 py-3 text-center">
            <p className="font-display text-sm font-bold text-[var(--ink)]">
              Insights
            </p>
            <p className="mt-1 text-[10px] leading-4 text-[var(--muted)]">
              Track progress
            </p>
          </div>
        </div>

        {/* Footer note */}
        {!isModel && (
          <p className="mt-7 text-center text-[11px] leading-5 text-[var(--muted)]">
            Guest mode lets you explore the workspace without an account.
            Backend-powered AI features need the server to be running.
          </p>
        )}
      </motion.div>
    </div>
  );
}

export default Auth;
