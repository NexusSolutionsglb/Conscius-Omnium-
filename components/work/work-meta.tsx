import type { Work } from "@/lib/types";
import { AVAILABILITY_LABELS, DISCIPLINE_LABELS } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

/** Catalogue-entry metadata table for a work. */
export function WorkMeta({ work }: { work: Work }) {
  const rows: { label: string; value: string }[] = [];
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

  return (
    <dl className="divide-y divide-line border-y border-line">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[7.5rem_1fr] gap-4 py-3">
          <dt className="u-eyebrow pt-0.5">{row.label}</dt>
          <dd className="text-[0.88rem] text-ink-soft">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
