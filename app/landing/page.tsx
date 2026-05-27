import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { isAuthenticated } from "@/lib/auth";
import { getPhotoCount } from "@/lib/photos";

export default async function Landing() {
  if (!(await isAuthenticated())) redirect("/");
  const count = getPhotoCount();

  return (
    <main className="min-h-screen vibrant-bg px-4 sm:px-6 py-10 sm:py-20 relative">
      <div className="max-w-5xl mx-auto relative z-10">
        <header className="text-center animate-fade-in">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] sm:tracking-[0.4em] text-pink-400 font-extrabold mb-3">
            Welcome in, my shayla 👑
          </p>
          <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-black leading-[0.95] tracking-tight">
            Kelly,
            <br />
            <span className="text-gradient-candy">these are for you.</span>
          </h1>
          <p className="text-white/70 mt-5 sm:mt-6 text-sm xs:text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium px-2">
            Your boy Mathew shot{" "}
            <span className="text-gradient-neon font-black">{count}</span> graduation
            pictures of us. Take them all, take a few — whatever you want.
            They&apos;re yours.
          </p>
        </header>

        <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 animate-slide-up">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-pink-500/30 bg-white/[0.04] group neon-glow-pink">
            <Image
              src="/shayla.png"
              alt="My shayla"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              <p className="text-[11px] uppercase tracking-[0.3em] text-pink-500 font-bold">
                Featuring
              </p>
              <p className="text-2xl sm:text-3xl font-black mt-1 text-gradient-sunset">
                My shayla, the GOAT 🐐
              </p>
              <p className="text-sm text-white/70 mt-1">
                The one and only. Untouchable.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-yellow-500/30 bg-white/[0.04] p-5 sm:p-8 flex flex-col justify-between neon-glow-cyan">
            <div>
              <h2 className="text-2xl font-black mb-1 text-gradient-candy">How this works 🚀</h2>
              <p className="text-xs text-yellow-400 uppercase tracking-widest mb-5 font-bold">
                A 30-second tutorial
              </p>
              <ul className="space-y-3 text-white/90 text-sm sm:text-base font-semibold">
                <Step n={1}>Scroll through all {count} pictures.</Step>
                <Step n={2}>Tap any picture to see it full-size.</Step>
                <Step n={3}>
                  Tap the <span className="text-pink-500 font-bold">circle</span> on each
                  picture to select it.
                </Step>
                <Step n={4}>
                  Hit <span className="text-yellow-400 font-bold">Download selected</span> for a
                  zip, or <span className="text-pink-500 font-bold">Download all</span> if you
                  want everything.
                </Step>
              </ul>
              <p className="text-xs text-white/40 mt-5 leading-relaxed">
                Works on phone and laptop. Pictures saved go straight to your
                Downloads folder (desktop) or Files / Photos app (mobile).
              </p>
            </div>

            <Link
              href="/gallery"
              className="btn-primary mt-7 text-center text-lg shadow-xl"
            >
              Enter the gallery →
            </Link>
          </div>
        </div>

        <Footnote />
      </div>
    </main>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 items-start animate-fade-in">
      <span className="text-yellow-400 font-black w-5 shrink-0 tabular-nums">
        {n}.
      </span>
      <span>{children}</span>
    </li>
  );
}

function Footnote() {
  return (
    <p className="text-center text-[10px] uppercase tracking-[0.3em] text-white/30 mt-12">
      You got the password right · Respect · © Mathew & Kelly 2026
    </p>
  );
}
