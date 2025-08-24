import type { Metadata, Viewport } from "next"
import { Inter, Geist } from "next/font/google"
import type React from "react";
import "../index.css";
import Providers from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16a34a" },
    { media: "(prefers-color-scheme: dark)", color: "#15803d" },
  ],
  colorScheme: "light dark",
}


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://masomo.co.ke"),
  title: {
    default: "Masomo - Learn, Practice, Excel",
    template: "%s | Masomo",
  },
  description:
    "Kenya's premier educational technology platform for students. Master KCSE, KCPE, and university subjects with interactive lessons, practice tests, and personalized learning paths.",
  keywords: [
    "education",
    "Kenya",
    "learning",
    "KCSE",
    "KCPE",
    "university",
    "students",
    "online learning",
    "educational technology",
    "study platform",
    "exam preparation",
    "interactive lessons",
  ],
  authors: [{ name: "Masomo Team", url: "https://masomo.co.ke" }],
  creator: "Masomo Team",
  publisher: "Masomo",
  category: "Education",
  classification: "Educational Technology Platform",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "/",
    siteName: "Masomo",
    title: "Masomo - Kenya's Premier Educational Platform",
    description:
      "Transform your learning journey with Kenya's most comprehensive educational technology platform. Interactive lessons, practice tests, and personalized learning paths for KCSE, KCPE, and university students.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Masomo - Learn, Practice, Excel",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@MasomoKE",
    creator: "@MasomoKE",
    title: "Masomo - Kenya's Premier Educational Platform",
    description:
      "Transform your learning journey with interactive lessons, practice tests, and personalized learning paths.",
    images: ["/twitter-image.jpg"],
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-KE": "/",
      "sw-KE": "/sw",
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Masomo",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#16a34a",
    "msapplication-config": "/browserconfig.xml",
  },
}



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${geist.variable}`}>
      <body className="antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
