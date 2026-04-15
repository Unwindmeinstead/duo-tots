export type CategoryId =
  | "animals"
  | "food"
  | "toys"
  | "colors"
  | "body"
  | "family"
  | "us_presidents"
  | "modern_terms"
  | "world_basics"
  | "leadership"
  | "money"
  | "finance"
  | "space"
  | "universe"
  | "physics";

export type VocabItem = {
  id: string;
  word: string;
  imageQuery: string;
  fallbackImage: string;
};

export type VocabCategory = {
  id: CategoryId;
  name: string;
  icon: string;
  description: string;
  items: VocabItem[];
};

const fallbackImage = (seed: string) =>
  `https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80&${seed}`;

const makeItems = (prefix: string, words: Array<{ word: string; query?: string }>): VocabItem[] =>
  words.map(({ word, query }) => ({
    id: `${prefix}-${word.toLowerCase()}`,
    word,
    imageQuery: query ?? word,
    fallbackImage: fallbackImage(word.toLowerCase()),
  }));

export const categories: VocabCategory[] = [
  {
    id: "animals",
    name: "Animals",
    icon: "🐶",
    description: "Friendly animals your child sees every day.",
    items: makeItems("animals", [
      { word: "Dog" },
      { word: "Cat" },
      { word: "Bird" },
      { word: "Fish" },
      { word: "Horse" },
      { word: "Cow" },
      { word: "Rabbit" },
      { word: "Duck" },
    ]),
  },
  {
    id: "food",
    name: "Food",
    icon: "🍎",
    description: "Tasty food words for mealtime conversations.",
    items: makeItems("food", [
      { word: "Apple" },
      { word: "Banana" },
      { word: "Milk" },
      { word: "Bread" },
      { word: "Egg" },
      { word: "Rice" },
      { word: "Cheese" },
      { word: "Carrot" },
    ]),
  },
  {
    id: "toys",
    name: "Toys",
    icon: "🧸",
    description: "Playtime objects children already love.",
    items: makeItems("toys", [
      { word: "Ball", query: "Toy ball" },
      { word: "Blocks", query: "Toy block" },
      { word: "Puzzle", query: "Jigsaw puzzle" },
      { word: "Car", query: "Toy car" },
      { word: "Doll", query: "Toy doll" },
      { word: "Train", query: "Toy train" },
      { word: "Book", query: "Children's book" },
      { word: "Drum", query: "Toy drum" },
    ]),
  },
  {
    id: "colors",
    name: "Colors",
    icon: "🌈",
    description: "Basic color names with visual examples.",
    items: makeItems("colors", [
      { word: "Red", query: "Red color" },
      { word: "Blue", query: "Blue color" },
      { word: "Green", query: "Green color" },
      { word: "Yellow", query: "Yellow color" },
      { word: "Orange", query: "Orange color" },
      { word: "Purple", query: "Purple color" },
      { word: "Pink", query: "Pink color" },
      { word: "White", query: "White color" },
    ]),
  },
  {
    id: "body",
    name: "Body",
    icon: "🖐️",
    description: "Body part words toddlers can point to.",
    items: makeItems("body", [
      { word: "Eyes", query: "Human eye" },
      { word: "Nose", query: "Human nose" },
      { word: "Mouth", query: "Human mouth" },
      { word: "Ear", query: "Human ear" },
      { word: "Hand", query: "Human hand" },
      { word: "Foot", query: "Human foot" },
      { word: "Hair", query: "Human hair" },
      { word: "Teeth", query: "Human tooth" },
    ]),
  },
  {
    id: "family",
    name: "Family",
    icon: "🏡",
    description: "Words for the people closest to them.",
    items: makeItems("family", [
      { word: "Mom", query: "Mother" },
      { word: "Dad", query: "Father" },
      { word: "Baby" },
      { word: "Sister" },
      { word: "Brother" },
      { word: "Grandma", query: "Grandmother" },
      { word: "Grandpa", query: "Grandfather" },
      { word: "Friend" },
    ]),
  },
  {
    id: "us_presidents",
    name: "US Presidents",
    icon: "🇺🇸",
    description: "Early familiarity with important American leaders.",
    items: makeItems("us-presidents", [
      { word: "George Washington" },
      { word: "Abraham Lincoln" },
      { word: "Theodore Roosevelt" },
      { word: "Franklin Roosevelt", query: "Franklin D. Roosevelt" },
      { word: "John Kennedy", query: "John F. Kennedy" },
      { word: "Ronald Reagan" },
      { word: "Barack Obama" },
      { word: "Joe Biden" },
    ]),
  },
  {
    id: "modern_terms",
    name: "Modern Terms",
    icon: "🚀",
    description: "Big ideas children hear in the modern world.",
    items: makeItems("modern-terms", [
      { word: "Internet" },
      { word: "Robot" },
      { word: "Satellite" },
      { word: "Electric Car" },
      { word: "Solar Power" },
      { word: "Computer" },
      { word: "Smart Phone", query: "Smartphone" },
      { word: "Artificial Intelligence", query: "Artificial intelligence" },
    ]),
  },
  {
    id: "world_basics",
    name: "World Basics",
    icon: "🌍",
    description: "Core global words for geography and culture.",
    items: makeItems("world-basics", [
      { word: "Earth", query: "Planet Earth" },
      { word: "Ocean" },
      { word: "Mountain" },
      { word: "Continent" },
      { word: "Map" },
      { word: "Flag" },
      { word: "City" },
      { word: "Country" },
    ]),
  },
  {
    id: "leadership",
    name: "Leadership",
    icon: "👑",
    description: "Words that build confidence, character, and leadership.",
    items: makeItems("leadership", [
      { word: "Leader" },
      { word: "Courage" },
      { word: "Respect" },
      { word: "Teamwork" },
      { word: "Kindness" },
      { word: "Responsibility" },
      { word: "Decision" },
      { word: "Vision" },
    ]),
  },
  {
    id: "money",
    name: "Money Basics",
    icon: "💵",
    description: "Early money words every child should recognize.",
    items: makeItems("money", [
      { word: "Coin" },
      { word: "Dollar", query: "United States dollar" },
      { word: "Wallet" },
      { word: "Piggy Bank" },
      { word: "Cash" },
      { word: "Price Tag", query: "Price tag" },
      { word: "Store" },
      { word: "Receipt" },
    ]),
  },
  {
    id: "finance",
    name: "Finance",
    icon: "📈",
    description: "Core finance concepts in child-friendly terms.",
    items: makeItems("finance", [
      { word: "Save", query: "Savings" },
      { word: "Spend", query: "Spending" },
      { word: "Budget" },
      { word: "Bank" },
      { word: "Invest", query: "Investment" },
      { word: "Stock Market", query: "Stock market" },
      { word: "Business" },
      { word: "Profit" },
    ]),
  },
  {
    id: "space",
    name: "Space",
    icon: "🚀",
    description: "Exciting space words to spark big curiosity.",
    items: makeItems("space", [
      { word: "Rocket" },
      { word: "Astronaut" },
      { word: "Moon" },
      { word: "Mars" },
      { word: "Space Station", query: "International Space Station" },
      { word: "Telescope" },
      { word: "Comet" },
      { word: "Galaxy" },
    ]),
  },
  {
    id: "universe",
    name: "Universe",
    icon: "🌌",
    description: "Big-picture cosmic ideas and objects.",
    items: makeItems("universe", [
      { word: "Universe" },
      { word: "Star" },
      { word: "Planet" },
      { word: "Solar System", query: "Solar System" },
      { word: "Milky Way", query: "Milky Way" },
      { word: "Black Hole", query: "Black hole" },
      { word: "Nebula" },
      { word: "Orbit" },
    ]),
  },
  {
    id: "physics",
    name: "Physics",
    icon: "⚛️",
    description: "Foundational physics words for future problem-solvers.",
    items: makeItems("physics", [
      { word: "Force" },
      { word: "Energy" },
      { word: "Motion" },
      { word: "Gravity" },
      { word: "Speed" },
      { word: "Light" },
      { word: "Magnet" },
      { word: "Atom" },
    ]),
  },
];

export const categoriesById = categories.reduce<Record<CategoryId, VocabCategory>>(
  (acc, category) => {
    acc[category.id] = category;
    return acc;
  },
  {} as Record<CategoryId, VocabCategory>,
);
