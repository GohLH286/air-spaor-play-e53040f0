import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import shapes from "@/assets/mag-shapes.jpg";
import materials from "@/assets/mag-materials.jpg";
import poles from "@/assets/mag-poles.jpg";
import making from "@/assets/mag-making.jpg";
import compass from "@/assets/mag-compass.jpg";
import uses from "@/assets/mag-uses.jpg";

export const Route = createFileRoute("/magnets")({
  component: MagnetsPage,
  head: () => ({
    meta: [
      { title: "P3 Magnets Revision Notes | Primary Science Singapore" },
      {
        name: "description",
        content:
          "Visual Primary 3 Science revision notes on magnets: poles, magnetic materials, attraction and repulsion, making magnets, fair tests and everyday uses.",
      },
      { property: "og:title", content: "P3 Magnets Revision Notes" },
      {
        property: "og:description",
        content:
          "A picture-led magnets revision guide for Primary 3 pupils in Singapore, with exam traps and a self-check quiz.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const COLORS = ["var(--situation)", "var(--problem)", "var(--action)", "var(--observation)", "var(--reflection)"];

function Card({
  n,
  title,
  color,
  children,
}: {
  n: number;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border bg-card p-6 shadow-[var(--shadow-soft)] md:p-8">
      <div className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-[oklch(0.18_0.04_260)]"
          style={{ background: color }}
        >
          {n}
        </span>
        <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
      </div>
      <div className="mt-5 space-y-4 leading-relaxed">{children}</div>
    </section>
  );
}

function Figure({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure className="overflow-hidden rounded-[1.5rem] border bg-white">
      <img src={src} alt={alt} loading="lazy" width={1024} height={640} className="block h-auto w-full" />
      <figcaption className="bg-muted px-4 py-2.5 text-center text-xs text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

function Trap({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border-l-4 p-4"
      style={{ borderColor: "var(--problem)", background: "color-mix(in oklab, var(--problem) 14%, var(--card))" }}
    >
      <p className="font-bold" style={{ color: "var(--problem)" }}>
        ⚠ Exam trap!
      </p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

const QUIZ = [
  {
    q: "Which of these will a magnet attract?",
    options: ["Copper wire", "Steel paperclip", "Plastic ruler", "Aluminium foil"],
    a: 1,
    why: "Only iron and steel are magnetic. Copper and aluminium are metals but NOT magnetic.",
  },
  {
    q: "Where is a magnet's pull the strongest?",
    options: ["In the middle", "At the two poles", "Everywhere the same", "On the red side only"],
    a: 1,
    why: "Most paperclips stick at the N and S ends — the poles.",
  },
  {
    q: "The N pole of one magnet is brought near the N pole of another. What happens?",
    options: ["They attract", "They repel", "Nothing happens", "They stick, then fall"],
    a: 1,
    why: "Like poles repel; unlike poles attract.",
  },
  {
    q: "A magnet hangs freely on a string. When it stops, it points…",
    options: ["East–West", "North–South", "Up and down", "Any direction"],
    a: 1,
    why: "A freely suspended magnet always rests in the North–South direction. That is how a compass works.",
  },
  {
    q: "To test if more turns of wire make an electromagnet stronger, what must stay the same?",
    options: [
      "The number of turns of wire",
      "Nothing needs to stay the same",
      "The nail, the wire and the batteries",
      "The number of paperclips picked up",
    ],
    a: 2,
    why: "Change only one thing (the turns). Keep the nail, wire and batteries the same. Measure the paperclips picked up.",
  },
];

function Quiz() {
  const [picked, setPicked] = useState<Record<number, number>>({});
  const score = QUIZ.filter((q, i) => picked[i] === q.a).length;
  const answered = Object.keys(picked).length;

  return (
    <div className="space-y-5">
      {QUIZ.map((q, i) => {
        const chosen = picked[i];
        return (
          <div key={q.q} className="rounded-2xl bg-muted p-4">
            <p className="font-semibold">
              {i + 1}. {q.q}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {q.options.map((opt, oi) => {
                const isChosen = chosen === oi;
                const correct = oi === q.a;
                const show = chosen !== undefined;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setPicked((p) => ({ ...p, [i]: oi }))}
                    className="rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-background"
                    style={{
                      borderColor: show && correct ? "var(--action)" : isChosen ? "var(--problem)" : "var(--border)",
                      background:
                        show && correct
                          ? "color-mix(in oklab, var(--action) 20%, var(--card))"
                          : isChosen
                            ? "color-mix(in oklab, var(--problem) 18%, var(--card))"
                            : "var(--card)",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {chosen !== undefined && (
              <p className="mt-3 text-sm text-muted-foreground">
                {chosen === q.a ? "✅ Correct! " : "❌ Not quite. "}
                {q.why}
              </p>
            )}
          </div>
        );
      })}
      <p className="text-center font-bold">
        Score: {score} / {QUIZ.length} {answered === QUIZ.length && score === QUIZ.length ? "🎉 Super scientist!" : ""}
      </p>
    </div>
  );
}

function MagnetsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <Link to="/" className="text-sm font-semibold text-muted-foreground hover:underline">
        ← Back to lesson
      </Link>

      <header className="mt-5 rounded-[2rem] border bg-card p-7 shadow-[var(--shadow-soft)] md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Primary 3 Science · Singapore
        </p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Magnets — Revision Notes</h1>
        <p className="mt-3 text-muted-foreground">
          A picture-first guide for young scientists. Look at the pictures, read the short points, watch out for the
          exam traps, then try the quiz at the end.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {["Poles", "Magnetic materials", "Attract & repel", "Making magnets", "Fair test", "Everyday uses"].map(
            (t, i) => (
              <span
                key={t}
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-[oklch(0.18_0.04_260)]"
                style={{ background: COLORS[i % COLORS.length] }}
              >
                {t}
              </span>
            ),
          )}
        </div>
      </header>

      <div className="mt-6 space-y-6">
        <Card n={1} title="What is a magnet?" color={COLORS[0]}>
          <p>
            A <strong>magnet</strong> is an object that can <strong>pull magnetic materials</strong> (like iron and
            steel) towards itself <strong>without touching them</strong>.
          </p>
          <Figure src={shapes} alt="Horseshoe, bar, ring, U-shaped and button magnets" caption="Magnets come in many shapes: bar, horseshoe, U-shaped, ring and button." />
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Every magnet has <strong>two poles</strong>: a North pole (N) and a South pole (S).
            </li>
            <li>
              The pull is <strong>strongest at the two poles</strong>. Dip a bar magnet into paperclips — most clips
              stick to the two ends.
            </li>
          </ul>
          <div className="rounded-2xl bg-muted p-4">
            <p className="font-bold">🔍 Scientist's tip</p>
            <p className="mt-1">
              To find the poles, see where the most steel clips stick. That is always the N end and the S end.
            </p>
          </div>
        </Card>

        <Card n={2} title="Magnetic & non-magnetic materials" color={COLORS[1]}>
          <p>Magnets do not attract everything! We sort objects into two groups.</p>
          <Figure src={materials} alt="Magnet attracting nails, paperclips and a spoon, but not wood, plastic, glass, copper or aluminium" caption="Magnets attract only magnetic materials — iron and steel." />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl p-4" style={{ background: "color-mix(in oklab, var(--action) 18%, var(--card))" }}>
              <p className="font-bold">✅ Magnetic (attracted)</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Iron — iron nails, iron rods</li>
                <li>Steel — paperclips, pins, spoons</li>
              </ul>
            </div>
            <div className="rounded-2xl p-4" style={{ background: "color-mix(in oklab, var(--problem) 16%, var(--card))" }}>
              <p className="font-bold">🚫 Non-magnetic (not attracted)</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Wood, plastic, rubber, glass, fabric, ceramic</li>
                <li>Copper, aluminium, gold, silver</li>
              </ul>
            </div>
          </div>
          <Trap>
            <p>
              <strong>Not all metals are magnetic!</strong> Aluminium, copper, gold and silver are metals, but a magnet
              will <strong>not</strong> attract them.
            </p>
          </Trap>
        </Card>

        <Card n={3} title="Attraction & repulsion" color={COLORS[2]}>
          <Figure src={poles} alt="Two magnets attracting with unlike poles and repelling with like poles" caption="Unlike poles pull together. Like poles push apart." />
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Unlike poles attract</strong> (N–S or S–N) → they pull together.
            </li>
            <li>
              <strong>Like poles repel</strong> (N–N or S–S) → they push apart.
            </li>
            <li>
              Only <strong>repulsion</strong> proves that both objects are magnets. Attraction could just be a piece of
              steel!
            </li>
          </ul>
          <Trap>
            <p>
              <strong>Bigger does not mean stronger!</strong> Size does not decide strength. A small button magnet can
              pick up more paperclips than a big, weak bar magnet.
            </p>
          </Trap>
        </Card>

        <Card n={4} title="Freely suspended magnets & compasses" color={COLORS[3]}>
          <Figure src={compass} alt="Bar magnet hanging from a retort stand next to a compass" caption="A freely hanging magnet always rests pointing North–South." />
          <p>
            Hang a bar magnet on a string (or float it on water). It will turn and stop in the{" "}
            <strong>North–South direction</strong> every time. This is exactly how a <strong>compass</strong> helps
            people find their way.
          </p>
        </Card>

        <Card n={5} title="Making magnets & fair testing" color={COLORS[4]}>
          <Figure src={making} alt="Stroke method with a bar magnet and an electromagnet made from a nail, wire and battery" caption="Left: the stroke method. Right: the electrical method (electromagnet)." />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-muted p-4">
              <p className="font-bold">1. Stroke method</p>
              <p className="mt-1">
                Stroke an iron nail with <strong>one pole</strong> of a strong magnet, along its whole length, in{" "}
                <strong>one direction only</strong>. Lift the magnet high after each stroke. More strokes → stronger
                magnet.
              </p>
            </div>
            <div className="rounded-2xl bg-muted p-4">
              <p className="font-bold">2. Electrical method</p>
              <p className="mt-1">
                Coil insulated wire tightly around an iron nail and connect it to a battery in a{" "}
                <strong>closed circuit</strong>. More turns of wire <em>or</em> more batteries → stronger
                electromagnet.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 font-bold">Change (only one!)</th>
                  <th className="p-3 font-bold">Keep the same</th>
                  <th className="p-3 font-bold">Measure</th>
                </tr>
              </thead>
              <tbody>
                <tr className="align-top">
                  <td className="border-t p-3">Number of turns of wire<br />OR number of batteries</td>
                  <td className="border-t p-3">Same iron nail · same wire · same battery type · same paperclips</td>
                  <td className="border-t p-3">Number of steel paperclips attracted</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card n={6} title="Magnets in everyday life" color={COLORS[0]}>
          <Figure src={uses} alt="Fridge magnets, whiteboard magnets, scrapyard crane electromagnet, maglev train and a compass" caption="Magnets are all around us." />
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Holding things:</strong> fridge doors, whiteboard magnets, door stoppers, bag and box closures.
            </li>
            <li>
              <strong>Separating:</strong> crane electromagnets lift iron and steel scrap; magnets remove tiny metal
              bits from food.
            </li>
            <li>
              <strong>Floating (repulsion):</strong> maglev trains float above the track and travel very fast.
            </li>
            <li>
              <strong>Finding direction:</strong> a compass needle is a magnet that points North–South.
            </li>
          </ul>
        </Card>

        <Card n={7} title="Quick quiz — check yourself!" color={COLORS[2]}>
          <Quiz />
        </Card>

        <Card n={8} title="Young scientist's checklist" color={COLORS[3]}>
          <ul className="space-y-2">
            {[
              "I can name different shapes of magnets (bar, U-shaped, button, ring…).",
              "I know magnets attract only iron and steel.",
              "I know copper, aluminium, gold and silver are metals but NOT magnetic.",
              "I know a magnet has two poles, where the pull is strongest.",
              "I can state: unlike poles attract, like poles repel.",
              "I know a freely suspended magnet points North–South.",
              "I can explain the stroke method and the electrical method.",
              "I can plan a fair test for what makes an electromagnet stronger.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 rounded-2xl bg-muted px-4 py-3">
                <input type="checkbox" className="mt-1 h-4 w-4 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </main>
  );
}
