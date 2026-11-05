import { z } from "zod";

// What the AI sends back. Anything missing becomes null so the Confirm screen never breaks.

const text = z
  .string()
  .nullish()
  .transform((v) => (v && v.trim() ? v.trim() : null));

const person = z.object({
  full_name: text,
  title: text,
  organization: text,
  email: text,
  phone: text,
  orcid: text,
  linkedin_url: text,
});

export const ExtractSchema = z.object({
  person: z.preprocess((v) => v ?? {}, person),
  said: z
    .string()
    .nullish()
    .transform((v) => v?.trim() ?? ""),
  promises: z
    .array(
      z.object({
        text: z.string().trim().min(1),
        owed_by: z.enum(["owner", "other"]),
        due_hint: text,
      })
    )
    .nullish()
    .transform((v) => v ?? []),
  topics: z
    .array(z.string())
    .nullish()
    .transform((v) => v ?? []),
  suggested_team_name: text,
  met_at: text,
  confidence: z.enum(["high", "medium", "low"]).catch("low"),
});

export type Extract = z.infer<typeof ExtractSchema>;

// What we store in captures.ai_extract: the extract plus real dates and the user's local date.
export type StoredPromise = { text: string; owed_by: "owner" | "other"; due_hint: string | null; due_on: string | null };
export type StoredExtract = Omit<Extract, "promises"> & {
  promises: StoredPromise[];
  local_date: string;
};

export type CaptureKind = "card" | "badge" | "slide" | "poster" | "voice" | "note";

export function sourceLabel(kind: string) {
  switch (kind) {
    case "card":
      return "From their card";
    case "badge":
      return "From their badge";
    case "slide":
      return "From the slide";
    case "poster":
      return "From the poster";
    case "voice":
      return "From your voice note";
    default:
      return "From your note";
  }
}
