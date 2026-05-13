import React from 'react';
import { SyntheseSalaireBaseResponseDto } from './SyntheseSalaireBase';
import TitleArea from '../../../../../../utils/printing/TitleArea ';
import DateTimeArea from '../../../../../../utils/printing/DocumentTime';
import SeparatorArea from '../../../../../../utils/printing/SeparatorArea';
import FooterArea from '../../../../../../utils/printing/FooterArea';

interface PrintableSyntheseSalaireBaseProps {
    data: SyntheseSalaireBaseResponseDto;
}

const PrintableSyntheseSalaireBase = React.forwardRef<HTMLDivElement, PrintableSyntheseSalaireBaseProps>(
    ({ data }, ref) => {
        const logoUrl = '/assets/images/gps_icon.png';

        const formatCurrency = (value: number | undefined | null): string => {
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
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                    <thead>
                        <tr>
                            <th style={{ ...headerCellStyle, width: '80px' }}>Matricule</th>
                            <th style={{ ...headerCellStyle, width: '280px' }}>Nom et Prenom</th>
                            <th style={{ ...headerCellStyle, width: '150px' }}>Salaire de Base</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.employees.map((emp, index) => (
                            <tr key={index}>
                                <td style={{ ...cellStyle, textAlign: 'center' }}>{emp.matriculeId || ''}</td>
                                <td style={{ ...cellStyle, textAlign: 'left', color: '#c62828' }}>
                                    {`${emp.nom || ''} ${emp.prenom || ''}`.trim()}
                                </td>
                                <td style={{ ...cellStyle, color: '#1565c0', fontWeight: 'bold' }}>{formatCurrency(emp.base)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td style={{ ...totalCellStyle, textAlign: 'center' }} colSpan={2}>
                                Total ({data.totalEmployeeCount} employes)
                            </td>
                            <td style={totalCellStyle}>{formatCurrency(data.grandTotalBase)}</td>
                        </tr>
                    </tfoot>
                </table>

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
                    title={`SYNTHESE DES SALAIRES DE BASE`}
                    documentTime={`Periode : ${data.periodeLibelle}`}
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

PrintableSyntheseSalaireBase.displayName = 'PrintableSyntheseSalaireBase';

export default PrintableSyntheseSalaireBase;
