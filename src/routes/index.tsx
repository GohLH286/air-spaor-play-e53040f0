import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SlideDeck } from "@/components/SlideDeck";
import { UploadZone } from "@/components/UploadZone";
import { KissBoard } from "@/components/KissBoard";
import litReviewInfographic from "@/assets/lit-review-infographic.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Air Can Be Compressed — P4 Science SPAOR Lesson" },
      {
        name: "description",
        content:
          "Interactive Primary 4 science lesson on air compression using the SPAOR method (Situation, Problem, Action, Observation, Reflection).",
      },
      { property: "og:title", content: "Air Can Be Compressed — P4 Science SPAOR Lesson" },
      {
        property: "og:description",
        content:
          "Interactive Primary 4 science lesson on air compression using the SPAOR method (Situation, Problem, Action, Observation, Reflection).",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Lesson,
});

type StageKey = "S" | "P" | "A" | "O" | "R";

const stages: {
  key: StageKey;
  label: string;
  title: string;
  color: string;
  tint: string;
}[] = [
  { key: "S", label: "Scan", title: "Scan", color: "var(--situation)", tint: "oklch(0.97 0.03 70)" },
  { key: "P", label: "Plan", title: "Plan", color: "var(--problem)", tint: "oklch(0.97 0.03 35)" },
  { key: "A", label: "Action", title: "Action", color: "var(--action)", tint: "oklch(0.96 0.03 155)" },
  { key: "O", label: "Observe", title: "Observe", color: "var(--observation)", tint: "oklch(0.96 0.03 220)" },
  { key: "R", label: "Review", title: "Review", color: "var(--reflection)", tint: "oklch(0.97 0.03 300)" },
];

function Lesson() {
  const [active, setActive] = useState<StageKey>("S");
  const [pushes, setPushes] = useState(0);
  const [predicted, setPredicted] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const activeStage = stages.find((s) => s.key === active)!;

  return (
    <main className="min-h-screen px-5 py-8 md:px-12 md:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Primary 4 Science · Diversity of Matter · Air
            </p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">Air Can Be Compressed</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              A calm, guided SPAOR investigation for PLT · MOE Science Syllabus
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full border bg-card px-5 py-2.5 shadow-soft">
            <span className="text-xs font-semibold text-muted-foreground">Lesson Progress</span>
            <div className="flex gap-1.5">
              {stages.map((s) => (
                <span
                  key={s.key}
                  className="h-2.5 w-7 rounded-full transition-all duration-500"
                  style={{ background: s.key === active ? s.color : "var(--border)" }}
                />
              ))}
            </div>
          </div>
        </header>

        <nav className="mb-8 grid grid-cols-5 gap-3 rounded-[2rem] bg-card p-3 shadow-[var(--shadow-soft)]">
          {stages.map((s) => {
            const isActive = s.key === active;
            return (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className="group flex flex-col items-center gap-2 rounded-[1.5rem] px-2 py-4 text-center transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: isActive ? s.color : "transparent",
                  color: isActive ? "white" : "var(--foreground)",
                }}
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.25)" : s.tint,
                    color: isActive ? "white" : s.color,
                  }}
                >
                  {s.key}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider md:text-xs">
                  {s.label}
                </span>
              </button>
            );
          })}
        </nav>

        <section
          className="rounded-[2rem] border bg-card p-7 shadow-[var(--shadow-soft)] md:p-12"
          style={{ borderTop: `8px solid ${activeStage.color}` }}
        >
          <div className="mb-8 flex items-center gap-4">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold text-white shadow-soft"
              style={{ background: activeStage.color }}
            >
              {activeStage.key}
            </span>
            <h2 className="text-2xl font-bold md:text-3xl">{activeStage.title}</h2>
          </div>

          {active === "S" && <SituationView />}
          {active === "P" && <ProblemView predicted={predicted} setPredicted={setPredicted} />}
          {active === "A" && <ActionView pushes={pushes} setPushes={setPushes} />}
          {active === "O" && <ObservationView pushes={pushes} />}
          {active === "R" && (
            <ReflectionView
              reflection={reflection}
              setReflection={setReflection}
              checked={checked}
              setChecked={setChecked}
              predicted={predicted}
            />
          )}

          <div className="mt-10 flex justify-between border-t pt-8">
            <button
              className="rounded-2xl border px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
              disabled={active === "S"}
              onClick={() => {
                const idx = stages.findIndex((s) => s.key === active);
                setActive(stages[Math.max(0, idx - 1)].key);
              }}
            >
              ← Previous
            </button>
            <button
              className="rounded-2xl px-6 py-2.5 text-sm font-bold text-white shadow-soft transition-transform hover:scale-[1.02] disabled:opacity-40"
              style={{ background: activeStage.color }}
              disabled={active === "R"}
              onClick={() => {
                const idx = stages.findIndex((s) => s.key === active);
                setActive(stages[Math.min(4, idx + 1)].key);
              }}
            >
              Next →
            </button>
          </div>
        </section>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Sample lesson · SPAOR pedagogical framework · Sign-in and class saving coming soon
        </p>
      </div>
    </main>
  );
}

