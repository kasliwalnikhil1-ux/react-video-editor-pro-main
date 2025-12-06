"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { usePostHog } from "posthog-js/react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

// Check if PostHog is enabled via environment variables
const isPostHogEnabled = 
  process.env.NEXT_PUBLIC_POSTHOG_ENABLED === "true" && 
  process.env.NEXT_PUBLIC_POSTHOG_KEY;

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize PostHog if it's enabled and we have a key
    if (isPostHogEnabled) {
      // Suppress PostHog network errors in production
      if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
        // Store original fetch to wrap it
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
          try {
            return await originalFetch(...args);
          } catch (error) {
            // Silently catch PostHog-related fetch errors
            const url = typeof args[0] === "string" 
              ? args[0] 
              : args[0] instanceof Request 
                ? args[0].url 
                : args[0]?.toString();
            if (url && url.includes("posthog.com")) {
              // Return a dummy response to prevent errors from propagating
              return new Response(null, { status: 200 });
            }
            throw error;
          }
        };
      }

      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
        api_host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        person_profiles: "identified_only",
        capture_pageview: false, // We'll handle this manually
        capture_pageleave: true,
        // Enable session recording
        session_recording: {
          recordCrossOriginIframes: true,
        },
        // Handle blocked requests gracefully (ad blockers, privacy extensions, etc.)
        on_xhr_error: (failedRequest: XMLHttpRequest) => {
          // Silently handle errors - only log in development
          if (process.env.NODE_ENV === "development") {
            console.warn("PostHog request blocked or failed:", failedRequest.status);
          }
        },
      });
    }
  }, []);

  // If PostHog is not enabled, just return children without the provider
  if (!isPostHogEnabled) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  );
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  // Track pageviews
  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + "?" + searchParams.toString();
      }

      // Track pageview with additional context
      posthog.capture("$pageview", {
        $current_url: url,
        path: pathname,
        referrer: document.referrer,
        // Add UTM parameters if present
        utm_source: searchParams.get("utm_source"),
        utm_medium: searchParams.get("utm_medium"),
        utm_campaign: searchParams.get("utm_campaign"),
      });
    }
  }, [pathname, searchParams, posthog]);

  // Track user engagement (simplified version)
  useEffect(() => {
    if (!posthog) return;

    // Track external link clicks
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      if (link && link.hostname !== window.location.hostname) {
        posthog.capture("external_link_click", {
          url: link.href,
          text: link.textContent,
          path: pathname,
        });
      }
    };

    window.addEventListener("click", handleLinkClick);

    return () => {
      window.removeEventListener("click", handleLinkClick);
    };
  }, [pathname, posthog]);

  return null;
}

// Wrap PostHogPageView in Suspense to avoid useSearchParams from de-opting the app
function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
} 