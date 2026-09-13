import { createFileRoute } from "@tanstack/react-router";
import { Worksheet, type Question } from "@/components/Worksheet";

export const Route = createFileRoute("/practice/high")({
  component: HighSheet,
  head: () => ({
    meta: [
      { title: "Magnets Worksheet C (Higher Ability) | P3 Science" },
      {
        name: "description",
        content:
          "Challenging interactive Primary 3 magnets worksheet: fair tests, proving a magnet, exam traps and scientific reasoning with instant marking.",
      },
      { property: "og:title", content: "Magnets Worksheet C — Higher Ability" },
      {
        property: "og:description",
        content: "Think like a scientist: fair tests, proof of magnetism and tricky magnet exam questions.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const QUESTIONS: Question[] = [
  {
    type: "mcq",
    q: "Ali has two identical grey bars, P and Q. One is a magnet, one is an iron bar. Which test tells him for sure which one is the magnet?",
    options: [
      "See which bar picks up paperclips",
      "Bring the end of P near each end of Q and look for pushing away",
      "Check which bar is heavier",
      "See which bar sticks to the table",
    ],
    a: 1,
    why: "Both a magnet and an iron bar can attract. Only two magnets can repel, so repulsion is the only sure test of a magnet.",
  },
  {
    type: "mcq",
    q: "Siti wants to find out which magnet is stronger. She counts the paperclips each magnet can hold. What must she keep the same?",
    options: [
      "The size of the paperclips and the way she hangs them",
      "The strength of the magnets",
      "The number of paperclips used",
      "Nothing, any way is fine",
    ],
    a: 0,
    why: "In a fair test, only the magnet (the thing being tested) changes. Everything else — same paperclips, same method — must be kept the same.",
  },
  {
    type: "tf",
    q: "True or False: In the paperclip test above, the number of paperclips held is the measured result (dependent variable).",
    a: true,
    why: "The magnet used is what is changed; the number of paperclips held is what is measured.",
  },
  {
    type: "sort",
    q: "A magnet is placed under a table top. Which of these objects on the table will it attract through the table top?",
    items: [
      { name: "Steel pin", magnetic: true },
      { name: "Plastic button", magnetic: false },
      { name: "Nickel disc", magnetic: true },
      { name: "Copper wire", magnetic: false },
    ],
    why: "Magnetic force passes through non-magnetic materials like wood. Only the magnetic materials (iron, steel, nickel, cobalt) respond.",
  },
  {
    type: "fill",
    q: "Fill in the missing word.",
    before: "To store bar magnets safely, we place them in pairs with unlike poles together and add a soft iron",
    after: "at each end.",
    accept: ["keeper", "keepers", "keeperbar"],
    why: "Keepers (soft iron bars) keep the magnetism from leaking away during storage.",
  },
  {
    type: "mcq",
    q: "A bar magnet is broken into three pieces. How many poles are there altogether now?",
    options: ["Two", "Three", "Six", "Nine"],
    a: 2,
    why: "Each piece is a full magnet with two poles, so 3 pieces × 2 poles = 6 poles.",
  },
  {
    type: "tf",
    q: "True or False: An iron nail hanging from a magnet can pick up another nail below it.",
    a: true,
    why: "By induced magnetism, the first nail becomes a temporary magnet while it is touching the magnet, so it can attract a second nail.",
  },
  {
    type: "mcq",
    q: "A compass is placed next to a bar magnet's S pole. Which pole of the compass needle points towards it?",
    options: ["The N pole of the needle", "The S pole of the needle", "Neither, it spins", "Both ends equally"],
    a: 0,
    why: "Unlike poles attract, so the needle's N pole is pulled towards the magnet's S pole.",
  },
  {
    type: "mcq",
    q: "Why does a compass not work well when it is placed on a steel table?",
    options: [
      "Steel is too smooth",
      "The steel is magnetic and pulls the needle away from North",
      "Steel is heavier than the needle",
      "Steel blocks sunlight",
    ],
    a: 1,
    why: "Nearby magnetic materials and magnets attract the needle, so it no longer rests pointing North.",
  },
  {
    type: "fill",
    q: "Fill in the missing word.",
    before: "Heating, hammering or dropping a magnet will make it",
    after: "its magnetism.",
    accept: ["lose", "loses", "weaken"],
    why: "These actions jumble the tiny magnets inside, so the magnet becomes weaker or loses its magnetism.",
  },
];

function HighSheet() {
  return (
    <Worksheet
      level="High"
      subtitle="Explain your thinking to yourself before you answer. Some questions are exam traps."
      color="var(--reflection)"
      questions={QUESTIONS}
    />
  );
}
