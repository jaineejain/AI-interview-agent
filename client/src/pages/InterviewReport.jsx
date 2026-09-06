import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import Step3Report from "../components/Report";
import { FaChartLine } from "react-icons/fa";
import { motion } from "motion/react";

function InterviewReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const result = await axios.get(
          ServerUrl + "/api/interview/report/" + id,
          { withCredentials: true },
        );

        console.log(result.data);
        setReport(result.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchReport();
  }, []);

  if (!report) {
    return (
      <div className="page-shell surface-grid flex min-h-screen items-center justify-center px-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="
            flex w-full max-w-sm flex-col items-center
            rounded-2xl border border-[var(--line)]
            bg-[var(--surface)]
            px-8 py-10
            text-center
            shadow-[0_18px_45px_rgba(15,23,42,0.07)]
          "
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--blue-soft)] text-[var(--blue)]">
            <FaChartLine className="text-lg" />
          </div>

          <h2 className="mt-5 font-display text-lg font-bold text-[var(--ink)]">
            Preparing your report
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Your interview insights are being loaded. This shouldn't take long.
          </p>

          <div className="mt-6 h-5 w-5 animate-spin rounded-full border-2 border-[var(--line-strong)] border-t-[var(--blue)]" />
        </motion.div>
      </div>
    );
  }

  return <Step3Report report={report} />;
}

export default InterviewReport;
