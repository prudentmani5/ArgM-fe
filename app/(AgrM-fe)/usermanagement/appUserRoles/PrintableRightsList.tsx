'use client';

import React, { forwardRef } from 'react';
import { AuthorityResponse } from '../types';

interface PrintableRightsListProps {
    authorities: AuthorityResponse[];
    printDate?: string;
}

const PrintableRightsList = forwardRef<HTMLDivElement, PrintableRightsListProps>(
    ({ authorities, printDate }, ref) => {
        // Group by category
        const grouped: Record<string, AuthorityResponse[]> = {};
        authorities.forEach((auth) => {
            const cat = auth.category || 'Autres';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(auth);
        });
        const sortedCategories = Object.keys(grouped).sort();

        const totalCount = authorities.length;
        const today = printDate || new Date().toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'long', year: 'numeric'
        });

        const styles: Record<string, React.CSSProperties> = {
            page: {
                fontFamily: 'Arial, sans-serif',
                fontSize: '11px',
                color: '#1a1a1a',
                backgroundColor: '#fff',
                padding: '20mm 18mm',
                minHeight: '297mm',
            },
            header: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '6mm',
                paddingBottom: '4mm',
                borderBottom: '3px solid #7c5000',
            },
            logoArea: {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
            },
            logo: {
                width: '60px',
                height: '60px',
                objectFit: 'contain' as const,
            },
            companyName: {
                fontSize: '18px',
                fontWeight: 700,
                color: '#7c5000',
                margin: 0,
                lineHeight: 1.2,
            },
            companySubtitle: {
                fontSize: '9px',
                color: '#888',
                margin: 0,
                letterSpacing: '1px',
                textTransform: 'uppercase' as const,
            },
            docInfo: {
                textAlign: 'right' as const,
                fontSize: '9px',
                color: '#555',
                lineHeight: 1.6,
            },
            titleBlock: {
                textAlign: 'center' as const,
                margin: '4mm 0 6mm',
            },
            title: {
                fontSize: '16px',
                fontWeight: 700,
                color: '#1e293b',
                margin: '0 0 2px',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.5px',
            },
            subtitle: {
                fontSize: '10px',
                color: '#64748b',
                margin: 0,
            },
            summaryBar: {
                display: 'flex',
                gap: '16px',
                backgroundColor: '#f1f5f9',
                borderRadius: '6px',
                padding: '6px 12px',
                marginBottom: '5mm',
                fontSize: '10px',
                color: '#334155',
            },
            summaryItem: {
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
            },
            summaryBold: {
                fontWeight: 700,
                color: '#1e293b',
            },
            categoryBlock: {
                marginBottom: '5mm',
                pageBreakInside: 'avoid' as const,
            },
            categoryHeader: {
                background: 'linear-gradient(90deg, #1e3a5f 0%, #2563eb 100%)',
                color: '#fff',
                padding: '5px 10px',
                borderRadius: '4px 4px 0 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            },
            categoryName: {
                fontWeight: 700,
                fontSize: '11px',
                letterSpacing: '0.3px',
            },
            categoryCount: {
                fontSize: '9px',
                backgroundColor: 'rgba(255,255,255,0.25)',
                borderRadius: '10px',
                padding: '1px 8px',
            },
            table: {
                width: '100%',
                borderCollapse: 'collapse' as const,
                border: '1px solid #cbd5e1',
                borderTop: 'none',
            },
            th: {
                backgroundColor: '#dbeafe',
                color: '#1e3a5f',
                fontWeight: 700,
                padding: '4px 8px',
                textAlign: 'left' as const,
                fontSize: '9px',
                letterSpacing: '0.5px',
                textTransform: 'uppercase' as const,
                borderBottom: '1px solid #93c5fd',
                borderRight: '1px solid #cbd5e1',
            },
            tdCode: {
                padding: '4px 8px',
                borderBottom: '1px solid #e2e8f0',
                borderRight: '1px solid #e2e8f0',
                fontFamily: 'Courier New, monospace',
                fontSize: '9px',
                color: '#1d4ed8',
                fontWeight: 600,
                whiteSpace: 'nowrap' as const,
                width: '35%',
            },
            tdDesc: {
                padding: '4px 8px',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '10px',
                color: '#334155',
            },
            footer: {
                marginTop: '10mm',
                paddingTop: '4mm',
                borderTop: '1px solid #cbd5e1',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '9px',
                color: '#64748b',
            },
            signatureBlock: {
                textAlign: 'center' as const,
                marginTop: '8mm',
                paddingTop: '4mm',
            },
            signatureLine: {
                display: 'inline-block',
                width: '60mm',
                borderTop: '1px solid #1a1a1a',
                marginTop: '10mm',
                fontSize: '9px',
                color: '#334155',
                textAlign: 'center' as const,
                paddingTop: '2mm',
            },
        };

        return (
            <div ref={ref} style={styles.page}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.logoArea}>
                        <img
                            src="/layout/images/logo.png"
                            alt="Logo"
                            style={styles.logo}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div>
                            <p style={styles.companyName}>AGRINOVA MICROFINANCE</p>
                            <p style={styles.companySubtitle}>MicroCore ProFinance</p>
                        </div>
                    </div>
                    <div style={styles.docInfo}>
                        <div><strong>Document officiel</strong></div>
                        <div>Réf. : AGRINOVA/DRH/DROITS</div>
                        <div>Date : {today}</div>
                        <div>Confidentiel — Usage interne</div>
                    </div>
                </div>

                {/* Title */}
                <div style={styles.titleBlock}>
                    <p style={styles.title}>Tableau des Droits d&apos;Accès du Système</p>
                    <p style={styles.subtitle}>
                        Répertoire complet des autorisations et privilèges définis dans MicroCore ProFinance
                    </p>
                </div>

                {/* Summary */}
                <div style={styles.summaryBar}>
                    <div style={styles.summaryItem}>
                        <span>Nombre total de droits :</span>
                        <span style={styles.summaryBold}>{totalCount}</span>
                    </div>
                    <div style={styles.summaryItem}>
                        <span>Nombre de catégories :</span>
                        <span style={styles.summaryBold}>{sortedCategories.length}</span>
                    </div>
                    <div style={styles.summaryItem}>
                        <span>Système :</span>
                        <span style={styles.summaryBold}>MicroCore ProFinance v9.0</span>
                    </div>
                </div>

                {/* Categories */}
                {sortedCategories.map((cat) => (
                    <div key={cat} style={styles.categoryBlock}>
                        <div style={styles.categoryHeader}>
                            <span style={styles.categoryName}>{cat}</span>
                            <span style={styles.categoryCount}>{grouped[cat].length} droit{grouped[cat].length > 1 ? 's' : ''}</span>
                        </div>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Code technique</th>
                                    <th style={{ ...styles.th, borderRight: 'none' }}>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grouped[cat].map((auth, idx) => (
                                    <tr
                                        key={auth.id}
                                        style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}
                                    >
                                        <td style={styles.tdCode}>{auth.code}</td>
                                        <td style={{ ...styles.tdDesc, borderRight: 'none' }}>
                                            {auth.description || auth.code}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}

                {/* Signature block */}
                <div style={styles.signatureBlock}>
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '6mm' }}>
                        <div style={{ textAlign: 'center' as const }}>
                            <div style={styles.signatureLine}>Direction Générale</div>
                        </div>
                        <div style={{ textAlign: 'center' as const }}>
                            <div style={styles.signatureLine}>Responsable Informatique</div>
                        </div>
                        <div style={{ textAlign: 'center' as const }}>
                            <div style={styles.signatureLine}>Directeur des Ressources Humaines</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    <span>AGRINOVA MICROFINANCE — Bujumbura, Burundi</span>
                    <span>Document généré le {today} — MicroCore ProFinance</span>
                    <span>Confidentiel — Usage interne uniquement</span>
                </div>
            </div>
        );
    }
);

PrintableRightsList.displayName = 'PrintableRightsList';
export default PrintableRightsList;
