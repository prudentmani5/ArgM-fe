import React from 'react';
import { ListingJubileResponseDto, formatCurrency, getFullName } from './ListingJubile';
import SeparatorArea from '../../../../../../utils/printing/SeparatorArea';
import FooterArea from '../../../../../../utils/printing/FooterArea';

interface PrintableListingJubileProps {
    data: ListingJubileResponseDto;
}

const PrintableListingJubile = React.forwardRef<HTMLDivElement, PrintableListingJubileProps>(
    ({ data }, ref) => {
        const logoUrl = '/assets/images/gps_icon.png';

        const cellStyle: React.CSSProperties = {
            border: '1px solid #333',
            padding: '4px 8px',
            fontSize: '10px'
        };

        const headerCellStyle: React.CSSProperties = {
            ...cellStyle,
            fontWeight: 'bold',
            backgroundColor: '#e0e0e0',
            textAlign: 'center'
        };

        const mainContent = (
            <div style={{ padding: '14px' }}>
                {/* Bank Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                        <span style={{ fontWeight: 'bold' }}>Banque: </span>
                        <span style={{ fontWeight: 'bold' }}>{data.banqueLibelle}</span>
                    </div>
                    <div>
                        <span style={{ fontWeight: 'bold' }}>Compte: </span>
                        <span style={{ fontWeight: 'bold' }}>{data.compte}</span>
                    </div>
                </div>

                {/* Employee Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                    <thead>
                        <tr>
                            <th style={{ ...headerCellStyle, width: '80px' }}>Matricule</th>
                            <th style={{ ...headerCellStyle, width: '40%' }}>Nom et Prenom</th>
                            <th style={{ ...headerCellStyle, textAlign: 'right', width: '100px' }}>Base</th>
                            <th style={{ ...headerCellStyle, textAlign: 'center', width: '50px' }}>%</th>
                            <th style={{ ...headerCellStyle, textAlign: 'right', width: '100px' }}>Montant</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.employees.map((emp, index) => (
                            <tr key={index}>
                                <td style={cellStyle}>{emp.matriculeId}</td>
                                <td style={{ ...cellStyle, color: '#800000' }}>{getFullName(emp)}</td>
                                <td style={{ ...cellStyle, textAlign: 'right' }}>{formatCurrency(emp.base)}</td>
                                <td style={{ ...cellStyle, textAlign: 'center' }}>{emp.pourcentage}</td>
                                <td style={{ ...cellStyle, textAlign: 'right' }}>{formatCurrency(emp.montant)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={4} style={{
                                ...cellStyle,
                                borderTop: '2px solid #333',
                                fontWeight: 'bold'
                            }}>
                                {data.totalEmployeeCount} Employes
                            </td>
                            <td style={{
                                ...cellStyle,
                                borderTop: '2px solid #333',
                                textAlign: 'right',
                                fontWeight: 'bold'
                            }}>
                                {formatCurrency(data.grandTotalMontant)}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                {/* Signature Section */}
                <div style={{ marginTop: '50px' }}>
                    <div className='grid'>
                        <div className='col-4' style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '11px', margin: '0', fontWeight: 'bold', textDecoration: 'underline' }}>POUR ETABLISSEMENT</h3>
                        </div>
                        <div className='col-4' style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '11px', margin: '0', fontWeight: 'bold', textDecoration: 'underline' }}>POUR VERIFICATION</h3>
                        </div>
                        <div className='col-4' style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '11px', margin: '0', fontWeight: 'bold', textDecoration: 'underline' }}>POUR AUTORISATION</h3>
                        </div>
                    </div>
                </div>
            </div>
        );

        return (
            <div ref={ref} style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: 'white' }}>
                {/* Header with Logo */}
                <div className="col-12">
                    <div className="grid">
                        <div className="col-4">
                            <img src={logoUrl} alt="Logo" style={{ width: '100px', height: 'auto' }} />
                        </div>
                        <div className="col-8" style={{ textAlign: 'right' }}>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <h2 style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        textDecoration: 'underline',
                        color: '#800000',
                        margin: 0
                    }}>
                        ASSURANCE JUBILE : {data.periodeLibelle}
                    </h2>
                </div>

                {/* Main Content */}
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

PrintableListingJubile.displayName = 'PrintableListingJubile';

export default PrintableListingJubile;
