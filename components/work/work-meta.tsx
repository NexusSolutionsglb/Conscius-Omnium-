import Link from "next/link";
import type { Work } from "@/lib/types";
import { AVAILABILITY_LABELS, DISCIPLINE_LABELS } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

/** Catalogue-entry metadata table for a work — everything the CMS holds. */
export function WorkMeta({
  work,
  series,
}: {
  work: Work;
  series?: { slug: string; title: string } | null;
}) {
  const rows: { label: string; value: string }[] = [];
  if (series) rows.push({ label: "Series", value: series.title });
  if (work.year) rows.push({ label: "Year", value: work.year });
  rows.push({ label: "Discipline", value: DISCIPLINE_LABELS[work.discipline] });
  if (work.kind) rows.push({ label: "Type", value: work.kind });
  if (work.medium) rows.push({ label: "Medium", value: work.medium });
  if (work.dimensions) rows.push({ label: "Dimensions", value: work.dimensions });
  if (work.location) rows.push({ label: "Site", value: work.location });
  if (work.role) rows.push({ label: "Role", value: work.role });
  if (work.client) rows.push({ label: "Context", value: work.client });

  const priceValue =
    work.priceVisible && work.price
      ? formatPrice(work.price, work.currency)
      : work.availability === "not-for-sale"
        ? "Not for sale"
        : "Price on request";

  rows.push({ label: "Status", value: AVAILABILITY_LABELS[work.availability] });
  if (work.availability !== "not-for-sale") {
    rows.push({ label: "Price", value: priceValue });
  }

  if (work.concept) rows.push({ label: "Concept", value: work.concept });
  (work.credits ?? []).forEach((credit) => {
    if (credit.role && credit.name) rows.push({ label: credit.role, value: credit.name });
  });

  return (
    <dl className="divide-y divide-line border-y border-line">
      {rows.map((row, i) => (
        <div key={`${row.label}-${i}`} className="grid grid-cols-[7.5rem_1fr] gap-4 py-3">
          <dt className="u-eyebrow pt-0.5">{row.label}</dt>
          <dd className="text-[0.88rem] text-ink-soft">
            {row.label === "Series" && series ? (
              <Link href={`/gallery/collection/${series.slug}`} className="u-link">
                {row.value}
              </Link>
            ) : (
              row.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
