/* ─── Animated "How the World Works" scenes ───
   Inline-SVG concept scenes for the World lesson "See it" step,
   built 2026-11-08 on Grey's order ("animated, especially How the
   World Works"). Each scene IS its card: a 900×1350 (2:3) stage
   that fills the see-it frame exactly like the photo did — whole
   scene visible, nothing cropped — with the lesson's key process
   in gentle, looping motion so a 2-year-old reads the action at a
   glance: rain falls and the river flows, day and night take
   turns, the truck drives the food home, the seed grows.

   Craft rules: pure CSS animation on transforms/opacity only
   (see the ws-* vocabulary in globals.css), slow toddler pacing,
   no assets, no video. Base markup always shows the finished
   scene, so a reduced-motion device still gets a readable card.
   Lessons without a scene keep their photo card untouched. */

import type { CSSProperties, ReactElement, ReactNode } from "react";

/* Inline animation timing / CSS vars without fighting the types. */
const A = (s: Record<string, string | number>): CSSProperties =>
  s as CSSProperties;

function SceneShell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 900 1350"
      width={900}
      height={1350}
      className="ws-scene block max-h-full max-w-full"
      role="img"
      aria-label={label}
    >
      {children}
    </svg>
  );
}

function Sun({
  cx,
  cy,
  r = 62,
  raySpinSeconds = 38,
}: {
  cx: number;
  cy: number;
  r?: number;
  raySpinSeconds?: number;
}) {
  const rays = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);
  return (
    <g>
      <g
        className="ws-spin ws-origin-fill"
        style={A({ animationDuration: `${raySpinSeconds}s` })}
      >
        {rays.map((a, i) => (
          <line
            key={i}
            x1={cx + Math.cos(a) * (r + 16)}
            y1={cy + Math.sin(a) * (r + 16)}
            x2={cx + Math.cos(a) * (r + 46)}
            y2={cy + Math.sin(a) * (r + 46)}
            stroke="#FFB703"
            strokeWidth={13}
            strokeLinecap="round"
          />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={r} fill="#FFD93D" />
    </g>
  );
}

function Cloud({
  cx,
  cy,
  scale = 1,
  driftSeconds = 7,
}: {
  cx: number;
  cy: number;
  scale?: number;
  driftSeconds?: number;
}) {
  return (
    <g
      className="ws-drift"
      style={A({ animationDuration: `${driftSeconds}s` })}
    >
      <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
        <ellipse cx={0} cy={0} rx={105} ry={58} fill="#FFFFFF" />
        <ellipse cx={-62} cy={16} rx={70} ry={42} fill="#FFFFFF" />
        <ellipse cx={64} cy={14} rx={76} ry={46} fill="#FFFFFF" />
        <ellipse cx={4} cy={-34} rx={64} ry={46} fill="#FFFFFF" />
      </g>
    </g>
  );
}

function Rain({
  drops,
  fall = 300,
}: {
  drops: Array<{ x: number; y: number; d: number; t: number }>;
  fall?: number;
}) {
  return (
    <g stroke="#3E9BE9" strokeWidth={9} strokeLinecap="round">
      {drops.map((drop, i) => (
        <line
          key={i}
          x1={drop.x}
          y1={drop.y}
          x2={drop.x - 7}
          y2={drop.y + 36}
          className="ws-rain"
          style={A({
            "--fall": `${fall}px`,
            animationDelay: `${drop.d}s`,
            animationDuration: `${drop.t}s`,
          })}
        />
      ))}
    </g>
  );
}

function GrassTuft({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  return (
    <g
      className="ws-sway"
      style={A({ animationDelay: `${delay}s` })}
      stroke="#3E9B4F"
      strokeWidth={9}
      strokeLinecap="round"
      fill="none"
    >
      <path d={`M${x},${y} q-4,-38 -16,-54`} />
      <path d={`M${x + 14},${y} q0,-44 4,-62`} />
      <path d={`M${x + 28},${y} q5,-36 18,-50`} />
    </g>
  );
}

/* ─── Where water comes from: rain → river → pipes → tap ─── */
function WaterScene() {
  return (
    <SceneShell label="Rain falls, the river flows, water travels in pipes to the tap">
      <defs>
        <linearGradient id="ws-water-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8FD8FF" />
          <stop offset="100%" stopColor="#EAFBFF" />
        </linearGradient>
      </defs>
      <rect width={900} height={1350} fill="url(#ws-water-sky)" />
      <Sun cx={148} cy={150} r={58} />
      {/* Hills */}
      <path d="M0,720 Q230,590 470,700 T900,660 V1350 H0 Z" fill="#A9E5A0" />
      <path d="M0,860 Q260,740 520,830 T900,800 V1350 H0 Z" fill="#7ED37E" />
      {/* Rain cloud over the hill */}
      <Cloud cx={600} cy={215} scale={1.15} driftSeconds={8} />
      <Rain
        fall={330}
        drops={[
          { x: 505, y: 320, d: 0, t: 1.35 },
          { x: 555, y: 305, d: 0.45, t: 1.5 },
          { x: 605, y: 322, d: 0.9, t: 1.3 },
          { x: 655, y: 308, d: 0.25, t: 1.55 },
          { x: 700, y: 320, d: 0.7, t: 1.4 },
          { x: 530, y: 345, d: 1.05, t: 1.45 },
          { x: 630, y: 348, d: 0.6, t: 1.35 },
          { x: 685, y: 345, d: 1.15, t: 1.5 },
        ]}
      />
      {/* River winding down the hill */}
      <path
        d="M612,470 C565,620 705,740 628,920 C565,1065 668,1180 624,1350"
        fill="none"
        stroke="#39A7E8"
        strokeWidth={92}
        strokeLinecap="round"
        opacity={0.92}
      />
      <path
        d="M612,470 C565,620 705,740 628,920 C565,1065 668,1180 624,1350"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={11}
        strokeDasharray="26 32"
        strokeLinecap="round"
        opacity={0.75}
        className="ws-flow"
      />
      {/* Evaporation arrows rising back to the sky */}
      <g
        fill="none"
        stroke="#FF9F2E"
        strokeWidth={13}
        strokeLinecap="round"
        className="ws-rise"
        style={A({ animationDuration: "5.5s" })}
      >
        <path d="M330,930 C295,845 350,775 312,690" />
        <path d="M288,706 l22,-34 l26,30" />
      </g>
      <g
        fill="none"
        stroke="#FF9F2E"
        strokeWidth={13}
        strokeLinecap="round"
        className="ws-rise"
        style={A({ animationDuration: "5.5s", animationDelay: "2.4s" })}
      >
        <path d="M215,1010 C185,935 232,870 200,795" />
        <path d="M178,812 l20,-32 l24,28" />
      </g>
      {/* Pipe + tap + cup */}
      <rect x={700} y={1035} width={200} height={44} rx={22} fill="#B8C4D4" />
      <rect x={806} y={1035} width={44} height={130} rx={20} fill="#B8C4D4" />
      <rect x={742} y={1150} width={172} height={46} rx={23} fill="#8FA3BC" />
      <circle cx={828} cy={1012} r={30} fill="#FF6B6B" />
      <g stroke="#FF6B6B" strokeWidth={11} strokeLinecap="round">
        <line x1={828} y1={988} x2={828} y2={1036} />
        <line x1={804} y1={1012} x2={852} y2={1012} />
      </g>
      <g stroke="#3E9BE9" strokeWidth={10} strokeLinecap="round">
        <line
          x1={828}
          y1={1206}
          x2={824}
          y2={1244}
          className="ws-drip"
          style={A({ "--fall": "72px", animationDuration: "1.5s" })}
        />
        <line
          x1={828}
          y1={1206}
          x2={824}
          y2={1244}
          className="ws-drip"
          style={A({
            "--fall": "72px",
            animationDuration: "1.5s",
            animationDelay: "0.75s",
          })}
        />
      </g>
      <path d="M782,1272 h92 l-12,66 a14,14 0 0 1 -14,12 h-40 a14,14 0 0 1 -14,-12 Z" fill="#FF7A59" />
      <GrassTuft x={90} y={1180} />
      <GrassTuft x={180} y={1260} delay={0.8} />
      <GrassTuft x={420} y={1300} delay={1.6} />
    </SceneShell>
  );
}

/* ─── Day, night, sun and moon: the sky wheel takes turns ─── */
function DayNightScene() {
  return (
    <SceneShell label="Day and night take turns: the sun and the moon go round and round">
      <defs>
        <linearGradient id="ws-dn-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#232F66" />
          <stop offset="100%" stopColor="#46539C" />
        </linearGradient>
        <clipPath id="ws-dn-wheel">
          <circle cx={450} cy={545} r={338} />
        </clipPath>
      </defs>
      <rect width={900} height={1350} fill="url(#ws-dn-sky)" />
      {/* Corner stars */}
      {[
        { x: 90, y: 120, d: 0 },
        { x: 800, y: 100, d: 0.7 },
        { x: 120, y: 1080, d: 1.3 },
        { x: 790, y: 1120, d: 0.4 },
        { x: 450, y: 90, d: 1.8 },
      ].map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={7}
          fill="#FFF3B0"
          className="ws-twinkle"
          style={A({ animationDelay: `${s.d}s` })}
        />
      ))}
      {/* The rotating wheel: day half + night half */}
      <g clipPath="url(#ws-dn-wheel)">
        <g
          className="ws-spin ws-origin-view"
          style={A({ animationDuration: "48s", transformOrigin: "450px 545px" })}
        >
          <path d="M450,207 A338,338 0 0 1 450,883 Z" fill="#8FD8FF" />
          <path d="M450,207 A338,338 0 0 0 450,883 Z" fill="#26356E" />
          {/* Sun riding the day half */}
          <circle cx={628} cy={420} r={56} fill="#FFD93D" />
          <g stroke="#FFB703" strokeWidth={11} strokeLinecap="round">
            <line x1={628} y1={336} x2={628} y2={312} />
            <line x1={628} y1={504} x2={628} y2={528} />
            <line x1={544} y1={420} x2={520} y2={420} />
            <line x1={712} y1={420} x2={736} y2={420} />
            <line x1={569} y1={361} x2={552} y2={344} />
            <line x1={687} y1={479} x2={704} y2={496} />
            <line x1={687} y1={361} x2={704} y2={344} />
            <line x1={569} y1={479} x2={552} y2={496} />
          </g>
          {/* Moon + stars riding the night half */}
          <circle cx={278} cy={668} r={52} fill="#F7F1DC" />
          <circle cx={302} cy={646} r={44} fill="#26356E" />
          {[
            { x: 218, y: 420 },
            { x: 330, y: 330 },
            { x: 196, y: 560 },
            { x: 352, y: 740 },
          ].map((s, i) => (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={8}
              fill="#FFF3B0"
              className="ws-twinkle"
              style={A({ animationDelay: `${i * 0.6}s` })}
            />
          ))}
          {/* Small clouds on the day half */}
          <ellipse cx={600} cy={640} rx={66} ry={30} fill="#FFFFFF" opacity={0.9} />
          <ellipse cx={648} cy={622} rx={44} ry={26} fill="#FFFFFF" opacity={0.9} />
        </g>
      </g>
      <circle cx={450} cy={545} r={338} fill="none" stroke="#FFFFFF" strokeWidth={12} />
      {/* Home hub — stays still while the sky turns */}
      <circle cx={450} cy={545} r={148} fill="#FFF7E6" stroke="#FFD93D" strokeWidth={9} />
      <path d="M352,600 A148,148 0 0 0 548,600 Z" fill="#7ED37E" transform="translate(0 46)" />
      <g>
        <rect x={398} y={520} width={104} height={88} rx={8} fill="#FFF3D6" />
        <path d="M386,528 L450,472 L514,528 Z" fill="#FF7A59" />
        <rect x={434} y={556} width={32} height={52} rx={6} fill="#B5651D" />
        <rect x={410} y={534} width={22} height={22} rx={5} fill="#BFE7FF" />
        <rect x={468} y={534} width={22} height={22} rx={5} fill="#BFE7FF" />
      </g>
      {/* Ground */}
      <path d="M0,1140 Q240,1060 470,1120 T900,1100 V1350 H0 Z" fill="#5DBB63" />
      <GrassTuft x={120} y={1260} />
      <GrassTuft x={700} y={1280} delay={1} />
      {[
        { x: 250, y: 1200, c: "#FF8FAB" },
        { x: 640, y: 1180, c: "#FFD93D" },
      ].map((f, i) => (
        <g key={i} className="ws-sway" style={A({ animationDelay: `${i * 0.9}s` })}>
          <line x1={f.x} y1={f.y + 44} x2={f.x} y2={f.y} stroke="#3E9B4F" strokeWidth={8} strokeLinecap="round" />
          <circle cx={f.x} cy={f.y - 8} r={15} fill={f.c} />
          <circle cx={f.x} cy={f.y - 8} r={6} fill="#FFF3D6" />
        </g>
      ))}
    </SceneShell>
  );
}

/* ─── How food gets to us: farm → truck → home ─── */
function FoodScene() {
  return (
    <SceneShell label="A farmer grows the food, a truck drives it along the road, and it arrives at our home">
      <defs>
        <linearGradient id="ws-food-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9ED9FF" />
          <stop offset="100%" stopColor="#FFF7DC" />
        </linearGradient>
      </defs>
      <rect width={900} height={1350} fill="url(#ws-food-sky)" />
      <Sun cx={742} cy={148} r={56} raySpinSeconds={42} />
      <Cloud cx={220} cy={150} scale={0.85} driftSeconds={9} />
      {/* Barn + apple tree */}
      <g>
        <rect x={86} y={600} width={240} height={232} rx={10} fill="#D64541" />
        <path d="M66,612 L206,496 L346,612 Z" fill="#8E2F2B" />
        <rect x={168} y={700} width={76} height={132} rx={8} fill="#FFF3D6" />
        <path d="M168,700 L244,832 M244,700 L168,832" stroke="#D64541" strokeWidth={10} />
        <rect x={182} y={556} width={48} height={44} rx={6} fill="#FFF3D6" />
      </g>
      <g>
        <rect x={396} y={660} width={30} height={172} rx={12} fill="#8A5A33" />
        <circle cx={411} cy={590} r={104} fill="#58B368" />
        <circle cx={338} cy={640} r={62} fill="#58B368" />
        <circle cx={486} cy={642} r={58} fill="#58B368" />
        {[
          { x: 366, y: 566 },
          { x: 448, y: 540 },
          { x: 420, y: 640 },
          { x: 486, y: 600 },
          { x: 352, y: 636 },
        ].map((a, i) => (
          <circle key={i} cx={a.x} cy={a.y} r={17} fill="#FF5252" />
        ))}
      </g>
      {/* Road */}
      <rect x={0} y={832} width={900} height={168} fill="#7C8698" />
      <line
        x1={0}
        y1={916}
        x2={900}
        y2={916}
        stroke="#FFFFFF"
        strokeWidth={12}
        strokeDasharray="46 38"
        className="ws-flow"
      />
      {/* The truck drives the route */}
      <g transform="translate(30 668)">
        <g className="ws-drive" style={A({ animationDuration: "12s" })}>
          <rect x={0} y={0} width={196} height={138} rx={14} fill="#FFFFFF" />
          <circle cx={98} cy={69} r={34} fill="#FF5252" />
          <path d="M98,44 q10,-14 24,-8 q-4,12 -14,14 q10,4 8,16 q-10,-2 -12,-10 q-8,4 -14,-2 q6,-8 8,-10Z" fill="#58B368" />
          <path d="M196,44 h64 a18,18 0 0 1 14,7 l30,42 a18,18 0 0 1 4,11 v34 h-112 Z" fill="#38BDF8" />
          <rect x={216} y={56} width={46} height={38} rx={8} fill="#DFF4FF" />
          <rect x={0} y={138} width={308} height={14} rx={7} fill="#59637A" />
          {[
            { x: 52 },
            { x: 252 },
          ].map((w, i) => (
            <g
              key={i}
              className="ws-spin ws-origin-fill"
              style={A({ animationDuration: "0.9s" })}
            >
              <circle cx={w.x} cy={168} r={31} fill="#33383F" />
              <circle cx={w.x} cy={168} r={13} fill="#C9D2DE" />
              <line x1={w.x - 22} y1={168} x2={w.x + 22} y2={168} stroke="#C9D2DE" strokeWidth={6} />
              <line x1={w.x} y1={146} x2={w.x} y2={190} stroke="#C9D2DE" strokeWidth={6} />
            </g>
          ))}
        </g>
      </g>
      {/* Home ground */}
      <rect x={0} y={1000} width={900} height={350} fill="#7ED37E" />
      {/* Field rows bottom-left */}
      <g fill="none" stroke="#3E9B4F" strokeWidth={12} strokeLinecap="round" opacity={0.8}>
        <path d="M40,1120 q120,-34 250,0" />
        <path d="M40,1210 q120,-34 250,0" />
        <path d="M40,1300 q120,-34 250,0" />
      </g>
      {/* Home + a plate with an apple */}
      <g>
        <rect x={604} y={1086} width={216} height={178} rx={10} fill="#FFF3D6" />
        <path d="M584,1096 L712,986 L840,1096 Z" fill="#FF7A59" />
        <rect x={688} y={1168} width={50} height={96} rx={8} fill="#B5651D" />
        <rect x={626} y={1122} width={38} height={38} rx={7} fill="#BFE7FF" />
        <rect x={762} y={1122} width={38} height={38} rx={7} fill="#BFE7FF" />
      </g>
      <ellipse cx={712} cy={1308} rx={86} ry={20} fill="#FFFFFF" />
      <circle cx={712} cy={1294} r={24} fill="#FF5252" />
      <path d="M712,1272 q6,-16 22,-18" fill="none" stroke="#3E9B4F" strokeWidth={8} strokeLinecap="round" />
    </SceneShell>
  );
}

/* ─── Plants and trees grow slow: seed → sprout → flower ─── */
function PlantsScene() {
  return (
    <SceneShell label="A tiny seed in the soil grows slowly into a flower">
      <defs>
        <linearGradient id="ws-plant-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#AEE7FF" />
          <stop offset="100%" stopColor="#F2FFEC" />
        </linearGradient>
      </defs>
      <rect width={900} height={1350} fill="url(#ws-plant-sky)" />
      <Sun cx={150} cy={148} r={56} raySpinSeconds={44} />
      <Cloud cx={660} cy={170} scale={0.9} driftSeconds={10} />
      {/* Watering can raining on the seed */}
      <g transform="translate(96 742) rotate(-14)">
        <rect x={0} y={0} width={128} height={104} rx={22} fill="#FFB03A" />
        <path d="M128,26 L196,66 L182,92 L128,60 Z" fill="#F59E0B" />
        <path d="M6,10 q-40,-34 -12,-66" fill="none" stroke="#F59E0B" strokeWidth={13} strokeLinecap="round" />
      </g>
      <Rain
        fall={130}
        drops={[
          { x: 268, y: 884, d: 0, t: 1.2 },
          { x: 292, y: 878, d: 0.4, t: 1.3 },
          { x: 314, y: 886, d: 0.8, t: 1.15 },
        ]}
      />
      {/* Grass + soil cross-section */}
      <rect x={0} y={950} width={900} height={86} fill="#6FCF6A" />
      <rect x={0} y={1036} width={900} height={314} fill="#8A5A33" />
      <g fill="#74491F" opacity={0.65}>
        <circle cx={140} cy={1120} r={10} />
        <circle cx={700} cy={1180} r={13} />
        <circle cx={250} cy={1240} r={8} />
        <circle cx={790} cy={1100} r={8} />
        <circle cx={560} cy={1270} r={10} />
        <circle cx={90} cy={1300} r={9} />
      </g>
      {/* The seed + roots (always there) */}
      <ellipse cx={450} cy={1140} rx={36} ry={27} fill="#C98B4B" />
      <path d="M438,1132 q12,-10 26,-4" fill="none" stroke="#A96F33" strokeWidth={6} strokeLinecap="round" />
      <path
        d="M450,1166 q-6,44 -30,66 M450,1166 q4,52 -8,84 M450,1166 q14,40 34,58"
        fill="none"
        stroke="#E8D8B0"
        strokeWidth={9}
        strokeLinecap="round"
      />
      {/* The plant — grows from the soil line, holds, rests, grows again */}
      <g className="ws-grow">
        <path
          d="M450,1036 C438,880 472,730 450,585"
          fill="none"
          stroke="#3E9B4F"
          strokeWidth={21}
          strokeLinecap="round"
        />
        <path d="M452,790 q-96,-14 -128,-92 q92,6 128,92Z" fill="#58B368" />
        <path d="M450,690 q96,-14 128,-92 q-92,6 -128,92Z" fill="#58B368" />
        <g
          className="ws-pulse"
          style={A({ animationDuration: "2600ms" })}
        >
          {[
            { x: 450, y: 478 },
            { x: 408, y: 502 },
            { x: 492, y: 502 },
            { x: 420, y: 544 },
            { x: 480, y: 544 },
            { x: 450, y: 556 },
          ].map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={33} fill="#FF8FAB" />
          ))}
          <circle cx={450} cy={518} r={27} fill="#FFD93D" />
        </g>
      </g>
      {/* A tiny sprout friend, already up */}
      <g>
        <path d="M716,1036 q0,-44 6,-66" fill="none" stroke="#3E9B4F" strokeWidth={11} strokeLinecap="round" />
        <path d="M720,992 q-44,-4 -58,-40 q42,2 58,40Z" fill="#58B368" />
        <path d="M721,984 q44,-4 58,-40 q-42,2 -58,40Z" fill="#58B368" />
      </g>
      <GrassTuft x={110} y={1030} />
      <GrassTuft x={600} y={1032} delay={1.1} />
    </SceneShell>
  );
}

