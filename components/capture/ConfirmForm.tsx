"use client";

import { useState, useTransition } from "react";
import { discardCapture, makeTeam } from "@/app/(app)/capture/actions";
import { formatDue } from "@/lib/dueDate";
import { sourceLabel, type StoredExtract } from "@/lib/capture/extract";
import PromisePill from "../PromisePill";
import { CopyIcon, PlusIcon } from "../Icons";

type P = { key: string; text: string; owed_by: "owner" | "other"; due_on: string | null };

function localDate() {
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

const bare = "w-full min-w-0 bg-transparent outline-none placeholder:text-muted/60";

export default function ConfirmForm({
  captureId,
  kind,
  extract,
  myFirstName,
  eventName,
  photoUrls,
  audioUrl,
}: {
  captureId: string;
  kind: string;
  extract: StoredExtract;
  myFirstName: string;
  eventName: string | null;
  photoUrls: string[];
  audioUrl: string | null;
}) {
  const p0 = extract.person;
  const unsure = extract.confidence === "low" || !p0.full_name;
  const today = extract.local_date;

  const [name, setName] = useState(unsure ? "" : (p0.full_name ?? ""));
  const [title, setTitle] = useState(p0.title ?? "");
  const [org, setOrg] = useState(p0.organization ?? "");
  const [email, setEmail] = useState(p0.email ?? "");
  const [phone, setPhone] = useState(p0.phone ?? "");
  const [orcid, setOrcid] = useState(p0.orcid ?? "");
  const [linkedin, setLinkedin] = useState(p0.linkedin_url ?? "");
  const [said, setSaid] = useState(extract.said);
  const [metAt, setMetAt] = useState(eventName ?? extract.met_at ?? "");
  const [promises, setPromises] = useState<P[]>(
    extract.promises.map((p, i) => ({ key: `p${i}`, text: p.text, owed_by: p.owed_by, due_on: p.due_on }))
  );
  const [editing, setEditing] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [askDiscard, setAskDiscard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const theirFirst = name.trim().split(/\s+/)[0] || "Them";

  const update = (key: string, patch: Partial<P>) =>
    setPromises((list) => list.map((p) => (p.key === key ? { ...p, ...patch } : p)));

  function addPromise() {
    const key = `n${Date.now()}`;
    setPromises((l) => [...l, { key, text: "", owed_by: "owner", due_on: null }]);
    setEditing(key);
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked: the email is still selectable in the field
    }
  }

  function submit() {
    setError(null);
    if (!name.trim()) {
      setError("Add their name first.");
      return;
    }
    const original = p0.full_name?.trim();
    const teamName =
      extract.suggested_team_name && original && original === name.trim() ? extract.suggested_team_name : name.trim();
    start(async () => {
      const res = await makeTeam({
        captureId,
        person: {
          full_name: name,
          title,
          organization: org,
          email,
          phone,
          orcid,
          linkedin_url: linkedin,
        },
        teamName,
        said,
        metAt,
        localDate: localDate(),
        promises: promises
          .filter((p) => p.text.trim())
          .map((p) => ({ text: p.text, owed_by: p.owed_by, due_on: p.due_on })),
      });
      if (res?.error) setError(res.error);
    });
  }

  function discard() {
    start(async () => {
      await discardCapture(captureId);
    });
  }

  return (
    <div className="space-y-4 pb-36">
      <div>
        <span className="inline-flex rounded-full bg-them-light px-3 py-1 text-sm font-medium text-them-text">
          {sourceLabel(kind)}
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus={unsure}
          placeholder="Who did you meet?"
          aria-label="Name"
          className={`${bare} mt-3 font-heading text-[28px] font-extrabold leading-tight tracking-[-0.03em]`}
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a title"
          aria-label="Title"
          className={`${bare} mt-1 min-h-[28px] text-muted`}
        />
        <input
          value={org}
          onChange={(e) => setOrg(e.target.value)}
          placeholder="Add an organization"
          aria-label="Organization"
          className={`${bare} min-h-[28px] text-muted`}
        />
        <div className="mt-1 flex items-center gap-1">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Add an email"
            aria-label="Email"
            className={`${bare} min-h-[44px] text-ink`}
          />
          {email && (
            <button
              onClick={copyEmail}
              aria-label="Copy email"
              className="flex h-11 shrink-0 items-center gap-1 rounded-full px-3 text-sm text-you hover:bg-you-light"
            >
              <CopyIcon size={16} />
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <details className="text-sm text-muted">
          <summary className="flex min-h-[44px] cursor-pointer items-center">More details</summary>
          <div className="space-y-1 pb-2">
            {(
              [
                ["Phone", phone, setPhone],
                ["ORCID", orcid, setOrcid],
                ["LinkedIn", linkedin, setLinkedin],
              ] as const
            ).map(([label, value, set]) => (
              <input
                key={label}
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={label}
                aria-label={label}
                className="input"
              />
            ))}
          </div>
        </details>
      </div>

      <p className="text-sm text-muted">Tap anything to fix it.</p>

      <section className="card p-4">
        <h2 className="text-lg">What you said</h2>
        <textarea
          value={said}
          onChange={(e) => setSaid(e.target.value)}
          rows={3}
          placeholder="Add a line to remember this by"
          className="mt-2 w-full resize-none bg-transparent outline-none placeholder:text-muted/60"
        />
      </section>

      <section className="card p-4">
        <h2 className="text-lg">Promises</h2>
        <ul className="mt-1 divide-y divide-line">
          {promises.map((p) => {
            const due = formatDue(p.due_on, today);
            const open = editing === p.key;
            return (
              <li key={p.key}>
                <button
                  onClick={() => setEditing(open ? null : p.key)}
                  aria-expanded={open}
                  className="flex min-h-[52px] w-full items-center gap-3 py-2 text-left"
                >
                  <span className="h-5 w-5 shrink-0 rounded-md border-2 border-line" aria-hidden="true" />
                  <span className="min-w-0 flex-1">{p.text || "New promise"}</span>
                  <PromisePill who={p.owed_by === "owner" ? "me" : "them"}>
                    <span className="whitespace-nowrap">
                      {p.owed_by === "owner" ? "you" : theirFirst}
                      {due ? `, ${due}` : ""}
                    </span>
                  </PromisePill>
                </button>
                {open && (
                  <div className="mb-3 space-y-3 rounded-xl bg-paper p-3">
                    <input
                      value={p.text}
                      onChange={(e) => update(p.key, { text: e.target.value })}
                      placeholder="Send the talk slides"
                      aria-label="Promise"
                      autoFocus={!p.text}
                      className="input"
                    />
                    <div role="radiogroup" aria-label="Who promised" className="flex gap-2">
                      {(
                        [
                          ["owner", "You"],
                          ["other", theirFirst],
                        ] as const
                      ).map(([who, label]) => (
                        <button
                          key={who}
                          role="radio"
                          aria-checked={p.owed_by === who}
                          onClick={() => update(p.key, { owed_by: who })}
                          className={`min-h-[44px] flex-1 truncate rounded-full px-4 text-sm font-medium ${
                            p.owed_by === who
                              ? who === "owner"
                                ? "bg-you text-white"
                                : "bg-them text-ink"
                              : "border border-line bg-white"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <input
                      type="date"
                      value={p.due_on ?? ""}
                      onChange={(e) => update(p.key, { due_on: e.target.value || null })}
                      aria-label="Due date"
                      className="input"
                    />
                    <div className="flex justify-between">
                      <button
                        onClick={() => {
                          setPromises((l) => l.filter((x) => x.key !== p.key));
                          setEditing(null);
                        }}
                        className="min-h-[44px] px-2 text-sm text-red-600"
                      >
                        Remove
                      </button>
                      <button onClick={() => setEditing(null)} className="btn-secondary">
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        {promises.length === 0 && <p className="py-2 text-muted">No promises found.</p>}
        <button onClick={addPromise} className="mt-1 flex min-h-[44px] items-center gap-1 font-medium text-you">
          <PlusIcon size={18} />
          Add a promise
        </button>
      </section>

      <section className="card p-4">
        <h2 className="text-lg">Met at</h2>
        <input
          value={metAt}
          onChange={(e) => setMetAt(e.target.value)}
          placeholder="Event or place"
          aria-label="Met at"
          className={`${bare} mt-1 min-h-[44px]`}
        />
      </section>

      {(photoUrls.length > 0 || audioUrl) && (
        <section className="card space-y-3 p-4">
          <h2 className="text-lg">What you captured</h2>
          {photoUrls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {photoUrls.map((u, i) => (
                <a key={u} href={u} target="_blank" rel="noreferrer" aria-label={`Open photo ${i + 1}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt={`Photo ${i + 1}`} className="h-20 w-20 rounded-xl object-cover" />
                </a>
              ))}
            </div>
          )}
          {audioUrl && <audio controls src={audioUrl} className="w-full" />}
        </section>
      )}

      {/* Fixed action bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:left-[220px]">
        <div className="mx-auto max-w-[480px] lg:max-w-[880px]">
          {error && (
            <p role="alert" className="mb-2 text-sm text-red-600">
              {error}
            </p>
          )}
          {askDiscard ? (
            <div className="flex items-center gap-2">
              <p className="min-w-0 flex-1 text-sm">Delete this capture and its photos?</p>
              <button onClick={() => setAskDiscard(false)} className="btn-secondary">
                Keep
              </button>
              <button
                onClick={discard}
                disabled={pending}
                className="inline-flex min-h-[44px] items-center rounded-full bg-red-600 px-5 font-medium text-white disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => setAskDiscard(true)} className="min-h-[52px] px-3 text-muted hover:text-ink">
                Discard
              </button>
              <button
                onClick={submit}
                disabled={pending}
                className="min-h-[52px] flex-1 rounded-full bg-you text-base font-medium text-white hover:bg-you/90 disabled:opacity-60"
              >
                {pending ? "Making your team..." : "Make our team"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
