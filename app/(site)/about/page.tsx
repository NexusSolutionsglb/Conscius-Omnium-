import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProfile } from "@/lib/queries/profile";
import { getPage } from "@/lib/queries/pages";
import { getTimeline } from "@/lib/queries/timeline";
import { getFeaturedWorks } from "@/lib/queries/works";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { blurFor } from "@/lib/content/blur";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Eyebrow, Rule } from "@/components/ui/primitives";
import { Timeline } from "@/components/timeline/timeline";
import { JsonLd } from "@/components/site/json-ld";
import { ArtImage } from "@/components/motion/image-reveal";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("about");
  return buildMetadata({
    title: page.seo?.title ? page.seo.title.replace(" — Conscious Omnium", "") : "About",
    description: page.seo?.description ?? page.intro ?? undefined,
    path: "/about",
    type: "profile",
  });
}

export default async function AboutPage() {
  const [profile, page, timeline, featured] = await Promise.all([
    getProfile(),
    getPage("about"),
    getTimeline(),
    getFeaturedWorks(1),
  ]);

  const portraitFallback = featured[0]?.coverImage ?? "/work/the-formalin-man.jpg";

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />

      {/* Hero */}
      <section className="u-container grid gap-12 pb-16 pt-36 md:grid-cols-12 md:pb-24 md:pt-44">
        <div className="md:col-span-7">
          <Eyebrow>About</Eyebrow>
          <TextReveal
            as="h1"
            text={profile.name}
            className="mt-5 font-display text-[clamp(2.6rem,1.5rem+4.6vw,5.6rem)] font-light leading-[0.98]"
          />
          <Reveal delay={0.1}>
            <p className="mt-6 flex flex-wrap gap-x-3 gap-y-1 text-[0.8rem] uppercase tracking-[0.14em] text-ink-mute">
              {profile.roles.map((role, i) => (
                <span key={role}>
                  {role}
                  {i < profile.roles.length - 1 && (
                    <span className="ml-3 text-ink-faint">/</span>
                  )}
                </span>
              ))}
            </p>
          </Reveal>
          <Reveal delay={0.15} className="mt-8 max-w-xl">
            <p className="u-lead">{page.intro}</p>
          </Reveal>
        </div>

        <div className="md:col-span-5">
          <Reveal>
            {profile.portrait ? (
              <Image
                src={profile.portrait}
                alt={`${profile.name} — portrait`}
                width={900}
                height={1125}
                sizes="(min-width:768px) 40vw, 100vw"
                className="w-full object-cover"
                priority
              />
            ) : (
              <div className="relative">
                <ArtImage
                  src={portraitFallback}
                  alt="A work from Shivjeet Potdar's practice"
                  ratio="4 / 5"
                  fill
                  sizes="(min-width:768px) 40vw, 100vw"
                  placeholder={blurFor(portraitFallback) ? "blur" : "empty"}
                  blurDataURL={blurFor(portraitFallback)}
                />
                <p className="u-eyebrow mt-3 text-ink-faint">
                  Portrait to be added via Admin
                </p>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* Statement */}
      <section className="border-y border-line bg-paper-dim/50 py-20 md:py-28">
        <div className="u-container">
          <Reveal className="max-w-4xl">
            <p
              className="font-display text-[clamp(1.5rem,1rem+2.4vw,2.8rem)] font-light italic leading-[1.32] text-ink"
              style={{ fontStyle: "italic" }}
            >
              &ldquo;{profile.statement}&rdquo;
            </p>
            <p className="u-eyebrow mt-6">{profile.name}</p>
          </Reveal>
        </div>
      </section>

      {/* Bio sections */}
      <section className="u-container py-20 md:py-28">
        {page.sections.map((section, i) => (
          <div
            key={section.id}
            className="grid gap-10 border-t border-line py-12 first:border-t-0 md:grid-cols-12"
          >
            <div className="md:col-span-4">
              <Eyebrow>{section.eyebrow}</Eyebrow>
              <h2 className="mt-4 font-display text-[clamp(1.4rem,1rem+1.6vw,2rem)] font-normal leading-tight">
                {section.heading}
              </h2>
            </div>
            <Reveal delay={i * 0.05} className="u-prose md:col-span-8 md:pl-6">
              <div className="space-y-5 text-[0.95rem] leading-[1.75]">
                {(section.body ?? []).map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
              </div>
            </Reveal>
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="u-container pb-20 md:pb-28">
        <Reveal>
          <Eyebrow>Education</Eyebrow>
          <Rule className="mt-5" />
        </Reveal>
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {profile.education.map((ed) => (
            <Reveal key={ed.qualification} as="div">
              <h3 className="font-display text-[1.3rem] font-normal text-ink">
                {ed.qualification}
              </h3>
              <p className="mt-1 text-[0.88rem] text-ink-soft">{ed.institution}</p>
              {ed.detail && <p className="mt-1 text-[0.8rem] text-ink-mute">{ed.detail}</p>}
            </Reveal>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-2 text-[0.85rem] text-ink-soft">
          <a href={`mailto:${profile.email}`} className="u-link">
            {profile.email}
          </a>
          <span>{profile.phone}</span>
          <span className="text-ink-mute">{profile.location}</span>
        </div>
      </section>

      {/* Timeline */}
      <section id="timeline" className="scroll-mt-24 border-t border-line py-16 md:py-24">
        <div className="u-container">
          <Reveal className="max-w-2xl">
            <Eyebrow>His story</Eyebrow>
            <h2 className="mt-5 font-display text-[clamp(1.8rem,1.1rem+2.8vw,3.4rem)] font-light leading-[1.1]">
              A visual autobiography, 1995&ndash;2017.
            </h2>
            <p className="mt-5 max-w-md text-[0.92rem] leading-relaxed text-ink-soft">
              Drawing mythology, then wanting to be an artist, then a scientist,
              then finding that architecture could hold both — and finally moving
              toward the boundary between reality and fiction.
            </p>
          </Reveal>
        </div>
        <div className="mt-6">
          <Timeline entries={timeline} />
        </div>
      </section>

      <section className="u-container py-20 text-center md:py-28">
        <Reveal>
          <Eyebrow>Next</Eyebrow>
          <h2 className="mx-auto mt-5 max-w-xl font-display text-[clamp(1.8rem,1.1rem+2.6vw,3rem)] font-light">
            See how the work is made.
          </h2>
          <Link href="/studio" className="u-btn mt-8">
            Enter the studio
          </Link>
        </Reveal>
      </section>
    </>
  );
}
