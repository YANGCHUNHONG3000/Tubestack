"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

const JOKE_URL =
  "https://v2.jokeapi.dev/joke/Dark,Programming?type=single&safe-mode";

type JokeResponse = {
  error: boolean;
  joke?: string;
  category?: string;
};

export function JokeWidget() {
  const [joke, setJoke] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJoke = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(JOKE_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("Network error");
      const data: JokeResponse = await res.json();
      if (data.error || !data.joke) {
        throw new Error("API error");
      }
      setJoke(data.joke);
      setCategory(data.category ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJoke();
  }, [fetchJoke]);

  return (
    <div className="flex flex-col items-stretch gap-3">
      <div className="relative min-h-[80px] border-2 border-black bg-yellow-300 px-4 py-3 brutal-shadow-sm dark:border-zinc-100 dark:text-black">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-4 text-xs font-black uppercase">
            <Loader2 className="h-4 w-4 animate-spin" />
            Looking for a joke…
          </div>
        ) : error ? (
          <p className="text-center text-xs font-bold uppercase text-red-700">
            Couldn&apos;t fetch a joke. Try again?
          </p>
        ) : (
          <>
            {category && (
              <span className="absolute right-2 top-1 font-mono text-[9px] font-bold uppercase tracking-widest opacity-60">
                {category}
              </span>
            )}
            <p className="whitespace-pre-line text-center text-sm font-bold leading-snug">
              {joke}
            </p>
          </>
        )}
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={fetchJoke}
          disabled={loading}
          className="flex items-center gap-1.5 border-2 border-black bg-white px-3 py-1.5 text-xs font-black uppercase text-black brutal-shadow-sm hover:bg-stone-200 active:translate-x-px active:translate-y-px active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={3} />
          )}
          Another one
        </button>
      </div>
    </div>
  );
}
