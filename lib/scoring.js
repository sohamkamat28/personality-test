const dimensions = {
  EI: { left: "E", right: "I", leftName: "Extraversion", rightName: "Introversion" },
  SN: { left: "S", right: "N", leftName: "Sensing", rightName: "Intuition" },
  TF: { left: "T", right: "F", leftName: "Thinking", rightName: "Feeling" },
  JP: { left: "J", right: "P", leftName: "Judging", rightName: "Perceiving" }
};

const oppositeTrait = {
  E: "I",
  I: "E",
  S: "N",
  N: "S",
  T: "F",
  F: "T",
  J: "P",
  P: "J"
};

const responseValues = {
  "a. Strongly Agree": 2,
  "b. Agree": 1,
  "c. Neutral": 0,
  "d. Disagree": -1,
  "e. Strongly Disagree": -2
};

const responseWeights = {
  2: 2,
  1: 1,
  0: 0,
  "-1": -1,
  "-2": -2
};

// Question directions are calibrated from observed Humanmetrics result output where available.
export const questionScoring = [
  { id: 1, dimension: "JP", direction: "J" },
  { id: 2, dimension: "EI", direction: "E" },
  { id: 3, dimension: "EI", direction: "E" },
  { id: 4, dimension: "TF", direction: "F" },
  { id: 5, dimension: "EI", direction: "E" },
  { id: 6, dimension: "TF", direction: "F" },
  { id: 7, dimension: "JP", direction: "P" },
  { id: 8, dimension: "JP", direction: "P" },
  { id: 9, dimension: "TF", direction: "T" },
  { id: 10, dimension: "TF", direction: "F" },
  { id: 11, dimension: "SN", direction: "N" },
  { id: 12, dimension: "JP", direction: "P" },
  { id: 13, dimension: "SN", direction: "N" },
  { id: 14, dimension: "SN", direction: "S" },
  { id: 15, dimension: "TF", direction: "T" },
  { id: 16, dimension: "JP", direction: "P" },
  { id: 17, dimension: "EI", direction: "E" },
  { id: 18, dimension: "JP", direction: "J" },
  { id: 19, dimension: "TF", direction: "F" },
  { id: 20, dimension: "EI", direction: "I" },
  { id: 21, dimension: "JP", direction: "J" },
  { id: 22, dimension: "SN", direction: "N" },
  { id: 23, dimension: "EI", direction: "I" },
  { id: 24, dimension: "JP", direction: "P" },
  { id: 25, dimension: "SN", direction: "N" },
  { id: 26, dimension: "TF", direction: "F" },
  { id: 27, dimension: "EI", direction: "I" },
  { id: 28, dimension: "SN", direction: "S" },
  { id: 29, dimension: "TF", direction: "F" },
  { id: 30, dimension: "TF", direction: "T" },
  { id: 31, dimension: "EI", direction: "E" },
  { id: 32, dimension: "EI", direction: "E" },
  { id: 33, dimension: "SN", direction: "S" },
  { id: 34, dimension: "JP", direction: "J" },
  { id: 35, dimension: "TF", direction: "F" },
  { id: 36, dimension: "EI", direction: "I" },
  { id: 37, dimension: "EI", direction: "E" },
  { id: 38, dimension: "SN", direction: "N" },
  { id: 39, dimension: "TF", direction: "F" },
  { id: 40, dimension: "JP", direction: "P" },
  { id: 41, dimension: "EI", direction: "I" },
  { id: 42, dimension: "SN", direction: "S" },
  { id: 43, dimension: "TF", direction: "T" },
  { id: 44, dimension: "JP", direction: "J" },
  { id: 45, dimension: "JP", direction: "J" },
  { id: 46, dimension: "EI", direction: "E" },
  { id: 47, dimension: "JP", direction: "J" },
  { id: 48, dimension: "SN", direction: "N" },
  { id: 49, dimension: "EI", direction: "I" },
  { id: 50, dimension: "SN", direction: "S" },
  { id: 51, dimension: "JP", direction: "P" },
  { id: 52, dimension: "SN", direction: "S" },
  { id: 53, dimension: "TF", direction: "T" },
  { id: 54, dimension: "TF", direction: "T" },
  { id: 55, dimension: "JP", direction: "P" },
  { id: 56, dimension: "EI", direction: "I" },
  { id: 57, dimension: "SN", direction: "S" },
  { id: 58, dimension: "TF", direction: "F" },
  { id: 59, dimension: "SN", direction: "N" },
  { id: 60, dimension: "SN", direction: "S" },
  { id: 61, dimension: "EI", direction: "E" },
  { id: 62, dimension: "JP", direction: "J" },
  { id: 63, dimension: "TF", direction: "F" },
  { id: 64, dimension: "SN", direction: "N" }
];

