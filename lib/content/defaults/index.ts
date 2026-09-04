import type {
  AboutContent,
  ContactContent,
  ExhibitionsContent,
  HomeContent,
  PageContentMap,
  StudioContent,
  WorkIndexContent,
} from "@/lib/types";
import { homeDefaults } from "./home";
import { aboutDefaults } from "./about";
import { studioDefaults } from "./studio";
import { workIndexDefaults } from "./work";
import { exhibitionsDefaults } from "./exhibitions";
import { contactDefaults } from "./contact";

export {
  homeDefaults,
  aboutDefaults,
  studioDefaults,
  workIndexDefaults,
  exhibitionsDefaults,
  contactDefaults,
};

/** Default editable content, keyed by page slug. */
export const pageContentDefaults: PageContentMap = {
  home: homeDefaults,
  about: aboutDefaults,
  studio: studioDefaults,
  work: workIndexDefaults,
  exhibitions: exhibitionsDefaults,
  contact: contactDefaults,
};

export type EditablePageSlug = keyof PageContentMap;

export const EDITABLE_PAGE_SLUGS = Object.keys(
  pageContentDefaults,
) as EditablePageSlug[];

const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

/**
 * Merge a stored (possibly partial or empty) content object over its defaults so
 * a partial save never blanks a field. Arrays are taken wholesale when present
 * and non-empty; nested objects are merged one level deeper where it matters.
 */
function mergeHomeContent(stored: unknown): HomeContent {
  const s = obj(stored) as Partial<HomeContent>;
  return {
    order: s.order?.length ? s.order : homeDefaults.order,
    hidden: Array.isArray(s.hidden) ? s.hidden : homeDefaults.hidden,
    sectionStyles: s.sectionStyles ?? {},
    blocks: s.blocks ?? {},
    intro: { ...homeDefaults.intro, ...s.intro },
    featured: { ...homeDefaults.featured, ...s.featured },
    disciplines: {
      ...homeDefaults.disciplines,
      ...s.disciplines,
      blurbs: { ...homeDefaults.disciplines.blurbs, ...s.disciplines?.blurbs },
    },
    timeline: { ...homeDefaults.timeline, ...s.timeline },
    studioPreview: { ...homeDefaults.studioPreview, ...s.studioPreview },
    collections: { ...homeDefaults.collections, ...s.collections },
    contactCta: { ...homeDefaults.contactCta, ...s.contactCta },
  };
}

function mergeAboutContent(stored: unknown): AboutContent {
  const s = obj(stored) as Partial<AboutContent>;
  return {
    heroEyebrow: s.heroEyebrow ?? aboutDefaults.heroEyebrow,
    intro: s.intro ?? aboutDefaults.intro,
    portraitFallbackCaption:
      s.portraitFallbackCaption ?? aboutDefaults.portraitFallbackCaption,
    body: Array.isArray(s.body) && s.body.length ? s.body : aboutDefaults.body,
    educationEyebrow: s.educationEyebrow ?? aboutDefaults.educationEyebrow,
    timeline: { ...aboutDefaults.timeline, ...s.timeline },
    nextCta: { ...aboutDefaults.nextCta, ...s.nextCta },
  };
}

function mergeStudioContent(stored: unknown): StudioContent {
  const s = obj(stored) as Partial<StudioContent>;
  return {
    hero: { ...studioDefaults.hero, ...s.hero },
    intro: s.intro ?? studioDefaults.intro,
    body: Array.isArray(s.body) && s.body.length ? s.body : studioDefaults.body,
    endCta: { ...studioDefaults.endCta, ...s.endCta },
  };
}

function mergeWorkContent(stored: unknown): WorkIndexContent {
  const s = obj(stored) as Partial<WorkIndexContent>;
  return { ...workIndexDefaults, ...s };
}

function mergeExhibitionsContent(stored: unknown): ExhibitionsContent {
  const s = obj(stored) as Partial<ExhibitionsContent>;
  return {
    hero: { ...exhibitionsDefaults.hero, ...s.hero },
    listEyebrow: s.listEyebrow ?? exhibitionsDefaults.listEyebrow,
    listEmpty: s.listEmpty ?? exhibitionsDefaults.listEmpty,
    onScreen: { ...exhibitionsDefaults.onScreen, ...s.onScreen },
    trainingEyebrow: s.trainingEyebrow ?? exhibitionsDefaults.trainingEyebrow,
    endCtaLabel: s.endCtaLabel ?? exhibitionsDefaults.endCtaLabel,
  };
}

function mergeContactContent(stored: unknown): ContactContent {
  const s = obj(stored) as Partial<ContactContent>;
  return { ...contactDefaults, ...s };
}

export function mergePageContent<S extends EditablePageSlug>(
  slug: S,
  stored: unknown,
): PageContentMap[S] {
  switch (slug) {
    case "home":
      return mergeHomeContent(stored) as PageContentMap[S];
    case "about":
      return mergeAboutContent(stored) as PageContentMap[S];
    case "studio":
      return mergeStudioContent(stored) as PageContentMap[S];
    case "work":
      return mergeWorkContent(stored) as PageContentMap[S];
    case "exhibitions":
      return mergeExhibitionsContent(stored) as PageContentMap[S];
    case "contact":
      return mergeContactContent(stored) as PageContentMap[S];
    default:
      return pageContentDefaults[slug];
  }
}