function SituationView() {
  return (
    <div className="space-y-8">
      <div
        className="rounded-3xl border-l-[6px] bg-[oklch(0.98_0.02_80)] p-6"
        style={{ borderColor: "var(--situation)" }}
      >
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--situation)]">
          For Teachers · PLT Briefing
        </p>
        <p className="mt-2 text-sm leading-relaxed">
          Before starting the lesson with pupils, go through the slides below as a team to
          align on <span className="font-semibold">what a Learning Circle is</span>, the SPAOR
          cycle, and how it frames today's investigation on air.
        </p>
      </div>

      <SlideDeck />

      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Lesson Situation (for pupils)
          </p>
          <p className="mt-3 text-base leading-relaxed md:text-lg">
            Mrs Tan is pumping up a bicycle tyre before school. When she presses the pump
            handle down, she notices it becomes <span className="font-bold">harder and harder</span>{" "}
            to push, even though the pump is closed at the bottom.
          </p>
          <div className="mt-5 rounded-3xl bg-muted p-5">
            <p className="text-sm font-semibold text-muted-foreground">Think about it</p>
            <p className="mt-1 text-sm">
              What is inside the pump? Where does it go when Mrs Tan pushes the handle?
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div
            className="relative flex h-64 w-64 items-center justify-center rounded-[2rem] shadow-soft"
            style={{ background: "oklch(0.95 0.04 220)" }}
          >
            <svg viewBox="0 0 200 200" className="h-full w-full p-6">
              <rect x="80" y="30" width="40" height="120" rx="6" fill="oklch(0.85 0.03 240)" />
              <rect x="70" y="20" width="60" height="14" rx="4" fill="oklch(0.55 0.16 235)" />
              <circle cx="100" cy="165" r="18" fill="oklch(0.4 0.05 250)" />
              <circle cx="100" cy="90" r="4" fill="white" />
              <circle cx="90" cy="110" r="3" fill="white" />
              <circle cx="110" cy="70" r="3" fill="white" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProblemView({
  predicted,
  setPredicted,
}: {
  predicted: string | null;
  setPredicted: (v: string) => void;
}) {
  const options = [
    { id: "a", text: "The air escapes out of the pump." },
    { id: "b", text: "The air is squeezed into a smaller space." },
    { id: "c", text: "The air disappears when pushed." },
    { id: "d", text: "The air turns into water." },
  ];
  return (
    <div className="space-y-8">
      <div
        className="rounded-[2rem] border p-6 shadow-soft md:p-8"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.98 0.03 210) 0%, oklch(0.97 0.02 190) 60%, oklch(0.96 0.03 90) 100%)",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="h-px w-6 bg-[oklch(0.65_0.1_200)]" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[oklch(0.55_0.08_200)]">
            For Educators · Literature Review
          </p>
        </div>
        <h3 className="mt-2 text-lg font-bold tracking-tight text-foreground md:text-2xl">
          Effective Strategies for Teaching Air as a Gas
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Four research pillars shaping this lesson — visual summary.
        </p>

        <div className="relative mx-auto mt-6 max-w-md">
          <div
            className="absolute -inset-2 rounded-[1.5rem] opacity-30 blur-2xl"
            style={{
              background:
                "linear-gradient(120deg, oklch(0.8 0.08 200), oklch(0.78 0.07 170), oklch(0.82 0.06 80))",
            }}
          />
          <div className="relative overflow-hidden rounded-[1.5rem] border border-white/60 shadow-soft">
            <img
              src={litReviewInfographic.url}
              alt="Literature review infographic: effective strategies for teaching air as a gas — inquiry-based learning (SingTeach NIE 2023), hands-on syringe experiments (TERC 2019), MOE primary science syllabus air concepts, and active learning with visuals (ASCD 2022)"
              className="block w-full"
              loading="lazy"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {[
            "Inquiry-Based Experiments",
            "Visual Representations",
            "Collaborative Discussion",
          ].map((k) => (
            <span
              key={k}
              className="rounded-full px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-wider"
              style={{
                color: "oklch(0.45 0.06 200)",
                border: "1px solid oklch(0.75 0.05 200 / 0.4)",
                background: "oklch(1 0 0 / 0.55)",
              }}
            >
              {k}
            </span>
          ))}
        </div>
      </div>


      <div>
        <p className="text-lg font-semibold">
          Focus question: Can air be squeezed into a smaller space?
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Make a prediction before we investigate. There is no wrong answer at this stage —
          we are being scientists!
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {options.map((o) => {
            const isSel = predicted === o.id;
            return (
              <button
                key={o.id}
                onClick={() => setPredicted(o.id)}
                className="flex items-start gap-3 rounded-[1.5rem] border-2 p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft"
                style={{
                  borderColor: isSel ? "var(--problem)" : "var(--border)",
                  background: isSel ? "oklch(0.98 0.03 40)" : "var(--card)",
                }}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all"
                  style={{
                    background: isSel ? "var(--problem)" : "var(--muted)",
                    color: isSel ? "white" : "var(--foreground)",
                  }}
                >
                  {o.id.toUpperCase()}
                </span>
                <span className="text-sm font-medium leading-relaxed">{o.text}</span>
              </button>
            );
          })}
        </div>
        {predicted && (
          <div
            className="mt-6 rounded-3xl border-l-[6px] p-5"
            style={{ borderColor: "var(--problem)", background: "oklch(0.98 0.03 40)" }}
          >
            <p className="text-sm">
              Prediction recorded. Let's test it in the <span className="font-bold">Action</span> stage!
            </p>
          </div>
        )}
      </div>
    </div>
  );

}

