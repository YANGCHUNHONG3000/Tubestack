"use client";

let ctx: AudioContext | null = null;

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const w = window as WebkitWindow;
  const Ctor = window.AudioContext ?? w.webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

/** Call from a user-gesture handler (e.g. clicking Start) so playback later
 *  doesn't get blocked by autoplay policies. */
export function primeAudio() {
  getCtx();
}

/** Two-tone bell — Web Audio only, no asset files. */
export function playBell() {
  const c = getCtx();
  if (!c) return;
  const tone = (freq: number, start: number, dur: number, vol = 0.3) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.frequency.value = freq;
    osc.type = "sine";
    const t = c.currentTime + start;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  };
  tone(880, 0, 0.6, 0.28); // A5
  tone(1320, 0.45, 0.9, 0.22); // E6
}
