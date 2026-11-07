/* Sentence cards — one tiny spoken sentence per word, shown after the word
   card in the lesson flow (Duolingo pattern: word → carrier sentence).
   Data owner: overhaul wave WS-D. Interface is FIXED — do not change the
   exported shapes; other workstreams import them.

   Key: `${categoryId}:${itemId}` first, then `${categoryId}:${word.toLowerCase()}`
   fallback. Returns null when no sentence exists (lesson flow then skips
   the sentence step entirely). */

export const SENTENCES: Record<string, string> = {
  /* Actions — every photo in public/images/actions/ shows the same young
     boy, so one consistent frame: "The boy is …ing." Objects are named
     only where the photo shows one (ball, wagon, teddy, blocks). */
  "actions:act-run": "The boy is running.",
  "actions:run": "The boy is running.",
  "actions:act-jump": "The boy is jumping.",
  "actions:jump": "The boy is jumping.",
  "actions:act-eat": "The boy is eating.",
  "actions:eat": "The boy is eating.",
  "actions:act-sleep": "The boy is sleeping.",
  "actions:sleep": "The boy is sleeping.",
  "actions:act-walk": "The boy is walking.",
  "actions:walk": "The boy is walking.",
  "actions:act-play": "The boy is playing with blocks.",
  "actions:play": "The boy is playing with blocks.",
  "actions:act-dance": "The boy is dancing.",
  "actions:dance": "The boy is dancing.",
  "actions:act-sing": "The boy is singing.",
  "actions:sing": "The boy is singing.",
  "actions:act-clap": "The boy is clapping.",
  "actions:clap": "The boy is clapping.",
  "actions:act-wave": "The boy is waving.",
  "actions:wave": "The boy is waving.",
  "actions:act-cry": "The boy is crying.",
  "actions:cry": "The boy is crying.",
  "actions:act-laugh": "The boy is laughing.",
  "actions:laugh": "The boy is laughing.",
  "actions:act-sit": "The boy is sitting.",
  "actions:sit": "The boy is sitting.",
  "actions:act-stand": "The boy is standing.",
  "actions:stand": "The boy is standing.",
  "actions:act-push": "The boy is pushing the ball.",
  "actions:push": "The boy is pushing the ball.",
  "actions:act-pull": "The boy is pulling the wagon.",
  "actions:pull": "The boy is pulling the wagon.",
  "actions:act-throw": "The boy is throwing the ball.",
  "actions:throw": "The boy is throwing the ball.",
  "actions:act-catch": "The boy is catching the ball.",
  "actions:catch": "The boy is catching the ball.",
  "actions:act-hug": "The boy is hugging his teddy.",
  "actions:hug": "The boy is hugging his teddy.",
  "actions:act-kiss": "The boy is kissing his teddy.",
  "actions:kiss": "The boy is kissing his teddy.",
};

export function getSentence(
  categoryId: string,
  itemId: string,
  word: string,
): string | null {
  return (
    SENTENCES[`${categoryId}:${itemId}`] ??
    SENTENCES[`${categoryId}:${word.toLowerCase()}`] ??
    null
  );
}
