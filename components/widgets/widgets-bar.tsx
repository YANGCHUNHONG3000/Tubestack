"use client";

import { useState } from "react";
import { Clock, ListChecks, Smile, X } from "lucide-react";
import { PomodoroWidget } from "@/components/widgets/pomodoro-widget";
import { JokeWidget } from "@/components/widgets/joke-widget";
import { TodoWidget } from "@/components/widgets/todo-widget";
import {
  formatPomodoroTime,
  usePomodoro,
} from "@/components/widgets/pomodoro-context";

type WidgetId = "pomodoro" | "joke" | "todo";

const WIDGET_TITLE: Record<WidgetId, string> = {
  pomodoro: "Pomodoro",
  joke: "Random joke",
  todo: "To-do",
};

export function WidgetsBar() {
  const [active, setActive] = useState<WidgetId | null>(null);
  const pomo = usePomodoro();

  const toggle = (id: WidgetId) =>
    setActive((cur) => (cur === id ? null : id));

  return (
    <div className="shrink-0 flex flex-col items-stretch gap-2">
      {active && (
        <div
          key={active}
          className="border-2 border-black bg-stone-50 brutal-shadow-sm dark:border-zinc-100 dark:bg-zinc-900"
          style={{
            animation: "widget-slide-up 0.18s ease-out",
          }}
        >
          <div className="flex items-center justify-between border-b-2 border-black bg-yellow-300 px-3 py-1.5 dark:border-zinc-100 dark:text-black">
            <h3 className="text-xs font-black uppercase tracking-tight">
              {WIDGET_TITLE[active]}
            </h3>
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Close widget"
              className="opacity-70 hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" strokeWidth={3} />
            </button>
          </div>
          <div className="p-3">
            {active === "pomodoro" && <PomodoroWidget />}
            {active === "joke" && <JokeWidget />}
            {active === "todo" && <TodoWidget />}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-stretch gap-1.5 border-2 border-black bg-white p-1.5 brutal-shadow-sm dark:border-zinc-100 dark:bg-zinc-900">
        <NavButton
          label="pomodoro"
          icon={<Clock className="h-3.5 w-3.5" strokeWidth={3} />}
          active={active === "pomodoro"}
          onClick={() => toggle("pomodoro")}
          badge={
            pomo.status === "running"
              ? formatPomodoroTime(pomo.remaining)
              : pomo.status === "done"
              ? "Done!"
              : undefined
          }
        />
        <NavButton
          label="random joke"
          icon={<Smile className="h-3.5 w-3.5" strokeWidth={3} />}
          active={active === "joke"}
          onClick={() => toggle("joke")}
        />
        <NavButton
          label="to-do"
          icon={<ListChecks className="h-3.5 w-3.5" strokeWidth={3} />}
          active={active === "todo"}
          onClick={() => toggle("todo")}
        />
      </div>
    </div>
  );
}

function NavButton({
  label,
  icon,
  active,
  onClick,
  badge,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-1 min-w-[90px] items-center justify-center gap-1.5 border-2 border-black px-2 py-1.5 text-[11px] font-black uppercase tracking-tight transition-all dark:border-zinc-100 ${
        active
          ? "bg-black text-white brutal-shadow-sm dark:bg-zinc-100 dark:text-black"
          : "bg-white text-black hover:bg-yellow-300 active:translate-x-px active:translate-y-px dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-yellow-300 dark:hover:text-black"
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className="absolute -top-2 -right-2 border-2 border-black bg-red-500 px-1 py-px font-mono text-[9px] font-bold text-white dark:border-zinc-100">
          {badge}
        </span>
      )}
    </button>
  );
}
