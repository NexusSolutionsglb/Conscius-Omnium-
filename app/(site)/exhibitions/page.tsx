import type { Metadata } from "next";
import Link from "next/link";
import { getExhibitionsByYear } from "@/lib/queries/exhibitions";
import { getPublishedWorks } from "@/lib/queries/works";
import { getProfile } from "@/lib/queries/profile";
import { DISCIPLINE_LABELS } from "@/lib/types";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { blurFor } from "@/lib/content/blur";
import { Reveal, StaggerItem, StaggerList } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Eyebrow } from "@/components/ui/primitives";
import { ArtImage } from "@/components/motion/image-reveal";
import { ExhibitionList } from "@/components/exhibitions/exhibition-list";
import { JsonLd } from "@/components/site/json-ld";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Exhibitions & Experience",
  description:
    "Exhibitions, installations and screen work by Shivjeet Potdar — including Pavilion RVCA X (2017), production design for the Kannada feature FUBAR, and concept key art for the Prime Original LORE.",
  path: "/exhibitions",
});

export default async function ExhibitionsPage() {
  const [groups, works, profile] = await Promise.all([
    getExhibitionsByYear(),
    getPublishedWorks(),
    getProfile(),
  ]);

  const onScreen = works.filter((w) =>
    ["film", "production-design"].includes(w.discipline),
  );

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Exhibitions", path: "/exhibitions" },
        ])}
      />

      <header className="u-container pb-16 pt-36 md:pb-24 md:pt-44">
        <Eyebrow>Exhibitions &amp; Experience</Eyebrow>
        <TextReveal
          as="h1"
          text={"Shown\n& made"}
          className="mt-5 font-display text-[clamp(2.6rem,1.4rem+5vw,6rem)] font-light leading-[0.98]"
        />
        <Reveal delay={0.1} className="mt-8 max-w-xl text-[0.95rem] leading-relaxed text-ink-soft">
          <p>
            A working record — public installations, and the screen projects the
            practice has contributed to. It grows as the archive is compiled.
          </p>
        </Reveal>
      </header>

      {/* Exhibitions */}
      <section className="u-container pb-20 md:pb-28">
        <Reveal>
          <Eyebrow>Exhibitions &amp; installations</Eyebrow>
        </Reveal>
        <div className="mt-8">
          {groups.length ? (
            <ExhibitionList groups={groups} />
          ) : (
            <p className="border-y border-line py-10 text-ink-mute">
              The exhibition archive is being compiled.
            </p>
          )}
        </div>
      </section>

      {/* On screen */}
      {onScreen.length > 0 && (
        <section className="border-y border-line bg-paper-dim/50 py-20 md:py-28">
          <div className="u-container">
            <Reveal className="max-w-2xl">
              <Eyebrow>On screen</Eyebrow>
              <h2 className="mt-4 font-display text-[clamp(1.6rem,1.1rem+2vw,2.6rem)] font-light">
                Production design &amp; key art
              </h2>
              <p className="mt-4 max-w-md text-[0.9rem] leading-relaxed text-ink-soft">
                Title design and a first-look poster for the Kannada feature{" "}
                <em>FUBAR</em>, character design for the short <em>Terror Nature</em>,
                and concept key art for the Prime Original <em>LORE</em>.
              </p>
            </Reveal>

            <StaggerList className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {onScreen.map((work) => (
                <StaggerItem key={work.slug} as="article">
                  <Link href={`/work/${work.slug}`} className="group block">
                    <ArtImage
                      src={work.coverImage}
                      alt={work.images[0]?.alt ?? work.title}
                      ratio="3 / 2"
                      fill
                      sizes="(min-width:1024px) 30vw, 45vw"
                      hoverZoom
                      placeholder={blurFor(work.coverImage) ? "blur" : "empty"}
                      blurDataURL={blurFor(work.coverImage)}
                    />
                    <h3 className="mt-4 font-display text-[1.2rem] text-ink">{work.title}</h3>
                    <p className="u-eyebrow mt-1.5">
                      {[work.role, DISCIPLINE_LABELS[work.discipline]].filter(Boolean).join(" · ")}
                    </p>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerList>
          </div>
        </section>
      )}

      {/* Education / training */}
      <section className="u-container py-20 md:py-28">
        <Reveal>
          <Eyebrow>Training</Eyebrow>
        </Reveal>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {profile.education.map((ed) => (
            <div key={ed.qualification} className="grid gap-2 py-5 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="font-display text-[1.2rem] text-ink">{ed.qualification}</p>
                <p className="text-[0.84rem] text-ink-mute">{ed.institution}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="u-container pb-24 text-center">
        <Reveal>
          <Link href="/contact" className="u-btn">
            Enquire about an exhibition
          </Link>
        </Reveal>
      </section>
    </>
  );
}
