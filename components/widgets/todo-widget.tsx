"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const STORAGE_KEY = "tubestack:todos:v1";

type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
};

function load(): Todo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t): t is Todo =>
        t && typeof t.id === "string" && typeof t.text === "string"
    );
  } catch {
    return [];
  }
}

function save(todos: Todo[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // ignore
  }
}

export function TodoWidget() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const hydratedRef = useRef(false);

  useEffect(() => {
    setTodos(load());
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    save(todos);
  }, [todos]);

  function add(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setTodos((t) => [
      {
        id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text: trimmed,
        done: false,
        createdAt: Date.now(),
      },
      ...t,
    ]);
    setInput("");
  }

  function toggle(id: string) {
    setTodos((t) =>
      t.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo))
    );
  }

  function remove(id: string) {
    setTodos((t) => t.filter((todo) => todo.id !== id));
  }

  const remaining = todos.filter((t) => !t.done).length;

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={add} className="flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ADD A TASK…"
          maxLength={120}
          className="h-9 min-w-0 flex-1 border-2 border-r-0 border-black bg-white px-2 text-xs font-bold uppercase text-black placeholder:text-black/40 focus:outline-none dark:border-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-100/40"
        />
        <button
          type="submit"
          aria-label="Add task"
          disabled={!input.trim()}
          className="grid h-9 w-9 shrink-0 place-items-center border-2 border-black bg-yellow-300 hover:bg-yellow-400 active:translate-x-px active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-100 dark:text-black"
        >
          <Plus className="h-4 w-4" strokeWidth={3} />
        </button>
      </form>

      <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-widest opacity-60">
        <span>{todos.length === 0 ? "No tasks yet" : `${remaining} left`}</span>
        <span>{todos.length} total</span>
      </div>

      {todos.length > 0 && (
        <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto pr-1">
          {todos.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-2 border-2 border-black bg-white px-2 py-1.5 dark:border-zinc-100 dark:bg-zinc-950"
            >
              <Checkbox
                checked={t.done}
                onCheckedChange={() => toggle(t.id)}
                className="border-2 border-black"
                aria-label="Mark done"
              />
              <span
                className={`flex-1 truncate text-xs font-bold uppercase ${
                  t.done ? "text-black/40 line-through dark:text-zinc-500" : ""
                }`}
                title={t.text}
              >
                {t.text}
              </span>
              <button
                type="button"
                onClick={() => remove(t.id)}
                aria-label="Delete task"
                className="border-2 border-black p-0.5 hover:bg-red-500 hover:text-white dark:border-zinc-100"
              >
                <Trash2 className="h-3 w-3" strokeWidth={3} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
