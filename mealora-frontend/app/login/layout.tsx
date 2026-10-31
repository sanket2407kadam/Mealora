
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mealora | Good Food, Thoughtfully Delivered",
  description: "Discover delicious meals with Mealora.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
