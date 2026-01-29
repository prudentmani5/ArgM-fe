'use client';

import React from 'react';
import {
    FondPensionComplementaireBanqueGroupDto,
    FondPensionComplementaireEmployeeDto,
    formatCurrency,
    getFullName
} from './FondPensionComplementaire';
import TitleArea from '@/utils/printing/TitleArea ';
import DateTimeArea from '@/utils/printing/DocumentTime';
import MainContentArea from '@/utils/printing/MainContentArea';
import SeparatorArea from '@/utils/printing/SeparatorArea';
import FooterArea from '@/utils/printing/FooterArea';

interface PrintableFondPensionComplementaireProps {
    bankGroup: FondPensionComplementaireBanqueGroupDto;
    periodeLibelle: string;
}

const PrintableFondPensionComplementaire = React.forwardRef<HTMLDivElement, PrintableFondPensionComplementaireProps>(
    ({ bankGroup, periodeLibelle }, ref) => {
        const logoUrl = '/assets/images/gps_icon.png';

        const tableHeaderStyle: React.CSSProperties = {
            backgroundColor: '#dcdcdc',
            border: '1px solid #000',
            padding: '5px',
            textAlign: 'center',
            fontSize: '10px',
            fontWeight: 'bold'
        };

        const tableCellStyle: React.CSSProperties = {
            border: '1px solid #000',
            padding: '3px 5px',
            fontSize: '9px'
        };

        const tableCellRightStyle: React.CSSProperties = {
            ...tableCellStyle,
            textAlign: 'right'
        };

        const tableCellRedStyle: React.CSSProperties = {
            ...tableCellStyle,
            color: '#800000'
        };

        const tableCellRedRightStyle: React.CSSProperties = {
            ...tableCellRightStyle,
            color: '#800000'
        };

        const mainContent = (
            <>
                {/* Bank Header */}
                <div style={{ marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '12px' }}>BANQUE: </span>
                    <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{bankGroup.sigleBanque}</span>
                </div>

                {/* Employee Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                    <thead>
                        <tr>
                            <th style={{ ...tableHeaderStyle, width: '10%' }}>Matricule</th>
                            <th style={{ ...tableHeaderStyle, width: '20%' }}>Compte</th>
                            <th style={{ ...tableHeaderStyle, width: '30%' }}>Nom</th>
                            <th style={{ ...tableHeaderStyle, width: '13%' }}>FPC Pers</th>
                            <th style={{ ...tableHeaderStyle, width: '13%' }}>FPC Patr</th>
                            <th style={{ ...tableHeaderStyle, width: '14%' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bankGroup.employees.map((emp: FondPensionComplementaireEmployeeDto, index: number) => (
                            <tr key={index}>
                                <td style={tableCellStyle}>{emp.matriculeId}</td>
                                <td style={tableCellStyle}>{emp.compte || ''}</td>
                                <td style={tableCellRedStyle}>{getFullName(emp)}</td>
                                <td style={tableCellRightStyle}>{formatCurrency(emp.fpcPers)}</td>
                                <td style={tableCellRightStyle}>{formatCurrency(emp.fpcPatr)}</td>
                                <td style={tableCellRedRightStyle}>{formatCurrency(emp.total)}</td>
                            </tr>
                        ))}
                        {/* Totals Row */}
                        <tr>
                            <td colSpan={3} style={{ ...tableCellStyle, fontWeight: 'bold', borderTop: '2px solid #000' }}>
                                {bankGroup.employeeCount} Employes
                            </td>
                            <td style={{ ...tableCellRightStyle, fontWeight: 'bold', borderTop: '2px solid #000' }}>
                                {formatCurrency(bankGroup.totalFpcPers)}
                            </td>
                            <td style={{ ...tableCellRightStyle, fontWeight: 'bold', borderTop: '2px solid #000' }}>
                                {formatCurrency(bankGroup.totalFpcPatr)}
                            </td>
                            <td style={{ ...tableCellRedRightStyle, fontWeight: 'bold', borderTop: '2px solid #000' }}>
                                {formatCurrency(bankGroup.totalAmount)}
                            </td>
                        </tr>
                    </tbody>
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
            </>
        );

        return (
            <div ref={ref} style={{ padding: '10px', fontFamily: 'Arial, sans-serif', backgroundColor: 'white' }}>
                <DateTimeArea dateTime={new Date()} />
                <TitleArea
                    logoUrl={logoUrl}
                    title={`Cotisation au Fonds de pension Complementaire : ${periodeLibelle}`}
                    documentTime={`Imprime le ${new Date().toLocaleDateString('fr-FR')}`}
                />
                <MainContentArea content={mainContent} />
                <SeparatorArea color="#E0E0E0" />
                <FooterArea />
            </div>
        );
    }
);

PrintableFondPensionComplementaire.displayName = 'PrintableFondPensionComplementaire';

export default PrintableFondPensionComplementaire;
