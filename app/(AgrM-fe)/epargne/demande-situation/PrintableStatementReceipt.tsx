'use client';
import React, { forwardRef } from 'react';
import { StatementRequest } from './StatementRequest';
import { getClientDisplayName } from '@/utils/clientUtils';

interface PrintableStatementReceiptProps {
    request: StatementRequest;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
}

const PrintableStatementReceipt = forwardRef<HTMLDivElement, PrintableStatementReceiptProps>(
    ({ request, companyName = "MICROFINANCE", companyAddress = "Bujumbura, Burundi", companyPhone = "+257 22 XX XX XX" }, ref) => {

        const formatCurrency = (value: number | undefined) => {
            if (value === undefined || value === null) return '0 FBU';
            return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
        };

        const formatDate = (dateString: string | undefined) => {
            if (!dateString) return '-';
            const parts = dateString.split('-');
            if (parts.length === 3) {
                const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            }
            return dateString;
        };

        const getClientName = () => {
            return getClientDisplayName(request.client);
        };

        const getClientNumber = () => {
            return request.client?.clientNumber || '-';
        };

        const getBranchName = () => {
            return request.branch?.name || '-';
        };

        const getStatusLabel = () => {
            switch (request.status) {
                case 'PENDING': return 'En attente';
                case 'VALIDATED': return 'Validé';
                case 'DELIVERED': return 'Livré';
                case 'REJECTED': return 'Rejeté';
                case 'CANCELLED': return 'Annulé';
                default: return request.status;
            }
        };

        const getTypeLabel = () => {
            return request.requestType === 'HISTORIQUE' ? 'Historique des opérations' : 'Situation de compte';
        };

        return (
            <div ref={ref} style={{
                width: '210mm',
                minHeight: '148mm',
                padding: '15mm',
                backgroundColor: '#fff',
                fontFamily: 'Arial, sans-serif',
                fontSize: '12px',
                color: '#000'
            }}>
                {/* Header */}
                <div style={{ borderBottom: '3px double #333', paddingBottom: '10px', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src="/layout/images/logo/logoAgrinova.PNG" alt="Logo" style={{ height: '80px', width: '80px', objectFit: 'contain' }} />
                            <div>
                                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a' }}>
                                    {companyName}
                                </h1>
                                <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#666' }}>
                                    {companyAddress}<br />
                                    Tél: {companyPhone}
                                </p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a' }}>
                                DEMANDE DE {request.requestType === 'HISTORIQUE' ? 'HISTORIQUE' : 'SITUATION'}
                            </h2>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>
                                N° {request.requestNumber || '-'}
                            </p>
                            <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#666' }}>
                                Statut: {getStatusLabel()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Sections */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    {/* Client Info */}
                    <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '12px', backgroundColor: '#f8fafc' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#1e3a8a', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                            INFORMATIONS DU CLIENT
                        </h3>
                        <table style={{ width: '100%', fontSize: '11px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666', width: '40%' }}>Nom du Client:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{getClientName()}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>N° Client:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{getClientNumber()}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>Agence:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{getBranchName()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Request Details */}
                    <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '12px', backgroundColor: '#f8fafc' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#1e3a8a', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                            DÉTAILS DE LA DEMANDE
                        </h3>
                        <table style={{ width: '100%', fontSize: '11px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666', width: '40%' }}>Date:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{formatDate(request.requestDate)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>Type:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{getTypeLabel()}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>Frais:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{formatCurrency(request.feeAmount)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Amount Summary */}
                <div style={{ border: '2px solid #1e3a8a', borderRadius: '5px', padding: '15px', marginBottom: '20px', backgroundColor: '#eff6ff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <table style={{ fontSize: '12px' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '3px 15px 3px 0', color: '#666' }}>Solde avant:</td>
                                        <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{formatCurrency(request.balanceBefore)}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '3px 15px 3px 0', color: '#666' }}>Solde après:</td>
                                        <td style={{ padding: '3px 0', fontWeight: 'bold', color: '#dc2626' }}>{formatCurrency(request.balanceAfter)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>FRAIS DÉBITÉS</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a' }}>
                                {formatCurrency(request.feeAmount)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Motif */}
                {request.motif && (
                    <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '10px', marginBottom: '20px', backgroundColor: '#fefce8', fontSize: '11px' }}>
                        <strong>Motif:</strong> {request.motif}
                    </div>
                )}

                {/* Delivery info */}
                {request.status === 'DELIVERED' && (
                    <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '10px', marginBottom: '20px', backgroundColor: '#f0fdf4', fontSize: '11px' }}>
                        <strong>Livré à:</strong> {request.deliveredToName || getClientName()} | <strong>Date:</strong> {formatDate(request.deliveredDate)} | <strong>Par:</strong> {request.deliveredBy || '-'}
                    </div>
                )}

                {/* Signatures */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '30px', paddingTop: '20px', borderTop: '1px dashed #ccc' }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 40px 0', fontSize: '11px', color: '#666' }}>Signature du Client</p>
                        <div style={{ borderTop: '1px solid #333', width: '80%', margin: '0 auto' }}></div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#666' }}>{getClientName()}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 40px 0', fontSize: '11px', color: '#666' }}>Signature du Caissier</p>
                        <div style={{ borderTop: '1px solid #333', width: '80%', margin: '0 auto' }}></div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#666' }}>{request.userAction || '-'}</p>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '9px', color: '#999' }}>
                    <p style={{ margin: 0 }}>
                        Ce document est un reçu officiel de demande de {request.requestType === 'HISTORIQUE' ? 'historique' : 'situation de compte'}. Veuillez le conserver précieusement.
                    </p>
                    <p style={{ margin: '5px 0 0 0' }}>
                        Imprimé le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>
        );
    }
);

PrintableStatementReceipt.displayName = 'PrintableStatementReceipt';

export default PrintableStatementReceipt;
