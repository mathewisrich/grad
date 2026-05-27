import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import PasswordGate from "@/components/PasswordGate";

export default async function Home() {
  if (await isAuthenticated()) {
    redirect("/landing");
  }
  return <PasswordGate />;
}
