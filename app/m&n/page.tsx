import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { isMnAuthenticated } from "@/lib/auth";
import MnPasswordGate from "@/components/MnPasswordGate";

export const metadata: Metadata = {
  title: "M & N",
  robots: { index: false, follow: false },
};

export default async function MnHome() {
  if (await isMnAuthenticated()) {
    redirect("/m&n/gallery");
  }
  return <MnPasswordGate />;
}
