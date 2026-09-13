import { createFileRoute } from "@tanstack/react-router";
import { Worksheet, type Question } from "@/components/Worksheet";

export const Route = createFileRoute("/practice/medium")({
  component: MediumSheet,
  head: () => ({
    meta: [
      { title: "Magnets Worksheet B (Middle Ability) | P3 Science" },
      {
        name: "description",
        content:
          "Interactive Primary 3 magnets worksheet for middle ability pupils: sorting materials, poles, compass, making magnets, with instant marking.",
      },
      { property: "og:title", content: "Magnets Worksheet B — Middle Ability" },
      {
        property: "og:description",
        content: "Apply your magnet knowledge: sorting, true or false and key science words with instant hints.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const QUESTIONS: Question[] = [
  {
    type: "sort",
    q: "Sort these materials. Is each one magnetic or not magnetic?",
    items: [
      { name: "Copper coin", magnetic: false },
      { name: "Steel scissors blade", magnetic: true },
      { name: "Aluminium foil", magnetic: false },
      { name: "Iron key", magnetic: true },
      { name: "Glass bottle", magnetic: false },
    ],
    why: "Only iron, steel, nickel and cobalt are magnetic. Copper, aluminium and glass are metals or materials that a magnet does not attract.",
  },
  {
    type: "mcq",
    q: "A bar magnet is hung freely and left to rest. Which way does the N pole point?",
    options: ["To the East", "To the West", "To the North", "It keeps spinning"],
    a: 2,
    why: "A freely suspended magnet always rests with its N pole pointing North. This is how a compass works.",
  },
  {
    type: "fill",
    q: "Fill in the missing science word.",
    before: "Like poles",
    after: "each other, so N and N push apart.",
    accept: ["repel", "repels"],
    why: "Like poles repel; unlike poles attract.",
  },
  {
    type: "tf",
    q: "True or False: If you cut a bar magnet into two pieces, one piece will have only a N pole.",
    a: false,
    why: "Each new piece is still a complete magnet with both a N pole and a S pole.",
  },
  {
    type: "mcq",
    q: "Which method can be used to make a magnet from a steel bar?",
    options: [
      "Stroking it in one direction with a magnet",
      "Washing it in water",
      "Heating it over a flame",
      "Dropping it on the floor many times",
    ],
    a: 0,
    why: "Stroking in one direction with one pole of a magnet, or using an electric current (electrical method), makes a magnet. Heating, hammering and dropping make a magnet weaker.",
  },
  {
    type: "mcq",
    q: "Which one of these will make a magnet LOSE its magnetism?",
    options: ["Keeping it with a keeper bar", "Hammering it hard", "Storing it in a dry box", "Storing N next to S"],
    a: 1,
    why: "Hammering, dropping and heating jumble up the magnet inside, so it becomes weaker or loses its magnetism.",
  },
  {
    type: "tf",
    q: "True or False: A magnet can attract an iron paperclip through a thin sheet of paper.",
    a: true,
    why: "Magnetic force can act through non-magnetic materials like paper, plastic and glass.",
  },
  {
    type: "fill",
    q: "Fill in the missing science word.",
    before: "The two ends of a magnet, where the force is strongest, are called the",
    after: "of the magnet.",
    accept: ["poles", "pole"],
    why: "Every magnet has two poles, N and S, and the pull is strongest there.",
  },
  {
    type: "mcq",
    q: "Two objects, X and Y, repel each other. What can we say for sure?",
    options: [
      "Both X and Y are magnets",
      "X is a magnet, Y is iron",
      "Both are made of plastic",
      "Neither is a magnet",
    ],
    a: 0,
    why: "Only two magnets can repel. Attraction alone is not proof, but repulsion is the true test of a magnet.",
  },
];

function MediumSheet() {
  return (
    <Worksheet
      level="Medium"
      subtitle="Read each question carefully. Tap or type your answer, then read the hint."
      color="var(--action)"
      questions={QUESTIONS}
    />
  );
}
