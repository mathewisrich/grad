"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const HINTS = [
  "Hint: think about who really runs this town.",
  "Hint: a term of endearment.",
  "Hint: ask Kelly, he knows.",
  "Hint: starts with the letter M.",
];

export default function PasswordGate() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const answer = value;
    startTransition(async () => {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      if (res.ok) {
        router.push("/landing");
      } else {
        const next = attempts + 1;
        setAttempts(next);
        setError(
          next === 1
            ? "Nope. Try again."
            : next < 3
              ? "Still no. Think harder."
              : "Bro you really don't know who Mathew is??"
        );
        setValue("");
      }
    });
  }

  const hint = HINTS[Math.min(attempts, HINTS.length - 1)];

  return (
    <main className="min-h-screen grain flex items-center justify-center px-5 py-16 relative">
      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-10 animate-fade-in">
          <p className="text-[11px] uppercase tracking-[0.4em] text-gold mb-3">
            Private · Invite Only
          </p>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight">
            Before you can see them,
            <br />
            <span className="text-gold">answer this:</span>
          </h1>
        </div>

        <form
          onSubmit={submit}
          className="bg-white/[0.04] border border-white/10 rounded-3xl p-7 sm:p-9 shadow-2xl backdrop-blur-xl animate-slide-up"
        >
          <label className="block text-xs uppercase tracking-[0.25em] text-cream/50 mb-3">
            Question
          </label>
          <p className="text-2xl sm:text-3xl font-bold mb-7 leading-snug">
            Who is Mathew? Mathew is my{" "}
            <span className="text-gold">__________</span>
          </p>

          <label
            htmlFor="answer"
            className="block text-xs uppercase tracking-[0.25em] text-cream/50 mb-2"
          >
            Your answer
          </label>
          <input
            id="answer"
            type="text"
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="type it..."
            className="w-full px-4 py-4 text-lg bg-black/40 border border-white/15 rounded-2xl focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/40 transition placeholder-white/25"
            aria-invalid={!!error}
            aria-describedby={error ? "answer-error" : undefined}
          />

          {error && (
            <p
              id="answer-error"
              className="mt-3 text-sm text-red-400 animate-fade-in"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || !value.trim()}
            className="btn-primary mt-6 w-full text-lg"
          >
            {isPending ? "Checking..." : "Enter"}
          </button>

          <p className="text-xs text-cream/40 text-center mt-5">{hint}</p>
        </form>

        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-cream/30 mt-10">
          © Kelly & Mathew · Graduation 2026
        </p>
      </div>
    </main>
  );
}
