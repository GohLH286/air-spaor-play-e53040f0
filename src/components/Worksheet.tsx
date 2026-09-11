import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";

export type Question =
  | { type: "mcq"; q: string; options: string[]; a: number; why: string }
  | { type: "tf"; q: string; a: boolean; why: string }
  | { type: "fill"; q: string; before: string; after: string; accept: string[]; why: string }
  | { type: "sort"; q: string; items: { name: string; magnetic: boolean }[]; why: string };

type Props = {
  level: "Low" | "Medium" | "High";
  subtitle: string;
  color: string;
  questions: Question[];
};

const norm = (s: string) => s.trim().toLowerCase().replace(/[^a-z]/g, "");

export function Worksheet({ level, subtitle, color, questions }: Props) {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [nonce, setNonce] = useState(0);
  const done = Object.keys(answers).length;
  const score = Object.values(answers).filter(Boolean).length;
  const total = questions.length;

  const mark = (i: number, ok: boolean) => setAnswers((p) => (i in p ? p : { ...p, [i]: ok }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <Link to="/magnets" className="text-sm font-semibold text-muted-foreground hover:underline">
        ← Back to revision notes
      </Link>

      <header className="mt-5 rounded-[2rem] border bg-card p-7 shadow-[var(--shadow-soft)] md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Primary 3 Science · Magnets · e-Practice
        </p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">
          Worksheet {level === "Low" ? "A" : level === "Medium" ? "B" : "C"} — {level} ability
        </h1>
        <p className="mt-3 text-muted-foreground">{subtitle}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span
            className="rounded-full px-4 py-1.5 text-sm font-bold text-[oklch(0.18_0.04_260)]"
            style={{ background: color }}
          >
            {total} questions
          </span>
          <span className="rounded-full bg-muted px-4 py-1.5 text-sm font-semibold">
            Answered {done} / {total} · Score {score}
          </span>
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setNonce((n) => n + 1);
            }}
            className="rounded-full border px-4 py-1.5 text-sm font-semibold hover:bg-muted"
          >
            Try again
          </button>
        </div>
      </header>

      <div className="mt-6 space-y-5" key={nonce}>
        {questions.map((q, i) => (
          <QuestionCard key={`${nonce}-${i}`} index={i} q={q} color={color} onDone={(ok) => mark(i, ok)} />
        ))}
      </div>

      {done === total && (
        <div className="mt-6 rounded-[2rem] border bg-card p-7 text-center shadow-[var(--shadow-soft)]">
          <p className="text-2xl font-bold">
            You scored {score} / {total}
          </p>
          <p className="mt-2 text-muted-foreground">
            {score === total
              ? "Perfect! You are a magnet master. 🧲"
              : score >= total * 0.6
                ? "Well done! Read the blue hints for the ones you missed."
                : "Good try. Go back to the revision notes, then press Try again."}
          </p>
        </div>
      )}
    </main>
  );
}

function Shell({
  index,
  prompt,
  color,
  children,
  feedback,
}: {
  index: number;
  prompt: string;
  color: string;
  children: React.ReactNode;
  feedback?: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border bg-card p-6 shadow-[var(--shadow-soft)] md:p-7">
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-[oklch(0.18_0.04_260)]"
          style={{ background: color }}
        >
          {index + 1}
        </span>
        <p className="font-semibold">{prompt}</p>
      </div>
      <div className="mt-4">{children}</div>
      {feedback}
    </section>
  );
}

function Feedback({ ok, why }: { ok: boolean; why: string }) {
  return (
    <p className="mt-4 rounded-2xl bg-muted px-4 py-3 text-sm">
      {ok ? "✅ Correct! " : "❌ Not quite. "}
      {why}
    </p>
  );
}

function QuestionCard({
  index,
  q,
  color,
  onDone,
}: {
  index: number;
  q: Question;
  color: string;
  onDone: (ok: boolean) => void;
}) {
  if (q.type === "mcq") return <Mcq index={index} q={q} color={color} onDone={onDone} />;
  if (q.type === "tf") return <TrueFalse index={index} q={q} color={color} onDone={onDone} />;
  if (q.type === "fill") return <Fill index={index} q={q} color={color} onDone={onDone} />;
  return <Sort index={index} q={q} color={color} onDone={onDone} />;
}

const optStyle = (state: "idle" | "right" | "wrong") => ({
  borderColor: state === "right" ? "var(--action)" : state === "wrong" ? "var(--problem)" : "var(--border)",
  background:
    state === "right"
      ? "color-mix(in oklab, var(--action) 20%, var(--card))"
      : state === "wrong"
        ? "color-mix(in oklab, var(--problem) 18%, var(--card))"
        : "var(--card)",
});

