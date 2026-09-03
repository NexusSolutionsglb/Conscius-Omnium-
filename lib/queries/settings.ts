import "server-only";

import { cache } from "react";
import { settingsSeed } from "@/lib/content";
import { FOOTER_LEGAL_DEFAULT, FOOTER_OWNER_DEFAULT } from "@/lib/content/defaults/footer";
import type { SiteSettings } from "@/lib/types";
import { fromDbOr } from "./_shared";
import { mapSettings } from "./mappers";

export const getSettings = cache(async (): Promise<SiteSettings> => {
  return fromDbOr(
    async (s) => {
      const { data, error } = await s
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const mapped = mapSettings(data);
      // Merge in any missing keys from the seed so a partial row is safe.
      return {
        ...settingsSeed,
        ...mapped,
        hero: { ...settingsSeed.hero, ...mapped.hero },
        contactCopy: { ...settingsSeed.contactCopy, ...mapped.contactCopy },
        seo: { ...settingsSeed.seo, ...mapped.seo },
        theme: mapped.theme ?? {},
        footerLegal: mapped.footerLegal ?? FOOTER_LEGAL_DEFAULT,
        footerOwner: mapped.footerOwner ?? FOOTER_OWNER_DEFAULT,
      };
    },
    () => settingsSeed,
  );
});
