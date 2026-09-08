import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

/*
  Helper functions
*/

const clampScore = (value, min = 0, max = 10) => {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return min;
  }

  return Math.min(max, Math.max(min, number));
};

const parseAiJson = (content) => {
  if (!content || !content.trim()) {
    throw new Error("AI returned empty response.");
  }

  let cleaned = content.trim();

  // Remove markdown JSON fences if AI accidentally returns them.
  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleaned);
};

const cleanStringArray = (value, maxItems = 10) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems);
};

const calculateWordCount = (answer) => {
  if (!answer || typeof answer !== "string") {
    return 0;
  }

  return answer.trim() ? answer.trim().split(/\s+/).length : 0;
};

const calculateFillerWords = (answer) => {
  if (!answer || typeof answer !== "string") {
    return 0;
  }

  const fillerWords = [
    "um",
    "uh",
    "umm",
    "hmm",
    "like",
    "actually",
    "basically",
    "you know",
    "sort of",
    "kind of",
    "i mean",
  ];

  const text = answer.toLowerCase();
  let count = 0;

  fillerWords.forEach((word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "g");
    const matches = text.match(regex);

    if (matches) {
      count += matches.length;
    }
  });

  return count;
};

const calculateReadinessScore = ({
  finalScore,
  avgConfidence,
  avgCommunication,
  avgCorrectness,
}) => {
  /*
    Interview score is out of 10.
    Readiness score is out of 100.

    We intentionally use the existing evaluation metrics instead
    of creating another expensive AI request.
  */

  const score = clampScore(finalScore, 0, 10);
  const confidence = clampScore(avgConfidence, 0, 10);
  const communication = clampScore(avgCommunication, 0, 10);
  const correctness = clampScore(avgCorrectness, 0, 10);

  const readiness =
    score * 10 * 0.4 +
    confidence * 10 * 0.2 +
    communication * 10 * 0.15 +
    correctness * 10 * 0.25;

  return Number(Math.min(100, Math.max(0, readiness)).toFixed(1));
};

const buildCommunicationAnalysis = ({
  avgCommunication,
  avgConfidence,
  totalWords,
  totalTime,
  totalFillers,
}) => {
  const communication = Number(avgCommunication.toFixed(1));
  const confidence = Number(avgConfidence.toFixed(1));

  const wordsPerMinute =
    totalTime > 0 ? Math.round((totalWords / totalTime) * 60) : 0;

  if (communication >= 8 && confidence >= 8) {
    return `Strong communication with clear and confident responses. Average speaking pace was approximately ${
      wordsPerMinute || 0
    } words per minute.`;
  }

  if (communication >= 6) {
    return `Communication was generally clear, but some answers could be more structured and concise. Average speaking pace was approximately ${
      wordsPerMinute || 0
    } words per minute.`;
  }

  if (totalFillers > 0) {
    return `Communication needs improvement in clarity and structure. Try reducing filler words and organizing answers before speaking.`;
  }

  return `Communication needs improvement. Focus on clearer structure, concise explanations, and more confident delivery.`;
};

const buildPreparationPlan = ({ weaknesses, skillPerformance, finalScore }) => {
  const plan = [];

  const weaknessList = cleanStringArray(weaknesses, 5);

  weaknessList.forEach((weakness, index) => {
    plan.push({
      topic: weakness,
      reason:
        "This weakness appeared during your interview answers and should be practiced.",
      priority: index < 2 ? "High" : "Medium",
    });
  });

  const weakSkills = (skillPerformance || [])
    .filter((skill) => Number(skill.score || 0) < 6)
    .sort((a, b) => Number(a.score || 0) - Number(b.score || 0))
    .slice(0, 3);

  weakSkills.forEach((skill) => {
    const alreadyExists = plan.some(
      (item) => item.topic.toLowerCase() === String(skill.name).toLowerCase(),
    );

    if (!alreadyExists) {
      plan.push({
        topic: skill.name,
        reason: `Your average performance in ${skill.name} was below the target level.`,
        priority: Number(skill.score || 0) < 5 ? "High" : "Medium",
      });
    }
  });

  if (plan.length === 0) {
    if (finalScore >= 8) {
      plan.push({
        topic: "Advanced interview practice",
        reason:
          "Your current performance is strong. Focus on difficult real-world scenarios.",
        priority: "Medium",
      });
    } else {
      plan.push({
        topic: "Interview fundamentals",
        reason:
          "Continue practicing structured answers and technical explanations.",
        priority: "Medium",
      });
    }
  }

  return plan.slice(0, 6);
};

