import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bouquet Tutorial Platform",
  description: "Learn the art of bouquet making with premium video tutorials",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
