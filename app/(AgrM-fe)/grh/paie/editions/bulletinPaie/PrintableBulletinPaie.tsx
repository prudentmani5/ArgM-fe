import React from 'react';
import { SaisiePaie } from '../SaisiePaie';
import { SaisieRetenue } from '../../saisie/retenue/SaisieRetenue';
import { RetenueParametre } from '../../retenueParametre/RetenueParametre';
import { PeriodePaie } from '../../periodePaie/PeriodePaie';

interface PrintableBulletinPaieProps {
    saisiePaie: SaisiePaie;
    saisieRetenues?: SaisieRetenue[];
    retenueParametres?: RetenueParametre[];
    selectedPeriode?: PeriodePaie | null;
}

const PrintableBulletinPaie = React.forwardRef<HTMLDivElement, PrintableBulletinPaieProps>(
    ({ saisiePaie, saisieRetenues = [], retenueParametres = [], selectedPeriode }, ref) => {
        const formatAmount = (amount: number): string => {
            return SaisiePaie.formatCurrency(amount);
        };

        // Get retenue label from code
        const getRetenueLabel = (codeRet: string): string => {
            const retenueParam = retenueParametres.find(rp => rp.codeRet === codeRet);
            return retenueParam ? retenueParam.libelleRet : codeRet;
        };

        // Get month name from period
        const getMonthName = (): string => {
            if (!selectedPeriode) return '';
            const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                               'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
            return monthNames[selectedPeriode.mois - 1] || '';
        };

        return (
            <div ref={ref} style={{ padding: '20px', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#000080' }}>
                        Bulletin de paie --- Période {getMonthName()} / {selectedPeriode?.annee || ''}
                    </h2>
                </div>

                {/* Employee Info Section */}
                <div style={{
                    border: '1px solid #000',
                    padding: '10px',
                    marginBottom: '15px',
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{ marginBottom: '5px' }}>
                            <strong>Matricule :</strong> {saisiePaie.matriculeId}
                        </div>
                        <div>
                            <strong>Fonction :</strong> {saisiePaie.fonctionLibelle || 'N/A'}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div>
                            <strong>Nom et prénom:</strong> {saisiePaie.getFullName()}
                        </div>
                    </div>
                </div>

                {/* Main Content - Two Columns */}
                <div style={{ display: 'flex', gap: '20px' }}>
                    {/* Left Column - Credits */}
                    <div style={{ flex: 1, border: '1px solid #000', padding: '10px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '3px 0' }}>Base:</td>
                                    <td style={{ textAlign: 'right', padding: '3px 0' }}>{formatAmount(saisiePaie.base)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0' }}>Jours Prestés:</td>
                                    <td style={{ textAlign: 'right', padding: '3px 0' }}>{formatAmount(saisiePaie.preste)}</td>
                                </tr>
                                
                                <tr>
                                    <td style={{ padding: '3px 0' }}>Allocation familiale:</td>
                                    <td style={{ textAlign: 'right', padding: '3px 0' }}>{formatAmount(saisiePaie.allocFam)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0' }}>Logement :</td>
                                    <td style={{ textAlign: 'right', padding: '3px 0' }}>{formatAmount(saisiePaie.logement)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0' }}>Déplacement:</td>
                                    <td style={{ textAlign: 'right', padding: '3px 0' }}>{formatAmount(saisiePaie.deplacement)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0' }}>HS:</td>
                                    <td style={{ textAlign: 'right', padding: '3px 0' }}>{formatAmount(saisiePaie.getTotalHS())}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0' }}>INDEMNITES DE CHARGE</td>
                                    <td style={{ textAlign: 'right', padding: '3px 0' }}>{formatAmount(saisiePaie.getTotalIndemnites())}</td>
                                </tr>
                                <tr style={{ borderTop: '1px solid #000', fontWeight: 'bold' }}>
                                    <td style={{ padding: '8px 0' }}>Brut:</td>
                                    <td style={{ textAlign: 'right', padding: '8px 0' }}>{formatAmount(saisiePaie.brut)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Right Column - Deductions */}
                    <div style={{ flex: 1, border: '1px solid #000', padding: '10px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '3px 0' }}>Rappel positif:</td>
                                    <td style={{ textAlign: 'right', padding: '3px 0' }}>{formatAmount(saisiePaie.getTotalRappelPositif())}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0' }}>Rappel négatif:</td>
                                    <td style={{ textAlign: 'right', padding: '3px 0' }}>{formatAmount(saisiePaie.getTotalRappelNegatif())}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0' }}>Inss Pers:</td>
                                    <td style={{ textAlign: 'right', padding: '3px 0' }}>{formatAmount(saisiePaie.getTotalInssPers())}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0' }}>IRE:</td>
                                    <td style={{ textAlign: 'right', padding: '3px 0' }}>{formatAmount(saisiePaie.ipr)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0' }}>Jubilee:</td>
                                    <td style={{ textAlign: 'right', padding: '3px 0' }}>{formatAmount(saisiePaie.jubile)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0' }}>Pension Compl:</td>
                                    <td style={{ textAlign: 'right', padding: '3px 0' }}>{formatAmount(saisiePaie.pensionComplPers)}</td>
                                </tr>
                                {/* Display all SaisieRetenue items for this employee */}
                                {saisieRetenues.map((retenue, index) => (
                                    <tr key={retenue.id || index}>
                                        <td style={{ padding: '3px 0' }}>{getRetenueLabel(retenue.codeRet)}:</td>
                                        <td style={{ textAlign: 'right', padding: '3px 0' }}>{formatAmount(retenue.montant)}</td>
                                    </tr>
                                ))}
                                <tr style={{ borderTop: '1px solid #000' }}>
                                    <td style={{ padding: '5px 0' }}>Tot retenues:</td>
                                    <td style={{ textAlign: 'right', padding: '5px 0' }}>{formatAmount(saisiePaie.totalRetenue)}</td>
                                </tr>
                                <tr style={{ fontWeight: 'bold', fontSize: '14px' }}>
                                    <td style={{ padding: '8px 0', color: '#000080' }}>Net</td>
                                    <td style={{
                                        textAlign: 'right',
                                        padding: '8px 0',
                                        border: '2px solid #000',
                                        fontWeight: 'bold'
                                    }}>
                                        {formatAmount(saisiePaie.net)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Signature Section */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '40px',
                    paddingTop: '20px',
                    borderTop: '1px solid #ccc'
                }}>
                    <div style={{ textAlign: 'center', width: '45%' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '40px' }}>Signature Travailleur</div>
                        <div style={{ borderTop: '1px solid #000', width: '80%', margin: '0 auto' }}></div>
                    </div>
                    <div style={{ textAlign: 'center', width: '45%' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '40px' }}>Signature Employeur</div>
                        <div style={{ borderTop: '1px solid #000', width: '80%', margin: '0 auto' }}></div>
                    </div>
                </div>
            </div>
        );
    }
);

PrintableBulletinPaie.displayName = 'PrintableBulletinPaie';

export default PrintableBulletinPaie;
