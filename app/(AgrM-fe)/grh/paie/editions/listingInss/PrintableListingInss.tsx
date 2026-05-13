import React from 'react';
import { ListingInssResponseDto, ListingInssEmployeeDto } from './ListingInss';
import TitleArea from '../../../../../../utils/printing/TitleArea ';
import DateTimeArea from '../../../../../../utils/printing/DocumentTime';
import SeparatorArea from '../../../../../../utils/printing/SeparatorArea';
import FooterArea from '../../../../../../utils/printing/FooterArea';

interface PrintableListingInssProps {
    listingData: ListingInssResponseDto;
}

const PrintableListingInss = React.forwardRef<HTMLDivElement, PrintableListingInssProps>(
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
            padding: '3px 6px',
            fontSize: '10px',
            textAlign: 'right'
        };

        const headerCellStyle: React.CSSProperties = {
            ...cellStyle,
            textAlign: 'center',
            fontWeight: 'bold',
            backgroundColor: '#e3f2fd',
            color: '#1565c0'
        };

        const totalCellStyle: React.CSSProperties = {
            ...cellStyle,
            fontWeight: 'bold',
            backgroundColor: '#c8e6c9'
        };

        const mainContent = (
            <div style={{
                padding: '14px',
                border: '3px solid #000'
            }}>
                {/* Main Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                    <thead>
                        <tr>
                            <th style={{ ...headerCellStyle, width: '100px' }}>Matricule INSS</th>
                            <th style={{ ...headerCellStyle, width: '70px' }}>Matricule</th>
                            <th style={{ ...headerCellStyle, width: '200px' }}>Nom et Prenom</th>
                            <th style={{ ...headerCellStyle, width: '90px' }}>Base Inss Pension</th>
                            <th style={{ ...headerCellStyle, width: '90px' }}>Base Inss Risque</th>
                            <th style={{ ...headerCellStyle, width: '70px' }}>Inss Pers</th>
                            <th style={{ ...headerCellStyle, width: '70px' }}>Inss Patr</th>
                            <th style={{ ...headerCellStyle, width: '90px' }}>Inss Patr Risque</th>
                            <th style={{ ...headerCellStyle, width: '80px' }}>Total Inss</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listingData.employees.map((emp, index) => (
                            <tr key={index}>
                                <td style={{ ...cellStyle, textAlign: 'left' }}>{emp.matriculeInss || ''}</td>
                                <td style={{ ...cellStyle, textAlign: 'center' }}>{emp.matriculeId || ''}</td>
                                <td style={{ ...cellStyle, textAlign: 'left', color: '#c62828' }}>
                                    {`${emp.nom || ''} ${emp.prenom || ''}`.trim()}
                                </td>
                                <td style={{ ...cellStyle, color: '#1565c0' }}>{formatNumber(emp.baseInssPension)}</td>
                                <td style={{ ...cellStyle, color: '#1565c0' }}>{formatNumber(emp.baseInssRisque)}</td>
                                <td style={{ ...cellStyle, color: '#1565c0' }}>{formatNumber(emp.inssPers)}</td>
                                <td style={{ ...cellStyle, color: '#1565c0' }}>{formatNumber(emp.inssPatr)}</td>
                                <td style={{ ...cellStyle, color: '#1565c0' }}>{formatNumber(emp.inssPatrRisque)}</td>
                                <td style={{ ...cellStyle, color: '#c62828', fontWeight: 'bold' }}>{formatNumber(emp.totalInss)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td style={{ ...totalCellStyle, textAlign: 'center' }} colSpan={3}>
                                Total ({listingData.totalEmployeeCount} employes)
                            </td>
                            <td style={totalCellStyle}>{formatNumber(listingData.grandTotalBaseInssPension)}</td>
                            <td style={totalCellStyle}>{formatNumber(listingData.grandTotalBaseInssRisque)}</td>
                            <td style={totalCellStyle}>{formatNumber(listingData.grandTotalInssPers)}</td>
                            <td style={totalCellStyle}>{formatNumber(listingData.grandTotalInssPatr)}</td>
                            <td style={totalCellStyle}>{formatNumber(listingData.grandTotalInssPatrRisque)}</td>
                            <td style={totalCellStyle}>{formatNumber(listingData.grandTotalInss)}</td>
                        </tr>
                    </tfoot>
                </table>

                {/* Footer - Signature Section */}
                <div style={{ marginTop: '40px' }}>
                    <div className='grid'>
                        <div className='col-4' style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '12px', margin: '0', textDecoration: 'underline', fontWeight: 'bold' }}>POUR ETABLISSEMENT</h3>
                            <h6 style={{ fontSize: '10px', marginTop: '30px' }}>Signature</h6>
                        </div>
                        <div className='col-4' style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '12px', margin: '0', textDecoration: 'underline', fontWeight: 'bold' }}>POUR VERIFICATION</h3>
                            <h6 style={{ fontSize: '10px', marginTop: '30px' }}>Signature</h6>
                        </div>
                        <div className='col-4' style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '12px', margin: '0', textDecoration: 'underline', fontWeight: 'bold' }}>POUR AUTORISATION</h3>
                            <h6 style={{ fontSize: '10px', marginTop: '30px' }}>Signature</h6>
                        </div>
                    </div>
                </div>
            </div>
        );

        return (
            <div ref={ref} style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: 'white' }}>
                <DateTimeArea dateTime={new Date()} />
                <TitleArea
                    logoUrl={logoUrl}
                    title={`LISTING INSS`}
                    documentTime={`Periode : ${listingData.periodeLibelle}`}
                />
                <div style={{ marginTop: '10px' }}>
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

PrintableListingInss.displayName = 'PrintableListingInss';

export default PrintableListingInss;
