// app/bienvenue/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BienvenuePage() {
  const router = useRouter();

  // Redirection exemple après 3 secondes (optionnel)
  useEffect(() => {
    const timer = setTimeout(() => {
      // router.push('/dashboard'); // Décommentez pour rediriger automatiquement
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4 overflow-hidden">
      <div className="w-full max-w-4xl mx-auto text-center">
        {/* En-tête */}
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Bienvenue</h1>
          <p className="text-lg text-gray-600">
            BUJUMBURA PORT INFORMATION SYSTEM (BUPORTIS)
          </p>
        </header>

        {/* Contenu principal vide */}
        <main className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col items-center justify-center h-48">
            <div className="text-gray-400 mb-4">
              {/* Icône ou illustration optionnelle */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <p className="text-gray-500"></p>
          </div>
        </main>

        {/* Pied de page */}
        <footer className="mt-6 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Bujumbura Port Information System BUPORTIS</p>
        </footer>
      </div>
    </div>
  );
}