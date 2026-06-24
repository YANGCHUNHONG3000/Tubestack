"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import {
  formatPomodoroTime,
  usePomodoro,
} from "@/components/widgets/pomodoro-context";

const PRESETS: { label: string; seconds: number }[] = [
  { label: "25 min", seconds: 25 * 60 },
  { label: "10 min", seconds: 10 * 60 },
  { label: "5 min", seconds: 5 * 60 },
];

export function PomodoroWidget() {
  const {
    duration,
    status,
    remaining,
    start,
    stop,
    reset,
    setDuration,
    dismissDone,
  } = usePomodoro();

  const isRunning = status === "running";
  const isDone = status === "done";

  return (
    <div
      className={`flex flex-col items-center gap-3 ${
        isDone ? "animate-pulse" : ""
      }`}
    >
      <div
        className={`flex w-full flex-col items-center gap-2 border-2 px-4 py-3 transition-colors ${
          isDone
            ? "border-red-500 bg-red-50 dark:bg-red-950/40"
            : "border-black bg-white dark:border-zinc-100 dark:bg-zinc-950"
        }`}
      >
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-60">
          {isDone
            ? "Time's up"
            : isRunning
            ? "Focus"
            : status === "paused"
            ? "Paused"
            : "Ready"}
        </span>
        <span className="font-mono text-5xl font-black tabular-nums leading-none sm:text-6xl">
          {formatPomodoroTime(remaining)}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {PRESETS.map((p) => {
          const active = duration === p.seconds;
          return (
            <button
              key={p.seconds}
              type="button"
              onClick={() => setDuration(p.seconds)}
              className={`border-2 border-black px-2.5 py-1 text-[11px] font-black uppercase tracking-tight transition-all dark:border-zinc-100 ${
                active
                  ? "bg-black text-white brutal-shadow-sm dark:bg-zinc-100 dark:text-black"
                  : "bg-white text-black hover:bg-stone-200 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2">
        {isDone ? (
          <button
            type="button"
            onClick={dismissDone}
            className="flex items-center gap-1.5 border-2 border-black bg-yellow-300 px-3 py-1.5 text-xs font-black uppercase brutal-shadow-sm hover:bg-yellow-400 active:translate-x-px active:translate-y-px active:shadow-none dark:border-zinc-100 dark:text-black"
          >
            Dismiss
          </button>
        ) : isRunning ? (
          <button
            type="button"
            onClick={stop}
            className="flex items-center gap-1.5 border-2 border-black bg-red-500 px-3 py-1.5 text-xs font-black uppercase text-white brutal-shadow-sm hover:bg-red-600 active:translate-x-px active:translate-y-px active:shadow-none dark:border-zinc-100"
          >
            <Pause className="h-3.5 w-3.5" strokeWidth={3} />
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            className="flex items-center gap-1.5 border-2 border-black bg-yellow-300 px-3 py-1.5 text-xs font-black uppercase text-black brutal-shadow-sm hover:bg-yellow-400 active:translate-x-px active:translate-y-px active:shadow-none dark:border-zinc-100"
          >
            <Play className="h-3.5 w-3.5" strokeWidth={3} />
            Start
          </button>
        )}
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 border-2 border-black bg-white px-3 py-1.5 text-xs font-black uppercase text-black hover:bg-stone-200 active:translate-x-px active:translate-y-px dark:border-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={3} />
          Reset
        </button>
      </div>
    </div>
  );
}
