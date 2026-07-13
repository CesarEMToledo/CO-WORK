import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { IntroGate } from "@/components/IntroGate";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CO-WORK Ciudad Valles - Bienes raíces en la Huasteca Potosina",
  description:
    "Encuentra o publica villas, cabañas, ecolodges y terrenos en venta y renta en Ciudad Valles y la Huasteca Potosina.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${manrope.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('cw_intro_seen')==='1'){document.documentElement.setAttribute('data-intro-seen','1')}}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans selection:bg-primary selection:text-white bg-background text-on-surface">
        <IntroGate>{children}</IntroGate>
      </body>
    </html>
  );
}
