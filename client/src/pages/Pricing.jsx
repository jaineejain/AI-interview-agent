import React, { useState } from "react";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaCreditCard,
  FaShieldAlt,
  FaBolt,
  FaCrown,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import axios from "axios";
import { ServerUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

function Pricing() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const dispatch = useDispatch();

  const loadRazorpay = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = resolve;
      script.onerror = () =>
        reject(new Error("Razorpay checkout could not be loaded."));
      document.body.appendChild(script);
    });

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "₹0",
      credits: 100,
      description: "Perfect for beginners starting interview preparation.",
      features: [
        "100 AI Interview Credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
      default: true,
    },
    {
      id: "basic",
      name: "Starter Pack",
      price: "₹100",
      credits: 150,
      description: "Great for focused practice and skill improvement.",
      features: [
        "150 AI Interview Credits",
        "Detailed Feedback",
        "Performance Analytics",
        "Full Interview History",
      ],
    },
    {
      id: "pro",
      name: "Pro Pack",
      price: "₹500",
      credits: 650,
      description: "Best value for serious job preparation.",
      features: [
        "650 AI Interview Credits",
        "Advanced AI Feedback",
        "Skill Trend Analysis",
        "Priority AI Processing",
      ],
      badge: "Best Value",
    },
  ];

  const handlePayment = async (plan) => {
    try {
      setLoadingPlan(plan.id);

      const amount = plan.id === "basic" ? 100 : plan.id === "pro" ? 500 : 0;

      const result = await axios.post(
        ServerUrl + "/api/payment/order",
        {
          planId: plan.id,
          amount: amount,
          credits: plan.credits,
        },
        { withCredentials: true },
      );

      await loadRazorpay();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: result.data.amount,
        currency: "INR",
        name: "InterviewIQ.AI",
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: result.data.id,

        handler: async function (response) {
          const verifypay = await axios.post(
            ServerUrl + "/api/payment/verify",
            response,
            { withCredentials: true },
          );

          dispatch(setUserData(verifypay.data.user));

          alert("Payment Successful 🎉 Credits Added!");
          navigate("/");
        },

        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      setLoadingPlan(null);
    } catch (error) {
      console.log(error);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="page-shell min-h-screen px-5 py-8 sm:px-6 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 flex items-start gap-4 sm:mb-14">
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

          <div className="min-w-0 flex-1 text-center">
            <div className="eyebrow mb-3">
              <FaBolt className="text-[var(--blue)]" />
              Simple & flexible
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)] sm:text-4xl lg:text-5xl">
              Choose your plan
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              Get the interview practice you need without unnecessary
              subscriptions or complicated pricing.
            </p>
          </div>

          <div className="hidden h-11 w-11 shrink-0 sm:block" />
        </div>

        {/* Trust strip */}
        <div className="mx-auto mb-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-[var(--muted)] sm:mb-12 sm:text-sm">
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-[var(--success)]" />
            Secure payments
          </div>

          <span className="hidden h-4 w-px bg-[var(--line)] sm:block" />

          <div className="flex items-center gap-2">
            <FaCreditCard className="text-[var(--blue)]" />
            Pay securely with Razorpay
          </div>

          <span className="hidden h-4 w-px bg-[var(--line)] sm:block" />

          <div className="flex items-center gap-2">
            <FaBolt className="text-[var(--warning)]" />
            Credits added instantly
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:items-stretch">
          {plans.map((plan, index) => {
            const isSelected = selectedPlan === plan.id;
            const isPro = plan.id === "pro";

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.08,
                }}
                whileHover={
                  !plan.default
                    ? {
                        y: -5,
                      }
                    : undefined
                }
                onClick={() => !plan.default && setSelectedPlan(plan.id)}
                className={`
                  relative flex h-full flex-col overflow-hidden rounded-2xl
                  border bg-[var(--surface)]
                  transition-all duration-300
                  ${
                    isSelected
                      ? "border-[var(--blue)] shadow-[0_18px_45px_rgba(37,99,235,0.12)]"
                      : "border-[var(--line)] shadow-[0_12px_30px_rgba(15,23,42,0.05)] hover:border-[var(--line-strong)] hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
                  }
                  ${plan.default ? "cursor-default" : "cursor-pointer"}
                `}
              >
                {/* Top accent */}
                {isSelected && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-[var(--blue)]" />
                )}

                {/* Badge */}
                {plan.badge && (
                  <div className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full bg-[var(--blue)] px-3 py-1.5 text-[11px] font-bold text-white shadow-sm">
                    <FaCrown className="text-[10px]" />
                    {plan.badge}
                  </div>
                )}

                {plan.default && (
                  <div className="absolute right-5 top-5 rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-3 py-1.5 text-[11px] font-semibold text-[var(--muted)]">
                    Default
                  </div>
                )}

                {/* Card content */}
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  {/* Plan icon */}
                  <div
                    className={`
                      mb-5 flex h-11 w-11 items-center justify-center rounded-xl
                      ${
                        isPro
                          ? "bg-[var(--blue-soft)] text-[var(--blue)]"
                          : "bg-[var(--surface-2)] text-[var(--muted)]"
                      }
                    `}
                  >
                    {isPro ? (
                      <FaCrown className="text-base" />
                    ) : (
                      <FaCreditCard className="text-base" />
                    )}
                  </div>

                  <h3 className="font-display text-xl font-bold tracking-tight text-[var(--ink)]">
                    {plan.name}
                  </h3>

                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-[var(--muted)]">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mt-6 border-b border-[var(--line)] pb-6">
                    <div className="flex items-end gap-2">
                      <span
                        className={`
                          font-display text-4xl font-bold tracking-tight
                          ${
                            isSelected
                              ? "text-[var(--blue)]"
                              : "text-[var(--ink)]"
                          }
                        `}
                      >
                        {plan.price}
                      </span>

                      {plan.id !== "free" && (
                        <span className="mb-1 text-xs font-medium text-[var(--muted)]">
                          one-time
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex rounded-md bg-[var(--blue-soft)] px-2 py-1 text-xs font-bold text-[var(--blue)]">
                        {plan.credits} Credits
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mt-6 flex-1">
                    <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                      Includes
                    </p>

                    <div className="space-y-3.5">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <FaCheckCircle className="mt-0.5 shrink-0 text-sm text-[var(--success)]" />

                          <span className="text-sm leading-5 text-[var(--ink-soft)]">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  {!plan.default && (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      disabled={loadingPlan === plan.id}
                      onClick={(e) => {
                        e.stopPropagation();

                        if (!isSelected) {
                          setSelectedPlan(plan.id);
                        } else {
                          handlePayment(plan);
                        }
                      }}
                      className={`
                        focus-ring
                        mt-8 flex w-full items-center justify-center gap-2
                        rounded-xl py-3.5
                        text-sm font-bold
                        transition-all duration-200
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        ${
                          isSelected
                            ? "button-accent"
                            : "border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-soft)] hover:border-[var(--blue)] hover:bg-[var(--blue-soft)] hover:text-[var(--blue)]"
                        }
                      `}
                    >
                      {loadingPlan === plan.id ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Processing...
                        </>
                      ) : isSelected ? (
                        <>
                          <FaCreditCard className="text-xs" />
                          Proceed to Pay
                        </>
                      ) : (
                        "Select Plan"
                      )}
                    </motion.button>
                  )}

                  {plan.default && (
                    <div className="mt-8 flex w-full items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-2)] py-3.5 text-sm font-semibold text-[var(--muted)]">
                      Current default plan
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom note */}
        <div className="mx-auto mt-10 max-w-2xl text-center">
          <p className="text-xs leading-5 text-[var(--muted)] sm:text-sm">
            Credits are used when generating and evaluating AI interviews. Paid
            plans are one-time purchases, so you only pay when you need more
            practice.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
