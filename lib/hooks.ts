"use client";

import { useCallback, useEffect, useState } from "react";
import { getDownloadedSet, downloadedEventName } from "./download";

const selectionKey = (namespace: string) => `${namespace}.selection.v1`;

export function usePersistedSelection(namespace = "kg") {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(selectionKey(namespace));
      if (raw) setSelected(new Set(JSON.parse(raw) as string[]));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, [namespace]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(
        selectionKey(namespace),
        JSON.stringify([...selected])
      );
    } catch {
      // ignore
    }
  }, [selected, hydrated, namespace]);

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

export function useDownloadedSet(namespace = "kg"): Set<string> {
  const [set, setSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    const evt = downloadedEventName(namespace);
    setSet(getDownloadedSet(namespace));
    const onChange = () => setSet(getDownloadedSet(namespace));
    window.addEventListener(evt, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(evt, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [namespace]);

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
