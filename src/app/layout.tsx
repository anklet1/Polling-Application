import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Felipoll",
  description: "Create, share, and vote on polls in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <nav className="w-full flex items-center mb-8 gap-8">
          <div className="flex items-center gap-3">
            <Image src="/next.svg" alt="Felipoll Logo" width={32} height={32} />
            <span className="text-2xl font-bold tracking-tight">Felipoll</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
            <Link
              href="/polls"
              className="bg-card shadow-lg rounded-xl p-6 flex flex-col items-center justify-center hover:bg-primary hover:text-primary-foreground transition font-semibold text-lg"
            >
              <span>Polls</span>
              <span className="text-xs font-normal mt-2 text-muted-foreground">
                Browse & vote
              </span>
            </Link>
            <Link
              href="/my-polls"
              className="bg-card shadow-lg rounded-xl p-6 flex flex-col items-center justify-center hover:bg-primary hover:text-primary-foreground transition font-semibold text-lg"
            >
              <span>My Polls</span>
              <span className="text-xs font-normal mt-2 text-muted-foreground">
                Manage your polls
              </span>
            </Link>
            <Link
              href="/create-poll"
              className="bg-card shadow-lg rounded-xl p-6 flex flex-col items-center justify-center hover:bg-primary hover:text-primary-foreground transition font-semibold text-lg"
            >
              <span>Create Poll</span>
              <span className="text-xs font-normal mt-2 text-muted-foreground">
                Start a new poll
              </span>
            </Link>
            <Link
              href="/auth"
              className="bg-card shadow-lg rounded-xl p-6 flex flex-col items-center justify-center hover:bg-primary hover:text-primary-foreground transition font-semibold text-lg"
            >
              <span>Login/Register</span>
              <span className="text-xs font-normal mt-2 text-muted-foreground">
                Access your account
              </span>
            </Link>
          </div>
        </nav>
        <main className="max-w-3xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
