export type CategoryId =
  | "animals"
  | "food"
  | "toys"
  | "colors"
  | "body"
  | "family";

export type VocabItem = {
  id: string;
  word: string;
  image: string;
};

export type VocabCategory = {
  id: CategoryId;
  name: string;
  icon: string;
  description: string;
  items: VocabItem[];
};

const makeItems = (prefix: string, words: string[]): VocabItem[] =>
  words.map((word) => ({
    id: `${prefix}-${word.toLowerCase()}`,
    word,
    image: `https://loremflickr.com/900/700/${encodeURIComponent(word.toLowerCase())}`,
  }));

export const categories: VocabCategory[] = [
  {
    id: "animals",
    name: "Animals",
    icon: "🐶",
    description: "Friendly animals your child sees every day.",
    items: makeItems("animals", [
      "Dog",
      "Cat",
      "Bird",
      "Fish",
      "Horse",
      "Cow",
      "Rabbit",
      "Duck",
    ]),
  },
  {
    id: "food",
    name: "Food",
    icon: "🍎",
    description: "Tasty food words for mealtime conversations.",
    items: makeItems("food", [
      "Apple",
      "Banana",
      "Milk",
      "Bread",
      "Egg",
      "Rice",
      "Cheese",
      "Carrot",
    ]),
  },
  {
    id: "toys",
    name: "Toys",
    icon: "🧸",
    description: "Playtime objects children already love.",
    items: makeItems("toys", [
      "Ball",
      "Blocks",
      "Puzzle",
      "Car",
      "Doll",
      "Train",
      "Book",
      "Drum",
    ]),
  },
  {
    id: "colors",
    name: "Colors",
    icon: "🌈",
    description: "Basic color names with visual examples.",
    items: makeItems("colors", [
      "Red",
      "Blue",
      "Green",
      "Yellow",
      "Orange",
      "Purple",
      "Pink",
      "White",
    ]),
  },
  {
    id: "body",
    name: "Body",
    icon: "🖐️",
    description: "Body part words toddlers can point to.",
    items: makeItems("body", [
      "Eyes",
      "Nose",
      "Mouth",
      "Ear",
      "Hand",
      "Foot",
      "Hair",
      "Teeth",
    ]),
  },
  {
    id: "family",
    name: "Family",
    icon: "🏡",
    description: "Words for the people closest to them.",
    items: makeItems("family", [
      "Mom",
      "Dad",
      "Baby",
      "Sister",
      "Brother",
      "Grandma",
      "Grandpa",
      "Friend",
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
