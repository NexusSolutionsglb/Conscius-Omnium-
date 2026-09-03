import type { TimelineEntry } from "@/lib/types";

/**
 * "His story" — the visual autobiography from the opening spread of the
 * monograph, reinterpreted as an interactive archive. Years and captions
 * follow the document's own clusters. Typographic by design; the Admin
 * can attach archival images to any entry.
 */
export const timelineSeed: TimelineEntry[] = [
  {
    id: "t-1995",
    year: "1995",
    title: "Drawing mythology",
    description:
      "He likes drawing mythology. He likes living mythology — the gods are less pictures than housemates.",
    image: null,
    category: "Origin",
    sortOrder: 1,
    published: true,
  },
  {
    id: "t-1998",
    year: "1998",
    title: "He wants to be an artist",
    description:
      "He likes drawing. He likes drawing more. He decides he wants to be an artist.",
    image: null,
    category: "Art",
    sortOrder: 2,
    published: true,
  },
  {
    id: "t-2001",
    year: "2001",
    title: "“All art is quite useless”",
    description:
      "A line read too early and taken too literally: all art is quite useless, it has no purpose. He begins to prefer science to art — it is more useful.",
    image: null,
    category: "Science",
    sortOrder: 3,
    published: true,
  },
  {
    id: "t-2004",
    year: "2004",
    title: "He invents an electric dynamo",
    description:
      "He wants to be a scientist. But he cannot give up on art.",
    image: null,
    category: "Science",
    sortOrder: 4,
    published: true,
  },
  {
    id: "t-2007",
    year: "2007",
    title: "Both are his friends",
    description:
      "Art and science are both his friends now — but science is his right hand.",
    image: null,
    category: "Both",
    sortOrder: 5,
    published: true,
  },
  {
    id: "t-2014",
    year: "2014",
    title: "Architecture holds both",
    description:
      "Architecture turns out to be a homogenous blend of art and science. Science is the body; art is its soul.",
    image: null,
    category: "Architecture",
    sortOrder: 6,
    published: true,
  },
  {
    id: "t-2015",
    year: "2015",
    title: "“Everything you can imagine is real”",
    description:
      "— Pablo Picasso. The sentence that turns the practice toward what has not been built yet.",
    image: null,
    category: "Turn",
    sortOrder: 7,
    published: true,
  },
  {
    id: "t-2016",
    year: "2016",
    title: "Reality and fiction",
    description:
      "The boundary between reality and fiction begins to fade — the miniatures, the renders set into real photographs, the ruins that might be resurrected.",
    image: null,
    category: "Fiction",
    sortOrder: 8,
    published: true,
  },
  {
    id: "t-2017",
    year: "2017",
    title: "Toward the screen",
    description:
      "Fiction. Reality. The move into production design and filmmaking — where holding both is the whole job.",
    image: null,
    category: "Film",
    sortOrder: 9,
    published: true,
  },
];
