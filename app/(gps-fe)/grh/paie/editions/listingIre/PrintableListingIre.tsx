import React from 'react';
import { ListingIreResponseDto, ListingIreEmployeeDto } from './ListingIre';
import TitleArea from '../../../../../../utils/printing/TitleArea ';
import DateTimeArea from '../../../../../../utils/printing/DocumentTime';
import SeparatorArea from '../../../../../../utils/printing/SeparatorArea';
import FooterArea from '../../../../../../utils/printing/FooterArea';

interface PrintableListingIreProps {
    listingData: ListingIreResponseDto;
}

const PrintableListingIre = React.forwardRef<HTMLDivElement, PrintableListingIreProps>(
    ({ listingData }, ref) => {
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
            padding: '2px 4px',
            fontSize: '9px',
            textAlign: 'right'
        };

        const headerCellStyle: React.CSSProperties = {
            ...cellStyle,
            textAlign: 'center',
            fontWeight: 'bold',
            backgroundColor: '#e3f2fd',
            color: '#1565c0'
        };

        const subHeaderCellStyle: React.CSSProperties = {
            ...cellStyle,
            textAlign: 'center',
            fontWeight: 'bold',
            backgroundColor: '#bbdefb',
            fontSize: '8px'
        };

        const totalCellStyle: React.CSSProperties = {
            ...cellStyle,
            fontWeight: 'bold',
            backgroundColor: '#c8e6c9'
        };

        const mainContent = (
            <div style={{
                padding: '8px'
            }}>
                {/* Main Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                    <thead>
                        {/* Main Header Row */}
                        <tr>
                            <th rowSpan={2} style={{ ...headerCellStyle, width: '180px', verticalAlign: 'middle' }}>Nom</th>
                            <th rowSpan={2} style={{ ...headerCellStyle, width: '60px', verticalAlign: 'middle' }}>Base</th>
                            <th rowSpan={2} style={{ ...headerCellStyle, width: '50px', verticalAlign: 'middle' }}>Logt</th>
                            <th rowSpan={2} style={{ ...headerCellStyle, width: '50px', verticalAlign: 'middle' }}>Deplac</th>
                            <th rowSpan={2} style={{ ...headerCellStyle, width: '60px', verticalAlign: 'middle' }}>Brut</th>
                            <th rowSpan={2} style={{ ...headerCellStyle, width: '50px', verticalAlign: 'middle' }}>Inss</th>
                            <th colSpan={2} style={headerCellStyle}>Tranche de 0 - 1500000</th>
                            <th colSpan={2} style={headerCellStyle}>Tranche de 150001 - 300000</th>
                            <th colSpan={2} style={headerCellStyle}>Tranche de plus de 300000</th>
                            <th rowSpan={2} style={{ ...headerCellStyle, width: '70px', verticalAlign: 'middle' }}>Brut<br/>Imposable</th>
                            <th rowSpan={2} style={{ ...headerCellStyle, width: '60px', verticalAlign: 'middle' }}>IRE</th>
                            <th rowSpan={2} style={{ ...headerCellStyle, width: '70px', verticalAlign: 'middle' }}>Net</th>
                        </tr>
                        {/* Sub Header Row */}
                        <tr>
                            <th style={subHeaderCellStyle}>Imposable a 0%</th>
                            <th style={subHeaderCellStyle}>Impot du</th>
                            <th style={subHeaderCellStyle}>Imposable a 20%</th>
                            <th style={subHeaderCellStyle}>Impot du</th>
                            <th style={subHeaderCellStyle}>Imposable a 30%</th>
                            <th style={subHeaderCellStyle}>Impot du</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listingData.employees.map((emp, index) => (
                            <tr key={index}>
                                <td style={{ ...cellStyle, textAlign: 'left', color: '#c62828' }}>
                                    {`${emp.nom || ''} ${emp.prenom || ''}`.trim()}
                                </td>
                                <td style={{ ...cellStyle, color: '#1565c0' }}>{formatNumber(emp.base)}</td>
                                <td style={{ ...cellStyle, color: '#1565c0' }}>{formatNumber(emp.logt)}</td>
                                <td style={{ ...cellStyle, color: '#1565c0' }}>{formatNumber(emp.deplac)}</td>
                                <td style={{ ...cellStyle, color: '#1565c0' }}>{formatNumber(emp.brut)}</td>
                                <td style={{ ...cellStyle, color: '#1565c0' }}>{formatNumber(emp.inss)}</td>
                                <td style={{ ...cellStyle, color: '#c62828' }}>{formatNumber(emp.bracket1Imposable)}</td>
                                <td style={{ ...cellStyle, color: '#c62828' }}>{formatNumber(emp.bracket1Tax)}</td>
                                <td style={{ ...cellStyle, color: '#c62828' }}>{formatNumber(emp.bracket2Imposable)}</td>
                                <td style={{ ...cellStyle, color: '#c62828' }}>{formatNumber(emp.bracket2Tax)}</td>
                                <td style={{ ...cellStyle, color: '#c62828' }}>{formatNumber(emp.bracket3Imposable)}</td>
                                <td style={{ ...cellStyle, color: '#c62828' }}>{formatNumber(emp.bracket3Tax)}</td>
                                <td style={{ ...cellStyle, color: '#c62828' }}>{formatNumber(emp.brutImposable)}</td>
                                <td style={{ ...cellStyle, color: '#c62828' }}>{formatNumber(emp.ire)}</td>
                                <td style={{ ...cellStyle, color: '#c62828' }}>{formatNumber(emp.net)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td style={{ ...totalCellStyle, textAlign: 'center', borderTop: '2px solid #333' }}>{listingData.totalEmployeeCount}</td>
                            <td style={{ ...totalCellStyle, borderTop: '2px solid #333' }}>{formatNumber(listingData.grandTotalBase)}</td>
                            <td style={{ ...totalCellStyle, borderTop: '2px solid #333' }}>{formatNumber(listingData.grandTotalLogt)}</td>
                            <td style={{ ...totalCellStyle, borderTop: '2px solid #333' }}>{formatNumber(listingData.grandTotalDeplac)}</td>
                            <td style={{ ...totalCellStyle, borderTop: '2px solid #333' }}>{formatNumber(listingData.grandTotalBrut)}</td>
                            <td style={{ ...totalCellStyle, borderTop: '2px solid #333' }}>{formatNumber(listingData.grandTotalInss)}</td>
                            <td style={{ ...totalCellStyle, borderTop: '2px solid #333' }}>{formatNumber(listingData.grandTotalBracket1Imposable)}</td>
                            <td style={{ ...totalCellStyle, borderTop: '2px solid #333' }}>{formatNumber(listingData.grandTotalBracket1Tax)}</td>
                            <td style={{ ...totalCellStyle, borderTop: '2px solid #333' }}>{formatNumber(listingData.grandTotalBracket2Imposable)}</td>
                            <td style={{ ...totalCellStyle, borderTop: '2px solid #333' }}>{formatNumber(listingData.grandTotalBracket2Tax)}</td>
                            <td style={{ ...totalCellStyle, borderTop: '2px solid #333' }}>{formatNumber(listingData.grandTotalBracket3Imposable)}</td>
                            <td style={{ ...totalCellStyle, borderTop: '2px solid #333' }}>{formatNumber(listingData.grandTotalBracket3Tax)}</td>
                            <td style={{ ...totalCellStyle, borderTop: '2px solid #333' }}>{formatNumber(listingData.grandTotalBrutImposable)}</td>
                            <td style={{ ...totalCellStyle, borderTop: '2px solid #333' }}>{formatNumber(listingData.grandTotalIre)}</td>
                            <td style={{ ...totalCellStyle, borderTop: '2px solid #333' }}>{formatNumber(listingData.grandTotalNet)}</td>
                        </tr>
                    </tfoot>
                </table>

                {/* Footer - Signature Section */}
                <div style={{ marginTop: '20px' }}>
                    <div className='grid'>
                        <div className='col-4' style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '12px', margin: '0', textDecoration: 'underline', fontWeight: 'bold' }}>POUR ETABLISSEMENT</h3>
                            <h6 style={{ fontSize: '10px', marginTop: '20px' }}>Signature</h6>
                            <h6 style={{ fontSize: '10px', marginTop: '15px' }}>Nom et Prenom</h6>
                        </div>
                        <div className='col-4' style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '12px', margin: '0', textDecoration: 'underline', fontWeight: 'bold' }}>POUR VERIFICATION</h3>
                            <h6 style={{ fontSize: '10px', marginTop: '20px' }}>Signature</h6>
                            <h6 style={{ fontSize: '10px', marginTop: '15px' }}>Nom et Prenom</h6>
                        </div>
                        <div className='col-4' style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '12px', margin: '0', textDecoration: 'underline', fontWeight: 'bold' }}>POUR AUTORISATION</h3>
                            <h6 style={{ fontSize: '10px', marginTop: '20px' }}>Signature</h6>
                            <h6 style={{ fontSize: '10px', marginTop: '15px' }}>Nom et Prenom</h6>
                        </div>
                    </div>
                </div>
            </div>
        );

        return (
            <div ref={ref} style={{ padding: '10px', fontFamily: 'Arial, sans-serif', backgroundColor: 'white' }}>
                <DateTimeArea dateTime={new Date()} />
                <TitleArea
                    logoUrl={logoUrl}
                    title={`DECLARATION DE L' IRE : ${listingData.periodeLibelle}`}
                    documentTime={`Imprime le ${new Date().toLocaleDateString('fr-FR')}`}
                />
                <div style={{ marginTop: '5px' }}>
                    {mainContent}
                </div>
                <SeparatorArea color="#E0E0E0" />
                <FooterArea
                    line1="Port de Bujumbura, 1 Avenue Tanzanie, Bujumbura, Burundi, PO Box 6440 Kinindo * Tel: +257 22 22 68 10"
                    line2="www.gpsb.bi . Compte: IBB701-8733001-37 . R.C85744 . NIF:4000155053"
                />
            </div>
        );
    }
);

PrintableListingIre.displayName = 'PrintableListingIre';

export default PrintableListingIre;
