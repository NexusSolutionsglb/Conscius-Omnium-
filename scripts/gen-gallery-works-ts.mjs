// One-off generator: merges scripts/gallery-manifest.json (real image
// dimensions + blur data) with hand-transcribed artwork metadata (verbatim
// from the client's PDFs/pptx) into a TypeScript snippet for
// lib/content/works.ts. Output is written to scripts/.gen-works-snippet.ts
// for manual review + paste — nothing here writes into lib/content itself.
//
// Run: node scripts/gen-gallery-works-ts.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const manifest = JSON.parse(readFileSync(join(process.cwd(), "scripts", "gallery-manifest.json"), "utf8"));

const PAPER = "Acrylic on Ivory paper";
const CM = "56 × 71 cm";
const OIL = "Oil pastels on black paper";
const BLACK_CM = "54 × 67 cm";

// Order matters — becomes sortOrder starting at 25.
const WORKS = [
  // ── Black Canvas ──
  {
    collection: "black-canvas", slug: "breath-and-the-mind", title: "Breath and the Mind",
    medium: OIL, dimensions: BLACK_CM, year: "2026", price: 65000,
    summary: "The relationship between breath and mind, traced through repeated returns to the point where attention keeps slipping and keeps coming back.",
    description: [
      "The journey begins with a black canvas — a space before form, representing stillness and possibility. Through Anapana meditation, attention moves towards the breath: the touch of air at the nostrils, the movement through the body, and subtle sensations around the forehead.",
      "Thoughts continue to arise and pull attention away, but awareness returns again and again to the breath. This painting explores the relationship between breath and mind — the constant movement between distraction and observation, thought and presence. A visual reflection on the process of becoming aware.",
    ],
  },
  {
    collection: "black-canvas", slug: "subtle-currents", title: "Subtle Currents",
    medium: OIL, dimensions: BLACK_CM, year: "2026", price: 55000,
    summary: "A narrowing of focus to the space between the nostrils and the upper lip, and the almost-invisible movements found there.",
    description: [
      "Attention moves deeper into a smaller field of observation — the space between the nostrils and the upper lip, where the breath gently touches the body. The slightest sensations become visible: the movement of air, the changing waves of feeling, and the subtle currents that are usually unnoticed.",
      "Thoughts continue to arise and pull attention away, but awareness returns again and again. This painting explores the refinement of attention — discovering the depth within a single breath and the invisible movements that exist within each moment.",
    ],
  },
  {
    collection: "black-canvas", slug: "the-tree-house", title: "The Tree House",
    medium: OIL, dimensions: BLACK_CM, year: "2026", price: 75000,
    summary: "A meditation that wandered toward a real design brief — a tree house for a friend's farm — and let the thought become the painting instead of resisting it.",
    description: [
      "The meditation began with observing the breath, but attention moved towards a thought — the design of a tree house for a friend's farm. A place to work, observe the land, and remain connected with nature while working remotely. Instead of resisting the thought, I followed it.",
      "The structure, the space, the relationship between architecture and landscape began to take form on the canvas. This work explores the meeting point of meditation and creativity — where a thought becomes a design, and design becomes a form of observation.",
    ],
  },
  {
    collection: "black-canvas", slug: "vortex-of-awareness", title: "Vortex of Awareness",
    medium: OIL, dimensions: BLACK_CM, year: "2026", price: 75000,
    summary: "Attention moved through the body from head to toe until the sensations converged into something felt as a single inner vortex.",
    description: [
      "Through meditation, attention moves through the body — observing sensations from head to toe and back again. As awareness deepens, these subtle sensations begin to feel like waves, converging into an inner movement — a vortex within the body.",
      "For brief moments, the outside world fades, leaving only observation and experience. This painting explores the relationship between sensation, awareness, and the continuous journey of understanding the self through observation.",
    ],
  },
  {
    collection: "black-canvas", slug: "shape-of-belief", title: "Shape of Belief",
    medium: "Acrylic and chalk powder on black paper", dimensions: BLACK_CM, year: "2026", price: 75000,
    summary: "Transparent gum laid on black paper first, powder colour added after — belief, like perception, giving shape to a pattern that already existed.",
    description: [
      "This work begins with a question: do we experience truth as it is, or do we experience the meaning we create around it? The painting starts with transparent gum applied on the black surface — an invisible structure waiting to be revealed. Powder colour is then introduced, exposing patterns that were already formed before they became visible.",
      "The process becomes a reflection of perception itself. We observe, interpret, connect fragments, and create meaning. Gradually, belief gives shape to what we see. This painting explores the space between reality and interpretation — between what exists and what the mind reveals.",
    ],
  },

  // ── States of Attention ──
  {
    collection: "states-of-attention", slug: "the-light-attracts-everything", title: "The Light Attracts Everything",
    medium: PAPER, dimensions: CM, year: "2026", price: 60000,
    processVideo: "https://youtu.be/4laH2RzzHyg",
    summary: "A 3 a.m. meditation, documented on camera for the first time, as terrace lights drew bees out of the dark and distraction became the subject.",
    description: [
      "A 3 AM meditation led into this painting process. For the first time, decided to document the experience and speak in front of the camera. As the terrace lights drew bees from the darkness, the act of creating also brought distraction, fear, movement, and awareness to the surface.",
      "This work became less about achieving stillness and more about observing everything that gathers around light.",
    ],
  },
  {
    collection: "states-of-attention", slug: "symmetry-in-the-swarm", title: "Symmetry in the Swarm",
    medium: PAPER, dimensions: CM, year: "2026", price: 60000,
    processVideo: "https://youtu.be/ZdW_NNWwjWE",
    summary: "As the bees at the terrace light kept gathering, deeper focus turned their chaos into afterimages — symmetrical forms emerging within the swarm.",
    description: [
      "This emerged from observing distraction, fear, and the gradual ability to remain present. As bees gathered around the terrace lights, the chaos of movement became the subject of observation. With deeper focus, the external world began to fade, and patterns started appearing through afterimages — symmetrical forms emerging within the swarm.",
      "The painting explores the hidden order within apparent chaos, and how attention can transform disturbance into perception.",
    ],
  },
  {
    collection: "states-of-attention", slug: "concentric-emergence", title: "Concentric Emergence",
    medium: PAPER, dimensions: CM, year: "2026", price: 85000,
    processVideo: "https://youtu.be/Fc9Obr-xNKI",
    summary: "The camera was still there, but the mind had begun to move past it — what stayed visible were concentric afterimages expanding around a growing centre of light.",
    description: [
      "The camera was still present, but it no longer occupied the space the same way. The bees remained around the light, yet the mind had begun to move past distraction. What stayed visible were the afterimages — concentric formations expanding and dissolving around a growing centre of light.",
      "The experience felt similar to searching for light while trapped inside fabric — like the brief moment when a T-shirt catches around the head and the eyes instinctively move toward the opening. This painting emerged from that sensation of perception pushing itself toward clarity.",
    ],
  },
  {
    collection: "states-of-attention", slug: "pyre-for-perspective", title: "Pyre for Perspective",
    medium: "Burnt on Ivory paper", dimensions: CM, year: "2026", price: 65000,
    processVideo: "https://youtu.be/xvQT-e2y8OE",
    summary: "A disturbance during meditation — that thoughts about painting never stop arising — led to burning the paper itself and using the burn marks to form an eye.",
    description: [
      "During meditation, a disturbance arose from the thought that thoughts themselves continue to arise endlessly. The act of painting began to feel performative — an image repeating itself through habit, observation, and identity. A question remained: if art is meant to liberate, what must first be burned?",
      "Began burning paper and using the burn marks themselves to form an eye-like structure on the canvas. The process became less about creating an image and more about confronting perspective through destruction. This work emerged from an attempt to burn perspective itself.",
    ],
  },
  {
    collection: "states-of-attention", slug: "the-canvas-wouldnot-empty", title: "The Canvas Wouldnot Empty",
    medium: PAPER, dimensions: CM, year: "2026", price: 75000,
    processVideo: "https://youtu.be/PFnRwOx9Z3U",
    summary: "An attempt to cover the canvas in black and find emptiness — undone, layer after layer, by a mind that kept moving.",
    description: [
      "The meditation began, but thoughts arrived faster than silence — thoughts about painting, the camera, people watching, and the future. Instead of resisting them, placed them onto the canvas. I tried covering everything in black, searching for emptiness. But the mind was still active, still moving. Colours returned, one layer washing over another, like thoughts replacing thoughts.",
      "This work explores a question: If thoughtlessness is not the goal, can deep awareness itself become meditation? Perhaps painting is also a meditation — not by escaping thought, but by moving completely through it.",
    ],
  },

  // ── Duality — only "The Burden of Goodness" has source text; the other
  // four have real titles/images and no fabricated description or medium. ──
  {
    collection: "duality", slug: "dance-of-duality", title: "Dance of Duality",
    summary: "From the Duality series.",
  },
  {
    collection: "duality", slug: "the-burden-of-goodness", title: "The Burden of Goodness",
    medium: PAPER, dimensions: CM, price: 250000,
    processVideo: "https://youtu.be/4laH2RzzHyg", processVideoUnverified: true,
    summary: "A contemplative exploration of morality, pleasure, pain, and the identities we build around them, resolving into the open eye of consciousness at the centre.",
    description: [
      "The Burden of Goodness is a contemplative exploration of morality, pleasure, pain, and the subtle identities we create around them.",
      "The upper half represents goodness and pleasure — the part of us that knows what it wants and moves toward it. The eyes have pupils, symbolising awareness, direction, and desire. Yet every desire can carry its own attachments: fear, anger, jealousy, pride, and the fear of losing what we seek.",
      "The lower half represents pain, struggle, and surrender. The eyes have no pupils, suggesting a state that does not seek or grasp. Through struggle, sacrifice, and stepping beyond comfort, attachments can begin to dissolve.",
      "At the centre is the open eye of consciousness — awareness beyond the labels of good and bad, pleasure and pain. The partially closing eyelid becomes the final metaphor. The path from above is obstructed, while below it remains open. It suggests that even the identity of being good, or the desire for a higher state of awareness, can become another form of attachment.",
      "The painting ultimately asks: Who are you beyond the need to be good, bad, right, or wrong? And perhaps, more subtly: Can awakening be found when there is nothing left to seek?",
    ],
  },
  {
    collection: "duality", slug: "the-infinite-axis", title: "The Infinite Axis",
    summary: "From the Duality series.",
  },
  {
    collection: "duality", slug: "the-primordial-point", title: "The Primordial Point",
    summary: "From the Duality series.",
  },
  {
    collection: "duality", slug: "untitled-i", title: "Untitled",
    summary: "From the Duality series — untitled in the material supplied by the artist.",
  },

  // ── States of Awareness (the Nilgai series) ──
  {
    collection: "states-of-awareness", slug: "establishment-of-self", title: "Establishment of Self",
    medium: "Acrylic on paper", dimensions: "22 × 22 in", year: "2026", sold: true,
    processVideo: "https://youtu.be/NmezGg8lRSQ",
    summary: "The first painting in the series — a mountain landscape crowned by a Shivling, a nest with one hatched and one unhatched egg, and the young bird's freedom to choose.",
    description: [
      "Establishment of Self is the first painting in the States of Awareness series. A mountain landscape crowned by a towering Shivling symbolizes the source of consciousness. Waterfalls descend into open grasslands before disappearing into a dense forest, representing the unfolding journey of life.",
      "In the foreground, a luminous nest with one hatched and one unhatched egg symbolizes birth and infinite potential. The young bird embodies the freedom to choose. Through choice, experience, and karma, the sense of self gradually takes form, inviting the viewer to reflect on identity as a process established through the life we choose to live.",
    ],
  },
  {
    collection: "states-of-awareness", slug: "the-weight-of-i", title: "The Weight of ‘I’",
    medium: "Acrylic on paper", dimensions: "22 × 22 in", year: "2026", sold: true,
    processVideo: "https://youtu.be/eYqfRj33NLo",
    summary: "The second painting — a luminous bird moving through a forest where light cannot reach the ground, and the fear that arrives with a formed identity.",
    description: [
      "The Weight of 'I' is the second painting in the States of Awareness series. A luminous bird journeys through a dense forest where light cannot reach the ground, symbolizing the mind after the formation of identity. As the sense of \"I\" emerges, so does the instinct to protect it.",
      "The painting reflects on fear as a natural consequence of attachment to the self, inviting the viewer to contemplate the burden of identity.",
    ],
  },
  {
    collection: "states-of-awareness", slug: "the-observer", title: "The Observer",
    medium: "Acrylic on paper", dimensions: "22 × 22 in", year: "2026", sold: true,
    processVideo: "https://youtu.be/vYGxbBO68tA",
    summary: "Deep in the forest, the bird meets a still Nilgai — and realises thoughts, emotions and fear need not be identified with, only observed.",
    description: [
      "The Observer is the third painting in the States of Awareness series. Deep within the dense forest, the bird encounters a still Nilgai, symbolizing awareness. In this silent meeting, the bird realizes that thoughts, emotions, and fear need not be identified with — they can simply be observed.",
      "The painting marks the shift from attachment to witnessing, revealing awareness as the quiet presence behind every experience.",
    ],
  },
  {
    collection: "states-of-awareness", slug: "the-bliss", title: "The Bliss",
    medium: "Acrylic on paper", dimensions: "22 × 22 in", year: "2026", sold: true,
    processVideo: "https://youtu.be/h4R5qXem2ys",
    summary: "Guided by fireflies, the bird rises above the forest into the open sky, witnessing light and darkness as parts of the same whole.",
    description: [
      "The Bliss is the fourth painting in the States of Awareness series. Guided by a swarm of fireflies, the bird rises above the forest into the open sky, where it witnesses both light and darkness as parts of the same whole.",
      "The painting symbolizes the joy that arises from awareness — not through escaping the world, but through seeing it with clarity, freedom, and an unburdened mind.",
    ],
  },
  {
    collection: "states-of-awareness", slug: "a-small-fire", title: "A Small Fire",
    medium: "Acrylic on paper", dimensions: "22 × 22 in", year: "2026", sold: true,
    processVideo: "https://youtu.be/K19KNbITkhk",
    summary: "From above the forest, the bird watches a fire burning in the valley below — overwhelming up close, small within the whole landscape.",
    description: [
      "A Small Fire is the fifth and final painting in the States of Awareness series. From above the forest, the bird witnesses a fire burning in the valley below. What once might have appeared overwhelming is now seen within the vastness of the landscape.",
      "The painting reflects on perspective, reminding us that the mind often magnifies its struggles, while awareness reveals them as fleeting moments within a much larger whole.",
    ],
  },
];

