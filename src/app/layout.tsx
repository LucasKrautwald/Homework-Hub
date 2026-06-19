import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Homework Hub",
  description: "Organiza tareas escolares, fechas de entrega y enlaces a Google.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
