"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { playBell, primeAudio } from "@/lib/audio";

const STORAGE_KEY = "tubestack:pomodoro:v1";

export type PomodoroStatus = "idle" | "running" | "paused" | "done";

type StoredState = {
  duration: number; // seconds
  status: PomodoroStatus;
  endsAt: number | null; // ms timestamp when running
  pausedRemaining: number; // seconds
};

type Ctx = {
  duration: number;
  status: PomodoroStatus;
  remaining: number; // computed seconds
  start: () => void;
  stop: () => void;
  reset: () => void;
  setDuration: (seconds: number) => void;
  dismissDone: () => void;
};

const PomodoroContext = createContext<Ctx | null>(null);

const DEFAULT: StoredState = {
  duration: 25 * 60,
  status: "idle",
  endsAt: null,
  pausedRemaining: 25 * 60,
};

function load(): StoredState {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as StoredState;
    // sanity check fields
    if (
      typeof parsed.duration !== "number" ||
      typeof parsed.pausedRemaining !== "number"
    ) {
      return DEFAULT;
    }
    return parsed;
  } catch {
    return DEFAULT;
  }
}

function save(s: StoredState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoredState>(DEFAULT);
  const [, setTick] = useState(0);
  const playedDoneRef = useRef(false);

  // hydrate on mount, recompute if a session was running
  useEffect(() => {
    const stored = load();
    if (stored.status === "running" && stored.endsAt !== null) {
      const now = Date.now();
      if (now >= stored.endsAt) {
        // already finished while away — mark done silently (no bell)
        const next: StoredState = {
          ...stored,
          status: "done",
          endsAt: null,
          pausedRemaining: 0,
        };
        playedDoneRef.current = true;
        setState(next);
        save(next);
      } else {
        setState(stored);
      }
    } else {
      setState(stored);
    }
  }, []);

  // persist on every change
  useEffect(() => {
    save(state);
  }, [state]);

  // tick + completion detection
  useEffect(() => {
    if (state.status !== "running" || state.endsAt === null) return;
    const interval = setInterval(() => {
      if (state.endsAt !== null && Date.now() >= state.endsAt) {
        setState((s) => ({
          ...s,
          status: "done",
          endsAt: null,
          pausedRemaining: 0,
        }));
        if (!playedDoneRef.current) {
          playedDoneRef.current = true;
          playBell();
        }
      } else {
        setTick((t) => (t + 1) & 0xff);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [state.status, state.endsAt]);

  const remaining =
    state.status === "running" && state.endsAt !== null
      ? Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000))
      : state.status === "done"
      ? 0
      : state.pausedRemaining;

  const start = useCallback(() => {
    primeAudio();
    setState((s) => {
      const r = s.pausedRemaining > 0 ? s.pausedRemaining : s.duration;
      playedDoneRef.current = false;
      return {
        ...s,
        status: "running",
        endsAt: Date.now() + r * 1000,
        pausedRemaining: r,
      };
    });
  }, []);

  const stop = useCallback(() => {
    setState((s) => {
      const r =
        s.endsAt !== null
          ? Math.max(0, Math.ceil((s.endsAt - Date.now()) / 1000))
          : s.pausedRemaining;
      return { ...s, status: "paused", endsAt: null, pausedRemaining: r };
    });
  }, []);

  const reset = useCallback(() => {
    playedDoneRef.current = false;
    setState((s) => ({
      ...s,
      status: "idle",
      endsAt: null,
      pausedRemaining: s.duration,
    }));
  }, []);

  const setDuration = useCallback((seconds: number) => {
    playedDoneRef.current = false;
    setState({
      duration: seconds,
      status: "idle",
      endsAt: null,
      pausedRemaining: seconds,
    });
  }, []);

  const dismissDone = useCallback(() => {
    setState((s) =>
      s.status === "done"
        ? { ...s, status: "idle", pausedRemaining: s.duration }
        : s
    );
  }, []);

  return (
    <PomodoroContext.Provider
      value={{
        duration: state.duration,
        status: state.status,
        remaining,
        start,
        stop,
        reset,
        setDuration,
        dismissDone,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro(): Ctx {
  const ctx = useContext(PomodoroContext);
  if (!ctx) {
    // safe stub for islands rendered without provider
    return {
      duration: 25 * 60,
      status: "idle",
      remaining: 25 * 60,
      start: () => {},
      stop: () => {},
      reset: () => {},
      setDuration: () => {},
      dismissDone: () => {},
    };
  }
  return ctx;
}

export function formatPomodoroTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}`;
}
