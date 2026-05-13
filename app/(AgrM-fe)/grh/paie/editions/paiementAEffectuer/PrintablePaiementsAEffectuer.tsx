import React from 'react';
import { PaiementsAEffectuerResponseDto } from './PaiementsAEffectuer';

interface PrintablePaiementsAEffectuerProps {
    reportData: PaiementsAEffectuerResponseDto;
}

const PrintablePaiementsAEffectuer = React.forwardRef<HTMLDivElement, PrintablePaiementsAEffectuerProps>(
    ({ reportData }, ref) => {
        const logoUrl = '/assets/images/gps_icon.png';

        const formatNumber = (value: number | undefined | null): string => {
            if (value === null || value === undefined) return '0';
            return new Intl.NumberFormat('fr-FR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(value);
        };

        const cellStyle: React.CSSProperties = {
            border: '1px solid #333',
            padding: '8px 12px',
            fontSize: '11px'
        };

        const headerCellStyle: React.CSSProperties = {
            ...cellStyle,
            fontWeight: 'bold',
            backgroundColor: '#f0f0f0'
        };

        const totalRowStyle: React.CSSProperties = {
            ...cellStyle,
            fontWeight: 'bold',
            backgroundColor: '#e0e0e0'
        };

        const grandTotalRowStyle: React.CSSProperties = {
            ...cellStyle,
            fontWeight: 'bold',
            backgroundColor: '#c8e6c9'
        };

        return (
            <div ref={ref} style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: 'white' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                    <div style={{ flex: '0 0 100px' }}>
                        <img src={logoUrl} alt="Logo" style={{ width: '80px', height: 'auto' }} />
                        <div style={{ fontSize: '10px', marginTop: '5px' }}>
                            <span style={{ fontWeight: 'bold', color: '#800000' }}>global port</span>
                            <br />
                            <span style={{ fontSize: '8px', fontStyle: 'italic' }}>services burundi</span>
                        </div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                            LES PAIEMENTS A EFFECTUER POUR LE MOIS DE {reportData.periodeLibelle}
                        </h2>
                    </div>
                    <div style={{ flex: '0 0 100px', textAlign: 'right', fontSize: '10px' }}>
                        <div>Imprime le:</div>
                        <div>{new Date().toLocaleDateString('fr-FR')}</div>
                    </div>
                </div>

                {/* Report Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                    <thead>
                        <tr>
                            <th style={{ ...headerCellStyle, textAlign: 'left', width: '60%' }}>Banque</th>
                            <th style={{ ...headerCellStyle, textAlign: 'right', width: '40%' }}>Montant</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Bank Payments */}
                        {reportData.banquePayments.map((bank, index) => (
                            <tr key={`bank-${index}`}>
                                <td style={{ ...cellStyle, textAlign: 'left' }}>{bank.libelleBanque}</td>
                                <td style={{ ...cellStyle, textAlign: 'right' }}>{formatNumber(bank.montant)}</td>
                            </tr>
                        ))}

                        {/* Total Banque */}
                        <tr>
                            <td style={{ ...totalRowStyle, textAlign: 'right' }}>Total Banque:</td>
                            <td style={{ ...totalRowStyle, textAlign: 'right' }}>{formatNumber(reportData.totalBanque)}</td>
                        </tr>

                        {/* Empty row for separation */}
                        <tr>
                            <td colSpan={2} style={{ border: 'none', height: '20px' }}></td>
                        </tr>

                        {/* Retenue Payments */}
                        {reportData.retenuePayments.map((retenue, index) => (
                            <tr key={`retenue-${index}`}>
                                <td style={{ ...cellStyle, textAlign: 'left' }}>{retenue.libelleRet}</td>
                                <td style={{ ...cellStyle, textAlign: 'right' }}>{formatNumber(retenue.montant)}</td>
                            </tr>
                        ))}

                        {/* Total Retenue */}
                        {reportData.retenuePayments.length > 0 && (
                            <tr>
                                <td style={{ ...totalRowStyle, textAlign: 'right' }}>Total Retenue:</td>
                                <td style={{ ...totalRowStyle, textAlign: 'right' }}>{formatNumber(reportData.totalRetenue)}</td>
                            </tr>
                        )}

                        {/* Empty row for separation */}
                        <tr>
                            <td colSpan={2} style={{ border: 'none', height: '20px' }}></td>
                        </tr>

                        {/* Total General */}
                        <tr>
                            <td style={{ ...grandTotalRowStyle, textAlign: 'left' }}>Total General:</td>
                            <td style={{ ...grandTotalRowStyle, textAlign: 'right' }}>{formatNumber(reportData.totalGeneral)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Signature Section */}
                <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ textAlign: 'center', width: '30%' }}>
                        <div style={{
                            fontWeight: 'bold',
                            textDecoration: 'underline',
                            fontSize: '11px'
                        }}>
                            POUR ETABLISSEMENT
                        </div>
                        <div style={{ marginTop: '50px', borderTop: '1px solid #333', width: '80%', margin: '50px auto 0' }}></div>
                    </div>
                    <div style={{ textAlign: 'center', width: '30%' }}>
                        <div style={{
                            fontWeight: 'bold',
                            textDecoration: 'underline',
                            fontSize: '11px'
                        }}>
                            POUR VERIFICATION
                        </div>
                        <div style={{ marginTop: '50px', borderTop: '1px solid #333', width: '80%', margin: '50px auto 0' }}></div>
                    </div>
                    <div style={{ textAlign: 'center', width: '30%' }}>
                        <div style={{
                            fontWeight: 'bold',
                            textDecoration: 'underline',
                            fontSize: '11px'
                        }}>
                            POUR AUTORISATION
                        </div>
                        <div style={{ marginTop: '50px', borderTop: '1px solid #333', width: '80%', margin: '50px auto 0' }}></div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '40px', borderTop: '1px solid #ccc', paddingTop: '10px', fontSize: '10px', textAlign: 'center' }}>
                    <p style={{ margin: 0 }}>Global Port Services - Paiements a Effectuer</p>
                </div>
            </div>
        );
    }
);

PrintablePaiementsAEffectuer.displayName = 'PrintablePaiementsAEffectuer';

export default PrintablePaiementsAEffectuer;
