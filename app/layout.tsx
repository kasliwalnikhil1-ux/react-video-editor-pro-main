import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "./reactvideoeditor/pro/components/ui/toaster";
import { PostHogProvider } from "./reactvideoeditor/pro/components/providers/posthog-provider";

export const metadata: Metadata = {
  title: "React Video Editor | Pro",
  description: "Purchased version of the React Video Editor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>
        <PostHogProvider>
            <main>
              {children}
              <Toaster />
            </main>
        </PostHogProvider>
      </body>
    </html>
  );
}