const esc = (s) => JSON.stringify(s);

function relatedFor(list, i) {
  const siblings = list.filter((_, j) => j !== i).map((w) => w.slug);
  return siblings.slice(0, 3);
}

const byCollection = {};
for (const w of WORKS) (byCollection[w.collection] ??= []).push(w);

let out = "";
let sortOrder = 25;
for (const w of WORKS) {
  const m = manifest[w.collection][w.slug];
  const list = byCollection[w.collection];
  const i = list.indexOf(w);
  const related = relatedFor(list, i);
  const year = w.year ?? null;
  const availability = w.sold ? "sold" : w.price ? "available" : "enquire";
  const priceVisible = !!w.price;
  const process =
    w.processVideo && !w.processVideoUnverified
      ? `Watch the process: ${w.processVideo}`
      : null;

  out += `  {
    ...base,
    id: ${esc(`w-gallery-${w.slug}`)},
    slug: ${esc(w.slug)},
    title: ${esc(w.title)},
    year: ${esc(year)},
    yearSort: ${year ? Number(year) : "null"},
    discipline: "art",
    kind: "Painting",
    medium: ${w.medium ? esc(w.medium) : "null"},
    dimensions: ${w.dimensions ? esc(w.dimensions) : "null"},
    summary: ${esc(w.summary)},
    description: ${w.description ? `[\n${w.description.map((p) => `      ${esc(p)},`).join("\n")}\n    ]` : "[]"},
    statement: null,
    process: ${esc(process)},
    collectionSlug: ${esc(w.collection)},
    availability: ${esc(availability)},
    price: ${w.price ?? "null"},
    priceVisible: ${priceVisible},
    featured: false,
    sortOrder: ${sortOrder},
    coverImage: ${esc(m.primary.url)},
    images: [
      { id: ${esc(`${w.slug}-cover`)}, url: ${esc(m.primary.url)}, alt: ${esc(`${w.title} — Shivjeet Potdar, ${w.medium ?? "painting"}`)}, kind: "cover", caption: null, width: ${m.primary.width}, height: ${m.primary.height}, sortOrder: 0 },
      { id: ${esc(`${w.slug}-installation`)}, url: ${esc(m.context.url)}, alt: ${esc(`${w.title} — installation view`)}, kind: "installation", caption: null, width: ${m.context.width}, height: ${m.context.height}, sortOrder: 1 },
    ],
    relatedSlugs: ${JSON.stringify(related)},
  },
`;
  sortOrder++;
}

writeFileSync(join(process.cwd(), "scripts", ".gen-works-snippet.ts"), out, "utf8");

// Also emit the blur.ts additions.
let blurOut = "";
for (const w of WORKS) {
  const m = manifest[w.collection][w.slug];
  blurOut += `  ${esc(m.primary.url)}: ${esc(m.primary.blurDataUrl)},\n`;
  blurOut += `  ${esc(m.context.url)}: ${esc(m.context.blurDataUrl)},\n`;
}
writeFileSync(join(process.cwd(), "scripts", ".gen-blur-snippet.ts"), blurOut, "utf8");

console.log(`Wrote ${WORKS.length} works to scripts/.gen-works-snippet.ts and blur entries to scripts/.gen-blur-snippet.ts`);
