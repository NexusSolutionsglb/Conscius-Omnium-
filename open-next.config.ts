import { defineCloudflareConfig } from "@opennextjs/cloudflare";
// Swap in the R2-backed cache once a bucket exists (see wrangler.jsonc) —
// without it, ISR/data-cache entries just aren't persisted between
// invocations, which is a safe default, not a broken one.
// import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
  // incrementalCache: r2IncrementalCache,
});
