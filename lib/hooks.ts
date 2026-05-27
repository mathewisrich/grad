"use client";

import { useCallback, useEffect, useState } from "react";
import { getDownloadedSet } from "./download";

const SELECTION_KEY = "kg.selection.v1";

export function usePersistedSelection() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SELECTION_KEY);
      if (raw) setSelected(new Set(JSON.parse(raw) as string[]));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(SELECTION_KEY, JSON.stringify([...selected]));
    } catch {
      // ignore
    }
  }, [selected, hydrated]);

  const toggle = useCallback((name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const selectMany = useCallback((names: string[]) => {
    setSelected(new Set(names));
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  return { selected, toggle, selectMany, clear, hydrated };
}

export function useDownloadedSet(): Set<string> {
  const [set, setSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSet(getDownloadedSet());
    const onChange = () => setSet(getDownloadedSet());
    window.addEventListener("kg:downloaded-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("kg:downloaded-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return set;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}
