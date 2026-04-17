// app/bienvenue/page.tsx
'use client';

export default function BienvenuePage() {
  return (
    <div className="flex align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
      <div className="text-center">
        <div className="flex justify-content-center mb-4">
          <img
            src="/layout/images/logo/Welcome.PNG"
            alt="MicroCore ProFinance"
            style={{ maxWidth: '700px', width: '100%', height: 'auto' }}
          />
        </div>
      </div>
    </div>
  );
}
