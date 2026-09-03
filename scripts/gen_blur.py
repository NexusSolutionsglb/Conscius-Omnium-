"""
Regenerate lib/content/blur.ts — tiny base64 blur placeholders for the
bundled portfolio images in public/work.

Usage:  python scripts/gen_blur.py
Requires: pillow  (pip install pillow)

Only needed for the bundled fallback images. Images uploaded through the
Admin get their blur data from Supabase / next/image directly.
"""

import base64
import io
import json
import os

from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "work")
OUT = os.path.join(ROOT, "lib", "content", "blur.ts")


def main() -> None:
    result: dict[str, str] = {}
    for name in sorted(os.listdir(SRC)):
        if not name.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            continue
        image = Image.open(os.path.join(SRC, name)).convert("RGB")
        width = 20
        height = max(1, round(image.height * width / image.width))
        tiny = image.resize((width, height), Image.LANCZOS).filter(
            ImageFilter.GaussianBlur(1)
        )
        buffer = io.BytesIO()
        tiny.save(buffer, format="JPEG", quality=40)
        encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
        result[f"/work/{name}"] = f"data:image/jpeg;base64,{encoded}"

    body = (
        "// AUTO-GENERATED - tiny blur placeholders for bundled images in /public/work.\n"
        "// Regenerate with: python scripts/gen_blur.py  (see README).\n\n"
        "export const blurMap: Record<string, string> = "
        + json.dumps(result, indent=2, ensure_ascii=True)
        + ";\n\n"
        "export function blurFor(src: string): string | undefined {\n"
        "  return blurMap[src];\n"
        "}\n"
    )
    with open(OUT, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(body)
    print(f"Wrote {OUT} with {len(result)} entries.")


if __name__ == "__main__":
    main()
