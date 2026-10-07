import AuthSessionProvider from "@/components/providers/AuthSessionProvider";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { isRtl } from "@/i18n/languages";
import { type Locale, routing } from "@/i18n/routing";
import { APPLE_STARTUP_IMAGES } from "@/lib/pwa/apple-startup-images";
import { THEME_BEFORE_INTERACTIVE_SCRIPT } from "@/lib/pwa/theme-before-interactive";
import "flatpickr/dist/flatpickr.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Outfit } from "next/font/google";
import { notFound } from "next/navigation";
import "simplebar-react/dist/simplebar.min.css";
import "swiper/css/bundle";
import "../globals.css";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "TutorHub",
  appleWebApp: {
    capable: true,
    title: "TutorHub",
    statusBarStyle: "black-translucent",
    startupImage: APPLE_STARTUP_IMAGES.map((entry) =>
      "media" in entry && entry.media
        ? { url: entry.url, media: entry.media }
        : { url: entry.url },
    ),
  },
  icons: {
    apple: [{ url: "/pwa/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#465fff" },
    { media: "(prefers-color-scheme: dark)", color: "#465fff" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      dir={isRtl(locale as Locale) ? "rtl" : "ltr"}
      className="h-full bg-white dark:bg-gray-900"
      suppressHydrationWarning
    >
      <body
        className={`${outfit.className} min-h-full bg-white dark:bg-gray-900`}
      >
        <Script
          id="theme-before-interactive"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: THEME_BEFORE_INTERACTIVE_SCRIPT,
          }}
        />
        <NextIntlClientProvider>
          <AuthSessionProvider>
            <ThemeProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </ThemeProvider>
          </AuthSessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
