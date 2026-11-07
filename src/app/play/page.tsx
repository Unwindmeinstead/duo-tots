import { PlayHub } from "@/components/games/play-hub";

/* Play Zone — route shell (same pattern as /practice): this file
   stays a thin server component; all interaction lives in the
   client hub, which state-switches between the game list and the
   four mini-games on this single route. */
export default function PlayPage() {
  return <PlayHub />;
}