/*
  Resume Analysis
*/

export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Resume required",
      });
    }

    const filepath = req.file.path;

    const fileBuffer = await fs.promises.readFile(filepath);
    const uint8Array = new Uint8Array(fileBuffer);

    const pdf = await pdfjsLib.getDocument({
      data: uint8Array,
    }).promise;

    let resumeText = "";

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      const pageText = content.items.map((item) => item.str).join(" ");

      resumeText += pageText + "\n";
    }

    resumeText = resumeText.replace(/\s+/g, " ").trim();

    const messages = [
      {
        role: "system",
        content: `
Extract structured data from resume.

Return strictly JSON:

{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}
`,
      },
      {
        role: "user",
        content: resumeText,
      },
    ];

    const aiResponse = await askAi(messages);
    const parsed = parseAiJson(aiResponse);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    return res.json({
      role: parsed.role || "",
      experience: parsed.experience || "",
      projects: cleanStringArray(parsed.projects, 10),
      skills: cleanStringArray(parsed.skills, 20),
      resumeText,
    });
  } catch (error) {
    console.error(error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      message: error.message,
    });
  }
};

/*
  Generate Interview Questions
*/

export const generateQuestion = async (req, res) => {
  try {
    let {
      role,
      experience,
      mode,
      interviewType,
      resumeText,
      projects,
      skills,
    } = req.body;

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();
    interviewType = interviewType?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({
        message: "Role, Experience and Mode are required.",
      });
    }

    /*
      Keep the old mode field working.

      If the new frontend sends interviewType, use it.
      Otherwise fall back to the existing HR / Technical mode.
    */

    const selectedInterviewType =
      interviewType || (mode === "HR" ? "HR" : "Technical");

    const allowedInterviewTypes = [
      "Technical",
      "HR",
      "Behavioral",
      "System Design",
      "Coding",
      "Mixed",
    ];

    if (!allowedInterviewTypes.includes(selectedInterviewType)) {
      return res.status(400).json({
        message: "Invalid interview type.",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.credits < 50) {
      return res.status(400).json({
        message: "Not enough credits. Minimum 50 required.",
      });
    }

    const projectList = Array.isArray(projects)
      ? cleanStringArray(projects, 10)
      : [];

    const skillList = Array.isArray(skills) ? cleanStringArray(skills, 20) : [];

    const projectText = projectList.length ? projectList.join(", ") : "None";

    const skillsText = skillList.length ? skillList.join(", ") : "None";

    const safeResume = resumeText?.trim() || "None";

    const userPrompt = `
Role: ${role}
Experience: ${experience}
Interview Mode: ${mode}
Interview Type: ${selectedInterviewType}
Projects: ${projectText}
Skills: ${skillsText}
Resume: ${safeResume}
`;

    if (!userPrompt.trim()) {
      return res.status(400).json({
        message: "Prompt content is empty.",
      });
    }

    const messages = [
      {
        role: "system",
        content: `
You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions.

Strict Rules:

- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.
- Questions must match the selected interview type.

Difficulty progression:
Question 1 → easy
Question 2 → easy
Question 3 → medium
Question 4 → medium
Question 5 → hard

Interview type guidance:

Technical:
Focus on technical concepts, implementation, debugging, architecture, and practical engineering decisions.

HR:
Focus on motivation, teamwork, communication, behavior, conflict, and career goals.

Behavioral:
Focus on real experiences, decision making, teamwork, leadership, and problem solving.

System Design:
Focus on architecture, scalability, reliability, databases, APIs, and trade-offs.

Coding:
Focus on programming logic, algorithms, data structures, debugging, and complexity.

Mixed:
Mix technical, behavioral, and practical questions based on the candidate profile.

Make questions based on the candidate's role, experience, projects, skills, resume, and interview type.
`,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ];

    const aiResponse = await askAi(messages);

    if (!aiResponse || !aiResponse.trim()) {
      return res.status(500).json({
        message: "AI returned empty response.",
      });
    }

    const questionsArray = aiResponse
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .map((q) => q.replace(/^\d+[).\-:]\s*/, ""))
      .slice(0, 5);

    if (questionsArray.length === 0) {
      return res.status(500).json({
        message: "AI failed to generate questions.",
      });
    }

    /*
      Credits are deducted only after successful question generation.
    */

    user.credits -= 50;
    await user.save();

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      interviewType: selectedInterviewType,
      resumeText: safeResume,
      projects: projectList,
      skills: skillList,

      questions: questionsArray.map((q, index) => ({
        question: q,
        difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
        timeLimit: [60, 60, 90, 90, 120][index],
      })),
    });

    return res.json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      interviewType: interview.interviewType,
      questions: interview.questions,
    });
  } catch (error) {
    console.error("Generate Interview Error:", error);

    return res.status(500).json({
      message: `failed to create interview ${error.message}`,
    });
  }
};

