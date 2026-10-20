import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UploadZone } from "@/components/UploadZone";

export const Route = createFileRoute("/maths")({
  component: MathsPortal,
  head: () => ({
    meta: [
      { title: "P3 Maths PLT Portal | Maths Talk Moves & Fractions" },
      {
        name: "description",
        content:
          "Primary 3 Maths PLT portal using SPAOR: Maths Talk Moves (What If / What's Wrong), comparing fractions, team uploads and KISS review.",
      },
      { property: "og:title", content: "P3 Maths PLT Portal" },
      {
        property: "og:description",
        content: "An interactive SPAOR portal for the Primary 3 Maths PLT team.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const stages = [
  { id: "scan", label: "Scan", color: "var(--situation)" },
  { id: "plan", label: "Plan", color: "var(--problem)" },
  { id: "action", label: "Action", color: "var(--action)" },
  { id: "observe", label: "Observe", color: "var(--observation)" },
  { id: "review", label: "Review", color: "var(--reflection)" },
] as const;
type StageId = (typeof stages)[number]["id"];

function Card({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border bg-card p-5">
      <p className="font-bold" style={{ fontSize: "1.3rem", color }}>{title}</p>
      <div className="mt-2 space-y-2 leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

function MathsPortal() {
  const [stage, setStage] = useState<StageId>("scan");
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("stage");
    if (s && stages.some((x) => x.id === s)) setStage(s as StageId);
  }, []);
  const go = (id: StageId) => {
    setStage(id);
    window.history.replaceState(null, "", `?stage=${id}`);
  };
  const cur = stages.find((s) => s.id === stage)!;

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <Link to="/" className="text-sm text-muted-foreground hover:underline">← Air (Science) PLT lesson</Link>
      <h1 className="mt-3 text-4xl font-extrabold">P3 Maths PLT Portal</h1>
      <p className="mt-2 text-muted-foreground">
        Maths Talk Moves — “What If?” and “What’s Wrong?” · Fractions · SPAOR cycle · MOE Maths Syllabus
      </p>

      <nav className="mt-6 flex flex-wrap gap-2">
        {stages.map((s) => (
          <button
            key={s.id}
            onClick={() => go(s.id)}
            className="rounded-full border-2 px-5 py-2 font-bold transition-transform hover:scale-105"
            style={
              stage === s.id
                ? { background: s.color, borderColor: s.color, color: "oklch(0.18 0.04 260)" }
                : { borderColor: s.color, color: s.color }
            }
          >
            {s.label}
          </button>
        ))}
      </nav>

      <section className="mt-8 space-y-6">
        {stage === "scan" && <Scan color={cur.color} />}
        {stage === "plan" && <Plan color={cur.color} />}
        {stage === "action" && <Action color={cur.color} />}
        {stage === "observe" && <Observe color={cur.color} />}
        {stage === "review" && <Review color={cur.color} />}
      </section>
    </main>
  );
}

function Scan({ color }: { color: string }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Problem areas we noticed" color={color}>
          <p>Pupils can follow procedures but struggle to explain their reasoning in fractions.</p>
          <p>Common gap: comparing fractions when the wholes are not the same.</p>
          <p>Fact fluency barrier: multiplication tables of 2 and finding half of a number.</p>
        </Card>
        <Card title="Our focus" color={color}>
          <p>Maths Talk Moves: <b>“What If?”</b> and <b>“What’s Wrong?”</b></p>
          <p>Aligned to e21CC — Critical, Adaptive & Inventive Thinking (CAIT).</p>
        </Card>
      </div>
      <Card title="Four Critical Questions" color={color}>
        <ol className="list-decimal space-y-1 pl-5">
          <li>What do we expect pupils to learn?</li>
          <li>How will we know when they have learned it?</li>
          <li>How will we respond when they have not learned?</li>
          <li>How will we respond when they already know it?</li>
        </ol>
      </Card>
      <UploadZone label="Scan · My Uploads" color={color} slots={[
        { id: "maths-scan-logs", title: "PLT Team Learning Logs", hint: "Upload session logs (Word/PDF)." },
        { id: "maths-scan-data", title: "Baseline data", hint: "Past test results or item analysis." },
      ]} />
    </>
  );
}

function Plan({ color }: { color: string }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="“What If?”" color={color}>
          <p>Change one part of a problem: “What if the denominator were 8 instead of 4?”</p>
          <p>Builds flexible, adaptive thinking.</p>
        </Card>
        <Card title="“What’s Wrong?”" color={color}>
          <p>Show a worked example with an error. Pupils find, explain and fix it.</p>
          <p>Builds critical thinking and error analysis.</p>
        </Card>
        <Card title="Fractions sequence" color={color}>
          <p>1. Like fractions → 2. Unit fractions → 3. Compare to ½.</p>
          <p>Reminder: the whole must be the same.</p>
        </Card>
      </div>
      <UploadZone label="Plan · My Uploads" color={color} slots={[
        { id: "maths-plan-lit", title: "Literature review", hint: "Readings on Maths Talk Moves." },
        { id: "maths-plan-lesson", title: "Lesson plan & SLS lessons", allowLink: true, linkHint: "Paste the SLS lesson URL." },
      ]} />
    </>
  );
}

const wrongItems = [
  { claim: "1/4 is bigger than 1/2 because 4 is bigger than 2.", wrong: true, why: "With unit fractions, a bigger denominator means smaller parts. 1/2 > 1/4." },
  { claim: "2/6 and 1/3 are equivalent fractions.", wrong: false, why: "Correct! 2/6 simplifies to 1/3." },
  { claim: "3/5 is less than 1/2.", wrong: true, why: "Half of 5 is 2½, and 3 > 2½, so 3/5 is more than ½." },
];

function Action({ color }: { color: string }) {
  const [num, setNum] = useState(3);
  const [den, setDen] = useState(8);
  const [picked, setPicked] = useState<Record<number, boolean>>({});
  const half = den / 2;
  const verdict = num > half ? "more than ½" : num < half ? "less than ½" : "equal to ½";
  return (
    <>
      <Card title="Compare to ½ — explore" color={color}>
        <div className="flex flex-wrap items-center gap-4">
          <label>Numerator <input type="number" min={0} max={den} value={num}
            onChange={(e) => setNum(Math.max(0, Math.min(den, Number(e.target.value))))}
            className="ml-2 w-20 rounded-lg border bg-muted px-2 py-1" /></label>
          <label>Denominator <input type="number" min={2} max={12} value={den}
            onChange={(e) => { const d = Math.max(2, Math.min(12, Number(e.target.value))); setDen(d); setNum((n) => Math.min(n, d)); }}
            className="ml-2 w-20 rounded-lg border bg-muted px-2 py-1" /></label>
        </div>
        <div className="mt-4 flex h-14 overflow-hidden rounded-xl border-2" style={{ borderColor: color }}>
          {Array.from({ length: den }).map((_, i) => (
            <div key={i} className="flex-1 border-r last:border-r-0"
              style={{ background: i < num ? color : "transparent", borderColor: "var(--border)" }} />
          ))}
        </div>
        <p className="mt-3 text-lg text-foreground">
          {num}/{den} is <b style={{ color }}>{verdict}</b> (half of {den} is {half}).
        </p>
        <p>What if the denominator changes? Try it and talk about it.</p>
      </Card>

      <Card title="What’s Wrong? — pupil challenge" color={color}>
        {wrongItems.map((it, i) => (
          <div key={i} className="rounded-xl bg-muted p-3">
            <p className="text-foreground">“{it.claim}”</p>
            <div className="mt-2 flex gap-2">
              {[true, false].map((v) => (
                <button key={String(v)} onClick={() => setPicked((p) => ({ ...p, [i]: v }))}
                  className="rounded-lg border px-3 py-1 font-semibold"
                  style={picked[i] === v ? { background: color, color: "oklch(0.18 0.04 260)" } : {}}>
                  {v ? "Something’s wrong" : "It’s correct"}
                </button>
              ))}
            </div>
            {picked[i] !== undefined && (
              <p className="mt-2">{picked[i] === it.wrong ? "✅ " : "❌ Try again. "}{picked[i] === it.wrong && it.why}</p>
            )}
          </div>
        ))}
      </Card>

      <UploadZone label="Action · My Uploads" color={color} slots={[
        { id: "maths-action-slides", title: "Teaching slides & games", allowLink: true, linkHint: "Paste SLS or NotebookLM link." },
        { id: "maths-action-worksheets", title: "Differentiated worksheets", hint: "HA / MA / LA versions." },
      ]} />
    </>
  );
}

const lookFors = [
  "Pupils use “What if…?” to change a problem",
  "Pupils explain an error using maths vocabulary",
  "Pupils compare fractions to ½ before deciding",
  "Pupils check that the wholes are the same",
];

function Observe({ color }: { color: string }) {
  const [done, setDone] = useState<boolean[]>(lookFors.map(() => false));
  return (
    <>
      <Card title="Classroom look-fors" color={color}>
        {lookFors.map((l, i) => (
          <label key={l} className="flex items-center gap-3 text-foreground">
            <input type="checkbox" checked={done[i]} onChange={() => setDone((d) => d.map((x, j) => (j === i ? !x : x)))} className="h-5 w-5" />
            {l}
          </label>
        ))}
        <p>{done.filter(Boolean).length} / {lookFors.length} observed</p>
      </Card>
      <UploadZone label="Observe · My Uploads" color={color} slots={[
        { id: "maths-observe-artefacts", title: "Pupils’ artefacts", hint: "Photos of pupils’ work.", accept: "image/*,application/pdf" },
        { id: "maths-observe-tests", title: "Pre / post test data", hint: "Results and analysis." },
      ]} />
    </>
  );
}

function Review({ color }: { color: string }) {
  const quads = [
    { t: "Keep", c: "var(--action)" },
    { t: "Improve", c: "var(--situation)" },
    { t: "Start", c: "var(--observation)" },
    { t: "Stop", c: "var(--problem)" },
  ];
  const [notes, setNotes] = useState<Record<string, string>>({});
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {quads.map((q) => (
          <Card key={q.t} title={q.t} color={q.c}>
            <textarea rows={4} value={notes[q.t] ?? ""} onChange={(e) => setNotes((n) => ({ ...n, [q.t]: e.target.value }))}
              placeholder={`Team notes for ${q.t}…`} className="w-full rounded-xl border bg-muted p-3" />
          </Card>
        ))}
      </div>
      <UploadZone label="Review · My Uploads" color={color} slots={[
        { id: "maths-review-report", title: "PLT reflection / sharing", hint: "Final slides or report.", allowLink: true },
      ]} />
    </>
  );
}