/* ─── Weather and seasons: sun, cloud, rain, rainbow ─── */
function WeatherScene() {
  return (
    <SceneShell label="The sky changes: sun, clouds and rain, then a rainbow">
      <defs>
        <linearGradient id="ws-weather-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8FD4FF" />
          <stop offset="100%" stopColor="#EAFBFF" />
        </linearGradient>
      </defs>
      <rect width={900} height={1350} fill="url(#ws-weather-sky)" />
      <Sun cx={158} cy={160} r={60} raySpinSeconds={40} />
      {/* The rain cloud */}
      <Cloud cx={520} cy={300} scale={1.35} driftSeconds={8} />
      <Rain
        fall={400}
        drops={[
          { x: 380, y: 420, d: 0, t: 1.5 },
          { x: 440, y: 405, d: 0.5, t: 1.35 },
          { x: 500, y: 425, d: 0.95, t: 1.6 },
          { x: 560, y: 408, d: 0.3, t: 1.4 },
          { x: 620, y: 422, d: 0.75, t: 1.5 },
          { x: 668, y: 408, d: 1.1, t: 1.35 },
          { x: 410, y: 448, d: 0.65, t: 1.45 },
          { x: 532, y: 452, d: 1.2, t: 1.55 },
          { x: 646, y: 450, d: 0.15, t: 1.4 },
        ]}
      />
      <Cloud cx={770} cy={540} scale={0.6} driftSeconds={11} />
      {/* Ground */}
      <path d="M0,1130 Q260,1050 520,1110 T900,1090 V1350 H0 Z" fill="#6FCF6A" />
      {/* Rainbow fading in after the rain */}
      <g fill="none" strokeLinecap="round" className="ws-rainbow">
        <path d="M148,1152 A302,302 0 0 1 752,1152" stroke="#FF6B6B" strokeWidth={34} />
        <path d="M186,1152 A264,264 0 0 1 714,1152" stroke="#FFA94D" strokeWidth={34} />
        <path d="M224,1152 A226,226 0 0 1 676,1152" stroke="#FFD93D" strokeWidth={34} />
        <path d="M262,1152 A188,188 0 0 1 638,1152" stroke="#69DB7C" strokeWidth={34} />
      </g>
      {/* Puddle with ripples */}
      <ellipse cx={520} cy={1246} rx={138} ry={25} fill="#7CC4F5" opacity={0.85} />
      <ellipse
        cx={520}
        cy={1246}
        rx={58}
        ry={11}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={5}
        className="ws-ripple"
      />
      <ellipse
        cx={520}
        cy={1246}
        rx={58}
        ry={11}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={5}
        className="ws-ripple"
        style={A({ animationDelay: "1.4s" })}
      />
      {/* Flowers in the grass */}
      {[
        { x: 170, y: 1180, c: "#FF8FAB", d: 0 },
        { x: 250, y: 1252, c: "#FFD93D", d: 0.8 },
        { x: 742, y: 1210, c: "#C77DFF", d: 1.5 },
      ].map((f, i) => (
        <g key={i} className="ws-sway" style={A({ animationDelay: `${f.d}s` })}>
          <line x1={f.x} y1={f.y + 52} x2={f.x} y2={f.y} stroke="#3E9B4F" strokeWidth={9} strokeLinecap="round" />
          <circle cx={f.x} cy={f.y - 10} r={17} fill={f.c} />
          <circle cx={f.x} cy={f.y - 10} r={7} fill="#FFF3D6" />
        </g>
      ))}
      <GrassTuft x={330} y={1300} delay={0.5} />
      <GrassTuft x={820} y={1306} delay={1.2} />
    </SceneShell>
  );
}

