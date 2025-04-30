import "./globals.css";
import Providers from "./providers";
import { GeistMono } from "geist/font/mono";

export const metadata = {
  title: "South African Government Tenders Database",
  description: "South African Government Tenders Database",
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={GeistMono.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
