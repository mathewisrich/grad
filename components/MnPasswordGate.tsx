"use client";

import { useState, useTransition, type FormEvent } from "react";

export default function MnPasswordGate() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isPending, startTransition] = useTransition();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const answer = value;
    startTransition(async () => {
      const res = await fetch("/api/auth-mn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
        credentials: "same-origin",
        cache: "no-store",
      });
      if (res.ok) {
        window.location.assign("/m&n/gallery");
      } else {
        setAttempts((a) => a + 1);
        setError("mmm, not quite. try again 🤍");
        setValue("");
      }
    });
  }

  return (
    <main className="min-h-screen vibrant-bg flex items-center justify-center px-4 sm:px-5 py-10 sm:py-16 relative">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6 animate-fade-in">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-pink-300/80 font-extrabold mb-3">
            just us 🤍
          </p>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight">
            <span className="text-gradient-candy">Mathew</span>
            <span className="text-white/40 mx-2">&amp;</span>
            <span className="text-gradient-sunset">Naa</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/60 font-medium max-w-sm mx-auto">
            a little corner of the internet, only for two.
          </p>
        </div>

        <div className="mb-7 flex items-center justify-center animate-fade-in">
          <div className="text-6xl sm:text-7xl animate-pulse select-none" aria-hidden>
            🤍
          </div>
        </div>

        <form
          onSubmit={submit}
          className="bg-black/85 border border-pink-500/40 rounded-3xl p-6 sm:p-9 shadow-2xl backdrop-blur-xl animate-slide-up neon-glow-pink"
        >
          <label className="block text-[10px] sm:text-xs uppercase tracking-[0.25em] text-pink-300 font-extrabold mb-2">
            One question
          </label>
          <p className="text-2xl sm:text-3xl font-black mb-5 sm:mb-6 leading-snug text-gradient-candy">
            who is your daddy?
          </p>

          <label
            htmlFor="mn-answer"
            className="block text-[10px] sm:text-xs uppercase tracking-[0.25em] text-white/40 font-bold mb-2"
          >
            Your answer
          </label>
          <input
            id="mn-answer"
            type="password"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="• • • • • • •"
            className="w-full px-4 py-4 text-lg bg-zinc-950 border border-pink-500/30 rounded-2xl focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-400/20 text-white font-semibold transition placeholder-white/20 shadow-inner tracking-widest"
            aria-invalid={!!error}
            aria-describedby={error ? "mn-answer-error" : undefined}
          />

          {error && (
            <p
              id="mn-answer-error"
              className="mt-3 text-sm text-pink-400 font-extrabold animate-fade-in"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || !value.trim()}
            className="btn-primary mt-6 w-full text-lg shadow-lg"
          >
            {isPending ? "Opening..." : "Come in 🤍"}
          </button>

          {attempts >= 2 && (
            <p className="text-xs text-white/40 font-medium text-center mt-5">
              psst — you already know this one. 😌
            </p>
          )}
        </form>

        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-white/25 mt-8">
          private · M &amp; N
        </p>
      </div>
    </main>
  );
}
