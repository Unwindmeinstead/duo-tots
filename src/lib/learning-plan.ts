import { categories, type CategoryId } from "./vocab";

export type LearningPrinciple = {
  id: string;
  title: string;
  summary: string;
  action: string;
  evidence: string;
};

export type LearningRitual = {
  id: string;
  title: string;
  duration: string;
  outcome: string;
  steps: string[];
};

export type LearningPhase = {
  id: string;
  title: string;
  description: string;
  target: string;
  cadence: string;
  categoryIds: CategoryId[];
};

export const learningPrinciples: LearningPrinciple[] = [
  {
    id: "dialogic-reading",
    title: "Interactive talk beats passive exposure",
    summary: "Kids learn faster when adults turn pictures into back-and-forth conversation instead of one-way labeling.",
    action: "Ask, wait, respond, then expand the child’s answer with one richer phrase.",
    evidence: "Dialogic reading meta-analysis: Mol, Bus, de Jong, & Smeets (2008), DOI 10.1080/10409280701838603.",
  },
  {
    id: "oral-language",
    title: "Build vocabulary inside real oral language",
    summary: "Words stick better when children hear them in short explanations, comparisons, and simple narratives.",
    action: "For every card, pair the label with a tiny sentence such as 'The tiger is big' or 'We use a spoon to eat.'",
    evidence: "IES/WWC Foundational Skills Practice Guide (2016, revised 2019): teach vocabulary, inferential language, and narrative language together.",
  },
  {
    id: "retrieval",
    title: "Recall is stronger than rereading",
    summary: "Trying to remember the answer strengthens memory more reliably than just looking again.",
    action: "Use short quizzes after lessons, then come back to the same topic later rather than drilling one long block.",
    evidence: "Agarwal, Nunes, & Blunt (2021), Retrieval Practice Consistently Benefits Student Learning: systematic review of applied school research.",
  },
  {
    id: "spacing",
    title: "Small spaced sessions outperform cramming",
    summary: "Young learners do better with brief, repeated sessions spread across days.",
    action: "Run one focused lesson, one fast quiz, and one short review later in the day or the next day.",
    evidence: "Dunlosky et al. (2013), Improving Students’ Learning With Effective Learning Techniques: spaced practice and practice testing are high-utility strategies.",
  },
  {
    id: "feedback",
    title: "Feedback should be immediate and specific",
    summary: "Children improve faster when feedback tells them what happened and what to do next, not just whether they were right.",
    action: "Use quick reinforcement: 'Yes, that’s a zebra' or 'That one was zebra, let’s say it together.'",
    evidence: "Hattie & Timperley (2007), The Power of Feedback, DOI 10.3102/003465430298487.",
  },
];

export const dailyRituals: LearningRitual[] = [
  {
    id: "preview",
    title: "Preview Burst",
    duration: "2 minutes",
    outcome: "Prime attention and curiosity.",
    steps: [
      "Open one topic and preview 3 to 5 cards.",
      "Name each picture once, then use one tiny sentence.",
      "Ask the child to point, repeat, or choose between two options.",
    ],
  },
  {
    id: "deep-practice",
    title: "Focused Lesson",
    duration: "4 to 6 minutes",
    outcome: "Teach a compact set without overload.",
    steps: [
      "Run through a single topic in lesson mode.",
      "Tap audio and encourage one spoken repetition.",
      "For difficult cards, add a contrast such as 'lion vs tiger' or 'cup vs plate.'",
    ],
  },
  {
    id: "retrieval-loop",
    title: "Retrieval Loop",
    duration: "2 to 3 minutes",
    outcome: "Strengthen recall through effort.",
    steps: [
      "Use quiz mode immediately after the lesson.",
      "Stop after a few wins if attention drops.",
      "Revisit the same topic later instead of extending the same sitting.",
    ],
  },
];

export const weeklyCadence = [
  { day: "Day 1", focus: "New topic", move: "Introduce one foundation topic and finish with one short quiz." },
  { day: "Day 2", focus: "Spaced review", move: "Revisit yesterday’s topic, then add one adjacent topic." },
  { day: "Day 3", focus: "Contrast", move: "Mix two related topics so the child learns to discriminate similar items." },
  { day: "Day 4", focus: "Recall", move: "Lean on quizzes and spoken recall with less direct prompting." },
  { day: "Day 5", focus: "Real-world transfer", move: "Point out the same words at home, outside, or in books." },
  { day: "Weekend", focus: "Light repetition", move: "Use quick playful reviews, not full drills." },
];

export const learningPhases: LearningPhase[] = [
  {
    id: "foundation",
    title: "Foundation Language",
    description: "Start with the words children can see, touch, act out, and request every day.",
    target: "Build recognition, pointing, imitation, and first spoken labels.",
    cadence: "2 to 3 foundation topics per week, repeated often.",
    categoryIds: categories.filter((category) => category.stage === "foundation").slice(0, 8).map((category) => category.id),
  },
  {
    id: "world",
    title: "World Expansion",
    description: "Once basics are stable, widen the child’s vocabulary with geography, technology, people, and landmarks.",
    target: "Expand conceptual range and simple descriptions.",
    cadence: "1 new world topic plus 2 review sessions each week.",
    categoryIds: categories.filter((category) => category.stage === "world").slice(0, 6).map((category) => category.id),
  },
  {
    id: "advanced",
    title: "Big Idea Thinking",
    description: "Use advanced topics as stretch content once the child enjoys the routine and can handle comparisons.",
    target: "Practice curiosity, analogies, and richer explanations.",
    cadence: "Short exploratory sessions mixed with easier review topics.",
    categoryIds: categories.filter((category) => category.stage === "advanced").slice(0, 6).map((category) => category.id),
  },
];

export function getPhaseCategories(categoryIds: CategoryId[]) {
  return categoryIds.map((id) => categories.find((category) => category.id === id)).filter(Boolean);
}
