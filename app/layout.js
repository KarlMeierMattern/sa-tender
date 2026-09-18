import "./globals.css";
import QueryClientProvider from "./providers";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "South African Government Tenders Database",
  description: "South African Government Tenders Database",
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <QueryClientProvider>{children}</QueryClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
