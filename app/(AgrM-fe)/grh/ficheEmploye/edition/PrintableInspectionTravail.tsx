'use client';

import React from 'react';
import moment from 'moment';
import { InspectionTravailEmployee } from './InspectionTravailReport';

interface PrintableInspectionTravailProps {
    employees: InspectionTravailEmployee[];
}

const PrintableInspectionTravail = React.forwardRef<HTMLDivElement, PrintableInspectionTravailProps>(
    ({ employees }, ref) => {
        const logoUrl = '/assets/images/gps_icon.png';

        return (
            <div ref={ref} style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: 'white' }}>
                {/* Header */}
                <div style={{ textAlign: 'right', marginBottom: '10px', fontSize: '10px' }}>
                    Imprime le: {moment(new Date()).format('DD/MM/YYYY HH:mm')}
                </div>

                {/* Logo and Title */}
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ width: '150px' }}>
                        <img src={logoUrl} alt="Logo" style={{ width: '80px', height: 'auto' }} />
                        <div style={{ fontSize: '10px', fontStyle: 'italic', marginTop: '5px' }}>
                            <span style={{ fontWeight: 'bold' }}>global port</span><br />
                            <span>services burundi</span>
                        </div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <h2 style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            margin: '20px 0',
                            textDecoration: 'underline'
                        }}>
                            RAPPORT INSPECTION DU TRAVAIL
                        </h2>
                    </div>
                </div>

                {/* Table */}
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '10px',
                    border: '1px solid #000'
                }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                            <th style={{
                                border: '1px solid #000',
                                padding: '6px 4px',
                                textAlign: 'left',
                                fontWeight: 'bold'
                            }}>
                                Matricule
                            </th>
                            <th style={{
                                border: '1px solid #000',
                                padding: '6px 4px',
                                textAlign: 'left',
                                fontWeight: 'bold',
                                minWidth: '150px'
                            }}>
                                Nom et Prenom
                            </th>
                            <th style={{
                                border: '1px solid #000',
                                padding: '6px 4px',
                                textAlign: 'center',
                                fontWeight: 'bold'
                            }}>
                                Date<br/>d'engageme
                            </th>
                            <th style={{
                                border: '1px solid #000',
                                padding: '6px 4px',
                                textAlign: 'left',
                                fontWeight: 'bold',
                                minWidth: '200px'
                            }}>
                                Nature du Travail
                            </th>
                            <th style={{
                                border: '1px solid #000',
                                padding: '6px 4px',
                                textAlign: 'center',
                                fontWeight: 'bold'
                            }}>
                                Date de<br/>cessation
                            </th>
                            <th style={{
                                border: '1px solid #000',
                                padding: '6px 4px',
                                textAlign: 'left',
                                fontWeight: 'bold'
                            }}>
                                Cause de cessatio
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((employee, index) => (
                            <tr key={employee.matriculeId || index}>
                                <td style={{
                                    border: '1px solid #000',
                                    padding: '4px',
                                    textAlign: 'left'
                                }}>
                                    {employee.matriculeId || ''}
                                </td>
                                <td style={{
                                    border: '1px solid #000',
                                    padding: '4px',
                                    textAlign: 'left'
                                }}>
                                    {`${employee.nom || ''} ${employee.prenom || ''}`.trim().toUpperCase()}
                                </td>
                                <td style={{
                                    border: '1px solid #000',
                                    padding: '4px',
                                    textAlign: 'center'
                                }}>
                                    {employee.dateEngagement || ''}
                                </td>
                                <td style={{
                                    border: '1px solid #000',
                                    padding: '4px',
                                    textAlign: 'left'
                                }}>
                                    {employee.natureTravailLibelle || ''}
                                </td>
                                <td style={{
                                    border: '1px solid #000',
                                    padding: '4px',
                                    textAlign: 'center'
                                }}>
                                    {employee.dateCessation
                                        ? moment(employee.dateCessation).format('DD/MM/YYYY')
                                        : ''}
                                </td>
                                <td style={{
                                    border: '1px solid #000',
                                    padding: '4px',
                                    textAlign: 'left'
                                }}>
                                    {employee.causeCessation || ''}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer - Page info */}
                <div style={{
                    marginTop: '20px',
                    fontSize: '10px',
                    textAlign: 'center',
                    color: '#666'
                }}>
                    Total: {employees.length} employe(s) actif(s)
                </div>
            </div>
        );
    }
);

PrintableInspectionTravail.displayName = 'PrintableInspectionTravail';

export default PrintableInspectionTravail;
