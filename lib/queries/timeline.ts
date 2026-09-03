import "server-only";

import { cache } from "react";
import { timelineSeed } from "@/lib/content";
import type { TimelineEntry } from "@/lib/types";
import { fromAuthedDbOr, fromDbOr } from "./_shared";
import { mapTimeline } from "./mappers";

export const getTimeline = cache(async (): Promise<TimelineEntry[]> => {
  return fromDbOr(
    async (s) => {
      const { data, error } = await s
        .from("timeline_entries")
        .select("*")
        .eq("published", true)
        .order("sort_order");
      if (error) throw error;
      return data?.map(mapTimeline) ?? null;
    },
    () =>
      timelineSeed
        .filter((t) => t.published)
        .sort((a, b) => a.sortOrder - b.sortOrder),
  );
});

export const getAllTimelineEntries = cache(async (): Promise<TimelineEntry[]> => {
  return fromAuthedDbOr(
    async (s) => {
      const { data, error } = await s
        .from("timeline_entries")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data?.map(mapTimeline) ?? null;
    },
    () => [...timelineSeed].sort((a, b) => a.sortOrder - b.sortOrder),
  );
});
