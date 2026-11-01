import React, { ReactNode } from "react";
import "./globals.css";
export default function CartLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}