/* ─── How things move: wheels roll, balls roll, boats float ─── */
function MoveScene() {
  return (
    <SceneShell label="Wheels roll round and round, a ball rolls, and a boat floats on the water">
      <defs>
        <linearGradient id="ws-move-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9ED9FF" />
          <stop offset="100%" stopColor="#EAFBFF" />
        </linearGradient>
      </defs>
      <rect width={900} height={1350} fill="url(#ws-move-sky)" />
      <Sun cx={760} cy={140} r={54} raySpinSeconds={42} />
      <Cloud cx={230} cy={140} scale={0.8} driftSeconds={9} />
      {/* Road */}
      <rect x={0} y={540} width={900} height={216} fill="#7C8698" />
      <line
        x1={0}
        y1={648}
        x2={900}
        y2={648}
        stroke="#FFFFFF"
        strokeWidth={12}
        strokeDasharray="46 38"
        className="ws-flow"
      />
      {/* Bicycle — wheels turning as it rides */}
      <g transform="translate(70 330)">
        <g className="ws-drive" style={A({ animationDuration: "14s" })}>
          {[
            { x: 10 },
            { x: 196 },
          ].map((w, i) => (
            <g key={i}>
              <circle cx={w.x} cy={330} r={64} fill="none" stroke="#33383F" strokeWidth={13} />
              <g
                className="ws-spin ws-origin-fill"
                style={A({ animationDuration: "1s" })}
              >
                <line x1={w.x - 52} y1={330} x2={w.x + 52} y2={330} stroke="#8FA3BC" strokeWidth={7} />
                <line x1={w.x} y1={278} x2={w.x} y2={382} stroke="#8FA3BC" strokeWidth={7} />
                <line x1={w.x - 37} y1={293} x2={w.x + 37} y2={367} stroke="#8FA3BC" strokeWidth={7} />
                <line x1={w.x + 37} y1={293} x2={w.x - 37} y2={367} stroke="#8FA3BC" strokeWidth={7} />
              </g>
              <circle cx={w.x} cy={330} r={11} fill="#33383F" />
            </g>
          ))}
          <g stroke="#FF7A59" strokeWidth={15} strokeLinecap="round" fill="none">
            <path d="M10,330 L66,196 L176,190 L196,330" />
            <path d="M66,196 L104,330 L196,330" />
            <path d="M104,330 L10,330" />
          </g>
          <rect x={44} y={182} width={48} height={16} rx={8} fill="#33383F" />
          <path d="M168,178 q22,-14 34,2" fill="none" stroke="#33383F" strokeWidth={11} strokeLinecap="round" />
        </g>
      </g>
      {/* Grass strip with a rolling ball */}
      <rect x={0} y={756} width={900} height={238} fill="#79CE74" />
      <g transform="translate(-60 830)">
        <g className="ws-drive" style={A({ animationDuration: "8s" })}>
          <g
            className="ws-spin ws-origin-fill"
            style={A({ animationDuration: "1.3s" })}
          >
            <circle cx={60} cy={60} r={52} fill="#FF6B6B" />
            <path d="M8,60 a52,52 0 0 1 104,0 Z" fill="#FFFFFF" opacity={0.85} />
            <circle cx={60} cy={60} r={13} fill="#FFD93D" />
          </g>
        </g>
      </g>
      <GrassTuft x={150} y={986} />
      <GrassTuft x={700} y={990} delay={1} />
      {/* Water with a bobbing boat */}
      <rect x={0} y={994} width={900} height={356} fill="#4FA8E0" />
      <g fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.55}>
        <path d="M30,1080 q30,-18 60,0 t60,0 t60,0" strokeDasharray="30 20" className="ws-flow" />
        <path d="M600,1310 q30,-18 60,0 t60,0 t60,0" strokeDasharray="30 20" className="ws-flow" />
      </g>
      <g transform="translate(90 1052)">
        <g className="ws-drift" style={A({ animationDuration: "7s" })}>
          <g className="ws-bob" style={A({ animationDuration: "3000ms" })}>
            <path d="M20,150 h240 l-34,66 a14,14 0 0 1 -13,8 h-146 a14,14 0 0 1 -13,-8 Z" fill="#E4572E" />
            <line x1={140} y1={150} x2={140} y2={36} stroke="#8A5A33" strokeWidth={11} strokeLinecap="round" />
            <path d="M152,44 L228,142 L152,142 Z" fill="#FFFFFF" />
            <path d="M128,70 L62,142 L128,142 Z" fill="#FFE9A8" />
            <path d="M140,36 l44,12 l-44,12 Z" fill="#FFD93D" />
          </g>
        </g>
      </g>
    </SceneShell>
  );
}