function Mcq({
  index,
  q,
  color,
  onDone,
}: {
  index: number;
  q: Extract<Question, { type: "mcq" }>;
  color: string;
  onDone: (ok: boolean) => void;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  return (
    <Shell
      index={index}
      prompt={q.q}
      color={color}
      feedback={chosen !== null ? <Feedback ok={chosen === q.a} why={q.why} /> : undefined}
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {q.options.map((opt, oi) => {
          const state = chosen === null ? "idle" : oi === q.a ? "right" : oi === chosen ? "wrong" : "idle";
          return (
            <button
              key={opt}
              type="button"
              disabled={chosen !== null}
              onClick={() => {
                setChosen(oi);
                onDone(oi === q.a);
              }}
              className="rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-muted disabled:cursor-default"
              style={optStyle(state)}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

function TrueFalse({
  index,
  q,
  color,
  onDone,
}: {
  index: number;
  q: Extract<Question, { type: "tf" }>;
  color: string;
  onDone: (ok: boolean) => void;
}) {
  const [chosen, setChosen] = useState<boolean | null>(null);
  return (
    <Shell
      index={index}
      prompt={q.q}
      color={color}
      feedback={chosen !== null ? <Feedback ok={chosen === q.a} why={q.why} /> : undefined}
    >
      <div className="flex gap-3">
        {[true, false].map((v) => {
          const state = chosen === null ? "idle" : v === q.a ? "right" : v === chosen ? "wrong" : "idle";
          return (
            <button
              key={String(v)}
              type="button"
              disabled={chosen !== null}
              onClick={() => {
                setChosen(v);
                onDone(v === q.a);
              }}
              className="rounded-xl border px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-default"
              style={optStyle(state)}
            >
              {v ? "True" : "False"}
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

function Fill({
  index,
  q,
  color,
  onDone,
}: {
  index: number;
  q: Extract<Question, { type: "fill" }>;
  color: string;
  onDone: (ok: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const ok = useMemo(() => q.accept.some((a) => norm(a) === norm(value)), [value, q.accept]);
  return (
    <Shell
      index={index}
      prompt={q.q}
      color={color}
      feedback={
        checked ? <Feedback ok={ok} why={ok ? q.why : `The answer is “${q.accept[0]}”. ${q.why}`} /> : undefined
      }
    >
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span>{q.before}</span>
        <input
          value={value}
          disabled={checked}
          onChange={(e) => setValue(e.target.value)}
          placeholder="type here"
          className="min-w-[8rem] rounded-xl border px-3 py-2"
          style={optStyle(checked ? (ok ? "right" : "wrong") : "idle")}
        />
        <span>{q.after}</span>
        {!checked && (
          <button
            type="button"
            disabled={!value.trim()}
            onClick={() => {
              setChecked(true);
              onDone(ok);
            }}
            className="rounded-full border px-4 py-2 font-semibold hover:bg-muted disabled:opacity-50"
          >
            Check
          </button>
        )}
      </div>
    </Shell>
  );
}

function Sort({
  index,
  q,
  color,
  onDone,
}: {
  index: number;
  q: Extract<Question, { type: "sort" }>;
  color: string;
  onDone: (ok: boolean) => void;
}) {
  const [picks, setPicks] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState(false);
  const allPicked = q.items.every((it) => it.name in picks);
  const allRight = q.items.every((it) => picks[it.name] === it.magnetic);
  return (
    <Shell
      index={index}
      prompt={q.q}
      color={color}
      feedback={checked ? <Feedback ok={allRight} why={q.why} /> : undefined}
    >
      <div className="space-y-2">
        {q.items.map((it) => {
          const pick = picks[it.name];
          return (
            <div key={it.name} className="flex items-center justify-between gap-3 rounded-2xl bg-muted px-4 py-2.5">
              <span className="text-sm font-medium">{it.name}</span>
              <div className="flex gap-2">
                {[true, false].map((v) => {
                  const state =
                    !checked
                      ? pick === v
                        ? "right"
                        : "idle"
                      : it.magnetic === v
                        ? "right"
                        : pick === v
                          ? "wrong"
                          : "idle";
                  return (
                    <button
                      key={String(v)}
                      type="button"
                      disabled={checked}
                      onClick={() => setPicks((p) => ({ ...p, [it.name]: v }))}
                      className="rounded-xl border px-3 py-1.5 text-xs font-semibold disabled:cursor-default"
                      style={optStyle(state as "idle" | "right" | "wrong")}
                    >
                      {v ? "Magnetic" : "Not magnetic"}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {!checked && (
        <button
          type="button"
          disabled={!allPicked}
          onClick={() => {
            setChecked(true);
            onDone(allRight);
          }}
          className="mt-3 rounded-full border px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50"
        >
          Check my sorting
        </button>
      )}
    </Shell>
  );
}
