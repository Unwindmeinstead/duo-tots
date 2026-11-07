/* "How the World Works" — Book 1: step-through life-knowledge lessons.
   Data owner: overhaul wave WS-D, transcribed from
   goals/raising-a-future-world-leader-age-2-training-system/files/
   future-leader-age2-how-world-works-book1/.src (index.html + OUTLINE.md).
   Interface is FIXED — do not change the exported shapes; the home path
   (WS-A) and the world lesson client import them.

   Progress: completing a lesson calls completeActivity(state, nodeId, stars)
   with nodeId === `world-${id}` so stars/XP/streak pick it up automatically. */

export interface WorldLesson {
  /** slug, e.g. "rain-grows" — node id on the path is `world-${id}` */
  id: string;
  title: string;
  /** Beat 1 — the big idea, one or two short sentences a 2-year-old can hold. */
  bigIdea: string;
  /** Beat 2 — the words to say out loud together (short phrase). */
  sayIt: string;
  /** Beat 4 — a real-world action the child does with the parent. */
  doIt: string;
  /** Beat 5 — the closing question to wonder about together. */
  question: string;
  /** Beat 3 — "see it" photo: /images/world_book/<slug>.webp when generated,
      otherwise an existing local photo path that fits the lesson. */
  image: string;
  /** Accent color for the node + lesson chrome. */
  color: string;
}

