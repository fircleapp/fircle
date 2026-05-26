"use client";

import NProgress from "nprogress";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const START_DELAY_MS = 120;

let startTimer: ReturnType<typeof setTimeout> | null = null;
let started = false;

export function beginNavigationProgress() {
  if (started || startTimer) {
    return;
  }

  startTimer = setTimeout(() => {
    NProgress.start();
    started = true;
    startTimer = null;
  }, START_DELAY_MS);
}

function endNavigationProgress() {
  if (startTimer) {
    clearTimeout(startTimer);
    startTimer = null;
  }

  if (started) {
    NProgress.done();
    started = false;
  }
}

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({ showSpinner: false, minimum: 0.08, trickleSpeed: 120 });
  }, []);

  useEffect(() => {
    endNavigationProgress();
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (anchor.target && anchor.target !== "_self") {
        return;
      }

      if (anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) {
        return;
      }

      const nextUrl = new URL(href, window.location.href);
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const nextPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;

      if (nextUrl.origin !== window.location.origin || currentPath === nextPath) {
        return;
      }

      beginNavigationProgress();
    };

    const handleHistoryNavigation = () => {
      beginNavigationProgress();
    };

    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("popstate", handleHistoryNavigation);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("popstate", handleHistoryNavigation);
    };
  }, []);

  return null;
}
