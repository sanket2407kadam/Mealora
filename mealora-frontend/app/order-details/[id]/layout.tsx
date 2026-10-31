import type { ReactNode } from "react";
import "./globals.css";

export default function OrderDetailsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}