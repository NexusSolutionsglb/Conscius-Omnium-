import { z } from "zod";

/** Where a subscription came from — free-form, but these are the known ones. */
export const NEWSLETTER_SOURCES = [
  "footer",
  "contact-page",
  "gallery",
  "admin",
  "api",
] as const;

export const newsletterSubscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Please enter your email address")
    .max(200, "That address is too long")
    .email("Please enter a valid email address"),
  name: z.string().trim().max(120).optional().or(z.literal("")),
  source: z.string().trim().max(60).optional().or(z.literal("")),
  // Honeypot — bots fill it in, people never see it.
  company: z.string().max(0).optional().or(z.literal("")),
  /** ms since the form mounted; a sub-second submit is a script. */
  elapsedMs: z.coerce.number().optional(),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;

const sectionSchema = z.object({
  id: z.string().trim().min(1),
  heading: z.string().trim().max(200).optional().or(z.literal("")),
  body: z.string().trim().max(20000).default(""),
  imageUrl: z.string().trim().max(600).optional().or(z.literal("")),
  imageCaption: z.string().trim().max(300).optional().or(z.literal("")),
  linkLabel: z.string().trim().max(80).optional().or(z.literal("")),
  linkHref: z.string().trim().max(600).optional().or(z.literal("")),
});

export const campaignSchema = z.object({
  subject: z.string().trim().min(3, "Give the issue a subject").max(200),
  preheader: z.string().trim().max(200).optional().or(z.literal("")),
  intro: z.string().trim().max(8000).optional().or(z.literal("")),
  sections: z.array(sectionSchema).max(20).default([]),
  ctaLabel: z.string().trim().max(80).optional().or(z.literal("")),
  ctaHref: z.string().trim().max(600).optional().or(z.literal("")),
});

export type CampaignInput = z.infer<typeof campaignSchema>;
