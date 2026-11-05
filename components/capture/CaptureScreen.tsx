"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createCapture } from "@/app/(app)/capture/actions";
import { prepareImage } from "@/lib/image";
import { CameraIcon, MicIcon, NoteIcon, PauseIcon, PlayIcon, XIcon } from "../Icons";
import { shellClass, TopBar } from "./CaptureShell";
import ReadingState from "./ReadingState";

const MODES = [
  { id: "card", label: "Card" },
  { id: "badge", label: "Badge" },
  { id: "slide", label: "Slide" },
  { id: "poster", label: "Poster" },
] as const;
type Mode = (typeof MODES)[number]["id"];

const MAX_PHOTOS = 3;
const MAX_SECONDS = 120;

const HELP =
  "Allow the camera and microphone for this site. Safari: tap the aA menu, then Website Settings. Chrome: tap the lock icon, then Permissions. Then try again.";

type Photo = { id: string; blob: Blob; url: string };
type Voice = { blob: Blob; url: string; mime: string; ext: string; seconds: number };

function clock(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function localDate() {
  // YYYY-MM-DD in the user's own time zone
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export default function CaptureScreen({ eventName }: { eventName: string | null }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("card");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [active, setActive] = useState(0);
  const [voice, setVoice] = useState<Voice | null>(null);
  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt = useRef(0);
  const recordingRef = useRef(false);
  const starting = useRef(false);
  const press = useRef({ down: false, at: 0, ignoreUp: false });
  const urls = useRef<string[]>([]);
  const captureId = useRef<string | null>(null);
  const userId = useRef<string | null>(null);

  // Clean up the microphone and temporary URLs if the user leaves.
  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
      if (recorder.current && recorder.current.state !== "inactive") {
        recorder.current.onstop = null;
        recorder.current.stop();
      }
      stream.current?.getTracks().forEach((t) => t.stop());
      urls.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  // ---------------------------------------------------------------- photos
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setError(null);
    setProcessing(true);
    try {
      let count = photos.length;
      for (const f of files) {
        if (count >= MAX_PHOTOS) break;
        const blob = await prepareImage(f);
        const url = URL.createObjectURL(blob);
        urls.current.push(url);
        count++;
        setPhotos((p) => [...p, { id: crypto.randomUUID(), blob, url }]);
        setActive(count - 1);
      }
    } catch {
      setError("We could not read that photo. Try again, or pick a JPEG or PNG. If the camera will not open: " + HELP);
    } finally {
      setProcessing(false);
    }
  }

  function removePhoto(id: string) {
    setPhotos((p) => {
      const next = p.filter((x) => x.id !== id);
      setActive((a) => Math.min(a, Math.max(next.length - 1, 0)));
      return next;
    });
  }

  // ---------------------------------------------------------------- voice
  async function startRecording() {
    if (starting.current || recordingRef.current) return;
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Voice notes do not work in this browser. Type a note instead.");
      return;
    }
    starting.current = true;
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = s;
      const wanted = ["audio/webm;codecs=opus", "audio/mp4"].find((m) => MediaRecorder.isTypeSupported(m));
      const rec = new MediaRecorder(s, wanted ? { mimeType: wanted } : undefined);
      chunks.current = [];
      rec.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunks.current.push(ev.data);
      };
      rec.onstop = () => {
        const mime = (rec.mimeType || wanted || "audio/webm").split(";")[0];
        const seconds = Math.round((Date.now() - startedAt.current) / 1000);
        s.getTracks().forEach((t) => t.stop());
        stream.current = null;
        if (seconds < 1 || chunks.current.length === 0) return; // too short, ignore
        const blob = new Blob(chunks.current, { type: mime });
        const url = URL.createObjectURL(blob);
        urls.current.push(url);
        const ext = mime.includes("mp4") ? "m4a" : mime.includes("ogg") ? "ogg" : "webm";
        setVoice({ blob, url, mime, ext, seconds });
      };
      recorder.current = rec;
      startedAt.current = Date.now();
      rec.start();
      recordingRef.current = true;
      setRecording(true);
      setElapsed(0);
      timer.current = setInterval(() => {
        const sec = Math.floor((Date.now() - startedAt.current) / 1000);
        setElapsed(sec);
        if (sec >= MAX_SECONDS) stopRecording();
      }, 250);
    } catch (e) {
      const name = e instanceof DOMException ? e.name : "";
      setError(
        name === "NotAllowedError" || name === "SecurityError"
          ? "The microphone is blocked. " + HELP
          : name === "NotFoundError"
            ? "No microphone was found on this device. Type a note instead."
            : "We could not start the microphone. " + HELP
      );
    } finally {
      starting.current = false;
    }
  }

  function stopRecording() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    const rec = recorder.current;
    if (rec && rec.state !== "inactive") rec.stop();
    recordingRef.current = false;
    setRecording(false);
  }

  function micDown(e: React.PointerEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    if (recordingRef.current) {
      // second tap stops
      stopRecording();
      press.current.ignoreUp = true;
      return;
    }
    press.current = { down: true, at: Date.now(), ignoreUp: false };
    startRecording();
  }

  function micUp() {
    const p = press.current;
    p.down = false;
    if (p.ignoreUp) {
      p.ignoreUp = false;
      return;
    }
    if (!recordingRef.current) return; // still starting: treat as a tap, keep recording
    if (Date.now() - p.at >= 450) stopRecording(); // held: release stops. Quick tap keeps going.
  }

  function micKey(e: React.MouseEvent) {
    // keyboard activation only (mouse and touch are handled by the pointer events)
    if (e.detail !== 0) return;
    if (recordingRef.current) stopRecording();
    else startRecording();
  }

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play();
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  }

  function removeVoice() {
    audioRef.current?.pause();
    setPlaying(false);
    setVoice(null);
  }

  // ---------------------------------------------------------------- send
  const hasContent = photos.length > 0 || voice !== null || note.trim().length > 0;

  async function readIt() {
    if (reading || !hasContent || recording) return;
    setError(null);
    setReading(true);
    const kind = photos.length > 0 ? mode : voice ? "voice" : "note";
    const supabase = createClient();
    try {
      if (!captureId.current) {
        const r = await createCapture({ kind, note: note.trim() || null });
        if ("error" in r) throw new Error(r.error);
        captureId.current = r.id;
        userId.current = r.userId;
      } else {
        // a retry: keep the same capture, refresh the mode and note
        await supabase
          .from("captures")
          .update({ kind, text_content: note.trim() || null, status: "reading", error: null })
          .eq("id", captureId.current);
      }
      const id = captureId.current!;
      const base = `${userId.current}/${id}`;

      const photoPaths: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const path = `${base}/${i + 1}.jpg`;
        const { error: upErr } = await supabase.storage
          .from("captures")
          .upload(path, photos[i].blob, { contentType: "image/jpeg", upsert: true });
        if (upErr) throw new Error("upload");
        photoPaths.push(path);
      }
      let audioPath: string | null = null;
      if (voice) {
        audioPath = `${base}/${photos.length + 1}.${voice.ext}`;
        const { error: upErr } = await supabase.storage
          .from("captures")
          .upload(audioPath, voice.blob, { contentType: voice.mime, upsert: true });
        if (upErr) throw new Error("upload");
      }
      const { error: rowErr } = await supabase
        .from("captures")
        .update({ photo_paths: photoPaths, audio_path: audioPath, storage_path: photoPaths[0] ?? audioPath })
        .eq("id", id);
      if (rowErr) throw new Error("upload");

      // The reading page takes over from here (also if this request is cut off).
      fetch(`/api/capture/${id}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ localDate: localDate() }),
      })
        .catch(() => {})
        .finally(() => router.replace(`/capture/${id}`));
    } catch (e) {
      if (captureId.current) {
        await supabase
          .from("captures")
          .update({ status: "failed", error: "Upload did not finish." })
          .eq("id", captureId.current);
      }
      setReading(false);
      setError(
        e instanceof Error && e.message !== "upload" && e.message.length < 120
          ? e.message
          : "We could not upload your capture. Your photos and note are still here. Check your connection and try again."
      );
    }
  }

  // ---------------------------------------------------------------- screens
  if (reading) {
    const messages = [
      ...(photos.length ? ["Reading the card..."] : []),
      ...(voice || note.trim() ? ["Listening to your note..."] : []),
      "Finding promises...",
    ];
    return (
      <div className={shellClass()}>
        <TopBar eventName={eventName} />
        <ReadingState messages={messages} />
      </div>
    );
  }

  const retry = captureId.current !== null && error !== null;

  return (
    <div className={shellClass("relative")}>
      <TopBar eventName={eventName} />

      <div role="radiogroup" aria-label="What are you capturing" className="flex justify-center gap-2 px-4 pb-3">
        {MODES.map((m) => (
          <button
            key={m.id}
            role="radio"
            aria-checked={mode === m.id}
            onClick={() => setMode(m.id)}
            className={`min-h-[44px] rounded-full px-4 text-sm font-medium ${
              mode === m.id ? "bg-white text-ink" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="relative mx-4 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-3xl bg-white/5">
        {photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photos[Math.min(active, photos.length - 1)].url} alt="Your photo" className="h-full w-full object-contain" />
        ) : (
          !recording && (
            <div className="px-8 text-center">
              <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/80">
                <CameraIcon />
              </span>
              <p className="text-lg text-white/80">Snap their card, badge or slide. Or hold to talk.</p>
              <button
                onClick={() => setError(HELP)}
                className="mt-3 min-h-[44px] text-sm text-white/50 underline underline-offset-4"
              >
                Camera or microphone blocked?
              </button>
            </div>
          )
        )}
        {recording && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/70 text-center">
            <p className="flex items-center gap-2 font-heading text-4xl font-extrabold tabular-nums">
              <span className="h-3 w-3 rounded-full bg-red-500" aria-hidden="true" />
              {clock(elapsed)}
            </p>
            <p className="text-white/70">Release to stop, or tap the button again.</p>
          </div>
        )}
        {processing && (
          <p className="absolute bottom-3 rounded-full bg-black/60 px-3 py-1 text-sm">Preparing photo...</p>
        )}
      </div>

      {error && (
        <div role="alert" className="mx-4 mt-3 flex items-start gap-2 rounded-2xl bg-white/10 p-3 text-sm">
          <p className="flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            aria-label="Dismiss"
            className="-m-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-white/10"
          >
            <XIcon size={18} />
          </button>
        </div>
      )}

      {/* What was captured */}
      {(photos.length > 0 || voice || note.trim()) && (
        <div className="mx-4 mt-3 flex flex-wrap items-center gap-2">
          {photos.map((p, i) => (
            <div key={p.id} className="relative">
              <button
                onClick={() => setActive(i)}
                aria-label={`Photo ${i + 1}`}
                className={`block h-14 w-14 overflow-hidden rounded-xl ${i === active ? "ring-2 ring-white" : "opacity-80"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="h-full w-full object-cover" />
              </button>
              <button
                onClick={() => removePhoto(p.id)}
                aria-label={`Remove photo ${i + 1}`}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink before:absolute before:-inset-3 before:content-['']"
              >
                <XIcon size={14} />
              </button>
            </div>
          ))}
          {voice && (
            <div className="flex min-h-[44px] items-center gap-1 rounded-full bg-white/15 pl-1 pr-1 text-sm">
              <button
                onClick={togglePlay}
                aria-label={playing ? "Pause voice note" : "Play voice note"}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-you"
              >
                {playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
              </button>
              <span className="px-1 tabular-nums">Voice {clock(voice.seconds)}</span>
              <button
                onClick={removeVoice}
                aria-label="Remove voice note"
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10"
              >
                <XIcon size={16} />
              </button>
              <audio ref={audioRef} src={voice.url} onEnded={() => setPlaying(false)} className="hidden" />
            </div>
          )}
          {note.trim() && (
            <div className="flex min-h-[44px] max-w-full items-center gap-1 rounded-full bg-white/15 pl-3 pr-1 text-sm">
              <button onClick={() => setNoteOpen(true)} className="min-w-0 max-w-[180px] truncate text-left">
                {note.trim()}
              </button>
              <button
                onClick={() => setNote("")}
                aria-label="Remove note"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-white/10"
              >
                <XIcon size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {hasContent && !recording && (
        <button
          onClick={readIt}
          className="mx-4 mt-3 min-h-[52px] rounded-full bg-you text-base font-medium text-white hover:bg-you/90"
        >
          {retry ? "Try again" : "Read it"}
        </button>
      )}

      {/* Thumb zone */}
      <div className="grid grid-cols-3 items-start px-6 pb-[max(20px,env(safe-area-inset-bottom))] pt-4">
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => setNoteOpen(true)}
            aria-label="Add a note"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
          >
            <NoteIcon />
          </button>
          <span className="text-xs text-white/70">Note</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFile}
            className="hidden"
            tabIndex={-1}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={photos.length >= MAX_PHOTOS || processing || recording}
            aria-label="Take a photo"
            className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white disabled:opacity-40"
          >
            <span className="h-14 w-14 rounded-full bg-white" />
          </button>
          <span className="text-xs text-white/70">
            {photos.length >= MAX_PHOTOS ? "3 of 3" : photos.length > 0 ? `${photos.length} of 3` : "Photo"}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            onPointerDown={micDown}
            onPointerUp={micUp}
            onPointerCancel={micUp}
            onClick={micKey}
            onContextMenu={(e) => e.preventDefault()}
            aria-label={recording ? "Stop recording" : "Hold to talk"}
            aria-pressed={recording}
            style={{ touchAction: "none" }}
            className={`flex h-14 w-14 select-none items-center justify-center rounded-full text-white ${
              recording ? "bg-red-500 ring-4 ring-red-500/30" : "bg-you hover:bg-you/90"
            }`}
          >
            <MicIcon />
          </button>
          <span className="text-xs text-white/70">{recording ? "Stop" : "Hold to talk"}</span>
        </div>
      </div>

      {/* Note sheet */}
      {noteOpen && (
        <div className="absolute inset-0 z-10 flex items-end bg-black/50" onClick={() => setNoteOpen(false)}>
          <div
            className="w-full rounded-t-3xl bg-white p-4 pb-[max(16px,env(safe-area-inset-bottom))] text-ink"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg">What should you remember?</h2>
            <textarea
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
              placeholder="She wants our slides. I said I would send them Friday."
              className="input mt-3 resize-none py-3"
            />
            <div className="mt-3 flex gap-2">
              {note && (
                <button onClick={() => setNote("")} className="btn-secondary">
                  Clear
                </button>
              )}
              <button
                onClick={() => setNoteOpen(false)}
                className="min-h-[44px] flex-1 rounded-full bg-you font-medium text-white hover:bg-you/90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
