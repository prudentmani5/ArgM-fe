import React, { forwardRef } from 'react';

interface PrintablePreuvePaiementProps {
    demande: any;
    internalAccounts?: any[];
    savingsAccounts?: any[];
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
}

const PrintablePreuvePaiement = forwardRef<HTMLDivElement, PrintablePreuvePaiementProps>(
    ({ demande, internalAccounts = [], savingsAccounts = [], companyName = 'AGRINOVA MICROFINANCE', companyAddress = 'Bujumbura, Burundi', companyPhone = '+257 22 XX XX XX' }, ref) => {

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
                const t = Math.floor(num / 10); const u = num % 10;
                if (t === 7 || t === 9) return tens[t - 1] + '-' + units[10 + u];
                return tens[t] + (u ? '-' + units[u] : '');
            }
            if (num < 1000) { const h = Math.floor(num / 100); const r = num % 100; return (h === 1 ? 'cent' : units[h] + ' cent') + (r ? ' ' + numberToWords(r) : ''); }
            if (num < 1000000) { const t = Math.floor(num / 1000); const r = num % 1000; return (t === 1 ? 'mille' : numberToWords(t) + ' mille') + (r ? ' ' + numberToWords(r) : ''); }
            const m = Math.floor(num / 1000000); const r = num % 1000000;
            return (m === 1 ? 'un million' : numberToWords(m) + ' millions') + (r ? ' ' + numberToWords(r) : '');
        };

        const modeLabels: Record<string, string> = {
            'ESPECES': 'Espèces (Caisse)', 'VIREMENT_INTERNE': 'Virement Interne',
            'VIREMENT_BANCAIRE': 'Virement Bancaire', 'MOBILE_MONEY': 'Mobile Money', 'CHEQUE': 'Chèque'
        };

        const resolveSourceAccount = () => {
            if (!demande?.compteSourceId) return '-';
            const acc = internalAccounts.find(a => a.value === demande.compteSourceId);
            return acc?.label || String(demande.compteSourceId);
        };

        const resolveDestAccount = () => {
            if (!demande?.compteDestinationId) return null;
            const options = demande.typeCompteDestination === 'CLIENT' ? savingsAccounts : internalAccounts;
            const acc = options.find((a: any) => a.value === demande.compteDestinationId);
            return acc?.label || String(demande.compteDestinationId);
        };

        const cellLabel = { width: '30%', padding: '4px 8px', color: '#666', fontSize: '12px' };
        const cellValue = { padding: '4px 8px', fontWeight: 'bold' as const, fontSize: '13px' };

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
                            <p style={{ margin: '0' }}>Date: {demande?.datePaiement ? new Date(demande.datePaiement).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}</p>
                        </div>
                    </div>
                    <h3 style={{ margin: '10px 0 0', color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '3px' }}>
                        PREUVE DE PAIEMENT
                    </h3>
                    <p style={{ margin: '5px 0 0', fontSize: '14px' }}>Réf: {demande?.numeroDemande}</p>
                </div>

                {/* Informations de la Demande */}
                <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '15px', marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 10px', color: '#1a5276', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Informations de la Demande</h4>
                    <table style={{ width: '100%' }}>
                        <tbody>
                            <tr>
                                <td style={cellLabel}>N° Demande:</td>
                                <td style={cellValue}>{demande?.numeroDemande}</td>
                                <td style={cellLabel}>Date Demande:</td>
                                <td style={cellValue}>{demande?.dateDemande ? new Date(demande.dateDemande).toLocaleDateString('fr-FR') : '-'}</td>
                            </tr>
                            <tr>
                                <td style={cellLabel}>Nature:</td>
                                <td style={cellValue}>{demande?.natureLibelle}</td>
                                <td style={cellLabel}>Catégorie:</td>
                                <td style={cellValue}>{demande?.categorieDepenseName || '-'}</td>
                            </tr>
                            <tr>
                                <td style={cellLabel}>Demandeur:</td>
                                <td style={cellValue}>{demande?.beneficiaireFournisseur}</td>
                                <td style={cellLabel}>Justification:</td>
                                <td style={{ ...cellValue, fontWeight: 'normal' }}>{demande?.justification || '-'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Informations de Paiement */}
                <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '15px', marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 10px', color: '#1a5276', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Informations de Paiement</h4>
                    <table style={{ width: '100%' }}>
                        <tbody>
                            <tr>
                                <td style={cellLabel}>Type de Source:</td>
                                <td style={cellValue}>{demande?.typeSource === 'COMPTE_INTERNE' ? 'Compte Interne' : demande?.typeSource === 'CAISSE' ? 'Caisse' : '-'}</td>
                                <td style={cellLabel}>Compte Source:</td>
                                <td style={cellValue}>{resolveSourceAccount()}</td>
                            </tr>
                            <tr>
                                <td style={cellLabel}>Mode de Paiement:</td>
                                <td style={cellValue}>{modeLabels[demande?.modePaiementName] || demande?.modePaiementName || '-'}</td>
                                <td style={cellLabel}>Montant Payé:</td>
                                <td style={{ ...cellValue, color: '#27ae60', fontSize: '15px' }}>{formatCurrency(demande?.montantPaye || demande?.montantEstimeFBU)}</td>
                            </tr>
                            <tr>
                                <td style={cellLabel}>Date de Paiement:</td>
                                <td style={cellValue}>{demande?.datePaiement ? new Date(demande.datePaiement).toLocaleDateString('fr-FR') : '-'}</td>
                                {demande?.referenceVirement ? (
                                    <>
                                        <td style={cellLabel}>Référence:</td>
                                        <td style={cellValue}>{demande.referenceVirement}</td>
                                    </>
                                ) : (<><td></td><td></td></>)}
                            </tr>
                            {(demande?.modePaiementName === 'VIREMENT_INTERNE' || demande?.modePaiementName === 'VIREMENT_BANCAIRE') && demande?.compteDestinationId && (
                                <tr>
                                    <td style={cellLabel}>Type Destination:</td>
                                    <td style={cellValue}>{demande?.typeCompteDestination === 'CLIENT' ? 'Compte Client (Épargne)' : 'Compte Interne'}</td>
                                    <td style={cellLabel}>Compte Destination:</td>
                                    <td style={cellValue}>{resolveDestAccount()}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Montant en lettres */}
                <div style={{ border: '2px solid #1a5276', borderRadius: '5px', padding: '15px', marginBottom: '15px', backgroundColor: '#f8f9fa' }}>
                    <h4 style={{ margin: '0 0 10px', color: '#1a5276' }}>Montant</h4>
                    <table style={{ width: '100%', fontSize: '14px' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '30%', padding: '4px', color: '#666' }}>En chiffres:</td>
                                <td style={{ fontWeight: 'bold', fontSize: '18px', color: '#2c3e50' }}>{formatCurrency(demande?.montantPaye || demande?.montantEstimeFBU)}</td>
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

                {/* Historique d'Approbation */}
                {(demande?.approbateurN1Name || demande?.approbateurN2Name || demande?.approbateurN3Name) && (
                    <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '15px', marginBottom: '15px' }}>
                        <h4 style={{ margin: '0 0 10px', color: '#1a5276', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Historique d'Approbation</h4>
                        <table style={{ width: '100%', fontSize: '12px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #ddd' }}>
                                    <th style={{ padding: '4px', textAlign: 'left', color: '#666' }}>Niveau</th>
                                    <th style={{ padding: '4px', textAlign: 'left', color: '#666' }}>Approbateur</th>
                                    <th style={{ padding: '4px', textAlign: 'left', color: '#666' }}>Date</th>
                                    <th style={{ padding: '4px', textAlign: 'left', color: '#666' }}>Commentaire</th>
                                </tr>
                            </thead>
                            <tbody>
                                {demande?.approbateurN1Name && (
                                    <tr>
                                        <td style={{ padding: '4px', fontWeight: 'bold' }}>N1</td>
                                        <td style={{ padding: '4px' }}>{demande.approbateurN1Name}</td>
                                        <td style={{ padding: '4px' }}>{demande.dateApprobationN1 ? new Date(demande.dateApprobationN1).toLocaleDateString('fr-FR') : '-'}</td>
                                        <td style={{ padding: '4px' }}>{demande.commentaireN1 || '-'}</td>
                                    </tr>
                                )}
                                {demande?.approbateurN2Name && (
                                    <tr>
                                        <td style={{ padding: '4px', fontWeight: 'bold' }}>N2</td>
                                        <td style={{ padding: '4px' }}>{demande.approbateurN2Name}</td>
                                        <td style={{ padding: '4px' }}>{demande.dateApprobationN2 ? new Date(demande.dateApprobationN2).toLocaleDateString('fr-FR') : '-'}</td>
                                        <td style={{ padding: '4px' }}>{demande.commentaireN2 || '-'}</td>
                                    </tr>
                                )}
                                {demande?.approbateurN3Name && (
                                    <tr>
                                        <td style={{ padding: '4px', fontWeight: 'bold' }}>N3</td>
                                        <td style={{ padding: '4px' }}>{demande.approbateurN3Name}</td>
                                        <td style={{ padding: '4px' }}>{demande.dateApprobationN3 ? new Date(demande.dateApprobationN3).toLocaleDateString('fr-FR') : '-'}</td>
                                        <td style={{ padding: '4px' }}>{demande.commentaireN3 || '-'}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Signatures - 3 managers */}
                <div style={{ marginTop: '30px' }}>
                    <table style={{ width: '100%', fontSize: '12px' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '33%', textAlign: 'center', padding: '10px' }}>
                                    <div style={{ borderTop: '1px solid #333', paddingTop: '5px', marginTop: '60px' }}>
                                        <strong>Le Directeur Administratif</strong>
                                        <br /><strong>et Financier (DAF)</strong>
                                    </div>
                                </td>
                                <td style={{ width: '33%', textAlign: 'center', padding: '10px' }}>
                                    <div style={{ borderTop: '1px solid #333', paddingTop: '5px', marginTop: '60px' }}>
                                        <strong>Le Directeur Général</strong>
                                    </div>
                                </td>
                                <td style={{ width: '33%', textAlign: 'center', padding: '10px' }}>
                                    <div style={{ borderTop: '1px solid #333', paddingTop: '5px', marginTop: '60px' }}>
                                        <strong>Le Président du</strong>
                                        <br /><strong>Conseil d'Administration</strong>
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

PrintablePreuvePaiement.displayName = 'PrintablePreuvePaiement';

export default PrintablePreuvePaiement;
