import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { isAuthenticated } from "@/lib/auth";
import { getPhotoCount } from "@/lib/photos";

export default async function Landing() {
  if (!(await isAuthenticated())) redirect("/");
  const count = getPhotoCount();

  return (
    <main className="min-h-screen grain px-5 py-12 sm:py-20 relative">
      <div className="max-w-5xl mx-auto relative z-10">
        <header className="text-center animate-fade-in">
          <p className="text-[11px] uppercase tracking-[0.4em] text-gold mb-3">
            Welcome in, my shayla
          </p>
          <h1 className="text-5xl sm:text-7xl font-black leading-[0.95] tracking-tight">
            Kelly,
            <br />
            <span className="text-gold">these are for you.</span>
          </h1>
          <p className="text-cream/70 mt-6 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Your boy Mathew shot{" "}
            <span className="text-gold font-bold">{count}</span> graduation
            pictures of us. Take them all, take a few — whatever you want.
            They&apos;re yours.
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 animate-slide-up">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-white/5 group">
            <Image
              src="/shayla.png"
              alt="My shayla"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              <p className="text-[11px] uppercase tracking-[0.3em] text-gold">
                Featuring
              </p>
              <p className="text-2xl sm:text-3xl font-black mt-1">
                My shayla, the GOAT
              </p>
              <p className="text-sm text-cream/70 mt-1">
                The one and only. Untouchable.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 flex flex-col">
            <div>
              <h2 className="text-2xl font-bold mb-1">How this works</h2>
              <p className="text-xs text-cream/40 uppercase tracking-widest mb-5">
                A 30-second tutorial
              </p>
              <ul className="space-y-3 text-cream/80 text-sm sm:text-base">
                <Step n={1}>Scroll through all {count} pictures.</Step>
                <Step n={2}>Tap any picture to see it full-size.</Step>
                <Step n={3}>
                  Tap the <span className="text-gold">circle</span> on each
                  picture to select it.
                </Step>
                <Step n={4}>
                  Hit <span className="text-gold">Download selected</span> for a
                  zip, or <span className="text-gold">Download all</span> if you
                  want everything.
                </Step>
              </ul>
              <p className="text-xs text-cream/40 mt-5 leading-relaxed">
                Works on phone and laptop. Pictures saved go straight to your
                Downloads folder (desktop) or Files / Photos app (mobile).
              </p>
            </div>

            <Link
              href="/gallery"
              className="btn-primary mt-7 text-center text-lg"
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
    <li className="flex gap-3 items-start">
      <span className="text-gold font-black w-5 shrink-0 tabular-nums">
        {n}.
      </span>
      <span>{children}</span>
    </li>
  );
}

function Footnote() {
  return (
    <p className="text-center text-[10px] uppercase tracking-[0.3em] text-cream/30 mt-12">
      You got the password right · Respect · © Mathew & Kelly 2026
    </p>
  );
}
