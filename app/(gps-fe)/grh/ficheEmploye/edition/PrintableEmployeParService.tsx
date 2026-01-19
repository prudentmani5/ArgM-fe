'use client';

import React from 'react';
import moment from 'moment';
import { ServiceGroup } from './EmployeParServiceReport';

interface PrintableEmployeParServiceProps {
    serviceGroups: ServiceGroup[];
}

const PrintableEmployeParService = React.forwardRef<HTMLDivElement, PrintableEmployeParServiceProps>(
    ({ serviceGroups }, ref) => {
        const logoUrl = '/assets/images/gps_icon.png';

        // Count total employees
        const totalEmployees = serviceGroups.reduce((sum, group) => sum + group.employees.length, 0);

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
                            LISTING DES EMPLOYES PAR SERVICE
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
                                fontWeight: 'bold',
                                width: '120px'
                            }}>
                                Matricule
                            </th>
                            <th style={{
                                border: '1px solid #000',
                                padding: '6px 4px',
                                textAlign: 'center',
                                fontWeight: 'bold'
                            }} colSpan={2}>
                                Nom et prenom
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {serviceGroups.map((group, groupIndex) => (
                            <React.Fragment key={group.serviceId || groupIndex}>
                                {/* Service header row */}
                                <tr>
                                    <td
                                        colSpan={3}
                                        style={{
                                            border: '1px solid #000',
                                            padding: '8px 4px',
                                            fontWeight: 'bold',
                                            backgroundColor: '#fff'
                                        }}
                                    >
                                        {group.serviceLibelle || 'Service non defini'}
                                    </td>
                                </tr>
                                {/* Employee rows for this service */}
                                {group.employees.map((employee, empIndex) => (
                                    <tr key={employee.matriculeId || empIndex}>
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
                                            textAlign: 'left',
                                            width: '40%'
                                        }}>
                                            {(employee.nom || '').toUpperCase()}
                                        </td>
                                        <td style={{
                                            border: '1px solid #000',
                                            padding: '4px',
                                            textAlign: 'left',
                                            width: '40%'
                                        }}>
                                            {employee.prenom || ''}
                                        </td>
                                    </tr>
                                ))}
                            </React.Fragment>
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
                    Total: {totalEmployees} employe(s) actif(s) dans {serviceGroups.length} service(s)
                </div>
            </div>
        );
    }
);

PrintableEmployeParService.displayName = 'PrintableEmployeParService';

export default PrintableEmployeParService;