function ActionView({ pushes, setPushes }: { pushes: number; setPushes: (n: number) => void }) {
  const maxPushes = 3;
  const compression = (pushes / maxPushes) * 100;
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <p className="font-semibold">Experiment: The Sealed Syringe</p>
        <ol className="mt-3 space-y-2 text-sm">
          <li>1. Pull the plunger of a syringe to the 20 ml mark.</li>
          <li>2. Seal the nozzle tightly with your thumb.</li>
          <li>3. Push the plunger down slowly.</li>
          <li>4. Feel what happens as you push harder.</li>
        </ol>
        <div className="mt-6 rounded-3xl bg-muted p-5 text-sm">
          <p className="font-semibold">Try it here</p>
          <p className="mt-1 text-muted-foreground">
            Tap "Push plunger" to compress the air inside the sealed syringe.
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setPushes(Math.min(maxPushes, pushes + 1))}
              className="rounded-2xl bg-[var(--action)] px-5 py-2.5 text-sm font-bold text-white shadow-soft transition-all hover:scale-[1.02] hover:opacity-90"
            >
              Push plunger
            </button>
            <button
              onClick={() => setPushes(0)}
              className="rounded-2xl border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-background"
            >
              Reset
            </button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Pushes: {pushes} / {maxPushes}</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="relative flex h-72 w-32 flex-col rounded-[1.5rem] border-4 border-[oklch(0.8_0.03_220)] bg-white shadow-soft">
          <div
            className="w-full rounded-t-[1.25rem] bg-[oklch(0.65_0.1_220)] transition-all duration-500"
            style={{ height: `${compression}%`, minHeight: 12 }}
          />
          <div className="relative flex-1 overflow-hidden">
            {Array.from({ length: 8 + pushes * 4 }).map((_, i) => (
              <span
                key={i}
                className="absolute h-2 w-2 rounded-full transition-all duration-500"
                style={{
                  background: `oklch(0.65 0.1 220 / ${0.45 + pushes * 0.15})`,
                  left: `${(i * 37) % 90}%`,
                  top: `${(i * 53) % 90}%`,
                }}
              />
            ))}
          </div>
          <div className="h-3 w-full bg-[oklch(0.8_0.03_220)]" />
          <div className="mx-auto h-6 w-4 bg-[oklch(0.65_0.05_220)]" />
        </div>
        <p className="mt-3 text-xs font-semibold text-muted-foreground">
          Air particles inside the sealed syringe
        </p>
      </div>
    </div>
  );
}

