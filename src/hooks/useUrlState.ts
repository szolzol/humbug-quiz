/**
 * useUrlState Hook
 *
 * Centralized URL state management for the app.
 * Syncs app state with URL parameters for shareable, bookmarkable URLs.
 *
 * URL Structure: /pack/{packSlug}?lang={en|hu}&categories={cat1,cat2}
 */

import { useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

export interface UrlState {
  pack: string;
  lang: "en" | "hu";
  categories: string[];
}

/**
 * Parse URL and extract state
 */
function parseUrl(): UrlState {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);

  // Extract pack from pathname: /pack/{slug}
  const packMatch = path.match(/^\/pack\/([^/]+)/);
  const pack = packMatch?.[1] || "free";

  // Extract language from query param
  const langParam = params.get("lang") as "en" | "hu" | null;
  const lang = langParam === "en" || langParam === "hu" ? langParam : "en";

  // Extract categories from query param (comma-separated)
  const categoriesParam = params.get("categories");
  const categories = categoriesParam
    ? categoriesParam.split(",").filter(Boolean)
    : [];

  return { pack, lang, categories };
}

/**
 * Build URL from state
 */
function buildUrl(state: UrlState): string {
  const { pack, lang, categories } = state;

  // Build pathname
  const pathname = `/pack/${pack}`;

  // Build query params
  const params = new URLSearchParams();

  // Always include language
  params.set("lang", lang);

  // Include categories if any selected
  if (categories.length > 0) {
    params.set("categories", categories.join(","));
  }

  // Combine pathname and params
  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

/**
 * Custom hook for URL state management
 */
export function useUrlState() {
  const { i18n } = useTranslation();

  /**
   * Get current state from URL
   */
  const getState = useCallback((): UrlState => {
    return parseUrl();
  }, []);

  /**
   * Update URL with new state
   * @param newState - Partial state to update (merges with current)
   * @param replace - Use replaceState instead of pushState (doesn't add to history)
   */
  const setState = useCallback(
    (newState: Partial<UrlState>, replace: boolean = false) => {
      const currentState = parseUrl();
      const mergedState = { ...currentState, ...newState };
      const newUrl = buildUrl(mergedState);

      // Update browser URL
      if (replace) {
        window.history.replaceState(mergedState, "", newUrl);
      } else {
        window.history.pushState(mergedState, "", newUrl);
      }

      // Sync i18n language if changed
      if (newState.lang && newState.lang !== i18n.language) {
        i18n.changeLanguage(newState.lang);
      }
    },
    [i18n]
  );

  /**
   * Initialize state from URL on mount
   */
  const initializeFromUrl = useCallback(() => {
    const urlState = parseUrl();

    // Sync i18n language
    if (urlState.lang !== i18n.language) {
      i18n.changeLanguage(urlState.lang);
    }

    // If URL doesn't have proper format, set default
    if (!window.location.pathname.startsWith("/pack/")) {
      const defaultUrl = buildUrl(urlState);
      window.history.replaceState(urlState, "", defaultUrl);
    }

    return urlState;
  }, [i18n]);

  return {
    getState,
    setState,
    initializeFromUrl,
    buildUrl,
    parseUrl,
  };
}
