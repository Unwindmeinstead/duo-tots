export type CategoryId =
  | "actions" | "emotions" | "shapes" | "numbers" | "everyday" | "nature"
  | "animals" | "food" | "toys" | "colors" | "body" | "family" | "kid_general"
  | "us_presidents" | "modern_terms" | "world_basics" | "leadership"
  | "money" | "finance" | "space" | "universe" | "physics"
  | "top_people" | "inventions" | "landmarks";

export type Stage = "foundation" | "world" | "advanced";

export type ImageMode = "photo" | "vector" | "color" | "digit" | "shape" | "static" | "card" | "action";

export type VocabItem = { id: string; word: string; imageQuery: string; assetKey?: string };

export type VocabCategory = {
  id: CategoryId;
  name: string;
  color: string;
  stage: Stage;
  description: string;
  imageMode: ImageMode;
  items: VocabItem[];
};

const m = (prefix: string, words: Array<{ word: string; q?: string; a?: string }>): VocabItem[] =>
  words.map(({ word, q, a }) => ({
    id: `${prefix}-${word.toLowerCase().replace(/\s+/g, "-")}`,
    word,
    imageQuery: q ?? word,
    assetKey: a,
  }));

export const categories: VocabCategory[] = [
  /* ═══ FOUNDATION (first words a 2yo needs) ═══ */
  {
    id: "actions", name: "Actions", color: "#ff9500", stage: "foundation", imageMode: "action",
    description: "Verbs are how toddlers request and describe the world.",
    items: m("act", [
      { word: "Run" }, { word: "Jump" }, { word: "Eat" }, { word: "Sleep" },
      { word: "Walk" }, { word: "Play" }, { word: "Dance" }, { word: "Sing" },
      { word: "Clap" }, { word: "Wave" }, { word: "Cry" }, { word: "Laugh" },
      { word: "Sit" }, { word: "Stand" }, { word: "Push" }, { word: "Pull" },
      { word: "Throw" }, { word: "Catch" }, { word: "Hug" }, { word: "Kiss" },
    ]),
  },
  {
    id: "emotions", name: "Emotions", color: "#ff3b30", stage: "foundation", imageMode: "vector",
    description: "Naming feelings builds emotional intelligence early.",
    items: m("emo", [
      { word: "Happy" }, { word: "Sad" }, { word: "Angry" }, { word: "Scared" },
      { word: "Excited" }, { word: "Tired" }, { word: "Hungry" },
      { word: "Surprised", q: "Surprise (emotion)" }, { word: "Proud" },
      { word: "Shy" }, { word: "Brave" }, { word: "Calm" }, { word: "Silly" },
      { word: "Curious" }, { word: "Gentle" }, { word: "Loud" },
      { word: "Quiet" }, { word: "Strong" }, { word: "Kind" }, { word: "Love" },
    ]),
  },
  {
    id: "shapes", name: "Shapes", color: "#af52de", stage: "foundation", imageMode: "shape",
    description: "Spatial reasoning starts with recognizing shapes.",
    items: m("shp", [
      { word: "Circle" }, { word: "Square" }, { word: "Triangle" },
      { word: "Rectangle" }, { word: "Star", q: "Star shape" },
      { word: "Heart", q: "Heart symbol" }, { word: "Diamond", q: "Rhombus" },
      { word: "Oval" }, { word: "Arrow", q: "Arrow symbol" },
      { word: "Crescent", q: "Crescent" }, { word: "Hexagon" },
      { word: "Sphere" }, { word: "Cube" }, { word: "Cylinder" },
      { word: "Cone" }, { word: "Spiral" }, { word: "Cross", q: "Cross symbol" },
      { word: "Pentagon" }, { word: "Octagon" }, { word: "Pyramid", q: "Pyramid (geometry)" },
    ]),
  },
  {
    id: "numbers", name: "Numbers", color: "#0071e3", stage: "foundation", imageMode: "digit",
    description: "Counting is the gateway to all mathematics.",
    items: Array.from({ length: 101 }, (_, i) => ({ id: `num-${i}`, word: String(i), imageQuery: String(i) })),
  },
  {
    id: "everyday", name: "Everyday", color: "#636366", stage: "foundation", imageMode: "static",
    description: "Objects a child sees and touches every single day.",
    items: m("day", [
      { word: "Chair", a: "chair" }, { word: "Table", a: "table" }, { word: "Door", a: "door" }, { word: "Window", a: "window" },
      { word: "Bed", a: "bed" }, { word: "Clock", a: "clock" }, { word: "Lamp", a: "lamp" }, { word: "Cup", a: "cup" },
      { word: "Plate", a: "plate" }, { word: "Spoon", a: "spoon" }, { word: "Shoe", a: "shoe" }, { word: "Shirt", a: "shirt" },
      { word: "Hat", a: "hat" }, { word: "Bag", a: "bag" }, { word: "Key", a: "key" }, { word: "Phone", q: "Telephone", a: "telephone" },
      { word: "Mirror", a: "mirror" }, { word: "Soap", a: "soap" }, { word: "Towel", a: "towel" }, { word: "Brush", q: "Hairbrush", a: "hairbrush" },
    ]),
  },
  {
    id: "nature", name: "Nature", color: "#34c759", stage: "foundation", imageMode: "vector",
    description: "The natural world builds wonder and observation skills.",
    items: m("nat", [
      { word: "Tree" }, { word: "Flower" }, { word: "Rain" }, { word: "Sun" },
      { word: "Cloud" }, { word: "Snow" }, { word: "Wind" }, { word: "Leaf" },
      { word: "Grass" }, { word: "Rock", q: "Rock (geology)" }, { word: "Mud" },
      { word: "Sand" }, { word: "Rainbow" }, { word: "River" }, { word: "Hill" },
      { word: "Seed" }, { word: "Nest", q: "Bird nest" }, { word: "Bee" },
      { word: "Sky" }, { word: "Moon" },
    ]),
  },
  {
    id: "animals", name: "Animals", color: "#58cc02", stage: "foundation", imageMode: "static",
    description: "Friendly animals your child sees every day.",
    items: m("ani", [
      { word: "Dog" }, { word: "Cat" }, { word: "Bird" }, { word: "Fish" },
      { word: "Horse" }, { word: "Cow" }, { word: "Rabbit" }, { word: "Duck" },
      { word: "Elephant" }, { word: "Lion" }, { word: "Tiger" }, { word: "Bear" },
      { word: "Penguin" }, { word: "Dolphin" }, { word: "Butterfly" }, { word: "Frog" },
      { word: "Turtle" }, { word: "Owl" }, { word: "Sheep" }, { word: "Chicken" },
      { word: "Pig" }, { word: "Monkey" }, { word: "Giraffe" }, { word: "Zebra" },
      { word: "Whale" }, { word: "Snake" }, { word: "Bee" }, { word: "Mouse" },
      { word: "Deer" }, { word: "Fox" },
    ]),
  },
  {
    id: "food", name: "Food", color: "#ff9500", stage: "foundation", imageMode: "vector",
    description: "Tasty food words for mealtime conversations.",
    items: m("food", [
      { word: "Apple" }, { word: "Banana" }, { word: "Milk" }, { word: "Bread" },
      { word: "Egg", q: "Egg (food)" }, { word: "Rice" }, { word: "Cheese" },
      { word: "Carrot" }, { word: "Strawberry" }, { word: "Watermelon" },
      { word: "Pizza" }, { word: "Pasta" }, { word: "Soup" },
      { word: "Orange", q: "Orange (fruit)" }, { word: "Grape" },
      { word: "Corn" }, { word: "Tomato" }, { word: "Potato" },
      { word: "Ice Cream", q: "Ice cream" }, { word: "Chocolate" },
    ]),
  },
  {
    id: "toys", name: "Toys", color: "#1cb0f6", stage: "foundation", imageMode: "vector",
    description: "Playtime objects children already love.",
    items: m("toy", [
      { word: "Ball" }, { word: "Blocks", q: "Toy block" },
      { word: "Puzzle", q: "Jigsaw puzzle" }, { word: "Car", q: "Toy car" },
      { word: "Doll" }, { word: "Train", q: "Toy train" },
      { word: "Book", q: "Picture book" }, { word: "Drum" },
      { word: "Teddy Bear", q: "Teddy bear" }, { word: "Kite" },
      { word: "Yo-yo" }, { word: "Crayon" }, { word: "Bicycle" },
      { word: "Swing", q: "Swing (seat)" }, { word: "Balloon" },
      { word: "Skateboard" }, { word: "Lego" }, { word: "Robot" },
      { word: "Sandbox" }, { word: "Slide", q: "Playground slide" },
    ]),
  },
  {
    id: "colors", name: "Colors", color: "#af52de", stage: "foundation", imageMode: "color",
    description: "Basic color names with visual examples.",
    items: m("col", [
      { word: "Red" }, { word: "Blue" }, { word: "Green" }, { word: "Yellow" },
      { word: "Orange", q: "Orange (colour)" }, { word: "Purple" },
      { word: "Pink" }, { word: "White" }, { word: "Black" }, { word: "Brown" },
      { word: "Gold", q: "Gold (color)" }, { word: "Silver", q: "Silver (color)" },
      { word: "Gray", q: "Grey" }, { word: "Cyan" }, { word: "Magenta" },
      { word: "Indigo" }, { word: "Turquoise", q: "Turquoise (color)" },
      { word: "Maroon" }, { word: "Navy", q: "Navy blue" }, { word: "Beige" },
    ]),
  },
  {
    id: "body", name: "Body", color: "#ff3b30", stage: "foundation", imageMode: "vector",
    description: "Body part words toddlers can point to.",
    items: m("bod", [
      { word: "Eyes", q: "Human eye" }, { word: "Nose", q: "Human nose" },
      { word: "Mouth", q: "Human mouth" }, { word: "Ear" }, { word: "Hand" },
      { word: "Foot" }, { word: "Hair" }, { word: "Teeth", q: "Human tooth" },
      { word: "Arm" }, { word: "Leg", q: "Human leg" }, { word: "Finger" },
      { word: "Thumb" }, { word: "Knee" }, { word: "Elbow" },
      { word: "Shoulder" }, { word: "Belly", q: "Abdomen" },
      { word: "Back", q: "Human back" }, { word: "Neck" },
      { word: "Chin" }, { word: "Forehead" },
    ]),
  },
  {
    id: "family", name: "Family", color: "#0071e3", stage: "foundation", imageMode: "vector",
    description: "Words for the people closest to them.",
    items: m("fam", [
      { word: "Mom", q: "Mother" }, { word: "Dad", q: "Father" },
      { word: "Baby", q: "Infant" }, { word: "Sister" }, { word: "Brother" },
      { word: "Grandma", q: "Grandmother" }, { word: "Grandpa", q: "Grandfather" },
      { word: "Friend", q: "Friendship" }, { word: "Uncle" }, { word: "Aunt" },
      { word: "Cousin" }, { word: "Family" }, { word: "Twin" },
      { word: "Neighbor", q: "Neighbour" }, { word: "Teacher" },
      { word: "Doctor", q: "Physician" }, { word: "Pet" },
      { word: "Home" }, { word: "Love" }, { word: "Hug" },
    ]),
  },
  {
    id: "kid_general", name: "100 Words", color: "#5ac8fa", stage: "foundation", imageMode: "vector",
    description: "A broad mix of school, home, food, clothes, animals, and places — all in one big list.",
    items: m("gen", [
      { word: "Pencil" }, { word: "Eraser" }, { word: "Ruler" }, { word: "Backpack" },
      { word: "Scissors" }, { word: "Glue", q: "Glue stick" }, { word: "Notebook" }, { word: "Marker", q: "Marker pen" },
      { word: "Stapler" }, { word: "Tape", q: "Adhesive tape" },
      { word: "School Bus", q: "School bus" }, { word: "Firefighter" }, { word: "Police Officer", q: "Police officer" },
      { word: "Ambulance" }, { word: "Garbage Truck", q: "Garbage truck" }, { word: "Tractor" },
      { word: "Helicopter" }, { word: "Boat" }, { word: "Jet", q: "Jet airplane" }, { word: "Subway", q: "Subway train" },
      { word: "Kitchen" }, { word: "Bedroom" }, { word: "Bathroom" }, { word: "Living Room", q: "Living room" },
      { word: "Garage" }, { word: "Basement" }, { word: "Hallway" }, { word: "Backyard", q: "Backyard" },
      { word: "Front Door", q: "Front door" }, { word: "Roof" },
      { word: "Pillow" }, { word: "Blanket" }, { word: "Laundry" }, { word: "Bathtub" },
      { word: "Shower" }, { word: "Toilet" }, { word: "Faucet" }, { word: "Stove", q: "Kitchen stove" },
      { word: "Oven" }, { word: "Dishwasher" },
      { word: "Microwave" }, { word: "Vacuum", q: "Vacuum cleaner" }, { word: "Broom" }, { word: "Mop" },
      { word: "Bucket" }, { word: "Sponge" }, { word: "Hanger", q: "Clothes hanger" },
      { word: "Umbrella" }, { word: "Sunglasses" }, { word: "Watch", q: "Wristwatch" },
      { word: "Calendar" }, { word: "Birthday Cake", q: "Birthday cake" }, { word: "Gift" }, { word: "Party" },
      { word: "Board Game", q: "Board game" },
      { word: "Cereal" }, { word: "Sandwich" }, { word: "Juice" }, { word: "Cookie" }, { word: "Donut", q: "Donut" },
      { word: "Popcorn" }, { word: "Pancake" }, { word: "Waffle" }, { word: "Noodle", q: "Noodles" }, { word: "Muffin" },
      { word: "Smoothie" }, { word: "Pickle", q: "Pickle (food)" }, { word: "Yogurt" }, { word: "Peanut" }, { word: "Butter", q: "Butter (food)" },
      { word: "Jacket" }, { word: "Socks" }, { word: "Dress" }, { word: "Pants" }, { word: "Boots" },
      { word: "Gloves" }, { word: "Scarf" }, { word: "Belt" }, { word: "Pajamas" }, { word: "Raincoat" },
      { word: "Ladybug" }, { word: "Ant" }, { word: "Spider" }, { word: "Snail" }, { word: "Crab" },
      { word: "Octopus" }, { word: "Seahorse" }, { word: "Parrot" }, { word: "Koala" }, { word: "Sloth" },
      { word: "Raccoon" }, { word: "Bat", q: "Bat mammal" }, { word: "Hedgehog" }, { word: "Seal", q: "Seal animal" }, { word: "Walrus" },
      { word: "Peacock" }, { word: "Flamingo" }, { word: "Kangaroo" }, { word: "Rhinoceros" }, { word: "Hippopotamus" },
    ]),
  },

  /* ═══ WORLD (broaden horizons) ═══ */
  {
    id: "world_basics", name: "World", color: "#2ba84a", stage: "world", imageMode: "photo",
    description: "Core global words for geography and culture.",
    items: m("wld", [
      { word: "Earth" }, { word: "Ocean" }, { word: "Mountain" },
      { word: "Continent" }, { word: "Map" }, { word: "Flag" },
      { word: "City" }, { word: "Country" }, { word: "River" },
      { word: "Desert" }, { word: "Forest" }, { word: "Island" },
      { word: "Volcano" }, { word: "Glacier" }, { word: "Waterfall" },
      { word: "Canyon" }, { word: "Lake" }, { word: "Cave" },
      { word: "Jungle" }, { word: "Coral Reef", q: "Coral reef" },
    ]),
  },
  {
    id: "landmarks", name: "Landmarks", color: "#8e8e93", stage: "world", imageMode: "photo",
    description: "Iconic structures every future leader should recognize.",
    items: m("lmk", [
      { word: "Eiffel Tower" }, { word: "Pyramids", q: "Great Pyramid of Giza" },
      { word: "Great Wall", q: "Great Wall of China" },
      { word: "Statue of Liberty" }, { word: "Colosseum" }, { word: "Taj Mahal" },
      { word: "Big Ben" }, { word: "Mount Rushmore" },
      { word: "Golden Gate Bridge" }, { word: "Machu Picchu" },
      { word: "Stonehenge" }, { word: "Christ the Redeemer", q: "Christ the Redeemer (statue)" },
      { word: "Sydney Opera House" }, { word: "Parthenon" },
      { word: "Leaning Tower", q: "Leaning Tower of Pisa" },
      { word: "Burj Khalifa" }, { word: "Brandenburg Gate" },
      { word: "Angkor Wat" }, { word: "Petra" }, { word: "Chichen Itza" },
    ]),
  },
  {
    id: "us_presidents", name: "Presidents", color: "#1c3d7a", stage: "world", imageMode: "photo",
    description: "Early familiarity with important American leaders.",
    items: m("pres", [
      { word: "George Washington" }, { word: "John Adams" },
      { word: "Thomas Jefferson" }, { word: "Abraham Lincoln" },
      { word: "Theodore Roosevelt" },
      { word: "Franklin Roosevelt", q: "Franklin D. Roosevelt" },
      { word: "Dwight Eisenhower", q: "Dwight D. Eisenhower" },
      { word: "John Kennedy", q: "John F. Kennedy" },
      { word: "Ronald Reagan" }, { word: "Bill Clinton" },
      { word: "George W. Bush" }, { word: "Barack Obama" },
      { word: "Donald Trump" }, { word: "Joe Biden" },
      { word: "White House", q: "White House" },
      { word: "James Madison" }, { word: "Woodrow Wilson" },
      { word: "Harry Truman", q: "Harry S. Truman" },
      { word: "Richard Nixon" },
      { word: "George H.W. Bush", q: "George H. W. Bush" },
    ]),
  },
  {
    id: "top_people", name: "Great People", color: "#af52de", stage: "world", imageMode: "photo",
    description: "The most important people in history and today.",
    items: m("ppl", [
      { word: "Albert Einstein" }, { word: "Leonardo da Vinci" },
      { word: "Isaac Newton" }, { word: "Nikola Tesla" },
      { word: "Martin Luther King Jr.", q: "Martin Luther King Jr." },
      { word: "Mahatma Gandhi" }, { word: "Nelson Mandela" },
      { word: "Marie Curie" }, { word: "Elon Musk" }, { word: "Steve Jobs" },
      { word: "Alexander the Great" }, { word: "Julius Caesar" },
      { word: "Cleopatra" }, { word: "William Shakespeare" },
      { word: "Mozart", q: "Wolfgang Amadeus Mozart" },
      { word: "Genghis Khan" }, { word: "Wright Brothers", q: "Wright brothers" },
      { word: "Neil Armstrong" }, { word: "Queen Elizabeth II" },
      { word: "Aristotle" },
    ]),
  },
  {
    id: "inventions", name: "Inventions", color: "#ff9500", stage: "world", imageMode: "photo",
    description: "Breakthroughs that shaped civilization.",
    items: m("inv", [
      { word: "Wheel" }, { word: "Fire", q: "Control of fire by early humans" },
      { word: "Printing Press", q: "Printing press" },
      { word: "Telescope" }, { word: "Steam Engine", q: "Steam engine" },
      { word: "Telephone" }, { word: "Light Bulb", q: "Incandescent light bulb" },
      { word: "Airplane" }, { word: "Television" },
      { word: "Penicillin" }, { word: "Computer", q: "Computer" },
      { word: "Internet" }, { word: "Vaccine", q: "Vaccine" },
      { word: "Compass" }, { word: "Clock" }, { word: "Camera" },
      { word: "Radio" }, { word: "Refrigerator" },
      { word: "Battery", q: "Battery (electricity)" }, { word: "Rocket" },
    ]),
  },
  {
    id: "leadership", name: "Leadership", color: "#ffc800", stage: "world", imageMode: "card",
    description: "Words that build confidence, character, and leadership.",
    items: m("lead", [
      { word: "Leader", q: "Leadership" }, { word: "Courage", q: "Firefighter" },
      { word: "Respect", q: "Handshake" }, { word: "Teamwork" },
      { word: "Kindness" }, { word: "Honesty" }, { word: "Patience" },
      { word: "Bravery", q: "Medal of Honor" },
      { word: "Fairness", q: "Scales of justice" },
      { word: "Listening", q: "Active listening" },
      { word: "Sharing" }, { word: "Helping", q: "Volunteering" },
      { word: "Promise" }, { word: "Goal", q: "Goal setting" },
      { word: "Dream" }, { word: "Confidence" },
      { word: "Focus", q: "Attention" }, { word: "Champion" },
      { word: "Hero" }, { word: "Victory" },
    ]),
  },
  {
    id: "modern_terms", name: "Technology", color: "#1cb0f6", stage: "world", imageMode: "photo",
    description: "Big ideas children hear in the modern world.",
    items: m("tech", [
      { word: "Internet" }, { word: "Robot" }, { word: "Satellite" },
      { word: "Electric Car", q: "Electric car" },
      { word: "Solar Panel", q: "Solar panel" },
      { word: "Computer", q: "Personal computer" },
      { word: "Smartphone" }, { word: "Drone", q: "Unmanned aerial vehicle" },
      { word: "3D Printer", q: "3D printing" },
      { word: "Virtual Reality", q: "Virtual reality" },
      { word: "WiFi", q: "Wi-Fi" },
      { word: "GPS", q: "Global Positioning System" },
      { word: "Tablet", q: "Tablet computer" }, { word: "Headphones" },
      { word: "Camera", q: "Digital camera" },
      { word: "Battery", q: "Battery (electricity)" },
      { word: "Wind Turbine", q: "Wind turbine" },
      { word: "Recycling" }, { word: "Microchip", q: "Integrated circuit" },
      { word: "Space Suit", q: "Space suit" },
    ]),
  },

  /* ═══ ADVANCED (future leader track) ═══ */
  {
    id: "money", name: "Money", color: "#2ba84a", stage: "advanced", imageMode: "photo",
    description: "Early money words every child should recognize.",
    items: m("mon", [
      { word: "Coin" }, { word: "Dollar", q: "United States dollar" },
      { word: "Wallet" }, { word: "Piggy Bank", q: "Piggy bank" },
      { word: "Cash" }, { word: "Price Tag", q: "Price tag" },
      { word: "Store", q: "Retail" }, { word: "Receipt" },
      { word: "Penny", q: "Penny (United States coin)" },
      { word: "Quarter", q: "Quarter (United States coin)" },
      { word: "Credit Card", q: "Credit card" },
      { word: "ATM", q: "Automated teller machine" },
      { word: "Change", q: "Coins" }, { word: "Shopping" },
      { word: "Checkout", q: "Point of sale" },
      { word: "Coupon" }, { word: "Tip", q: "Gratuity" },
      { word: "Bill", q: "Banknote" }, { word: "Safe", q: "Safe (lock)" },
      { word: "Gold" },
    ]),
  },
  {
    id: "finance", name: "Finance", color: "#1c3d7a", stage: "advanced", imageMode: "card",
    description: "Core finance concepts in child-friendly terms.",
    items: m("fin", [
      { word: "Save", q: "Savings account" }, { word: "Spend", q: "Expenditure" },
      { word: "Budget" }, { word: "Bank" }, { word: "Invest", q: "Investment" },
      { word: "Stock Market", q: "New York Stock Exchange" },
      { word: "Business" }, { word: "Profit", q: "Profit (economics)" },
      { word: "Interest" }, { word: "Tax" }, { word: "Loan" },
      { word: "Wealth" }, { word: "Insurance" }, { word: "Trade" },
      { word: "Economy" }, { word: "Dividend" }, { word: "Currency" },
      { word: "Debt" }, { word: "Market", q: "Market (economics)" },
      { word: "Entrepreneur", q: "Entrepreneurship" },
    ]),
  },
  {
    id: "space", name: "Space", color: "#4a3f8a", stage: "advanced", imageMode: "photo",
    description: "Exciting space words to spark big curiosity.",
    items: m("spc", [
      { word: "Rocket" }, { word: "Astronaut" }, { word: "Moon" }, { word: "Mars" },
      { word: "Space Station", q: "International Space Station" },
      { word: "Telescope" }, { word: "Comet" }, { word: "Galaxy" },
      { word: "Saturn" }, { word: "Jupiter" }, { word: "Sun" },
      { word: "Meteor", q: "Meteoroid" }, { word: "Spacecraft" },
      { word: "Space Shuttle" }, { word: "Venus" },
      { word: "Mercury", q: "Mercury (planet)" }, { word: "Neptune" },
      { word: "Uranus" }, { word: "Asteroid" }, { word: "Constellation" },
    ]),
  },
  {
    id: "universe", name: "Universe", color: "#6b4fa2", stage: "advanced", imageMode: "photo",
    description: "Big-picture cosmic ideas and objects.",
    items: m("uni", [
      { word: "Universe" }, { word: "Star" }, { word: "Planet" },
      { word: "Solar System" }, { word: "Milky Way" },
      { word: "Black Hole", q: "Black hole" }, { word: "Nebula" },
      { word: "Orbit" }, { word: "Supernova" }, { word: "Quasar" },
      { word: "Dark Matter", q: "Dark matter" }, { word: "Big Bang" },
      { word: "Light Year", q: "Light-year" }, { word: "Red Giant", q: "Red giant" },
      { word: "White Dwarf", q: "White dwarf" }, { word: "Pulsar" },
      { word: "Gravity Well", q: "Gravitational field" },
      { word: "Exoplanet" }, { word: "Cosmic Ray", q: "Cosmic ray" },
      { word: "Andromeda", q: "Andromeda Galaxy" },
    ]),
  },
  {
    id: "physics", name: "Physics", color: "#ff3b30", stage: "advanced", imageMode: "card",
    description: "Foundational physics words for future problem-solvers.",
    items: m("phy", [
      { word: "Force" }, { word: "Energy" }, { word: "Motion", q: "Motion (physics)" },
      { word: "Gravity" }, { word: "Speed" }, { word: "Light" }, { word: "Magnet" },
      { word: "Atom" }, { word: "Electricity" }, { word: "Wave" },
      { word: "Friction" }, { word: "Pressure" }, { word: "Temperature" },
      { word: "Sound" }, { word: "Vibration" }, { word: "Momentum" },
      { word: "Lever" }, { word: "Pulley" }, { word: "Pendulum" },
      { word: "Prism", q: "Prism (optics)" },
    ]),
  },
];

export const STAGES: { id: Stage; label: string }[] = [
  { id: "foundation", label: "Foundation" },
  { id: "world", label: "World & People" },
  { id: "advanced", label: "Advanced" },
];

export const categoriesById = categories.reduce<Record<CategoryId, VocabCategory>>(
  (acc, c) => { acc[c.id] = c; return acc; },
  {} as Record<CategoryId, VocabCategory>,
);