/*
  Submit Answer + AI Evaluation + Adaptive Follow-up
*/

export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body;

    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.userId,
    });

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found.",
      });
    }

    const index = Number(questionIndex);

    if (
      Number.isNaN(index) ||
      index < 0 ||
      index >= interview.questions.length
    ) {
      return res.status(400).json({
        message: "Invalid question index.",
      });
    }

    const question = interview.questions[index];

    const safeAnswer = typeof answer === "string" ? answer.trim() : "";

    const safeTimeTaken = Math.max(0, Number(timeTaken) || 0);

    const wordCount = calculateWordCount(safeAnswer);
    const fillerWords = calculateFillerWords(safeAnswer);

    question.timeTaken = safeTimeTaken;
    question.wordCount = wordCount;
    question.fillerWords = fillerWords;

    /*
      If no answer
    */

    if (!safeAnswer) {
      question.score = 0;
      question.confidence = 0;
      question.communication = 0;
      question.correctness = 0;
      question.feedback = "You did not submit an answer.";
      question.answer = "";

      await interview.save();

      return res.json({
        feedback: question.feedback,
        score: 0,
        confidence: 0,
        communication: 0,
        correctness: 0,
        followUp: null,
      });
    }

    /*
      If time exceeded
    */

    if (question.timeLimit && safeTimeTaken > question.timeLimit) {
      question.score = 0;
      question.confidence = 0;
      question.communication = 0;
      question.correctness = 0;
      question.feedback = "Time limit exceeded. Answer not evaluated.";
      question.answer = safeAnswer;

      await interview.save();

      return res.json({
        feedback: question.feedback,
        score: 0,
        confidence: 0,
        communication: 0,
        correctness: 0,
        followUp: null,
      });
    }

    /*
      If this is an adaptive follow-up, do not generate another
      follow-up. This prevents infinite AI questioning.
    */

    const allowFollowUp = !question.isFollowUp;

    const messages = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly.

Score the answer in these areas from 0 to 10:

1. Confidence
2. Communication
3. Correctness

Also identify:
- Relevant skills demonstrated
- Strengths
- Weaknesses
- A better improved answer

Adaptive follow-up:
- Decide whether the candidate needs one useful follow-up question.
- Ask a follow-up when the answer is incomplete, shallow, partially correct, or needs deeper reasoning.
- Do not ask a follow-up when the answer is already strong and complete.
- A follow-up should directly build on the candidate's answer.
- Never ask an unrelated question.
- Keep the follow-up practical and interview-like.
- Only one follow-up is allowed for a normal question.
- If the current question is already a follow-up, set shouldAsk to false.
- If the answer is empty or invalid, set shouldAsk to false.