function ObservationView({ pushes }: { pushes: number }) {
  const observed = pushes > 0;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <p className="font-semibold">What did you notice?</p>
        <ul className="mt-4 space-y-3 text-sm">
          <ObsItem checked={observed} text="The plunger moved down — the air took up less space." />
          <ObsItem checked={observed} text="It became harder to push as the plunger went down." />
          <ObsItem checked={observed} text="No air escaped — the nozzle was sealed." />
          <ObsItem checked={pushes >= 3} text="When released, the plunger sprang back up." />
        </ul>
      </div>
      <div className="rounded-[2rem] p-7" style={{ background: "oklch(0.96 0.03 220)" }}>
        <p className="text-sm font-bold uppercase tracking-widest text-[var(--observation)]">
          Science Concept
        </p>
        <p className="mt-3 text-lg font-semibold leading-snug">
          Air is <span className="underline decoration-[var(--observation)] decoration-4">matter</span>.
          It takes up space and can be <span className="font-bold">compressed</span> — squeezed
          into a smaller space.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Unlike solids and liquids, air (a gas) has particles that are far apart. They can
          be pushed closer together when force is applied.
        </p>
      </div>
    </div>
  );
}

function ObsItem({ checked, text }: { checked: boolean; text: string }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl bg-muted p-4">
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ background: checked ? "var(--action)" : "var(--border)" }}
      >
        {checked ? "✓" : ""}
      </span>
      <span className="text-sm leading-relaxed">{text}</span>
    </li>
  );
}

function ReflectionView({
  reflection,
  setReflection,
  checked,
  setChecked,
  predicted,
}: {
  reflection: string;
  setReflection: (s: string) => void;
  checked: Record<string, boolean>;
  setChecked: (v: Record<string, boolean>) => void;
  predicted: string | null;
}) {
  const applications = [
    { id: "tyre", text: "Bicycle & car tyres" },
    { id: "ball", text: "Football / basketball" },
    { id: "spray", text: "Aerosol spray cans" },
    { id: "scuba", text: "Scuba diving tanks" },
  ];
  const wasCorrect = predicted === "b";
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <p className="font-semibold">Where do we see this in real life?</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tick everyday things that work because air can be compressed.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {applications.map((a) => {
            const isOn = checked[a.id];
            return (
              <button
                key={a.id}
                onClick={() => setChecked({ ...checked, [a.id]: !isOn })}
                className="rounded-[1.25rem] border-2 p-3.5 text-sm font-semibold transition-all duration-300 hover:shadow-soft"
                style={{
                  borderColor: isOn ? "var(--reflection)" : "var(--border)",
                  background: isOn ? "oklch(0.97 0.04 300)" : "var(--card)",
                }}
              >
                {isOn ? "✓ " : ""}
                {a.text}
              </button>
            );
          })}
        </div>

        {predicted && (
          <div
            className="mt-6 rounded-3xl p-5 text-sm"
            style={{
              background: wasCorrect ? "oklch(0.96 0.05 150)" : "oklch(0.97 0.04 70)",
            }}
          >
            {wasCorrect ? (
              <>Your prediction matched what we observed — air is squeezed into a smaller space!</>
            ) : (
              <>
                Your first prediction was different from what we observed. That's how
                scientists learn — by testing ideas!
              </>
            )}
          </div>
        )}
      </div>

      <div>
        <p className="font-semibold">My Reflection</p>
        <p className="mt-1 text-sm text-muted-foreground">
          In one or two sentences, explain to a friend what you learnt about air today.
        </p>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Today I learnt that air..."
          className="mt-4 h-40 w-full resize-none rounded-[1.5rem] border-2 bg-background p-5 text-sm outline-none transition-all focus:border-[var(--reflection)]"
        />
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{reflection.length} characters</span>
          <button
            className="rounded-xl bg-[var(--reflection)] px-5 py-2.5 text-xs font-bold text-white shadow-soft transition-all hover:scale-[1.02] disabled:opacity-40"
            disabled={!reflection.trim()}
            onClick={() => alert("Reflection saved (sample only).")}
          >
            Save reflection
          </button>
        </div>
      </div>
    </div>
  );
}
