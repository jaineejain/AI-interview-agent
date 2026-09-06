import React, { useEffect, useRef, useState } from "react";
import maleVideo from "../assets/videos/male-ai.mp4";
import femaleVideo from "../assets/videos/female-ai.mp4";
import Timer from "./Timer";
import { motion } from "motion/react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeUp,
  FaClock,
  FaCheckCircle,
  FaCircle,
  FaArrowRight,
  FaSpinner,
  FaKeyboard,
  FaChartLine,
} from "react-icons/fa";
import axios from "axios";
import { ServerUrl } from "../App";

function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName } = interviewData;

  const [isIntroPhase, setIsIntroPhase] = useState(true);

  // =========================================================
  // MICROPHONE / SPEECH STATES
  // =========================================================

  const [isMicOn, setIsMicOn] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState("");

  const [recordingTime, setRecordingTime] = useState(0);

  const recognitionRef = useRef(null);
  const isMicOnRef = useRef(false);
  const isAIPlayingRef = useRef(false);

  // =========================================================
  // AI SPEAKING STATES
  // =========================================================

  const [isAIPlaying, setIsAIPlaying] = useState(false);

  // =========================================================
  // INTERVIEW STATES
  // =========================================================

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);

  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");

  const [interimTranscript, setInterimTranscript] = useState("");

  const videoRef = useRef(null);

  const currentQuestion = questions[currentIndex];

  // =========================================================
  // LOAD AI VOICES
  // =========================================================

  useEffect(() => {
    if (!window.speechSynthesis) {
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      if (!voices.length) {
        return;
      }

      const femaleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female"),
      );

      const maleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male"),
      );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
      } else if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
      } else {
        setSelectedVoice(voices[0]);
        setVoiceGender("female");
      }
    };

    loadVoices();

    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  // =========================================================
  // RECORDING TIMER
  // =========================================================

  useEffect(() => {
    if (!isListening) return;

    const timer = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isListening]);

  const formatRecordingTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  // =========================================================
  // START MICROPHONE
  // =========================================================

  const startMic = () => {
    if (!recognitionRef.current) {
      setSpeechError(
        "Voice input is unavailable. You can still type your answer.",
      );
      return;
    }

    if (isAIPlayingRef.current) {
      setSpeechError("Please wait until the interviewer finishes speaking.");
      return;
    }

    setSpeechError("");
    setRecordingTime(0);

    isMicOnRef.current = true;

    try {
      recognitionRef.current.start();
    } catch (error) {
      if (error.name !== "InvalidStateError") {
        console.error("Speech recognition start error:", error);

        setSpeechError(
          "Voice input could not start. You can still type your answer.",
        );
      }
    }
  };

  // =========================================================
  // STOP MICROPHONE
  // =========================================================

  const stopMic = () => {
    isMicOnRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log("Speech recognition stop:", error);
      }
    }

    setIsListening(false);
    setInterimTranscript("");
  };

  // =========================================================
  // AI SPEAK FUNCTION
  // =========================================================

  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const humanText = text.replace(/,/g, ", ... ").replace(/\./g, ". ... ");

      const utterance = new SpeechSynthesisUtterance(humanText);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        isAIPlayingRef.current = true;

        stopMic();

        videoRef.current?.play().catch(() => {});
      };

      utterance.onend = () => {
        videoRef.current?.pause();

        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }

        setIsAIPlaying(false);
        isAIPlayingRef.current = false;

        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);

        setIsAIPlaying(false);
        isAIPlayingRef.current = false;

        setSubtitle("");

        resolve();
      };

      setSubtitle(text);

      window.speechSynthesis.speak(utterance);
    });
  };

  // =========================================================
  // INTRO + QUESTION
  // =========================================================

  useEffect(() => {
    if (!window.speechSynthesis) {
      return;
    }

    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`,
        );

        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin.",
        );

        setIsIntroPhase(false);
      } else if (currentQuestion) {
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }

        await speakText(currentQuestion.question);
      }
    };

    runIntro();
  }, [isIntroPhase, currentIndex]);

  // =========================================================
  // INTERVIEW TIMER
  // =========================================================

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex]);

  // =========================================================
  // RESET QUESTION TIMER
  // =========================================================

  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  }, [currentIndex, isIntroPhase]);

  // =========================================================
  // SPEECH RECOGNITION SETUP
  // =========================================================

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      setIsMicOn(false);
      isMicOnRef.current = false;

      return undefined;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError("");
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index++
      ) {
        const transcript = event.results[index][0].transcript;

        if (event.results[index].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      if (finalText.trim()) {
        setAnswer((prev) => {
          const previousText = prev.trim();
          const newText = finalText.trim();

          if (!previousText) {
            return newText;
          }

          return `${previousText} ${newText}`;
        });
      }

      setInterimTranscript(interimText.trim());
    };

    recognition.onerror = (event) => {
      console.log("Speech recognition error:", event.error);

      setIsListening(false);

      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        isMicOnRef.current = false;
        setIsMicOn(false);

        setSpeechError(
          "Microphone permission was denied. Please allow microphone access or type your answer.",
        );
      } else if (event.error === "no-speech") {
        setSpeechError(
          "No speech detected. Click the microphone and try again.",
        );
      } else if (event.error === "audio-capture") {
        setSpeechError(
          "Microphone could not be accessed. You can still type your answer.",
        );
      } else if (event.error !== "aborted") {
        setSpeechError(
          "Voice input stopped. You can click the microphone to try again.",
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);

      if (!isMicOnRef.current) {
        setIsMicOn(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onend = null;

      try {
        recognition.stop();
      } catch {
        // Ignore cleanup error
      }

      recognitionRef.current = null;
    };
  }, []);

  // =========================================================
  // TOGGLE MICROPHONE
  // =========================================================

  const toggleMic = () => {
    if (!isSpeechSupported) {
      return;
    }

    if (isSubmitting || feedback) {
      return;
    }

    if (isAIPlaying) {
      setSpeechError("Please wait until the interviewer finishes speaking.");
      return;
    }

    if (isListening) {
      isMicOnRef.current = false;

      stopMic();

      setIsMicOn(false);

      return;
    }

    isMicOnRef.current = true;

    setIsMicOn(true);

    startMic();
  };

  // =========================================================
  // SUBMIT ANSWER
  // =========================================================

  const submitAnswer = async () => {
    if (isSubmitting) return;

    isMicOnRef.current = false;

    stopMic();

    setIsMicOn(false);

    setIsSubmitting(true);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken: currentQuestion.timeLimit - timeLeft,
        },
        {
          withCredentials: true,
        },
      );

      setFeedback(result.data.feedback);

      speakText(result.data.feedback);

      setIsSubmitting(false);
    } catch (error) {
      console.log(error);

      setIsSubmitting(false);
    }
  };

  // =========================================================
  // NEXT QUESTION
  // =========================================================

  const handleNext = async () => {
    isMicOnRef.current = false;

    stopMic();

    setIsMicOn(false);

    setAnswer("");
    setInterimTranscript("");
    setFeedback("");
    setRecordingTime(0);

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright, let's move to the next question.");

    setCurrentIndex(currentIndex + 1);
  };

  // =========================================================
  // FINISH INTERVIEW
  // =========================================================

  const finishInterview = async () => {
    isMicOnRef.current = false;

    stopMic();

    setIsMicOn(false);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/finish",
        {
          interviewId,
        },
        {
          withCredentials: true,
        },
      );

      console.log(result.data);

      onFinish(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================================================
  // AUTO SUBMIT WHEN TIMER ENDS
  // =========================================================

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft, isIntroPhase, currentQuestion, isSubmitting, feedback]);

  // =========================================================
  // COMPONENT CLEANUP
  // =========================================================

  useEffect(() => {
    return () => {
      isMicOnRef.current = false;

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.abort();
        } catch {
          // Ignore cleanup errors
        }
      }

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // =========================================================
  // UI HELPERS
  // =========================================================

  const getInterviewStatus = () => {
    if (isAIPlaying) {
      return {
        label: "AI is speaking",
        description: "Listen to the interviewer",
        dot: "bg-[#2563eb]",
        bg: "bg-[#eff6ff]",
        text: "text-[#1d4ed8]",
      };
    }

    if (isListening) {
      return {
        label: "You are speaking",
        description: "Recording your answer",
        dot: "bg-[#dc2626]",
        bg: "bg-[#fef2f2]",
        text: "text-[#b91c1c]",
      };
    }

    if (feedback) {
      return {
        label: "Answer submitted",
        description: "Review your feedback below",
        dot: "bg-[#16a34a]",
        bg: "bg-[#ecfdf3]",
        text: "text-[#15803d]",
      };
    }

    return {
      label: "Your turn",
      description: "Answer the question naturally",
      dot: "bg-[#16a34a]",
      bg: "bg-[#ecfdf3]",
      text: "text-[#15803d]",
    };
  };

  const interviewStatus = getInterviewStatus();

  const answerPreview =
    answer + (interimTranscript ? ` ${interimTranscript}` : "");

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="page-shell min-h-screen bg-[#f7f8fa] px-3 py-3 sm:px-5 sm:py-5 lg:px-8"
    >
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1500px] flex-col overflow-hidden rounded-2xl border border-[#eaecf0] bg-white shadow-[0_12px_40px_rgba(16,24,40,0.07)] sm:min-h-[calc(100vh-40px)]">
        {/* =====================================================
            TOP BAR
        ====================================================== */}

        <header className="flex flex-col gap-4 border-b border-[#eaecf0] px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="brand-mark flex h-9 w-9 items-center justify-center rounded-lg">
              <FaMicrophone className="text-xs" />
            </div>

            <div>
              <p className="text-sm font-bold text-[#101828]">AI Interview</p>

              <p className="text-xs text-[#667085]">Live interview session</p>
            </div>
          </div>

          {!isIntroPhase && currentQuestion && (
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 text-xs font-medium text-[#667085] sm:flex">
                <FaCircle className="text-[6px] text-[#16a34a]" />
                Session active
              </div>

              <div className="h-5 w-px bg-[#eaecf0] sm:block" />

              <div className="flex items-center gap-2 rounded-lg border border-[#eaecf0] bg-[#fcfcfd] px-3 py-2">
                <span className="text-xs font-semibold text-[#667085]">
                  Question
                </span>

                <span className="text-sm font-bold text-[#101828]">
                  {currentIndex + 1}
                  <span className="mx-1 text-[#98a2b3]">/</span>
                  {questions.length}
                </span>
              </div>
            </div>
          )}
        </header>

        {/* =====================================================
            MAIN WORKSPACE
        ====================================================== */}

        <div className="grid flex-1 lg:grid-cols-[390px_1fr]">
          {/* ===================================================
              AI INTERVIEWER PANEL
          ==================================================== */}

          <aside className="border-b border-[#eaecf0] bg-[#f8fafc] p-4 sm:p-6 lg:border-b-0 lg:border-r">
            <div className="flex h-full flex-col">
              {/* AI heading */}

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="eyebrow mb-1">Interviewer</p>

                  <h2 className="text-lg font-bold text-[#101828]">
                    AI Interviewer
                  </h2>
                </div>

                <div
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${interviewStatus.bg} ${interviewStatus.text}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${interviewStatus.dot}`}
                  />

                  {isAIPlaying
                    ? "Speaking"
                    : isListening
                      ? "Listening"
                      : feedback
                        ? "Submitted"
                        : "Ready"}
                </div>
              </div>

              {/* Video */}

              <div className="relative overflow-hidden rounded-2xl border border-[#dfe3e8] bg-[#101828] shadow-sm">
                <video
                  src={videoSource}
                  key={videoSource}
                  ref={videoRef}
                  muted
                  playsInline
                  preload="auto"
                  className="aspect-[4/3] w-full object-cover"
                />

                {/* Video status */}

                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-2 rounded-lg bg-[#101828]/85 px-3 py-2 backdrop-blur-sm">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isAIPlaying
                          ? "animate-pulse bg-[#60a5fa]"
                          : "bg-[#16a34a]"
                      }`}
                    />

                    <span className="text-xs font-medium text-white">
                      {isAIPlaying
                        ? "Interviewer is speaking"
                        : "Interviewer is ready"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subtitle */}

              {subtitle && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-xl border border-[#dbeafe] bg-[#eff6ff] p-4"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <FaVolumeUp className="text-xs text-[#2563eb]" />

                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563eb]">
                      Interviewer says
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-[#344054]">{subtitle}</p>
                </motion.div>
              )}

              {/* Status */}

              <div className="mt-5 rounded-xl border border-[#eaecf0] bg-white p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${interviewStatus.bg} ${interviewStatus.text}`}
                  >
                    {isAIPlaying ? (
                      <FaVolumeUp className="text-xs" />
                    ) : isListening ? (
                      <FaMicrophone className="text-xs" />
                    ) : feedback ? (
                      <FaCheckCircle className="text-xs" />
                    ) : (
                      <FaCircle className="text-[8px]" />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#344054]">
                      {interviewStatus.label}
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-[#667085]">
                      {interviewStatus.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timer */}

              {!isIntroPhase && currentQuestion && (
                <div className="mt-5 rounded-xl border border-[#eaecf0] bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaClock className="text-xs text-[#667085]" />

                      <span className="text-xs font-semibold text-[#667085]">
                        Time remaining
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold ${
                        timeLeft <= 10 ? "text-[#dc2626]" : "text-[#344054]"
                      }`}
                    >
                      {timeLeft <= 10 ? "Almost done" : "Take your time"}
                    </span>
                  </div>

                  <div className="flex justify-center py-1">
                    <Timer
                      timeLeft={timeLeft}
                      totalTime={currentQuestion?.timeLimit}
                    />
                  </div>
                </div>
              )}

              {/* Question progress */}

              {!isIntroPhase && (
                <div className="mt-auto pt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#667085]">
                      Interview progress
                    </span>

                    <span className="text-xs font-bold text-[#344054]">
                      {currentIndex + 1}/{questions.length}
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-[#eaecf0]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          ((currentIndex + 1) / questions.length) * 100
                        }%`,
                      }}
                      transition={{ duration: 0.35 }}
                      className="h-full rounded-full bg-[#2563eb]"
                    />
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* ===================================================
              ANSWER PANEL
          ==================================================== */}

          <section className="flex min-w-0 flex-col p-5 sm:p-6 lg:p-8">
            {/* Intro */}

            {isIntroPhase ? (
              <div className="flex flex-1 items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-2xl text-center"
                >
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#2563eb]">
                    <FaMicrophone className="text-xl" />
                  </div>

                  <p className="eyebrow mb-2">Getting started</p>

                  <h1 className="text-3xl font-bold text-[#101828] sm:text-4xl">
                    Welcome, {userName}
                  </h1>

                  <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#667085] sm:text-base">
                    Your AI interviewer is introducing the session. Listen
                    carefully, then answer each question naturally when it is
                    your turn.
                  </p>

                  <div className="mx-auto mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
                    {[
                      {
                        icon: <FaVolumeUp />,
                        title: "Listen",
                        text: "Hear the question",
                      },
                      {
                        icon: <FaMicrophone />,
                        title: "Answer",
                        text: "Speak or type",
                      },
                      {
                        icon: <FaChartLine />,
                        title: "Improve",
                        text: "Get feedback",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-[#eaecf0] bg-white p-4"
                      >
                        <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2f4f7] text-xs text-[#475467]">
                          {item.icon}
                        </div>

                        <p className="text-xs font-bold text-[#344054]">
                          {item.title}
                        </p>

                        <p className="mt-1 text-[11px] text-[#667085]">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#eaecf0] bg-[#fcfcfd] px-4 py-2 text-xs font-medium text-[#667085]">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#2563eb]" />
                    AI interviewer is speaking...
                  </div>
                </motion.div>
              </div>
            ) : (
              <>
                {/* Question heading */}

                <div className="mb-5">
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div>
                      <p className="eyebrow">Question {currentIndex + 1}</p>
                    </div>

                    <span className="hidden items-center gap-2 text-xs font-medium text-[#667085] sm:flex">
                      <FaKeyboard className="text-[10px]" />
                      Type or use your microphone
                    </span>
                  </div>

                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-[#dbeafe] bg-[#f8fbff] p-5 sm:p-6"
                  >
                    <h1 className="text-xl font-bold leading-8 text-[#101828] sm:text-2xl">
                      {currentQuestion?.question}
                    </h1>
                  </motion.div>
                </div>

                {/* Answer editor */}

                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-bold text-[#344054]">
                      Your answer
                    </label>

                    <span className="text-xs text-[#98a2b3]">
                      {answer.length > 0
                        ? `${answer.length} characters`
                        : "Start typing or speaking"}
                    </span>
                  </div>

                  <div className="relative flex min-h-[250px] flex-1">
                    <textarea
                      placeholder="Write your answer here, or use the microphone to speak..."
                      onChange={(e) => {
                        setAnswer(e.target.value);
                        setInterimTranscript("");
                      }}
                      value={answerPreview}
                      disabled={isSubmitting || !!feedback}
                      className="focus-ring min-h-[250px] w-full resize-none rounded-2xl border border-[#d0d5dd] bg-white p-5 pb-20 text-sm leading-7 text-[#101828] outline-none transition placeholder:text-[#98a2b3] focus:border-[#2563eb] disabled:bg-[#f9fafb] disabled:opacity-80 sm:p-6 sm:pb-20"
                    />

                    {/* Microphone control */}

                    {!feedback && (
                      <div className="absolute bottom-4 right-4">
                        <motion.button
                          type="button"
                          onClick={toggleMic}
                          disabled={
                            !isSpeechSupported || isAIPlaying || isSubmitting
                          }
                          whileTap={{ scale: 0.95 }}
                          className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm transition ${
                            isListening
                              ? "bg-[#dc2626] hover:bg-[#b91c1c]"
                              : "bg-[#101828] hover:bg-[#1d2939]"
                          } ${
                            !isSpeechSupported || isAIPlaying || isSubmitting
                              ? "cursor-not-allowed opacity-40"
                              : ""
                          }`}
                          title={
                            isListening ? "Stop recording" : "Start recording"
                          }
                        >
                          {isListening ? (
                            <FaMicrophoneSlash />
                          ) : (
                            <FaMicrophone />
                          )}
                        </motion.button>

                        {isListening && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#dc2626]"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Recording status */}

                  <div className="mt-3 min-h-[42px]">
                    {isListening ? (
                      <motion.div
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap items-center gap-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-2.5"
                      >
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#dc2626] opacity-50" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#dc2626]" />
                        </span>

                        <span className="text-xs font-bold text-[#b91c1c]">
                          Recording
                        </span>

                        <span className="text-xs font-bold text-[#344054]">
                          {formatRecordingTime(recordingTime)}
                        </span>

                        <span className="text-xs text-[#667085]">
                          Speak naturally. Your words will appear above.
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            isMicOnRef.current = false;
                            stopMic();
                            setIsMicOn(false);
                          }}
                          className="ml-auto rounded-lg bg-[#dc2626] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#b91c1c]"
                        >
                          Stop
                        </button>
                      </motion.div>
                    ) : (
                      <div className="flex min-h-[42px] items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isAIPlaying ? "bg-[#2563eb]" : "bg-[#16a34a]"
                            }`}
                          />

                          <span className="text-xs font-medium text-[#667085]">
                            {isAIPlaying
                              ? "Interviewer is speaking..."
                              : "Your microphone is ready"}
                          </span>
                        </div>

                        <span className="hidden text-xs text-[#98a2b3] sm:block">
                          Click the microphone to speak
                        </span>
                      </div>
                    )}

                    {/* Unsupported browser */}

                    {!isSpeechSupported && (
                      <div className="mt-2 rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-3 py-2">
                        <p className="text-xs font-medium text-[#c2410c]">
                          Voice input isn't supported in this browser. Text
                          input is still available.
                        </p>
                      </div>
                    )}

                    {/* Speech error */}

                    {speechError && isSpeechSupported && (
                      <div className="mt-2 rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-3 py-2">
                        <p className="text-xs font-medium text-[#c2410c]">
                          {speechError}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Submit / Feedback */}

                  {!feedback ? (
                    <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#eaecf0] pt-5">
                      <p className="hidden text-xs text-[#98a2b3] sm:block">
                        Make sure your answer addresses the question clearly.
                      </p>

                      <motion.button
                        onClick={submitAnswer}
                        disabled={isSubmitting}
                        whileTap={{ scale: 0.98 }}
                        className="button-accent flex w-full items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold shadow-sm disabled:bg-[#d0d5dd] disabled:text-[#98a2b3] sm:w-auto"
                      >
                        {isSubmitting ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            Evaluating...
                          </>
                        ) : (
                          <>
                            Submit Answer
                            <FaArrowRight className="text-xs" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-5 rounded-2xl border border-[#d1fadf] bg-[#f6fef9] p-5"
                    >
                      <div className="mb-4 flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#dcfae6] text-[#16a34a]">
                          <FaCheckCircle />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-[#101828]">
                            Answer evaluated
                          </p>

                          <p className="mt-1 text-xs text-[#667085]">
                            Here's the interviewer's feedback on your response.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#d1fadf] bg-white p-4">
                        <p className="text-sm leading-7 text-[#344054]">
                          {feedback}
                        </p>
                      </div>

                      <button
                        onClick={handleNext}
                        className="button-accent mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-sm"
                      >
                        {currentIndex + 1 >= questions.length
                          ? "Finish Interview"
                          : "Next Question"}

                        <FaArrowRight className="text-xs" />
                      </button>
                    </motion.div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </motion.main>
  );
}

export default Step2Interview;
