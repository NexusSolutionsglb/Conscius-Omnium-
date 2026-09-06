"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clamp } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/client";
import { getLenis } from "@/components/site/smooth-scroll";

/**
 * The hero's full-bleed background film.
 *
 * It has to read as part of the page, not a clip dropped onto it:
 *  · it plays the instant the section paints — `autoPlay muted loop` needs no
 *    JS, and the `poster` (the clip's own first frame) covers the moment
 *    before the first video frame decodes, so there is never a blank flash;
 *  · it loops seamlessly — the encode crossfades its tail into its head
 *    (see /public/hero-media), so there is no visible cut;
 *  · the site's language sits on top — a brand-red wash, a legibility scrim
 *    and a faint film grain, the treatment the immersive panels use.
 *
 * Sound — browsers forbid audible autoplay until the visitor interacts, so the
 * film starts muted and is allowed to come up on the first pointer / key /
 * touch / scroll gesture anywhere on the page (or the corner control). As the
 * hero scrolls out of view the audio rides down to silence with it, and back
 * up if the visitor returns. A deliberate mute from the control is remembered.
 *
 * Everything past "it plays" is progressive enhancement: if this component's
 * JS never runs, you still get a muted, looping, poster-bridged background.
 */

/**
 * The web-encoded clip ships with the site as static assets
 * (/public/hero-media — committed; the raw master is not). `hero.video` in
 * Admin settings can still point the mp4 elsewhere.
 */
const DEFAULT_MP4 = "/hero-media/hero.mp4";
const DEFAULT_WEBM = "/hero-media/hero.webm";
const DEFAULT_POSTER = "/hero-media/hero-poster.jpg";

/** Peak level once unmuted — a background bed, never full volume. */
const PEAK_VOLUME = 0.7;

