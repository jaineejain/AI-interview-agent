import React, { useState } from "react";
import Step1SetUp from "../components/SetUp";
import Step2Interview from "../components/Interview";
import Step3Report from "../components/Report";

function InterviewPage() {
  const [step, setStep] = useState(1);
  const [interviewData, setInterviewData] = useState(null);

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {step === 1 && (
        <Step1SetUp
          onStart={(data) => {
            setInterviewData(data);
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <Step2Interview
          interviewData={interviewData}
          onFinish={(report) => {
            setInterviewData(report);
            setStep(3);
          }}
        />
      )}

      {step === 3 && <Step3Report report={interviewData} />}
    </main>
  );
}

export default InterviewPage;
