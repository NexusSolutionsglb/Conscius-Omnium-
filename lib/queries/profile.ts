import "server-only";

import { cache } from "react";
import { profileSeed } from "@/lib/content";
import type { Profile } from "@/lib/types";
import { fromDbOr } from "./_shared";
import { mapProfile } from "./mappers";

export const getProfile = cache(async (): Promise<Profile> => {
  return fromDbOr(async (s) => {
    const { data, error } = await s.from("profile").select("*").limit(1).maybeSingle();
    if (error) throw error;
    return data ? mapProfile(data) : null;
  }, () => profileSeed);
});
