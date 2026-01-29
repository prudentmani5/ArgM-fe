import React from 'react';
import { JournalPaieResponseDto, JournalPaieServiceGroupDto, JournalPaieEmployeeDto } from './JournalPaie';

interface PrintableJournalPaieProps {
    journalData: JournalPaieResponseDto;
}

const PrintableJournalPaie = React.forwardRef<HTMLDivElement, PrintableJournalPaieProps>(
    ({ journalData }, ref) => {
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
        const row2Headers = ['I.Charge', 'I.div', 'Regideso', 'H.S', 'Rap + NI', 'Rbt/Av', 'Rap - NI', 'Av.Sal', 'Ass.Vie', 'Jubilee', 'Ass.Soc', 'R.Cred', 'Loyer', 'Resto', 'BNDE', 'R.Sportif'];

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

        const totalCellStyle: React.CSSProperties = {
            ...cellStyle,
            fontWeight: 'bold',
            backgroundColor: '#fff9c4'
        };

        const renderEmployeeRow1 = (emp: JournalPaieEmployeeDto) => (
            <>
                <td style={cellStyle}>{formatNumber(emp.sBase)}</td>
                <td style={cellStyle}>{formatNumber(emp.logt)}</td>
                <td style={cellStyle}>{formatNumber(emp.iFam)}</td>
                <td style={cellStyle}>{formatNumber(emp.deplac)}</td>
                <td style={cellStyle}>{formatNumber(emp.rapPlusImp)}</td>
                <td style={cellStyle}>{formatNumber(emp.prime)}</td>
                <td rowSpan={2} style={{ ...cellStyle, fontWeight: 'bold', verticalAlign: 'middle' }}>{formatNumber(emp.brut)}</td>
                <td style={cellStyle}>{formatNumber(emp.rapMoinsImp)}</td>
                <td style={cellStyle}>{formatNumber(emp.fpc)}</td>
                <td style={cellStyle}>{formatNumber(emp.inss)}</td>
                <td style={cellStyle}>{formatNumber(emp.ipr)}</td>
                <td style={cellStyle}>{formatNumber(emp.synd)}</td>
                <td style={cellStyle}>{formatNumber(emp.fondsAval)}</td>
                <td style={cellStyle}>{formatNumber(emp.cahier)}</td>
                <td style={cellStyle}>{formatNumber(emp.quinzaine)}</td>
                <td style={{ ...cellStyle, fontWeight: 'bold' }}>{formatNumber(emp.totRetenue)}</td>
                <td style={{ ...cellStyle, fontWeight: 'bold', color: '#1565c0' }}>{formatNumber(emp.netAPayer)}</td>
            </>
        );

        const renderEmployeeRow2 = (emp: JournalPaieEmployeeDto) => (
            <>
                <td style={cellStyle}>{formatNumber(emp.iCharge)}</td>
                <td style={cellStyle}>{formatNumber(emp.iDiv)}</td>
                <td style={cellStyle}>{formatNumber(emp.regideso)}</td>
                <td style={cellStyle}>{formatNumber(emp.hs)}</td>
                <td style={cellStyle}>{formatNumber(emp.rapPlusNI)}</td>
                <td style={cellStyle}>{formatNumber(emp.rbtAv)}</td>
                {/* Brut column has rowSpan=2 from row1, so no cell here */}
                <td style={cellStyle}>{formatNumber(emp.rapMoinsNI)}</td>
                <td style={cellStyle}>{formatNumber(emp.avSal)}</td>
                <td style={cellStyle}>{formatNumber(emp.assVie)}</td>
                <td style={cellStyle}>{formatNumber(emp.jubilee)}</td>
                <td style={cellStyle}>{formatNumber(emp.assSoc)}</td>
                <td style={cellStyle}>{formatNumber(emp.rCred)}</td>
                <td style={cellStyle}>{formatNumber(emp.loyer)}</td>
                <td style={cellStyle}>{formatNumber(emp.reste)}</td>
                <td style={cellStyle}>{formatNumber(emp.bnde)}</td>
                <td style={cellStyle}>{formatNumber(emp.rSportif)}</td>
            </>
        );

        const renderServiceTotalRow1 = (group: JournalPaieServiceGroupDto) => (
            <>
                <td style={totalCellStyle}>{formatNumber(group.totalSBase)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalLogt)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalIFam)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalDeplac)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalRapPlusImp)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalPrime)}</td>
                <td rowSpan={2} style={{ ...totalCellStyle, verticalAlign: 'middle' }}>{formatNumber(group.totalBrut)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalRapMoinsImp)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalFpc)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalInss)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalIpr)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalSynd)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalFondsAval)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalCahier)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalQuinzaine)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalTotRetenue)}</td>
                <td style={{ ...totalCellStyle, color: '#1565c0' }}>{formatNumber(group.totalNetAPayer)}</td>
            </>
        );

        const renderServiceTotalRow2 = (group: JournalPaieServiceGroupDto) => (
            <>
                <td style={totalCellStyle}>{formatNumber(group.totalICharge)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalIDiv)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalRegideso)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalHs)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalRapPlusNI)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalRbtAv)}</td>
                {/* Brut column has rowSpan=2 from row1, so no cell here */}
                <td style={totalCellStyle}>{formatNumber(group.totalRapMoinsNI)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalAvSal)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalAssVie)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalJubilee)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalAssSoc)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalRCred)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalLoyer)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalReste)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalBnde)}</td>
                <td style={totalCellStyle}>{formatNumber(group.totalRSportif)}</td>
            </>
        );

        return (
            <div ref={ref} style={{ padding: '10px', fontFamily: 'Arial, sans-serif', backgroundColor: 'white' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ flex: '0 0 100px' }}>
                        <img src={logoUrl} alt="Logo" style={{ width: '80px', height: 'auto' }} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '16px', color: '#1565c0' }}>
                            JOURNAL DE PAIE PAR AFFECTATION
                        </h2>
                        <h3 style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                            Période: {journalData.periodeLibelle}
                        </h3>
                    </div>
                    <div style={{ flex: '0 0 100px', textAlign: 'right', fontSize: '10px' }}>
                        <div>Imprime le:</div>
                        <div>{new Date().toLocaleDateString('fr-FR')}</div>
                    </div>
                </div>

                {/* Report Content */}
                {journalData.serviceGroups.map((group, groupIndex) => (
                    <div key={groupIndex} style={{ marginBottom: '15px', pageBreakInside: 'avoid' }}>
                        {/* Service Header */}
                        <div style={{
                            backgroundColor: '#e3f2fd',
                            padding: '5px 10px',
                            fontWeight: 'bold',
                            fontSize: '11px',
                            border: '1px solid #333'
                        }}>
                            {group.serviceLibelle}
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                            <thead>
                                {/* Column Headers Row 1 */}
                                <tr>
                                    <th rowSpan={2} style={{ ...headerCellStyle, width: '40px', verticalAlign: 'middle' }}>Matr</th>
                                    <th rowSpan={2} style={{ ...headerCellStyle, width: '120px', verticalAlign: 'middle' }}>Nom et Prenom</th>
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
                                {group.employees.map((emp, empIndex) => (
                                    <React.Fragment key={empIndex}>
                                        {/* Employee Row 1 */}
                                        <tr>
                                            <td rowSpan={2} style={{ ...cellStyle, textAlign: 'left', fontWeight: 'bold', verticalAlign: 'middle' }}>
                                                {emp.matriculeId}
                                            </td>
                                            <td rowSpan={2} style={{ ...cellStyle, textAlign: 'left', verticalAlign: 'middle' }}>
                                                {`${emp.nom || ''} ${emp.prenom || ''}`.trim()}
                                            </td>
                                            {renderEmployeeRow1(emp)}
                                        </tr>
                                        {/* Employee Row 2 */}
                                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                                            {renderEmployeeRow2(emp)}
                                        </tr>
                                    </React.Fragment>
                                ))}
                                {/* Service Total Row 1 */}
                                <tr>
                                    <td colSpan={2} rowSpan={2} style={{ ...totalCellStyle, textAlign: 'center', verticalAlign: 'middle' }}>Total pour {group.employeeCount} employé(s)</td>
                                    {renderServiceTotalRow1(group)}
                                </tr>
                                {/* Service Total Row 2 */}
                                <tr style={{ backgroundColor: '#fff59d' }}>
                                    {renderServiceTotalRow2(group)}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ))}

                {/* Grand Total Section */}
                <div style={{ marginTop: '15px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                        <tbody>
                            <tr>
                                <td colSpan={2} rowSpan={4} style={{ ...headerCellStyle, width: '160px', verticalAlign: 'middle', backgroundColor: '#a5d6a7' }}>Total pour {journalData.totalEmployeeCount} employé(s)</td>
                                {row1Headers.map((header, idx) => (
                                    <td
                                        key={idx}
                                        rowSpan={idx === 6 ? 2 : 1}
                                        style={{ ...headerCellStyle, minWidth: '50px', backgroundColor: '#c8e6c9', verticalAlign: idx === 6 ? 'middle' : undefined }}
                                    >
                                        {header}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                {row2Headers.map((header, idx) => (
                                    <td key={idx} style={{ ...headerCellStyle2, minWidth: '50px', backgroundColor: '#e8f5e9' }}>
                                        {header}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td style={{ ...totalCellStyle, backgroundColor: '#c8e6c9' }}>{formatNumber(journalData.grandTotalSBase)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#c8e6c9' }}>{formatNumber(journalData.grandTotalLogt)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#c8e6c9' }}>{formatNumber(journalData.grandTotalIFam)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#c8e6c9' }}>{formatNumber(journalData.grandTotalDeplac)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#c8e6c9' }}>{formatNumber(journalData.grandTotalRapPlusImp)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#c8e6c9' }}>{formatNumber(journalData.grandTotalPrime)}</td>
                                <td rowSpan={2} style={{ ...totalCellStyle, backgroundColor: '#c8e6c9', verticalAlign: 'middle' }}>{formatNumber(journalData.grandTotalBrut)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#c8e6c9' }}>{formatNumber(journalData.grandTotalRapMoinsImp)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#c8e6c9' }}>{formatNumber(journalData.grandTotalFpc)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#c8e6c9' }}>{formatNumber(journalData.grandTotalInss)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#c8e6c9' }}>{formatNumber(journalData.grandTotalIpr)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#c8e6c9' }}>{formatNumber(journalData.grandTotalSynd)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#c8e6c9' }}>{formatNumber(journalData.grandTotalFondsAval)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#c8e6c9' }}>{formatNumber(journalData.grandTotalCahier)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#c8e6c9' }}>{formatNumber(journalData.grandTotalQuinzaine)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#c8e6c9' }}>{formatNumber(journalData.grandTotalTotRetenue)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#c8e6c9', color: '#1565c0' }}>{formatNumber(journalData.grandTotalNetAPayer)}</td>
                            </tr>
                            <tr style={{ backgroundColor: '#e8f5e9' }}>
                                <td style={{ ...totalCellStyle, backgroundColor: '#e8f5e9' }}>{formatNumber(journalData.grandTotalICharge)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#e8f5e9' }}>{formatNumber(journalData.grandTotalIDiv)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#e8f5e9' }}>{formatNumber(journalData.grandTotalRegideso)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#e8f5e9' }}>{formatNumber(journalData.grandTotalHs)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#e8f5e9' }}>{formatNumber(journalData.grandTotalRapPlusNI)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#e8f5e9' }}>{formatNumber(journalData.grandTotalRbtAv)}</td>
                                {/* Brut column has rowSpan=2 from row above, so no cell here */}
                                <td style={{ ...totalCellStyle, backgroundColor: '#e8f5e9' }}>{formatNumber(journalData.grandTotalRapMoinsNI)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#e8f5e9' }}>{formatNumber(journalData.grandTotalAvSal)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#e8f5e9' }}>{formatNumber(journalData.grandTotalAssVie)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#e8f5e9' }}>{formatNumber(journalData.grandTotalJubilee)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#e8f5e9' }}>{formatNumber(journalData.grandTotalAssSoc)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#e8f5e9' }}>{formatNumber(journalData.grandTotalRCred)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#e8f5e9' }}>{formatNumber(journalData.grandTotalLoyer)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#e8f5e9' }}>{formatNumber(journalData.grandTotalReste)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#e8f5e9' }}>{formatNumber(journalData.grandTotalBnde)}</td>
                                <td style={{ ...totalCellStyle, backgroundColor: '#e8f5e9' }}>{formatNumber(journalData.grandTotalRSportif)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

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
                    <p style={{ margin: 0 }}>Global Port Services - Journal de Paie</p>
                </div>
            </div>
        );
    }
);

PrintableJournalPaie.displayName = 'PrintableJournalPaie';

export default PrintableJournalPaie;
