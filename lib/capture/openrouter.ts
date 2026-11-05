import { ExtractSchema, type Extract } from "./extract";

// One request to OpenRouter with everything the user captured.
// The key and model come from server env and never reach the browser.

export type ReadInput = {
  images: { mime: string; b64: string }[];
  audio: { b64: string; format: string } | null;
  note: string | null;
  mode: string;
  today: string;
  userName: string | null;
  eventName: string | null;
};

export type Usage = {
  model: string | null;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost: number | null;
  attempts: number;
};

const TOTAL_MS = 45_000;

const SYSTEM = `You read what a researcher captured right after meeting someone at a conference: photos of a business card, badge, slide or poster, a voice note, and/or a typed note.

Reply with JSON only, exactly this shape:
{
  "person": { "full_name": string|null, "title": string|null, "organization": string|null, "email": string|null, "phone": string|null, "orcid": string|null, "linkedin_url": string|null },
  "said": string,
  "promises": [ { "text": string, "owed_by": "owner" | "other", "due_hint": string|null } ],
  "topics": [string],
  "suggested_team_name": string|null,
  "met_at": string|null,
  "confidence": "high" | "medium" | "low"
}

Rules:
- Never invent facts. Use only what is visible in the photos or said in the audio or note. Use null when something is unknown.
- "person" is the OTHER person the user met, not the user.
- "owner" is the app user (named in the request). "other" is the person they met.
- A promise is only something someone said they would do. "text" is a short action that starts with a verb, for example "Send the talk slides".
- "due_hint" is the words used for timing, for example "Friday" or "next week", or null.
- "said" is 1-2 plain sentences summarising what the user said or wrote, in their words.
- "suggested_team_name" is usually the other person's name.
- "met_at" is the event name if known, else null.
- "confidence" is "high" only when the person's name is clearly readable or stated.
- If the audio is in another language, still answer in English.`;

function parseJson(raw: string): unknown {
  const s = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  return JSON.parse(s);
}

async function callOnce(input: ReadInput, signal: AbortSignal) {
  const key = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;
  if (!key || !model) throw new Error("not_configured");

  const header = [
    `Mode hint: ${input.mode}`,
    `Today: ${input.today}`,
    `The app user (owner): ${input.userName ?? "unknown"}`,
    `Active event: ${input.eventName ?? "none"}`,
  ].join("\n");

  const parts: unknown[] = [{ type: "text", text: header }];
  if (input.note) parts.push({ type: "text", text: `Typed note from the user:\n${input.note}` });
  for (const img of input.images) {
    parts.push({ type: "image_url", image_url: { url: `data:${img.mime};base64,${img.b64}` } });
  }
  if (input.audio) {
    parts.push({ type: "text", text: "Voice note from the user (audio follows)." });
    parts.push({ type: "input_audio", input_audio: { data: input.audio.b64, format: input.audio.format } });
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://teamingful.com",
      "X-Title": "Teamingful",
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: "json_object" },
      usage: { include: true },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: parts },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("OpenRouter error", res.status, body.slice(0, 500));
    throw new Error(`http_${res.status}`);
  }
  const json = await res.json();
  const content: string | undefined = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error("empty");
  const extract = ExtractSchema.parse(parseJson(content));
  const u = json.usage ?? {};
  return {
    extract,
    usage: {
      model: (json.model as string) ?? model,
      prompt_tokens: u.prompt_tokens ?? 0,
      completion_tokens: u.completion_tokens ?? 0,
      total_tokens: u.total_tokens ?? 0,
      cost: typeof u.cost === "number" ? u.cost : null,
    },
  };
}

// Tries once, retries once if the call or the JSON failed. 45 second limit in total.
export async function readWithAi(input: ReadInput): Promise<{ extract: Extract; usage: Usage }> {
  const deadline = Date.now() + TOTAL_MS;
  let lastError: unknown;
  const sum = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, cost: 0 as number | null };

  for (let attempt = 1; attempt <= 2; attempt++) {
    const left = deadline - Date.now();
    if (left < 3000) break;
    try {
      const r = await callOnce(input, AbortSignal.timeout(left));
      return {
        extract: r.extract,
        usage: {
          model: r.usage.model,
          prompt_tokens: sum.prompt_tokens + r.usage.prompt_tokens,
          completion_tokens: sum.completion_tokens + r.usage.completion_tokens,
          total_tokens: sum.total_tokens + r.usage.total_tokens,
          cost: r.usage.cost === null ? null : (sum.cost ?? 0) + r.usage.cost,
          attempts: attempt,
        },
      };
    } catch (e) {
      lastError = e;
      if (e instanceof Error && ["not_configured", "http_402", "http_401"].includes(e.message)) throw e;
      console.error("Read attempt failed", attempt, e instanceof Error ? e.message : e);
    }
  }
  throw lastError ?? new Error("timeout");
}
