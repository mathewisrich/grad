"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function PasswordGate() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function submit(e: React.FormEvent) {
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
        setError("Nope. Think harder. Who really is Mathew?");
        setValue("");
      }
    });
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10 animate-fade-in">
          <p className="text-xs uppercase tracking-[0.35em] text-gold mb-3">
            Private · Invite Only
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            Before you can see them,
            <br />
            answer this:
          </h1>
        </div>

        <form
          onSubmit={submit}
          className="bg-white/5 border border-white/10 rounded-3xl p-7 sm:p-9 shadow-2xl backdrop-blur animate-slide-up"
        >
          <label className="block text-sm uppercase tracking-widest text-cream/60 mb-3">
            Question
          </label>
          <p className="text-2xl sm:text-3xl font-semibold mb-6 leading-snug">
            Who is Mathew? Mathew is my{" "}
            <span className="text-gold">__________</span>
          </p>

          <label
            htmlFor="answer"
            className="block text-sm uppercase tracking-widest text-cream/60 mb-2"
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
            className="w-full px-4 py-4 text-lg bg-black/40 border border-white/15 rounded-xl focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/40 transition placeholder-white/30"
          />

          {error && (
            <p className="mt-3 text-sm text-red-400 animate-fade-in">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending || !value.trim()}
            className="mt-6 w-full py-4 rounded-xl bg-gold text-ink font-bold text-lg uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? "Checking..." : "Enter"}
          </button>

          <p className="text-xs text-cream/40 text-center mt-5">
            Hint: think about who really runs this town.
          </p>
        </form>

        <p className="text-center text-xs text-cream/30 mt-8">
          © Kelly & Mathew · Graduation 2026
        </p>
      </div>
    </main>
  );
}
