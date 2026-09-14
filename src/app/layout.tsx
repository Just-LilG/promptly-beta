import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { BottomTabs } from "@/components/bottom-tabs";
import { SendFab } from "@/components/send-fab";
import { Topbar } from "@/components/topbar";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { InstallPrompt } from "@/components/install-prompt";
import { FullscreenOnLaunch } from "@/components/fullscreen-on-launch";
import { VisualViewportSync } from "@/components/visual-viewport-sync";
import { PageTransition } from "@/components/page-transition";
import { DataSync } from "@/components/data-sync";
import { NotificationsWatcher } from "@/components/notifications-watcher";
import { AuthSessionProvider } from "@/components/auth-session-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { SkipLink } from "@/components/skip-link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Promptly: Learn to talk to AI",
  description: "Practice prompt engineering with a live AI coach across coding, design, writing, and everyday tasks.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    // "black-translucent" lets our own content draw behind the iOS status bar,
    // which is what makes a true full-screen (no chrome) standalone app possible.
    statusBarStyle: "black-translucent",
    title: "Promptly",
  },
  other: {
    // Chrome/Android's own capable flag, distinct from Apple's.
    "mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/icons/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

// viewport-fit=cover is what makes env(safe-area-inset-*) resolve to real values
// on devices with a gesture nav bar / home indicator / notch — without it, our
// bottom-tabs padding has nothing real to read and the gesture bar overlaps the UI.
// It's also required for a truly edge-to-edge standalone PWA on both platforms.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#111312" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full">
        <Script id="promptly-theme" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem("promptly:theme");document.documentElement.setAttribute("data-theme",(t==="light"||t==="dark"||t==="system")?t:"system");}catch(e){}})();`}
        </Script>
        <AuthSessionProvider>
          <LocaleProvider>
            <ThemeProvider>
            <SkipLink />
            <ServiceWorkerRegister />
            <DataSync />
            <NotificationsWatcher />
            <FullscreenOnLaunch />
            <VisualViewportSync />
            <div className="flex min-h-dvh">
              <Sidebar />
              <div className="flex-1 min-w-0 flex flex-col desktop-canvas">
                <Topbar />
                <main
                  id="main-content"
                  tabIndex={-1}
                  className="flex-1 pb-20 md:pb-8 max-md:pb-[var(--bottom-chrome,5.5rem)] max-md:pt-[var(--top-chrome,0px)]"
                >
                  <PageTransition>{children}</PageTransition>
                </main>
              </div>
            </div>
            <BottomTabs />
            <SendFab />
            <InstallPrompt />
            </ThemeProvider>
          </LocaleProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
