"use client";

import { useState, useTransition, type FormEvent, useEffect, useRef } from "react";
import Image from "next/image";

const HINTS = [
  "Hint: Mathew is my d____. 🐶",
  "Hint: Starts with 'd' and ends with 'y'.",
  "Hint: roof roof roof... who is he to you? 🐶🐾",
  "Hint: come on baby boy, you know this one. 🐾",
];

export default function PasswordGate() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [isListening, setIsListening] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const matchedRef = useRef<boolean>(false);
  const userStoppedRef = useRef<boolean>(false);

  // Returns true if any of the transcripts sounds like "daddy"
  function looksLikeDaddy(transcripts: string[]): boolean {
    const targets = [
      "daddy",
      "dady",
      "dadi",
      "daddie",
      "daddies",
      "daddi",
      "dad",
      "dadda",
      "dada",
      "deddy",
      "doddy",
      "ddady",
      "addy",
      "dude",
      "deddi",
      "daty",
      "dadi",
      "dati",
      "diddy",
      "dadd",
    ];
    for (const raw of transcripts) {
      const text = raw.toLowerCase().replace(/[^a-z]/g, " ");
      const words = text.split(/\s+/).filter(Boolean);
      for (const w of words) {
        if (targets.includes(w)) return true;
        // Loose check: word starts with "d" + vowel + "d" pattern
        if (/^d[aeiou]d/.test(w)) return true;
        // Or contains "dad" as a substring
        if (w.includes("dad")) return true;
      }
      // Full-string contains check
      if (text.includes("daddy") || text.includes("dady")) return true;
    }
    return false;
  }

  // Initialize Speech Recognition on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        // Continuous + interim = grab partial transcripts the moment they come in
        recognition.continuous = true;
        recognition.lang = "en-US";
        recognition.interimResults = true;
        recognition.maxAlternatives = 5;

        recognition.onstart = () => {
          setIsListening(true);
          setSpeechFeedback("Listening... say 'daddy' 🎙️");
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          if (event.error === "not-allowed") {
            setIsListening(false);
            setSpeechFeedback("Microphone permission denied 🚫");
          } else if (event.error === "no-speech") {
            // Don't stop - let it auto-restart on end
            setSpeechFeedback("Didn't hear anything yet... 👂");
          } else if (event.error === "aborted") {
            // user stopped, ignore
          } else {
            setSpeechFeedback(`Hmm: ${event.error}. Trying again...`);
          }
        };

        recognition.onend = () => {
          // Auto-restart unless we matched the word or the user stopped manually
          if (!matchedRef.current && !userStoppedRef.current) {
            try {
              recognition.start();
              return;
            } catch (e) {
              console.warn("Restart failed", e);
            }
          }
          setIsListening(false);
        };

        recognition.onresult = (event: any) => {
          if (matchedRef.current) return; // already matched — ignore
          const allTranscripts: string[] = [];
          for (let i = 0; i < event.results.length; i++) {
            const res = event.results[i];
            for (let j = 0; j < res.length; j++) {
              allTranscripts.push(res[j].transcript.trim());
            }
          }
          console.log("Transcripts heard:", allTranscripts);

          const latest = allTranscripts[allTranscripts.length - 1];
          if (latest) {
            setSpeechFeedback(`Heard: "${latest}" 👂`);
          }

          if (looksLikeDaddy(allTranscripts)) {
            matchedRef.current = true;
            userStoppedRef.current = true;
            setSpeechFeedback("Recognized! Logging in... 🎉");
            setValue("daddy");
            try {
              recognition.abort();
            } catch {}
            try {
              recognition.stop();
            } catch {}
            // Defer to next tick so the mic fully releases on mobile Safari
            // BEFORE we kick off the network request + navigation. Without
            // this, iOS Safari can drop the fetch when the audio context tears
            // down mid-flight.
            setTimeout(() => triggerAutoLogin("daddy"), 50);
          }
        };

        recognitionRef.current = recognition;
      }
    }
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {}
    };
  }, []);

  async function triggerAutoLogin(passwordToUse: string) {
    setSpeechFeedback("Unlocking... 🔓");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: passwordToUse }),
        // Make sure the Set-Cookie response is honored on mobile Safari
        credentials: "same-origin",
        cache: "no-store",
      });
      if (res.ok) {
        setSpeechFeedback("In! Welcome 🎉");
        // Hard navigation so the just-set auth cookie is definitely sent on
        // the next request. router.push() can occasionally race the cookie on
        // mobile Safari and bounce the user right back to the login page.
        window.location.assign("/landing");
      } else {
        matchedRef.current = false; // allow retry
        setAttempts((a) => a + 1);
        setError("baby boy you forgot who i am to you");
        setSpeechFeedback("Hmm, try again 🐶");
        setValue("");
      }
    } catch (err) {
      console.error("Auto-login failed", err);
      matchedRef.current = false;
      setSpeechFeedback("Network hiccup. Tap Enter manually 👇");
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const answer = value;
    startTransition(async () => {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
        credentials: "same-origin",
        cache: "no-store",
      });
      if (res.ok) {
        window.location.assign("/landing");
      } else {
        setAttempts((a) => a + 1);
        setError("baby boy you forgot who i am to you");
        setValue("");
      }
    });
  }

  function toggleListening() {
    if (!recognitionRef.current) return;
    if (isListening) {
      userStoppedRef.current = true;
      try {
        recognitionRef.current.stop();
      } catch {}
    } else {
      matchedRef.current = false;
      userStoppedRef.current = false;
      setSpeechFeedback("Get ready...");
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  }

  const hint = HINTS[Math.min(attempts, HINTS.length - 1)];

  return (
    <main className="min-h-screen vibrant-bg flex items-center justify-center px-4 sm:px-5 py-8 sm:py-16 relative">
      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-5 sm:mb-6 animate-fade-in">
          <h1 className="text-3xl xs:text-4xl sm:text-5xl font-black leading-tight tracking-tight">
            <span className="text-gradient-animated">Who is a good boy!</span>{" "}
            <span className="paw-wiggle">🐾</span>
            <span className="paw-wiggle delay">🐾</span>
          </h1>
          <p className="mt-2 text-xs xs:text-sm sm:text-base text-pink-400 font-bold max-w-md mx-auto animate-pulse px-2">
            look at you being a good boy Kelly roof roof rooof 🐶🐾🐕
          </p>
        </div>

        {/* Dynamic Meme Picture based on password attempts */}
        <div className="mb-6 sm:mb-8 flex flex-col items-center justify-center animate-fade-in">
          {attempts === 0 ? (
            <>
              <div className="relative w-32 h-32 xs:w-40 xs:h-40 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-yellow-400 shadow-2xl neon-glow-pink">
                <Image
                  src="/dog-meme.png"
                  alt="Good Boy Kelly"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <p className="mt-3 sm:mt-4 text-lg xs:text-xl sm:text-2xl font-black uppercase tracking-wider text-gradient-sunset select-none animate-bounce text-center px-2">
                &ldquo;am talm bout innnnnit&rdquo;
              </p>
            </>
          ) : (
            <>
              <div className="relative w-32 h-32 xs:w-40 xs:h-40 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-pink-500 shadow-2xl neon-glow-pink animate-wiggle">
                <Image
                  src="/wrong-meme.png"
                  alt="Suspicious Side Eye Dog"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="text-center mt-3 sm:mt-4 px-2">
                <p className="text-base xs:text-xl sm:text-2xl font-black uppercase tracking-wider text-pink-500 animate-pulse leading-snug">
                  &ldquo;baby boy you forgot who i am to you&rdquo;
                </p>
                <p className="text-sm xs:text-base sm:text-lg font-black uppercase tracking-widest text-yellow-300 mt-1 scale-105">
                  say it louder. 📢
                </p>
              </div>
            </>
          )}
        </div>

        <form
          onSubmit={submit}
          className="bg-black/85 border border-pink-500/40 rounded-3xl p-5 xs:p-7 sm:p-9 shadow-2xl backdrop-blur-xl animate-slide-up neon-glow-pink"
        >
          <label className="block text-[10px] xs:text-xs uppercase tracking-[0.25em] text-yellow-400 font-extrabold mb-2 sm:mb-3">
            Prove your identity
          </label>
          <p className="text-2xl xs:text-3xl sm:text-4xl font-black mb-2 sm:mb-3 leading-snug text-gradient-candy">
            Who am I to you?
          </p>
          <p className="text-xs sm:text-sm text-white/70 font-semibold mb-5 sm:mb-7">
            You can either <span className="text-yellow-400">type it</span> or{" "}
            <span className="text-pink-400">say it louder</span>. 📢
          </p>

          <label
            htmlFor="answer"
            className="block text-xs uppercase tracking-[0.25em] text-pink-400 font-bold mb-2"
          >
            Your answer
          </label>
          <input
            id="answer"
            type="text"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="d-----y"
            className="w-full px-4 py-4 text-lg bg-zinc-950 border border-pink-500/30 rounded-2xl focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 text-white font-semibold transition placeholder-white/20 shadow-inner"
            aria-invalid={!!error}
            aria-describedby={error ? "answer-error" : undefined}
          />

          {error && (
            <p
              id="answer-error"
              className="mt-3 text-sm text-pink-400 font-extrabold animate-fade-in"
            >
              {error}
            </p>
          )}

          {/* Voice detector UI */}
          {isSupported && (
            <div className="mt-6 p-4 rounded-2xl bg-zinc-900/60 border border-yellow-400/20 flex flex-col items-center justify-center">
              <p className="text-xs text-white/50 uppercase tracking-widest font-black mb-3">
                🎙️ Lil boy voice dihtector
              </p>
              <button
                type="button"
                onClick={toggleListening}
                className={`h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isListening
                    ? "bg-red-500 text-white animate-ping scale-110 shadow-lg shadow-red-500/50"
                    : "bg-yellow-400 text-black hover:bg-yellow-300 hover:scale-105 active:scale-95 shadow-md"
                }`}
                title="Click to speak password"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-7 h-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                  />
                </svg>
              </button>
              {speechFeedback && (
                <p className="mt-3 text-xs text-yellow-300 font-extrabold animate-pulse text-center">
                  {speechFeedback}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || !value.trim()}
            className="btn-primary mt-6 w-full text-lg shadow-lg"
          >
            {isPending ? "Checking..." : "Enter 🐶"}
          </button>

          <p className="text-xs text-yellow-400/95 font-bold text-center mt-5">{hint}</p>
        </form>

        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-white/30 mt-10">
          © Kelly & Mathew · Graduation 2026
        </p>
      </div>
    </main>
  );
}
