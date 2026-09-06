import React from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

function Timer({ timeLeft, totalTime }) {
  const percentage = (timeLeft / totalTime) * 100;

  const isLowTime = timeLeft <= 10;

  return (
    <div
      className={`
        relative h-24 w-24
        transition-transform duration-300
        ${isLowTime ? "animate-pulse" : ""}
      `}
    >
      <CircularProgressbar
        value={percentage}
        text={`${timeLeft}s`}
        styles={buildStyles({
          textSize: "28px",
          pathColor: isLowTime ? "#ef4444" : "#2563eb",
          textColor: isLowTime ? "#ef4444" : "var(--ink)",
          trailColor: "var(--line)",
          pathTransitionDuration: 0.3,
        })}
      />

      <span
        className={`
          absolute -bottom-5 left-1/2
          -translate-x-1/2
          whitespace-nowrap
          text-[9px] font-bold uppercase tracking-wider
          ${isLowTime ? "text-red-500" : "text-[var(--muted)]"}
        `}
      >
        {isLowTime ? "Hurry up" : "Time left"}
      </span>
    </div>
  );
}

export default Timer;
