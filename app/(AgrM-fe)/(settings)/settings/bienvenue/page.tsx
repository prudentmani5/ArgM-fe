// app/bienvenue/page.tsx
'use client';

export default function BienvenuePage() {
  return (
    <div className="flex align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
      <div className="text-center">
        {/* Logo PrFin MIS */}
        <div className="flex justify-content-center mb-4">
          <img
            src="/layout/images/logo/Welcome.PNG"
            alt="PrFin MIS - Professional Financial Management Information System"
            style={{ maxWidth: '450px', width: '100%', height: 'auto' }}
          />
        </div>

        {/* Pied de page */}
        <p className="text-sm" style={{ color: '#9e9e9e' }}>
          © {new Date().getFullYear()} Professional Financial Management Information System - PrFin MIS
        </p>
      </div>
    </div>
  );
}
