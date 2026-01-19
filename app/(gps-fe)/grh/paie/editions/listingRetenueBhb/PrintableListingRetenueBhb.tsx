import React from 'react';
import { ListingRetenueBhbResponseDto, formatCurrency, getFullName } from './ListingRetenueBhb';
import SeparatorArea from '../../../../../../utils/printing/SeparatorArea';
import FooterArea from '../../../../../../utils/printing/FooterArea';

interface PrintableListingRetenueBhbProps {
    data: ListingRetenueBhbResponseDto;
}

const PrintableListingRetenueBhb = React.forwardRef<HTMLDivElement, PrintableListingRetenueBhbProps>(
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
            <div style={{ padding: '14px', border: '3px solid #000' }}>
                {/* Bank Header */}
                <div style={{ marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'normal' }}>Banque: </span>
                    <span style={{ fontWeight: 'bold', color: '#0000FF' }}>{data.banqueLibelle}</span>
                </div>

                {/* Retenue Label */}
                <h3 style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginBottom: '15px',
                    marginTop: '0'
                }}>
                    {data.retenueLibelle}
                </h3>

                {/* Employee Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                    <thead>
                        <tr>
                            <th style={headerCellStyle}></th>
                            <th style={headerCellStyle}>Compte</th>
                            <th style={{ ...headerCellStyle, width: '40%' }}>Nom et Prenom</th>
                            <th style={{ ...headerCellStyle, textAlign: 'right' }}>Montant</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.employees.map((emp, index) => (
                            <tr key={index}>
                                <td style={cellStyle}>{emp.matriculeId}</td>
                                <td style={cellStyle}>{emp.compte || ''}</td>
                                <td style={{ ...cellStyle, color: '#800000' }}>{getFullName(emp)}</td>
                                <td style={{ ...cellStyle, textAlign: 'right' }}>{formatCurrency(emp.montant)}</td>
                            </tr>
                        ))}
                        {/* Total row - placed in tbody to avoid repeating on each printed page */}
                        <tr>
                            <td colSpan={3} style={{
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
                    </tbody>
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
                        Listing des Retenues : {data.periodeLibelle}
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

PrintableListingRetenueBhb.displayName = 'PrintableListingRetenueBhb';

export default PrintableListingRetenueBhb;
