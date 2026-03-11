import type { Metadata } from "next";
import { Montserrat, Cormorant_Garamond, Philosopher } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const philosopher = Philosopher({
  variable: "--font-philosopher",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Magnolia Lunar | Spa de Massagens em Lisboa",
  description: "Um dia relaxante para corpo, mente e sentidos. Massagens sensoriais em ambiente reservado e sofisticado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT">
      <body
        className={`${montserrat.variable} ${cormorant.variable} ${philosopher.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
