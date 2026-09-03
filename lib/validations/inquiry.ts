import { z } from "zod";

export const INQUIRY_TYPES = [
  "purchase",
  "availability",
  "commission",
  "exhibition",
  "collaboration",
  "press",
  "general",
] as const;

export const inquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name")
    .max(120, "That name is a little long"),
  email: z.string().trim().email("Please enter a valid email address").max(200),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  type: z.enum(INQUIRY_TYPES).default("general"),
  message: z
    .string()
    .trim()
    .min(10, "A sentence or two, please")
    .max(4000, "Please keep it under 4000 characters"),
  budget: z.string().trim().max(80).optional().or(z.literal("")),
  preferredContact: z.enum(["email", "phone", "whatsapp"]).optional(),
  workSlug: z.string().trim().max(120).optional().or(z.literal("")),
  workTitle: z.string().trim().max(240).optional().or(z.literal("")),
  // Honeypot — must stay empty. Bots fill it in.
  company: z.string().max(0).optional().or(z.literal("")),
  // Time-to-submit guard (ms since form mount). Too fast = bot.
  elapsedMs: z.coerce.number().optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export const inquiryStatusSchema = z.enum([
  "new",
  "read",
  "in-progress",
  "responded",
  "closed",
  "archived",
]);
