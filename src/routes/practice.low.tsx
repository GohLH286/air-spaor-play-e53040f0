import { createFileRoute } from "@tanstack/react-router";
import { Worksheet, type Question } from "@/components/Worksheet";

export const Route = createFileRoute("/practice/low")({
  component: LowSheet,
  head: () => ({
    meta: [
      { title: "Magnets Worksheet A (Lower Ability) | P3 Science" },
      {
        name: "description",
        content:
          "Interactive Primary 3 magnets worksheet for lower ability pupils: magnetic materials, poles, attract and repel, with instant marking.",
      },
      { property: "og:title", content: "Magnets Worksheet A — Lower Ability" },
      { property: "og:description", content: "Simple interactive magnet practice for P3 pupils with instant hints." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const QUESTIONS: Question[] = [
  {
    type: "mcq",
    q: "Which object will a magnet attract?",
    options: ["A wooden pencil", "A steel paperclip", "A plastic cup", "A glass marble"],
    a: 1,
    why: "Magnets attract iron and steel. A steel paperclip is made of steel.",
  },
  {
    type: "mcq",
    q: "How many poles does every magnet have?",
    options: ["One", "Two", "Three", "Four"],
    a: 1,
    why: "Every magnet has two poles — a North pole (N) and a South pole (S).",
  },
  {
    type: "sort",
    q: "Sort these objects. Is each one magnetic or not magnetic?",
    items: [
      { name: "Iron nail", magnetic: true },
      { name: "Rubber eraser", magnetic: false },
      { name: "Steel spoon", magnetic: true },
      { name: "Wooden ruler", magnetic: false },
    ],
    why: "Only iron and steel objects are magnetic. Rubber and wood are not.",
  },
  {
    type: "tf",
    q: "True or False: A magnet is strongest in the middle.",
    a: false,
    why: "A magnet is strongest at its two poles — the two ends.",
  },
  {
    type: "mcq",
    q: "The N pole of one magnet is put near the S pole of another magnet. What happens?",
    options: ["They attract", "They repel", "Nothing happens", "They melt"],
    a: 0,
    why: "Unlike poles (N and S) attract — they pull together.",
  },
  {
    type: "tf",
    q: "True or False: Two North poles push each other away.",
    a: true,
    why: "Like poles repel. N and N push apart.",
  },
  {
    type: "fill",
    q: "Fill in the missing word.",
    before: "A magnet can pull iron and steel without",
    after: "them.",
    accept: ["touching", "touch"],
    why: "A magnet works without touching the object.",
  },
  {
    type: "mcq",
    q: "Where do we see magnets at home?",
    options: ["On the fridge door", "In a glass window", "In a paper book", "In a cotton shirt"],
    a: 0,
    why: "Fridge doors use magnets so they stay closed.",
  },
];

function LowSheet() {
  return (
    <Worksheet
      level="Low"
      subtitle="Take your time. Tap an answer and read the hint that appears."
      color="var(--situation)"
      questions={QUESTIONS}
    />
  );
}
