import { useEffect } from "react";
import { useRouter } from "next/router";
import designers from "../data/designers.json";
import { getTodaySlug } from "../lib/today";

// GRAPHICAL is a perpetual calendar: "/" redirects to whichever designer's
// birthday matches the visitor's current month/day.
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/day/${getTodaySlug(designers)}`);
  }, [router]);

  return null;
}
