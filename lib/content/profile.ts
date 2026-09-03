import type { Profile } from "@/lib/types";

/**
 * Facts from the monograph's profile page. The biography is written
 * only from the visual timeline in that same document ("his story").
 */
export const profileSeed: Profile = {
  name: "Shivjeet Potdar",
  roles: ["Architect", "Interior Designer", "Production Designer", "Filmmaker"],
  headline: "Architecture, image, and the fading boundary between reality and fiction.",
  statement:
    "Architecture is a homogenous blend of art and science — science is the body, art is its soul.",
  bio: [
    "Shivjeet Potdar works across architecture, interiors, production design and film. The practice began, by his own account, as a child drawing mythology and wanting to live in it — then wanting to be an artist, then deciding science was more useful, then building an electric dynamo and wanting to be a scientist, and finally refusing to give up either.",
    "Architecture became the place the two could hold hands. Much of the work since has circled a single question: what to do with the ruin, the eco-void, the monument, the dead quarry — how to build in a way that reclaims a place rather than erases it. It moves fluidly between a plaster miniature photographed until it becomes a world, a 3D render set back into a real landscape, a built pavilion of bent steel, and a title card for a feature film.",
    "More recently the work has moved toward the boundary between reality and fiction — production design, character design, and the beginnings of filmmaking.",
  ],
  education: [
    {
      qualification: "Bachelor of Architecture",
      institution: "RV College of Architecture, Bengaluru",
    },
    {
      qualification: "Production Design",
      institution: "Film and Television Institute of India, Pune",
    },
  ],
  email: "architectshivjeet@gmail.com",
  phone: "+91 99729 10950",
  whatsapp: "919972910950",
  location: "Bengaluru, India",
  portrait: null,
  social: [],
};
