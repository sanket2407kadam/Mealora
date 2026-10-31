
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mealora | Good Food, Thoughtfully Delivered",
  description:
    "Discover delicious meals, explore local restaurants, and find your next favorite dish with Mealora.",
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
