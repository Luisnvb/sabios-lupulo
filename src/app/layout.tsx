import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sábios del Lúpulo Simulator",
  description:
    "Recrea las partidas de trivial por equipos de los jueves en Checkpoint Arcade (Sevilla).",
};

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/play", label: "Jugar" },
  { href: "/categorias", label: "Categorías" },
  { href: "/questions", label: "Preguntas" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-amber-50 text-stone-900 antialiased">
        <header className="border-b border-amber-200 bg-white">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 sm:px-6">
            <Link href="/" className="text-lg font-bold text-amber-800">
              🍺 Sábios del Lúpulo Simulator
            </Link>
            <nav className="flex flex-wrap gap-4 text-sm font-medium text-stone-600">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-2 py-1 transition-colors hover:bg-amber-100 hover:text-amber-800"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">{children}</div>
        <footer className="mx-auto max-w-4xl px-4 pb-8 text-center text-xs text-stone-400 sm:px-6">
          Inspirado en las noches de trivial de los jueves en Checkpoint
          Arcade, Sevilla.
        </footer>
      </body>
    </html>
  );
}
