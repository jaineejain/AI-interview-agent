import mongoose from "mongoose";

const questionsSchema = new mongoose.Schema({
  question: String,
  difficulty: String,
  timeLimit: Number,

  answer: String,
  feedback: String,

  score: {
    type: Number,
    default: 0,
  },

  confidence: {
    type: Number,
    default: 0,
  },

  communication: {
    type: Number,
    default: 0,
  },

  correctness: {
    type: Number,
    default: 0,
  },

  // AI skill analysis
  skills: {
    type: [String],
    default: [],
  },

  // AI detected strengths and weaknesses
  strengths: {
    type: [String],
    default: [],
  },

  weaknesses: {
    type: [String],
    default: [],
  },

  // AI-generated improved version of candidate's answer
  improvedAnswer: {
    type: String,
    default: "",
  },

  // Adaptive follow-up information
  isFollowUp: {
    type: Boolean,
    default: false,
  },

  parentQuestionIndex: {
    type: Number,
    default: null,
  },

  followUpAsked: {
    type: Boolean,
    default: false,
  },

  // Optional communication metrics from frontend
  timeTaken: {
    type: Number,
    default: 0,
  },

  wordCount: {
    type: Number,
    default: 0,
  },

  fillerWords: {
    type: Number,
    default: 0,
  },
});

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    experience: {
      type: String,
      required: true,
    },

    // Existing field kept for backward compatibility
    mode: {
      type: String,
      enum: ["HR", "Technical"],
      required: true,
    },

    // New interview category
    interviewType: {
      type: String,
      enum: [
        "Technical",
        "HR",
        "Behavioral",
        "System Design",
        "Coding",
        "Mixed",
      ],
      default: "Technical",
    },

    resumeText: {
      type: String,
    },

    // Resume information used for personalized analysis
    projects: {
      type: [String],
      default: [],
    },

    skills: {
      type: [String],
      default: [],
    },

    questions: {
      type: [questionsSchema],
      default: [],
    },

    finalScore: {
      type: Number,
      default: 0,
    },

    // Overall readiness score from 0 to 100
    readinessScore: {
      type: Number,
      default: 0,
    },

    // Overall communication analysis
    communicationAnalysis: {
      type: String,
      default: "",
    },

    // Overall strengths detected by AI
    overallStrengths: {
      type: [String],
      default: [],
    },

    // Overall weaknesses detected by AI
    overallWeaknesses: {
      type: [String],
      default: [],
    },

    // Skill-wise performance
    skillPerformance: [
      {
        name: {
          type: String,
        },
        score: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Personalized preparation plan
    preparationPlan: [
      {
        topic: {
          type: String,
        },
        reason: {
          type: String,
        },
        priority: {
          type: String,
          enum: ["Low", "Medium", "High"],
          default: "Medium",
        },
      },
    ],

    // Existing status kept unchanged
    status: {
      type: String,
      enum: ["Incompleted", "completed"],
      default: "Incompleted",
    },
  },
  {
    timestamps: true,
  },
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
