/**
 * Client-review notice — deliberately NOT styled like the rest of the site
 * (a plain amber system bar, not the quiet-luxury palette) so it reads
 * unmistakably as "this isn't the design," not as a design choice.
 *
 * Fixed at the very top, at a FIXED height (`h-9` — kept single-line even on
 * mobile, the secondary text just hides) because `Header` and the page's own
 * top padding both need to know that exact number to sit below it. Changing
 * the height here means updating `top-9` in `header.tsx` and `pt-9` in
 * `(site)/layout.tsx` to match. Controlled by `IS_DRAFT_REVIEW` — see
 * `lib/draft-mode.ts` to remove it everywhere at once.
 */
export function DraftBanner() {
  return (
    <div
      role="status"
      className="u-no-print fixed inset-x-0 top-0 z-[200] flex h-9 items-center justify-center gap-x-2 overflow-hidden whitespace-nowrap bg-[#f5b400] px-4 text-center text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[#1a1400]"
    >
      <span>Draft — for client review</span>
      <span className="hidden font-normal normal-case tracking-normal opacity-80 sm:inline">
        · Not the final version — content and design are still subject to change
      </span>
    </div>
  );
}