const typeSummaries = {
  ISTJ: "Practical, steady, and detail-oriented. Usually prefers clear systems, reliable execution, and decisions grounded in evidence.",
  ISFJ: "Supportive, careful, and responsible. Often notices people's needs and works quietly to keep things stable and well cared for.",
  INFJ: "Insightful, values-led, and future-minded. Often combines empathy with a strong sense of purpose and long-range meaning.",
  INTJ: "Strategic, independent, and analytical. Usually prefers clear models, long-term planning, and efficient systems.",
  ISTP: "Observant, adaptable, and pragmatic. Often solves problems hands-on and stays calm when situations shift quickly.",
  ISFP: "Gentle, values-aware, and flexible. Often prefers authentic expression, personal space, and practical kindness.",
  INFP: "Reflective, idealistic, and empathetic. Usually guided by inner values and drawn to meaning, creativity, and personal growth.",
  INTP: "Curious, analytical, and concept-driven. Often enjoys theories, systems, and independent problem solving.",
  ESTP: "Energetic, direct, and action-oriented. Usually learns by doing and responds quickly to real-world opportunities.",
  ESFP: "Expressive, warm, and spontaneous. Often brings energy to groups and pays close attention to immediate experience.",
  ENFP: "Imaginative, people-oriented, and possibility-focused. Often connects ideas quickly and brings enthusiasm to new paths.",
  ENTP: "Inventive, quick-thinking, and debate-friendly. Usually enjoys exploring possibilities, testing assumptions, and reworking ideas.",
  ESTJ: "Organized, decisive, and practical. Often values structure, accountability, and getting measurable things done.",
  ESFJ: "Friendly, conscientious, and community-minded. Usually works to maintain harmony, support people, and create dependable routines.",
  ENFJ: "Encouraging, empathetic, and organized around people. Often helps groups align around shared purpose and growth.",
  ENTJ: "Decisive, strategic, and goal-driven. Usually focuses on direction, efficiency, and leading systems toward outcomes."
};

function strengthLabel(percent) {
  if (percent <= 1) return "Marginal or no";
  if (percent <= 20) return "Slight";
  if (percent <= 50) return "Moderate";
  if (percent <= 75) return "Clear";
  return "Very clear";
}

function describeTrait(trait) {
  const names = {
    E: "Extraversion",
    I: "Introversion",
    S: "Sensing",
    N: "Intuition",
    T: "Thinking",
    F: "Feeling",
    J: "Judging",
    P: "Perceiving"
  };
  return names[trait] || trait;
}

export function scoreAssessment(answers) {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  let neutralCount = 0;

  questionScoring.forEach((question, index) => {
    const responseValue = responseValues[answers[index]] ?? 0;
    const value = responseWeights[responseValue] ?? 0;
    if (!value) {
      neutralCount += 1;
      return;
    }

    const trait = value > 0 ? question.direction : oppositeTrait[question.direction];
    scores[trait] += Math.abs(value);
  });

  const resultDimensions = {};
  const typeLetters = [];

  Object.entries(dimensions).forEach(([key, meta]) => {
    const leftScore = scores[meta.left];
    const rightScore = scores[meta.right];
    const winner = leftScore >= rightScore ? meta.left : meta.right;
    const loser = winner === meta.left ? meta.right : meta.left;
    const rawPercent = Math.floor((Math.abs(leftScore - rightScore) / 32) * 100);
    const percent = rawPercent === 0 ? 1 : rawPercent;

    typeLetters.push(winner);
    resultDimensions[key] = {
      winner,
      loser,
      winnerName: describeTrait(winner),
      loserName: describeTrait(loser),
      left: meta.left,
      right: meta.right,
      leftName: meta.leftName,
      rightName: meta.rightName,
      leftScore,
      rightScore,
      strength: percent,
      label: strengthLabel(percent),
      signedPreference: winner === meta.left ? -percent : percent
    };
  });

  const type = typeLetters.join("");
  const typeTitle = type
    .split("")
    .map((trait) => describeTrait(trait))
    .join(" ");

  return {
    type,
    typeTitle,
    scores,
    dimensions: resultDimensions,
    neutralCount,
    summary: typeSummaries[type] || "This profile reflects the strongest trait preferences shown by the submitted responses.",
    notes: "Percentages use the observed Humanmetrics-style preference scale: strong answers contribute 6 points, moderate answers contribute 3 points, neutral answers contribute 0, and exact ties display as a 1% marginal preference toward E/S/T/J."
  };
}
