import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { isAuthenticated } from "@/lib/auth";
import { getPhotoCount } from "@/lib/photos";

export default async function Landing() {
  if (!(await isAuthenticated())) redirect("/");
  const count = getPhotoCount();

  return (
    <main className="min-h-screen px-6 py-12 sm:py-20">
      <div className="max-w-4xl mx-auto">
        <header className="text-center animate-fade-in">
          <p className="text-xs uppercase tracking-[0.35em] text-gold mb-3">
            Welcome in, my shayla
          </p>
          <h1 className="text-5xl sm:text-7xl font-black leading-none tracking-tight">
            Kelly,
            <br />
            <span className="text-gold">these are for you.</span>
          </h1>
          <p className="text-cream/70 mt-6 text-lg max-w-2xl mx-auto">
            Your boy Mathew shot{" "}
            <span className="text-gold font-bold">{count}</span> graduation
            pictures of us. Take them all, take a few — whatever you want.
            They're yours.
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 animate-slide-up">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-white/5">
            <Image
              src="/shayla.png"
              alt="My shayla"
              fill
              priority
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              <p className="text-xs uppercase tracking-widest text-gold">
                Featuring
              </p>
              <p className="text-2xl font-bold">My shayla, the GOAT</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-3">How this works</h2>
              <ul className="space-y-3 text-cream/80 text-sm sm:text-base">
                <li className="flex gap-3">
                  <span className="text-gold font-bold">1.</span>
                  <span>Scroll through all {count} pictures.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gold font-bold">2.</span>
                  <span>Tap any picture to see it full-size.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gold font-bold">3.</span>
                  <span>
                    Tap the circle on each picture to{" "}
                    <span className="text-gold">select</span> it.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gold font-bold">4.</span>
                  <span>
                    Hit <span className="text-gold">Download Selected</span> for
                    a zip, or <span className="text-gold">Download All</span> if
                    you want everything.
                  </span>
                </li>
              </ul>
              <p className="text-xs text-cream/40 mt-4">
                Works on phone and laptop. Downloads go straight to your device.
              </p>
            </div>

            <Link
              href="/gallery"
              className="mt-7 block text-center py-4 rounded-xl bg-gold text-ink font-bold text-lg uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition"
            >
              Enter the gallery →
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-cream/30 mt-12">
          You got the password right. Respect. · © Mathew & Kelly 2026
        </p>
      </div>
    </main>
  );
}
