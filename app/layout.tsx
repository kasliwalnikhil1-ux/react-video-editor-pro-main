import type { Metadata } from "next";
import "./globals.css";

import { ToastProviderWrapper } from "./reactvideoeditor/pro/components/providers/toast-provider-wrapper";
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
          <ToastProviderWrapper>
            <main>
              {children}
            </main>
          </ToastProviderWrapper>
        </PostHogProvider>
      </body>
    </html>
  );
}
