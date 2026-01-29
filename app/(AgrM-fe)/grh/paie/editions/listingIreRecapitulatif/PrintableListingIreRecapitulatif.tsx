import React from 'react';
import { ListingIreRecapitulatifResponseDto } from './ListingIreRecapitulatif';
import TitleArea from '../../../../../../utils/printing/TitleArea ';
import DateTimeArea from '../../../../../../utils/printing/DocumentTime';
import SeparatorArea from '../../../../../../utils/printing/SeparatorArea';
import FooterArea from '../../../../../../utils/printing/FooterArea';

interface PrintableListingIreRecapitulatifProps {
    listingData: ListingIreRecapitulatifResponseDto;
}

const PrintableListingIreRecapitulatif = React.forwardRef<HTMLDivElement, PrintableListingIreRecapitulatifProps>(
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

        const totalCellStyle: React.CSSProperties = {
            ...cellStyle,
            fontWeight: 'bold',
            backgroundColor: '#c8e6c9'
        };

        const mainContent = (
            <div style={{
                padding: '10px',
                border: '3px solid #000'
            }}>
                {/* Main Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                    <thead>
                        <tr>
                            <th style={{ ...headerCellStyle, width: '25px' }}>N</th>
                            <th style={{ ...headerCellStyle, width: '45px' }}>Matr</th>
                            <th style={{ ...headerCellStyle, width: '150px' }}>NomPrenom</th>
                            <th style={{ ...headerCellStyle, width: '60px' }}>Base</th>
                            <th style={{ ...headerCellStyle, width: '60px' }}>Logement</th>
                            <th style={{ ...headerCellStyle, width: '50px' }}>AllocFam</th>
                            <th style={{ ...headerCellStyle, width: '60px' }}>Deplacement</th>
                            <th style={{ ...headerCellStyle, width: '65px' }}>Autres<br/>ind+Prime</th>
                            <th style={{ ...headerCellStyle, width: '50px' }}>Rappel</th>
                            <th style={{ ...headerCellStyle, width: '60px' }}>Brut</th>
                            <th style={{ ...headerCellStyle, width: '50px' }}>INSS</th>
                            <th style={{ ...headerCellStyle, width: '60px' }}>Tot Pension</th>
                            <th style={{ ...headerCellStyle, width: '70px' }}>Base Imposable</th>
                            <th style={{ ...headerCellStyle, width: '55px' }}>IRE</th>
                            <th style={{ ...headerCellStyle, width: '60px' }}>Autres Ret</th>
                            <th style={{ ...headerCellStyle, width: '65px' }}>Net</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listingData.employees.map((emp, index) => (
                            <tr key={index}>
                                <td style={{ ...cellStyle, textAlign: 'center' }}>{index + 1}</td>
                                <td style={{ ...cellStyle, textAlign: 'center', fontWeight: 'bold' }}>{emp.matriculeId || ''}</td>
                                <td style={{ ...cellStyle, textAlign: 'left', color: '#c62828' }}>
                                    {`${emp.nom || ''} ${emp.prenom || ''}`.trim()}
                                </td>
                                <td style={{ ...cellStyle, color: '#1565c0' }}>{formatNumber(emp.base)}</td>
                                <td style={{ ...cellStyle, color: '#1565c0' }}>{formatNumber(emp.logement)}</td>
                                <td style={{ ...cellStyle, color: '#1565c0' }}>{formatNumber(emp.allocFam)}</td>
                                <td style={{ ...cellStyle, color: '#1565c0' }}>{formatNumber(emp.deplacement)}</td>
                                <td style={{ ...cellStyle, color: '#1565c0' }}>{formatNumber(emp.autresIndPrime)}</td>
                                <td style={{ ...cellStyle, color: '#1565c0' }}>{formatNumber(emp.rappel)}</td>
                                <td style={{ ...cellStyle, color: '#c62828', fontWeight: 'bold' }}>{formatNumber(emp.brut)}</td>
                                <td style={{ ...cellStyle, color: '#1565c0' }}>{formatNumber(emp.inss)}</td>
                                <td style={{ ...cellStyle, color: '#1565c0' }}>{formatNumber(emp.totPension)}</td>
                                <td style={{ ...cellStyle, color: '#c62828' }}>{formatNumber(emp.baseImposable)}</td>
                                <td style={{ ...cellStyle, color: '#c62828' }}>{formatNumber(emp.ire)}</td>
                                <td style={{ ...cellStyle, color: '#1565c0' }}>{formatNumber(emp.autresRet)}</td>
                                <td style={{ ...cellStyle, color: '#c62828', fontWeight: 'bold' }}>{formatNumber(emp.net)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td style={{ ...totalCellStyle, textAlign: 'center' }} colSpan={3}>
                                Total ({listingData.totalEmployeeCount} employes)
                            </td>
                            <td style={totalCellStyle}>{formatNumber(listingData.grandTotalBase)}</td>
                            <td style={totalCellStyle}>{formatNumber(listingData.grandTotalLogement)}</td>
                            <td style={totalCellStyle}>{formatNumber(listingData.grandTotalAllocFam)}</td>
                            <td style={totalCellStyle}>{formatNumber(listingData.grandTotalDeplacement)}</td>
                            <td style={totalCellStyle}>{formatNumber(listingData.grandTotalAutresIndPrime)}</td>
                            <td style={totalCellStyle}>{formatNumber(listingData.grandTotalRappel)}</td>
                            <td style={totalCellStyle}>{formatNumber(listingData.grandTotalBrut)}</td>
                            <td style={totalCellStyle}>{formatNumber(listingData.grandTotalInss)}</td>
                            <td style={totalCellStyle}>{formatNumber(listingData.grandTotalTotPension)}</td>
                            <td style={totalCellStyle}>{formatNumber(listingData.grandTotalBaseImposable)}</td>
                            <td style={totalCellStyle}>{formatNumber(listingData.grandTotalIre)}</td>
                            <td style={totalCellStyle}>{formatNumber(listingData.grandTotalAutresRet)}</td>
                            <td style={totalCellStyle}>{formatNumber(listingData.grandTotalNet)}</td>
                        </tr>
                    </tfoot>
                </table>

                {/* Footer - Signature Section */}
                <div style={{ marginTop: '40px' }}>
                    <div className='grid'>
                        <div className='col-4' style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '11px', margin: '0', textDecoration: 'underline', fontWeight: 'bold' }}>POUR ETABLISSEMENT</h3>
                            <h6 style={{ fontSize: '9px', marginTop: '30px' }}>Signature</h6>
                        </div>
                        <div className='col-4' style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '11px', margin: '0', textDecoration: 'underline', fontWeight: 'bold' }}>POUR VERIFICATION</h3>
                            <h6 style={{ fontSize: '9px', marginTop: '30px' }}>Signature</h6>
                        </div>
                        <div className='col-4' style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '11px', margin: '0', textDecoration: 'underline', fontWeight: 'bold' }}>POUR AUTORISATION</h3>
                            <h6 style={{ fontSize: '9px', marginTop: '30px' }}>Signature</h6>
                        </div>
                    </div>
                </div>
            </div>
        );

        return (
            <div ref={ref} style={{ padding: '15px', fontFamily: 'Arial, sans-serif', backgroundColor: 'white' }}>
                <DateTimeArea dateTime={new Date()} />
                <TitleArea
                    logoUrl={logoUrl}
                    title={`LISTING IRE RECAPITULATIF DETAILLE`}
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

PrintableListingIreRecapitulatif.displayName = 'PrintableListingIreRecapitulatif';

export default PrintableListingIreRecapitulatif;