/* ─── How things are built: plan first, then block by block ─── */
function BuiltScene() {
  const blocks: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    fill: string;
    delay: number;
  }> = [
    { x: 235, y: 1000, w: 160, h: 150, fill: "#FF7A59", delay: 0 },
    { x: 405, y: 1000, w: 160, h: 150, fill: "#38BDF8", delay: 1.2 },
    { x: 575, y: 1000, w: 160, h: 150, fill: "#FFD93D", delay: 2.4 },
    { x: 320, y: 850, w: 160, h: 150, fill: "#69DB7C", delay: 3.6 },
    { x: 490, y: 850, w: 160, h: 150, fill: "#C77DFF", delay: 4.8 },
    { x: 405, y: 700, w: 160, h: 150, fill: "#FF8FAB", delay: 6 },
  ];
  return (
    <SceneShell label="Builders make a plan, then build step by step — and if it falls, fix it and try again">
      <defs>
        <linearGradient id="ws-built-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CDEFFF" />
          <stop offset="100%" stopColor="#FFF9EC" />
        </linearGradient>
      </defs>
      <rect width={900} height={1350} fill="url(#ws-built-sky)" />
      <Sun cx={768} cy={140} r={52} raySpinSeconds={46} />
      <Cloud cx={200} cy={160} scale={0.8} driftSeconds={10} />
      {/* The plan: a dashed outline of the tower to build */}
      <rect
        x={225}
        y={560}
        width={520}
        height={590}
        rx={26}
        fill="#FFFFFF"
        opacity={0.4}
      />
      <rect
        x={225}
        y={560}
        width={520}
        height={590}
        rx={26}
        fill="none"
        stroke="#1748AC"
        strokeWidth={7}
        strokeDasharray="16 16"
        opacity={0.4}
      />
      {/* Sandy platform */}
      <rect x={0} y={1150} width={900} height={200} fill="#F2C879" />
      <rect x={0} y={1150} width={900} height={16} fill="#DFAF57" />
      {/* Blocks land one by one, on the plan */}
      {blocks.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          rx={20}
          fill={b.fill}
          className="ws-block"
          style={A({ animationDelay: `${b.delay}s` })}
        />
      ))}
      {/* The finishing star */}
      <polygon
        points="485,566 499,606 541,606 507,631 520,672 485,647 450,672 463,631 429,606 471,606"
        fill="#FFB703"
        className="ws-block"
        style={A({ animationDelay: "7.2s" })}
      />
      <GrassTuft x={90} y={1150} />
      <GrassTuft x={790} y={1150} delay={0.9} />
    </SceneShell>
  );
}

/* ─── Registry ───
   Pilot pass (2026-11-08): 7 of 14 lessons animated. The rest keep
   their photo see-it cards until their scenes are built:
   me-family-home, who-is-in-charge, rules-keep-us-safe,
   people-who-help, animals-and-homes, money-and-trading, our-earth. */
const SCENES: Record<string, () => ReactElement> = {
  "where-water-comes-from": WaterScene,
  "day-night-sun-moon": DayNightScene,
  "food-gets-to-us": FoodScene,
  "plants-grow-slow": PlantsScene,
  "weather-and-seasons": WeatherScene,
  "how-things-move": MoveScene,
  "how-things-are-built": BuiltScene,
};

export function hasWorldScene(lessonId: string): boolean {
  return lessonId in SCENES;
}

export function WorldScene({ lessonId }: { lessonId: string }) {
  const Scene = SCENES[lessonId];
  if (!Scene) return null;
  return <Scene />;
}