export const WORLD_LESSONS: WorldLesson[] = [
  {
    id: "me-family-home",
    title: "Me, my family, my home",
    bigIdea: "You belong to people who love you. Your home keeps you safe and warm.",
    sayIt: "This is me. This is my family.",
    doIt: "Build your home from blocks together. Put a toy person inside for everyone in your family.",
    question: "Who do you love in our home?",
    image: "/images/world_book/me-family-home.webp",
    color: "#FF9F2E",
  },
  {
    id: "who-is-in-charge",
    title: "Who is in charge",
    bigIdea: "Every place has a leader. A good leader helps, protects, and listens.",
    sayIt: "A leader helps people. A leader listens.",
    doIt: "Play leader of the parade! You lead and we follow your steps. Then swap — now you follow.",
    question: "If you were the leader today, how would you help us?",
    image: "/images/world_book/who-is-in-charge.webp",
    color: "#8B5CF6",
  },
  {
    id: "rules-keep-us-safe",
    title: "Rules keep us safe",
    bigIdea: "Rules keep us safe. We stop at the road, and we use gentle hands.",
    sayIt: "Stop. Look. Listen. Rules keep us safe.",
    doIt: "Play red light, green light! Red means freeze. Green means go. You hold the cards and lead.",
    question: "What rule keeps you safe?",
    image: "/images/world_book/rules-keep-us-safe.webp",
    color: "#FF7A59",
  },
  {
    id: "people-who-help",
    title: "People who help",
    bigIdea: "Many people help us every day. Every job matters.",
    sayIt: "Thank you for helping!",
    doIt: "Play helpers! Take turns with a toy stethoscope or a helper hat. Be the helper, then say thank you.",
    question: "Which helper would you like to be today?",
    image: "/images/world_book/people-who-help.webp",
    color: "#34C759",
  },
  {
    id: "food-gets-to-us",
    title: "How food gets to us",
    bigIdea: "Food travels a long way to your plate. A farmer grows it, a truck brings it, and we say thank you.",
    sayIt: "Thank you, farmer. Thank you, driver.",
    doIt: "Plant a seed in a cup of soil together. Water it every day and watch it grow.",
    question: "Who helped bring this food to us?",
    image: "/images/food/apple.webp",
    color: "#FFA826",
  },
  {
    id: "where-water-comes-from",
    title: "Where water comes from",
    bigIdea: "Rain fills the rivers. Water travels in pipes to our home and out of the tap.",
    sayIt: "Water is precious. We turn the tap off.",
    doIt: "Pour water play with two cups and a jug. Then practise turning the tap all the way off — no drips!",
    question: "Where does the water in your cup come from?",
    image: "/images/kid_general/faucet.webp",
    color: "#2B7FFF",
  },
  {
    id: "day-night-sun-moon",
    title: "Day, night, sun and moon",
    bigIdea: "Day and night take turns. The sun wakes us up to play, and the moon guards our sleep.",
    sayIt: "Good morning, sun! Good night, moon.",
    doIt: "Shine a flashlight on a ball and turn it slowly. When our mark faces the light, it is day. When it turns away, it is night!",
    question: "Is it the sun's turn now, or the moon's turn?",
    image: "/images/nature/sun.webp",
    color: "#F0519B",
  },
  {
    id: "weather-and-seasons",
    title: "Weather and seasons",
    bigIdea: "The sky changes every day. We look, we notice, and we dress for the weather.",
    sayIt: "What is the weather today?",
    doIt: "Dress the teddy bear! Call out the weather — rain, sun, snow — and dress the bear to match.",
    question: "What will you wear for this weather?",
    image: "/images/nature/rain.webp",
    color: "#17BEBB",
  },
  {
    id: "animals-and-homes",
    title: "Animals and their homes",
    bigIdea: "Animals need food, a home, and family — just like you. We look with gentle eyes.",
    sayIt: "Every animal has a home.",
    doIt: "Build animal homes from blocks and blankets — a nest for a toy bird, a den for a bear — and feed each animal.",
    question: "Where does this animal live, and what does it need?",
    image: "/images/nature/nest.webp",
    color: "#FF6FA5",
  },
  {
    id: "plants-grow-slow",
    title: "Plants and trees grow slow",
    bigIdea: "A tiny seed grows slowly with water and care. Good things grow slow.",
    sayIt: "Good things grow slow.",
    doIt: "Water your seed with a tiny cup every day. Each week, measure the sprout against your hand — growing, slowly!",
    question: "What is something good that grows slowly?",
    image: "/images/nature/seed.webp",
    color: "#9BC53D",
  },
  {
    id: "how-things-move",
    title: "How things move",
    bigIdea: "Legs walk, wheels roll, boats float, and planes fly. We can push, and we can pull.",
    sayIt: "Wheels roll round and round. Vroom!",
    doIt: "Make a ramp from a book. Roll a ball and a toy car down it. Higher ramp — faster! Does a block roll or slide?",
    question: "What is the fastest way this could move?",
    image: "/images/toys/bicycle.webp",
    color: "#38BDF8",
  },
  {
    id: "how-things-are-built",
    title: "How things are built",
    bigIdea: "Builders make a plan, then build step by step. When it falls, they fix it and try again.",
    sayIt: "Fix it and try again!",
    doIt: "Make a plan first — say what you will build. Build it step by step with blocks. If it falls, say: fix it and try again!",
    question: "What will you build, and what is your first step?",
    image: "/images/toys/blocks.webp",
    color: "#D64FD6",
  },
  {
    id: "money-and-trading",
    title: "Money and trading, simply",
    bigIdea: "Money is how we say thank you for work. Someone made or grew everything we use.",
    sayIt: "Thank you for your work.",
    doIt: "Play shop with a basket, play food, and paper money. For every thing you sell, name who made it — then say thank you.",
    question: "Who made this — and how can we thank them?",
    image: "/images/world_book/money-and-trading.webp",
    color: "#3ED6A5",
  },
  {
    id: "our-earth",
    title: "Our Earth and big issues, gently",
    bigIdea: "Earth is our big home. Leaders take care of people, animals, and our Earth.",
    sayIt: "We take care of our Earth.",
    doIt: "Do one helping thing together: fill a bird feeder, water a thirsty plant, or pack a small bag of food to share.",
    question: "Who can we help today?",
    image: "/images/world_book/our-earth.webp",
    color: "#5B6BE0",
  },
];

export function getWorldLesson(id: string): WorldLesson | undefined {
  return WORLD_LESSONS.find((l) => l.id === id);
}

export function worldNodeId(lessonId: string): string {
  return `world-${lessonId}`;
}
