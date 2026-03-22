import React, { forwardRef } from 'react';

interface PrintableBonDeCaisseProps {
    demande: any;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
}

const PrintableBonDeCaisse = forwardRef<HTMLDivElement, PrintableBonDeCaisseProps>(
    ({ demande, companyName = 'AGRINOVA MICROFINANCE', companyAddress = 'Bujumbura, Burundi', companyPhone = '+257 22 XX XX XX' }, ref) => {

        const formatCurrency = (value: number | undefined) => {
            return value?.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' }) || '0 FBU';
        };

        const numberToWords = (num: number): string => {
            if (num === 0) return 'zéro';
            const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
                'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
            const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

            if (num < 20) return units[num];
            if (num < 100) {
                const t = Math.floor(num / 10);
                const u = num % 10;
                if (t === 7 || t === 9) return tens[t - 1] + '-' + units[10 + u];
                return tens[t] + (u ? '-' + units[u] : '');
            }
            if (num < 1000) {
                const h = Math.floor(num / 100);
                const r = num % 100;
                return (h === 1 ? 'cent' : units[h] + ' cent') + (r ? ' ' + numberToWords(r) : '');
            }
            if (num < 1000000) {
                const t = Math.floor(num / 1000);
                const r = num % 1000;
                return (t === 1 ? 'mille' : numberToWords(t) + ' mille') + (r ? ' ' + numberToWords(r) : '');
            }
            const m = Math.floor(num / 1000000);
            const r = num % 1000000;
            return (m === 1 ? 'un million' : numberToWords(m) + ' millions') + (r ? ' ' + numberToWords(r) : '');
        };

        return (
            <div ref={ref} style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', borderBottom: '3px double #333', paddingBottom: '15px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ textAlign: 'left' }}>
                            <img src="/layout/images/logo.png" alt="Logo" style={{ height: '50px' }} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ margin: '0', color: '#1a5276' }}>{companyName}</h2>
                            <p style={{ margin: '2px 0', fontSize: '12px', color: '#666' }}>{companyAddress} | {companyPhone}</p>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '12px' }}>
                            <p style={{ margin: '0' }}>Date: {new Date().toLocaleDateString('fr-FR')}</p>
                        </div>
                    </div>
                    <h3 style={{ margin: '10px 0 0', color: '#c0392b', textTransform: 'uppercase', letterSpacing: '3px' }}>
                        BON DE CAISSE
                    </h3>
                    <p style={{ margin: '5px 0 0', fontSize: '14px' }}>N° {demande?.numeroBonCaisse || demande?.numeroDemande}</p>
                </div>

                {/* Beneficiaire */}
                <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '15px', marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 10px', color: '#1a5276', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Bénéficiaire</h4>
                    <table style={{ width: '100%', fontSize: '13px' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '30%', padding: '4px', color: '#666' }}>Nom complet:</td>
                                <td style={{ fontWeight: 'bold' }}>{demande?.beneficiaireFournisseur}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Objet */}
                <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '15px', marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 10px', color: '#1a5276', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Objet de la Dépense</h4>
                    <table style={{ width: '100%', fontSize: '13px' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '30%', padding: '4px', color: '#666' }}>Nature:</td>
                                <td style={{ fontWeight: 'bold' }}>{demande?.natureLibelle}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '4px', color: '#666' }}>Catégorie:</td>
                                <td>{demande?.categorieDepenseName}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '4px', color: '#666' }}>Réf. Demande:</td>
                                <td>{demande?.numeroDemande}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Montant */}
                <div style={{ border: '2px solid #1a5276', borderRadius: '5px', padding: '15px', marginBottom: '15px', backgroundColor: '#f8f9fa' }}>
                    <h4 style={{ margin: '0 0 10px', color: '#1a5276' }}>Montant</h4>
                    <table style={{ width: '100%', fontSize: '14px' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '30%', padding: '4px', color: '#666' }}>En chiffres:</td>
                                <td style={{ fontWeight: 'bold', fontSize: '18px', color: '#c0392b' }}>{formatCurrency(demande?.montantPaye || demande?.montantEstimeFBU)}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '4px', color: '#666' }}>En lettres:</td>
                                <td style={{ fontStyle: 'italic', fontWeight: 'bold' }}>
                                    {numberToWords(demande?.montantPaye || demande?.montantEstimeFBU || 0)} francs burundais
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Signatures */}
                <div style={{ marginTop: '30px' }}>
                    <table style={{ width: '100%', fontSize: '12px' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '25%', textAlign: 'center', padding: '10px' }}>
                                    <div style={{ borderTop: '1px solid #333', paddingTop: '5px', marginTop: '50px' }}>
                                        <strong>Le Demandeur</strong>
                                    </div>
                                </td>
                                <td style={{ width: '25%', textAlign: 'center', padding: '10px' }}>
                                    <div style={{ borderTop: '1px solid #333', paddingTop: '5px', marginTop: '50px' }}>
                                        <strong>Le Responsable</strong>
                                    </div>
                                </td>
                                <td style={{ width: '25%', textAlign: 'center', padding: '10px' }}>
                                    <div style={{ borderTop: '1px solid #333', paddingTop: '5px', marginTop: '50px' }}>
                                        <strong>Le Caissier</strong>
                                    </div>
                                </td>
                                <td style={{ width: '25%', textAlign: 'center', padding: '10px' }}>
                                    <div style={{ borderTop: '1px solid #333', paddingTop: '5px', marginTop: '50px' }}>
                                        <strong>Le Bénéficiaire</strong>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '10px', fontSize: '10px', color: '#999' }}>
                    <p>Document généré le {new Date().toLocaleString('fr-FR')} | {companyName}</p>
                </div>
            </div>
        );
    }
);

PrintableBonDeCaisse.displayName = 'PrintableBonDeCaisse';

export default PrintableBonDeCaisse;
