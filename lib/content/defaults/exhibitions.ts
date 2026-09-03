import type { ExhibitionsContent } from "@/lib/types";

/** Default editable copy for `/exhibitions` — verbatim from `app/(site)/exhibitions/page.tsx`. */
export const exhibitionsDefaults: ExhibitionsContent = {
  hero: {
    eyebrow: "Exhibitions & Experience",
    heading: "Shown\n& made",
    intro:
      "A working record — public installations, and the screen projects the practice has contributed to. It grows as the archive is compiled.",
  },
  listEyebrow: "Exhibitions & installations",
  listEmpty: "The exhibition archive is being compiled.",
  onScreen: {
    eyebrow: "On screen",
    heading: "Production design & key art",
    body: "Title design and a first-look poster for the Kannada feature *FUBAR*, character design for the short *Terror Nature*, and concept key art for the Prime Original *LORE*.",
  },
  trainingEyebrow: "Training",
  endCtaLabel: "Enquire about an exhibition",
};
