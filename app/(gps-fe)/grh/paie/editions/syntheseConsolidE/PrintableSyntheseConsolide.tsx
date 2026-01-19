import React from 'react';
import { SyntheseConsolideResponseDto } from './SyntheseConsolide';

interface PrintableSyntheseConsolideProps {
    syntheseData: SyntheseConsolideResponseDto;
}

const PrintableSyntheseConsolide = React.forwardRef<HTMLDivElement, PrintableSyntheseConsolideProps>(
    ({ syntheseData }, ref) => {
        const logoUrl = '/assets/images/gps_icon.png';

        const formatNumber = (value: number | undefined | null): string => {
            if (value === null || value === undefined) return '0';
            return new Intl.NumberFormat('fr-FR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(value);
        };

        // Column headers for the report
        const row1Headers = ['S.Base', 'Logt', 'I.Fam', 'Deplac', 'Rap + Imp', 'Prime', 'Brut', 'Rap - Imp', 'FPC', 'INSS', 'IRE', 'Synd', 'Fonds Aval', 'Cahier', 'Quinzaine', 'Tot retenue', 'Net a payer'];
        const row2Headers = ['I.Charge', 'I.div', 'Regideso', 'H.S', 'Rap + NI', 'Rbt/Av', 'Rap - NI', 'Av.Sal', 'Ass.Vie', 'Jubilee', 'Ass.Soc', 'R.Cred', 'Loyer', 'Resto', 'Remb/AV'];

        const cellStyle: React.CSSProperties = {
            border: '1px solid #333',
            padding: '2px 4px',
            fontSize: '9px',
            textAlign: 'right'
        };

        const headerCellStyle: React.CSSProperties = {
            ...cellStyle,
            textAlign: 'center',
            fontWeight: 'bold',
            backgroundColor: '#e3f2fd'
        };

        const headerCellStyle2: React.CSSProperties = {
            ...cellStyle,
            textAlign: 'center',
            fontWeight: 'bold',
            backgroundColor: '#bbdefb'
        };

        const labelCellStyle: React.CSSProperties = {
            ...cellStyle,
            textAlign: 'left',
            fontWeight: 'bold',
            backgroundColor: '#f5f5f5',
            width: '80px'
        };

        const dataCellStyle: React.CSSProperties = {
            ...cellStyle,
            fontWeight: 'bold'
        };

        const totalLabelCellStyle: React.CSSProperties = {
            ...cellStyle,
            textAlign: 'left',
            fontWeight: 'bold',
            backgroundColor: '#c8e6c9'
        };

        const totalDataCellStyle: React.CSSProperties = {
            ...cellStyle,
            fontWeight: 'bold',
            backgroundColor: '#c8e6c9'
        };

        return (
            <div ref={ref} style={{ padding: '10px', fontFamily: 'Arial, sans-serif', backgroundColor: 'white' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ flex: '0 0 120px' }}>
                        <img src={logoUrl} alt="Logo" style={{ width: '100px', height: 'auto' }} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '18px', color: '#800020', textDecoration: 'underline' }}>
                            SYNTHESE
                        </h2>
                        <h3 style={{ margin: '5px 0 0 0', fontSize: '16px', color: '#800020', textDecoration: 'underline' }}>
                            Période {syntheseData.periodeLibelle}
                        </h3>
                    </div>
                    <div style={{ flex: '0 0 120px' }}></div>
                </div>

                {/* Report Content */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                    <thead>
                        {/* Column Headers Row 1 */}
                        <tr>
                            <th rowSpan={2} style={{ ...headerCellStyle, width: '80px', verticalAlign: 'middle' }}></th>
                            {row1Headers.map((header, idx) => (
                                <th
                                    key={idx}
                                    rowSpan={idx === 6 ? 2 : 1}
                                    style={{ ...headerCellStyle, minWidth: '50px', verticalAlign: idx === 6 ? 'middle' : undefined }}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                        {/* Column Headers Row 2 */}
                        <tr>
                            {row2Headers.map((header, idx) => (
                                <th key={idx} style={{ ...headerCellStyle2, minWidth: '50px' }}>
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Employe Row 1 */}
                        <tr>
                            <td rowSpan={2} style={labelCellStyle}>Employé</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeSBase)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeLogt)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeIFam)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeDeplac)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeRapPlusImp)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employePrime)}</td>
                            <td rowSpan={2} style={{ ...dataCellStyle, verticalAlign: 'middle' }}>{formatNumber(syntheseData.employeBrut)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeRapMoinsImp)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeFpc)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeInss)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeIpr)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeSynd)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeFondsAval)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeCahier)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeQuinzaine)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeTotRetenue)}</td>
                            <td rowSpan={2} style={{ ...dataCellStyle, color: '#1565c0', verticalAlign: 'middle' }}>{formatNumber(syntheseData.employeNetAPayer)}</td>
                        </tr>
                        {/* Employe Row 2 */}
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeICharge)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeIDiv)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeRegideso)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeHs)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeRapPlusNI)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeRbtAv)}</td>
                            {/* Brut column has rowSpan=2 */}
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeRapMoinsNI)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeAvSal)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeAssVie)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeJubilee)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeAssSoc)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeRCred)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeLoyer)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeReste)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeRSportif)}</td>
                            {/* Net a payer has rowSpan=2 */}
                        </tr>

                        {/* Empty row for spacing */}
                        <tr>
                            <td colSpan={18} style={{ height: '10px', border: 'none' }}></td>
                        </tr>

                        {/* Employeur Row */}
                        <tr>
                            <td style={labelCellStyle}>Employeur</td>
                            <td style={cellStyle}></td>
                            <td style={cellStyle}></td>
                            <td style={cellStyle}></td>
                            <td style={cellStyle}></td>
                            <td style={cellStyle}></td>
                            <td style={cellStyle}></td>
                            <td style={cellStyle}></td>
                            <td style={cellStyle}></td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeurFpc)}</td>
                            <td style={dataCellStyle}>{formatNumber(syntheseData.employeurInss)}</td>
                            <td style={cellStyle}></td>
                            <td style={cellStyle}></td>
                            <td style={cellStyle}></td>
                            <td style={cellStyle}></td>
                            <td style={cellStyle}></td>
                            <td style={cellStyle}></td>
                            <td style={cellStyle}></td>
                        </tr>

                        {/* Empty row for spacing */}
                        <tr>
                            <td colSpan={18} style={{ height: '10px', border: 'none' }}></td>
                        </tr>

                        {/* TOTAL Row 1 */}
                        <tr>
                            <td rowSpan={2} style={totalLabelCellStyle}>TOTAL</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalSBase)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalLogt)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalIFam)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalDeplac)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalRapPlusImp)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalPrime)}</td>
                            <td rowSpan={2} style={{ ...totalDataCellStyle, verticalAlign: 'middle' }}>{formatNumber(syntheseData.totalBrut)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalRapMoinsImp)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalFpc)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalInss)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalIpr)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalSynd)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalFondsAval)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalCahier)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalQuinzaine)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalTotRetenue)}</td>
                            <td rowSpan={2} style={{ ...totalDataCellStyle, color: '#1565c0', verticalAlign: 'middle' }}>{formatNumber(syntheseData.totalNetAPayer)}</td>
                        </tr>
                        {/* TOTAL Row 2 */}
                        <tr style={{ backgroundColor: '#e8f5e9' }}>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalICharge)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalIDiv)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalRegideso)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalHs)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalRapPlusNI)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalRbtAv)}</td>
                            {/* Brut column has rowSpan=2 */}
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalRapMoinsNI)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalAvSal)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalAssVie)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalJubilee)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalAssSoc)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalRCred)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalLoyer)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalReste)}</td>
                            <td style={totalDataCellStyle}>{formatNumber(syntheseData.totalRSportif)}</td>
                            {/* Net a payer has rowSpan=2 */}
                        </tr>
                    </tbody>
                </table>

                {/* Footer with signature sections */}
                <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}>
                    <div style={{ textAlign: 'center', width: '30%' }}>
                        <p style={{ margin: 0 }}>POUR ETABLISSEMENT</p>
                    </div>
                    <div style={{ textAlign: 'center', width: '30%' }}>
                        <p style={{ margin: 0 }}>POUR VERIFICATION</p>
                    </div>
                    <div style={{ textAlign: 'center', width: '30%' }}>
                        <p style={{ margin: 0 }}>POUR AUTORISATION</p>
                    </div>
                </div>
            </div>
        );
    }
);

PrintableSyntheseConsolide.displayName = 'PrintableSyntheseConsolide';

export default PrintableSyntheseConsolide;
