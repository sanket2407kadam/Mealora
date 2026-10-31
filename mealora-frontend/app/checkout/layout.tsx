
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mealora | Fresh Food, Happy Moments",
  description:
    "Discover delicious meals and order your favourites with Mealora. Freshly prepared, delivered with care.",
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
