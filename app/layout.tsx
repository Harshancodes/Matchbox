import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Matchbox — Book a Ground',
  description: 'Book cricket, football, or badminton slots at Matchbox Sports Ground',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-green-700 text-white px-4 py-3 shadow-md">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <span className="text-2xl">🏟️</span>
            <div>
              <h1 className="text-lg font-bold leading-tight">Matchbox Sports Ground</h1>
              <p className="text-green-200 text-xs">Book your slot online — free &amp; instant</p>
            </div>
            <div className="ml-auto">
              <a href="/admin" className="text-green-200 hover:text-white text-xs underline">
                Admin
              </a>
            </div>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
        <footer className="text-center text-gray-400 text-xs py-6 border-t border-gray-200 mt-8">
          &copy; {new Date().getFullYear()} Matchbox Sports Ground &bull; Contact: +91 XXXXX XXXXX
        </footer>
      </body>
    </html>
  );
}
