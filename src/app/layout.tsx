import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NewTeacher",
  description: "An adaptive AI voice teacher grounded in textbooks and enriched with live context.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
        {children}
      </body>
    </html>
  );
}