// iOS ignores the HTMLMediaElement.volume setter (level is hardware-only), so
// there the fade is approximated by muting/unmuting at a threshold instead.
const IS_IOS =
  typeof navigator !== "undefined" &&
  (/iP(hone|ad|od)/.test(navigator.platform) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

export function HeroVideo({ override }: { override?: string | null }) {
  const mp4 = override || DEFAULT_MP4;
  const webm = override ? undefined : DEFAULT_WEBM;
  const poster = DEFAULT_POSTER;

  const hostRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [failed, setFailed] = useState(false);
  const [audible, setAudible] = useState(false);

  // Refs so the rAF loop always sees current values without re-subscribing.
  const wantsSoundRef = useRef(true); // visitor intent; a manual mute clears it
  const hasGestureRef = useRef(false); // has the browser seen an unmute-worthy gesture
  const reducedRef = useRef(false);
  const rafRef = useRef(0);
  const runningRef = useRef(false);

  /** Continuous easing of volume + play state toward the scroll-derived target. */
  const tick = useCallback(() => {
    const v = videoRef.current;
    const host = hostRef.current;
    if (!v || !host) {
      runningRef.current = false;
      return;
    }

    const vh = window.innerHeight || 1;
    const visRaw = clamp(host.getBoundingClientRect().bottom / vh, 0, 1);
    const vis = visRaw * visRaw * (3 - 2 * visRaw); // smoothstep

    // Keep it playing while any sliver is on screen; pause once fully past to
    // spare the battery. Reduced-motion visitors never get autoplay.
    if (!reducedRef.current) {
      if (visRaw > 0 && v.paused) void v.play().catch(() => {});
      else if (visRaw <= 0.001 && !v.paused) v.pause();
    }

    const wantAudible =
      wantsSoundRef.current &&
      hasGestureRef.current &&
      !reducedRef.current &&
      visRaw > 0.12;
    const target = wantAudible ? PEAK_VOLUME * vis : 0;

    if (IS_IOS) {
      v.muted = !wantAudible;
    } else {
      if (target > 0.001 && v.muted) v.muted = false;
      const next = v.volume + (target - v.volume) * 0.14;
      v.volume = clamp(next < 0.005 && target === 0 ? 0 : next, 0, 1);
      if (v.volume <= 0.005 && target === 0) v.muted = true;
    }

    const nowAudible = wantAudible && !v.muted;
    setAudible((prev) => (prev === nowAudible ? prev : nowAudible));

    // Stop looping once there is nothing left to animate; scroll/toggle restart.
    const settled = target === 0 && (IS_IOS || v.volume <= 0.005);
    if (visRaw <= 0.001 && settled) {
      runningRef.current = false;
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const ensureTicking = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  // Mount: keep it playing, arm the first-gesture unmute, wire scroll + audio.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    reducedRef.current = prefersReducedMotion();

    v.muted = true;
    v.volume = 0;

    if (!reducedRef.current) {
      void v.play().catch(() => {});
      // Some visitors (return visits, granted autoplay) can hear it right away.
      const tryImmediate = async () => {
        try {
          v.muted = false;
          await v.play();
          hasGestureRef.current = true;
          ensureTicking();
        } catch {
          v.muted = true;
          v.volume = 0;
        }
      };
      void tryImmediate();
    }

    const onGesture = () => {
      hasGestureRef.current = true;
      ensureTicking();
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("wheel", onGesture);
    };
    window.addEventListener("pointerdown", onGesture, { passive: true });
    window.addEventListener("keydown", onGesture);
    window.addEventListener("touchstart", onGesture, { passive: true });
    window.addEventListener("wheel", onGesture, { passive: true });

    // Scroll only needs to *restart* the ease loop once it has parked itself
    // (hero fully off screen); the loop then reads position every frame.
    const onScroll = () => ensureTicking();
    window.addEventListener("scroll", onScroll, { passive: true });
    // Lenis is a sibling singleton whose own effect runs after this one, so
    // grab it on the next tick. Its eased `scroll` event keeps the loop alive
    // through momentum where native `scroll` can briefly stall.
    let lenis: ReturnType<typeof getLenis> = null;
    const lenisTimer = setTimeout(() => {
      lenis = getLenis();
      lenis?.on("scroll", onScroll);
    }, 0);

    const onVisibility = () => {
      if (document.hidden) {
        v.pause();
        return;
      }
      // rAF is frozen while the tab is hidden, so the ease loop may have
      // died mid-run — force it back on.
      cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
      if (!reducedRef.current) void v.play().catch(() => {});
      ensureTicking();
    };
    document.addEventListener("visibilitychange", onVisibility);

    ensureTicking();

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(lenisTimer);
      runningRef.current = false;
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("wheel", onGesture);
      window.removeEventListener("scroll", onScroll);
      lenis?.off("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ensureTicking]);

  const toggleSound = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    hasGestureRef.current = true;
    wantsSoundRef.current = !wantsSoundRef.current;
    if (wantsSoundRef.current) {
      reducedRef.current = false; // an explicit ask overrides reduced-motion
      v.muted = false;
      void v.play().catch(() => {});
    }
    ensureTicking();
  }, [ensureTicking]);

  return (
    <>
      {/* z-0 (not a negative z-index) so the layer sits above the section's
          own background but below the z-10 copy — negative z can render
          *behind* a non-stacking-context parent's background. */}
      <div
        ref={hostRef}
        aria-hidden
        className="absolute inset-0 z-0 overflow-hidden bg-[#160c0b]"
      >
        {!failed ? (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={poster}
            onError={(e) => {
              // A failed <source> can fire an error while another source is
              // still viable — only give up once the element itself has
              // exhausted them.
              const el = e.currentTarget;
              if (el.networkState === el.NETWORK_NO_SOURCE || el.error) {
                setFailed(true);
              }
            }}
          >
            {webm && <source src={webm} type="video/webm" />}
            <source src={mp4} type="video/mp4" />
          </video>
        ) : (
          /* Ultimate fallback — the plain deep-red field, if nothing will play. */
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_18%,#e2372b_0%,#c81e1e_46%,#9c1414_100%)]" />
        )}

        {/* Brand wash — pulls the footage toward the site's red without hiding it. */}
        <div className="absolute inset-0 bg-[#c81e1e] opacity-20 mix-blend-multiply" />
        {/* Legibility. The clip swings from deep red to near-white, so the
            scrim has to hold white type over any frame: a base darkening, a
            focused pool behind the centred headline, and heavier top/bottom
            edges (under the transparent nav, and to seat the cut into the
            page below). */}
        <div className="absolute inset-0 bg-black/15" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 64% at 50% 43%, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.34) 45%, rgba(0,0,0,0) 78%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/45" />
        {/* Film grain — the same filmic finish as the immersive dark panels. */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
            backgroundSize: "160px 160px",
          }}
        />
      </div>

      {/* Sound control — quiet until hovered, clear of the scroll cue. */}
      {!failed && (
        <button
          type="button"
          onClick={toggleSound}
          aria-label={audible ? "Mute background film" : "Play sound"}
          aria-pressed={audible}
          className="group absolute bottom-5 right-5 z-20 flex h-10 w-10 items-center justify-center text-paper/55 transition-colors duration-300 hover:text-paper focus-visible:text-paper md:bottom-7 md:right-7"
        >
          <SoundGlyph on={audible} />
        </button>
      )}
    </>
  );
}

function SoundGlyph({ on }: { on: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" stroke="none" />
      {on ? (
        <>
          <path d="M16.5 8.5a5 5 0 0 1 0 7" />
          <path d="M19 6a8.5 8.5 0 0 1 0 12" className="opacity-70" />
        </>
      ) : (
        <path d="m17 9 4 6m0-6-4 6" />
      )}
    </svg>
  );
}
