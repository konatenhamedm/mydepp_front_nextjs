import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const outfit = Outfit({
  subsets: ["latin"],
  variable: '--font-outfit',
  display: 'swap',
});

/* export const metadata: Metadata = {
  title: "Tableau de Bord",
  description: "Tableau de Bord Administrateur",
};
 */
export const metadata = {
  title: 'e-DEPPS - Portail de Santé',
  description: 'Portail officiel de la Direction des Établissements Privés et des Professions Sanitaires (DEPPS).',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/new_Image/logo-depps.png',
    apple: '/images/new_Image/logo-depps.png',
  },
};

export const viewport = {
  themeColor: '#0ea5e9',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="fr">
      <head>
        <style>
          {`
            :root {
              --primary-color: #6EA8FF;
              --primary-hover: #5A86CC;
            }
          `}
        </style>
      </head>
      <body className={`${outfit.className} ${outfit.variable} antialiased bg-slate-50/50`}>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