Calculate:
finalScore = average of confidence, communication, and correctness rounded to nearest whole number.

Feedback:
- 10 to 15 words only.
- Natural human interview feedback.
- Professional and honest.
- Do not repeat the question.
- Do not explain scoring.

Improved answer:
- Give a concise example of how the candidate could answer better.
- Keep it relevant to the question.
- Do not make it excessively long.

Return ONLY valid JSON:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback",
  "skills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvedAnswer": "improved answer",
  "followUp": {
    "shouldAsk": boolean,
    "question": "follow-up question",
    "difficulty": "easy|medium|hard"
  }
}
`,
      },
      {
        role: "user",
        content: `
Interview Type: ${interview.interviewType || interview.mode}
Role: ${interview.role}
Experience: ${interview.experience}

Question:
${question.question}

Candidate Answer:
${safeAnswer}

Current Question Is Follow-Up:
${question.isFollowUp ? "Yes" : "No"}

Follow-Up Allowed:
${allowFollowUp ? "Yes" : "No"}
`,
      },
    ];

    const aiResponse = await askAi(messages);
    const parsed = parseAiJson(aiResponse);

    const confidence = clampScore(parsed.confidence);
    const communication = clampScore(parsed.communication);
    const correctness = clampScore(parsed.correctness);

    let finalScore = Number(parsed.finalScore);

    if (Number.isNaN(finalScore)) {
      finalScore = Math.round((confidence + communication + correctness) / 3);
    }

    finalScore = clampScore(finalScore);

    question.answer = safeAnswer;
    question.confidence = confidence;
    question.communication = communication;
    question.correctness = correctness;
    question.score = finalScore;

    question.feedback =
      typeof parsed.feedback === "string"
        ? parsed.feedback.trim()
        : "Answer evaluated successfully.";

    question.skills = cleanStringArray(parsed.skills, 8);

    question.strengths = cleanStringArray(parsed.strengths, 5);

    question.weaknesses = cleanStringArray(parsed.weaknesses, 5);

    question.improvedAnswer =
      typeof parsed.improvedAnswer === "string"
        ? parsed.improvedAnswer.trim()
        : "";

    let followUp = null;

    /*
      Adaptive follow-up question.

      IMPORTANT:
      Do NOT use push() here.

      push() would put the follow-up after Q5:

      Q1
      Q2
      Q3
      Q4
      Q5
      Follow-up

      Instead we insert it immediately after the current
      question:

      Q1
      Follow-up
      Q2
      Q3
      Q4
      Q5
    */

    if (
      allowFollowUp &&
      parsed.followUp &&
      parsed.followUp.shouldAsk === true &&
      typeof parsed.followUp.question === "string" &&
      parsed.followUp.question.trim()
    ) {
      const followUpQuestion = parsed.followUp.question.trim();

      question.followUpAsked = true;

      const followUpDifficulty = ["easy", "medium", "hard"].includes(
        parsed.followUp.difficulty,
      )
        ? parsed.followUp.difficulty
        : question.difficulty || "medium";

      /*
        Insert follow-up immediately after current question.
      */

      interview.questions.splice(index + 1, 0, {
        question: followUpQuestion,

        difficulty: followUpDifficulty,

        timeLimit:
          followUpDifficulty === "hard"
            ? 120
            : followUpDifficulty === "medium"
              ? 90
              : 60,

        isFollowUp: true,

        parentQuestionIndex: index,
      });

      /*
        Since we inserted at index + 1,
        the new follow-up's index is index + 1.
      */

      const newQuestionIndex = index + 1;

      followUp = {
        question: followUpQuestion,
        difficulty: followUpDifficulty,
        questionIndex: newQuestionIndex,
      };
    }

    await interview.save();

    return res.status(200).json({
      feedback: question.feedback,
      score: question.score,
      confidence: question.confidence,
      communication: question.communication,
      correctness: question.correctness,

      strengths: question.strengths,
      weaknesses: question.weaknesses,
      skills: question.skills,

      improvedAnswer: question.improvedAnswer,

      followUp,
    });
  } catch (error) {
    console.error("Submit Answer Error:", error);

    return res.status(500).json({
      message: `failed to submit answer ${error.message}`,
    });
  }
};

/*
  Finish Interview
*/

export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.userId,
    });

    if (!interview) {
      return res.status(400).json({
        message: "failed to find Interview",
      });
    }

    const totalQuestions = interview.questions.length;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    let totalWords = 0;
    let totalTime = 0;
    let totalFillers = 0;

    const skillScores = {};
    const weaknessCounts = {};
    const strengthCounts = {};

    interview.questions.forEach((q) => {
      const score = Number(q.score || 0);
      const confidence = Number(q.confidence || 0);
      const communication = Number(q.communication || 0);
      const correctness = Number(q.correctness || 0);

      totalScore += score;
      totalConfidence += confidence;
      totalCommunication += communication;
      totalCorrectness += correctness;

      totalWords += Number(q.wordCount || 0);
      totalTime += Number(q.timeTaken || 0);
      totalFillers += Number(q.fillerWords || 0);

      /*
        Skill-wise scoring
      */

      if (Array.isArray(q.skills)) {
        q.skills.forEach((skillName) => {
          if (!skillName || typeof skillName !== "string") {
            return;
          }

          const normalizedName = skillName.trim();

          if (!normalizedName) {
            return;
          }

          if (!skillScores[normalizedName]) {
            skillScores[normalizedName] = {
              total: 0,
              count: 0,
            };
          }

          skillScores[normalizedName].total += score;
          skillScores[normalizedName].count += 1;
        });
      }

      /*
        Weakness frequency
      */

      if (Array.isArray(q.weaknesses)) {
        q.weaknesses.forEach((weakness) => {
          if (!weakness || typeof weakness !== "string") {
            return;
          }

          const cleanWeakness = weakness.trim();

          if (!cleanWeakness) {
            return;
          }

          weaknessCounts[cleanWeakness] =
            (weaknessCounts[cleanWeakness] || 0) + 1;
        });
      }

      /*
        Strength frequency
      */

      if (Array.isArray(q.strengths)) {
        q.strengths.forEach((strength) => {
          if (!strength || typeof strength !== "string") {
            return;
          }

          const cleanStrength = strength.trim();

          if (!cleanStrength) {
            return;
          }

          strengthCounts[cleanStrength] =
            (strengthCounts[cleanStrength] || 0) + 1;
        });
      }
    });

    const finalScore = totalQuestions ? totalScore / totalQuestions : 0;

    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;

    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;

    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;

    /*
      Readiness score: 0 - 100
    */

    const readinessScore = calculateReadinessScore({
      finalScore,
      avgConfidence,
      avgCommunication,
      avgCorrectness,
    });

    /*
      Sort skills by average score
    */

    const skillPerformance = Object.entries(skillScores)
      .map(([name, data]) => ({
        name,
        score: Number((data.total / data.count).toFixed(1)),
      }))
      .sort((a, b) => b.score - a.score);

    /*
      Most frequently detected weaknesses
    */

    const overallWeaknesses = Object.entries(weaknessCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([weakness]) => weakness);

    /*
      Most frequently detected strengths
    */

    const overallStrengths = Object.entries(strengthCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([strength]) => strength);

    /*
      Communication analysis
    */

    const communicationAnalysis = buildCommunicationAnalysis({
      avgCommunication,
      avgConfidence,
      totalWords,
      totalTime,
      totalFillers,
    });

    /*
      Personalized preparation plan
    */

    const preparationPlan = buildPreparationPlan({
      weaknesses: overallWeaknesses,
      skillPerformance,
      finalScore,
    });

    interview.finalScore = Number(finalScore.toFixed(1));

    interview.readinessScore = readinessScore;

    interview.communicationAnalysis = communicationAnalysis;

    interview.overallWeaknesses = overallWeaknesses;

    interview.overallStrengths = overallStrengths;

    interview.skillPerformance = skillPerformance;

    interview.preparationPlan = preparationPlan;

    interview.status = "completed";

    await interview.save();

    return res.status(200).json({
      finalScore: Number(finalScore.toFixed(1)),

      readinessScore,

      confidence: Number(avgConfidence.toFixed(1)),

      communication: Number(avgCommunication.toFixed(1)),

      correctness: Number(avgCorrectness.toFixed(1)),

      communicationAnalysis,

      overallWeaknesses,
      overallStrengths,

      skillPerformance,

      preparationPlan,

      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,

        score: q.score || 0,

        feedback: q.feedback || "",

        confidence: q.confidence || 0,

        communication: q.communication || 0,

        correctness: q.correctness || 0,

        skills: q.skills || [],

        strengths: q.strengths || [],

        weaknesses: q.weaknesses || [],

        improvedAnswer: q.improvedAnswer || "",

        isFollowUp: q.isFollowUp || false,

        timeTaken: q.timeTaken || 0,

        wordCount: q.wordCount || 0,

        fillerWords: q.fillerWords || 0,
      })),
    });
  } catch (error) {
    console.error("Finish Interview Error:", error);

    return res.status(500).json({
      message: `failed to finish Interview ${error.message}`,
    });
  }
};

/*
  Interview History
*/

export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.userId,
    })
      .sort({ createdAt: -1 })
      .select(
        "role experience mode interviewType finalScore readinessScore status createdAt",
      );

    return res.status(200).json(interviews);
  } catch (error) {
    return res.status(500).json({
      message: `failed to find currentUser Interview ${error}`,
    });
  }
};

/*
  Interview Report
*/

export const getInterviewReport = async (req, res) => {
  try {
    /*
      Important security improvement:
      A user can only access their own report.
    */

    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    const totalQuestions = interview.questions.length;

    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;

    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;

    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;

    /*
      Backward compatibility:
      Older interviews won't have readiness or the new
      analytics fields. Calculate basic values when necessary.
    */

    const readinessScore =
      interview.readinessScore ||
      calculateReadinessScore({
        finalScore: interview.finalScore || 0,
        avgConfidence,
        avgCommunication,
        avgCorrectness,
      });

    const skillPerformance = interview.skillPerformance || [];

    const overallWeaknesses = interview.overallWeaknesses || [];

    const overallStrengths = interview.overallStrengths || [];

    const preparationPlan = interview.preparationPlan || [];

    const communicationAnalysis =
      interview.communicationAnalysis ||
      buildCommunicationAnalysis({
        avgCommunication,
        avgConfidence,

        totalWords: interview.questions.reduce(
          (sum, q) => sum + Number(q.wordCount || 0),
          0,
        ),

        totalTime: interview.questions.reduce(
          (sum, q) => sum + Number(q.timeTaken || 0),
          0,
        ),

        totalFillers: interview.questions.reduce(
          (sum, q) => sum + Number(q.fillerWords || 0),
          0,
        ),
      });

    return res.json({
      finalScore: Number(Number(interview.finalScore || 0).toFixed(1)),

      readinessScore,

      confidence: Number(avgConfidence.toFixed(1)),

      communication: Number(avgCommunication.toFixed(1)),

      correctness: Number(avgCorrectness.toFixed(1)),

      interviewType: interview.interviewType || interview.mode,

      role: interview.role,

      experience: interview.experience,

      communicationAnalysis,

      overallWeaknesses,

      overallStrengths,

      skillPerformance,

      preparationPlan,

      questionWiseScore: interview.questions,
    });
  } catch (error) {
    console.error("Interview Report Error:", error);

    return res.status(500).json({
      message: `failed to find currentUser Interview report ${error}`,
    });
  }
};
