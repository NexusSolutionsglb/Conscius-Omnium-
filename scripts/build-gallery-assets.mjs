// One-off: resize the real artwork photography from
// `WEBSITE DESIGN MATERIAL/pages/gallery/ARTWORKS/*` into `public/gallery/*`,
// preserving each image's exact original aspect ratio (fit: "inside", no
// crop), and emit a JSON manifest (dimensions + blur data URLs) for wiring
// into lib/content/works.ts and lib/content/blur.ts.
//
// Run: node scripts/build-gallery-assets.mjs

import sharp from "sharp";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SRC_ROOT = join(ROOT, "WEBSITE DESIGN MATERIAL", "pages", "gallery", "ARTWORKS");
const OUT_ROOT = join(ROOT, "public", "gallery");
const MAX_EDGE = 2400;
const QUALITY = 85;

// [collectionSlug, sourceFolder, [{ workSlug, primary, context }]]
const PLAN = [
  [
    "black-canvas",
    "BLACK CANVAS",
    [
      { slug: "breath-and-the-mind", primary: "6.jpg", context: "breath and the mind.jpg" },
      { slug: "the-tree-house", primary: "7.jpg", context: "the tree house.jpg" },
      { slug: "shape-of-belief", primary: "8.jpg", context: "shape of belief.jpg" },
      { slug: "vortex-of-awareness", primary: "9.jpg", context: "vortex of awareness.jpg" },
      { slug: "subtle-currents", primary: "10.jpg", context: "subtle currents.jpg" },
    ],
  ],
  [
    "states-of-attention",
    "STATES OF ATTENTION",
    [
      { slug: "the-light-attracts-everything", primary: "1.jpg", context: "the light attracts everything.jpg" },
      { slug: "symmetry-in-the-swarm", primary: "2.jpg", context: "symmetry in the swarm.jpg" },
      { slug: "the-canvas-wouldnot-empty", primary: "3.jpg", context: "the canvas wouldnot empty.jpg" },
      { slug: "pyre-for-perspective", primary: "4.jpg", context: "pyre for perspective.jpg" },
      { slug: "concentric-emergence", primary: "5.jpg", context: "concentric emergence.jpg" },
    ],
  ],
  [
    "duality",
    "DUALITY",
    [
      { slug: "dance-of-duality", primary: "dance of duality.jpg", context: "dance of duality 1.jpg" },
      { slug: "the-burden-of-goodness", primary: "the burden of goodness.jpg", context: "the burden of goodness1.jpg" },
      { slug: "the-infinite-axis", primary: "the infinite axis.jpg", context: "the infinite axis 1.jpg" },
      { slug: "the-primordial-point", primary: "the primordial point.jpg", context: "the primordial point 1.jpg" },
      { slug: "untitled-i", primary: "framed.jpg", context: "framed 1.jpg" },
    ],
  ],
  [
    "states-of-awareness",
    "STATES OF AWARENESS",
    [
      { slug: "establishment-of-self", primary: "establishment of self 1.jpg", context: "establishment of self.jpg" },
      { slug: "the-weight-of-i", primary: "the weight of i 1.jpg", context: "the weight of i.jpg" },
      { slug: "the-observer", primary: "the observer 1.jpg", context: "the observer.jpg" },
      { slug: "the-bliss", primary: "the bliss 1.jpg", context: "the bliss.jpg" },
      { slug: "a-small-fire", primary: "a small fire 1.jpg", context: "a small fire.jpg" },
    ],
  ],
];

async function processOne(srcPath, outPath) {
  const img = sharp(srcPath).rotate(); // auto-orient from EXIF
  const resized = img.resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true });
  const buf = await resized.jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
  writeFileSync(outPath, buf);
  const meta = await sharp(buf).metadata();

  const blurBuf = await sharp(srcPath)
    .rotate()
    .resize(16, 16, { fit: "inside" })
    .jpeg({ quality: 40 })
    .toBuffer();
  const blurDataUrl = `data:image/jpeg;base64,${blurBuf.toString("base64")}`;

  return { width: meta.width, height: meta.height, blurDataUrl };
}

async function main() {
  const manifest = {};
  for (const [collectionSlug, folder, works] of PLAN) {
    const outDir = join(OUT_ROOT, collectionSlug);
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
    manifest[collectionSlug] = {};

    for (const w of works) {
      const srcDir = join(SRC_ROOT, folder);
      const primarySrc = join(srcDir, w.primary);
      const contextSrc = join(srcDir, w.context);
      const primaryOut = join(outDir, `${w.slug}.jpg`);
      const contextOut = join(outDir, `${w.slug}-context.jpg`);

      const primaryMeta = await processOne(primarySrc, primaryOut);
      const contextMeta = await processOne(contextSrc, contextOut);

      manifest[collectionSlug][w.slug] = {
        primary: { url: `/gallery/${collectionSlug}/${w.slug}.jpg`, ...primaryMeta },
        context: { url: `/gallery/${collectionSlug}/${w.slug}-context.jpg`, ...contextMeta },
      };
      console.log(`  ${collectionSlug}/${w.slug}: primary ${primaryMeta.width}x${primaryMeta.height}, context ${contextMeta.width}x${contextMeta.height}`);
    }
  }

  writeFileSync(
    join(ROOT, "scripts", "gallery-manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8",
  );
  console.log("\nWrote scripts/gallery-manifest.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
